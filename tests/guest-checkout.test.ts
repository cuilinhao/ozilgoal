import type Stripe from 'stripe';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { database, jobEnv } from './helpers';
import * as auth from '../lib/server/auth';
import { POST as checkout } from '../app/api/checkout/route';
import { GET as me } from '../app/api/me/route';
import { GET as orders } from '../app/api/orders/route';
import { applyStripeEvent } from '../lib/server/stripe-payments';
import { createCheckout } from '../lib/server/payments';
import { reserveGeneration } from '../lib/server/billing';
import { createGuestUser } from '../lib/server/guest-accounts';
import type { Env } from '../lib/server/env';

const bindings = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('../lib/server/env', async importOriginal => ({ ...await importOriginal<typeof import('../lib/server/env')>(), getEnv: async () => bindings.current }));

const origin = 'https://example.test';
const priceId = 'price_starter123';
const password = 'A secure test password';
const price = { id: priceId, object: 'price', active: true, livemode: false, currency: 'usd', unit_amount: 990, type: 'one_time', recurring: null, product: 'prod_starter123' };
type Sqlite = ReturnType<typeof database>['sqlite'];
type FakeSession = { id: string; client_reference_id: string | null; metadata: Record<string, string>; payment_intent: string };

let db: D1Database, sqlite: Sqlite, sessions: Map<string, FakeSession>, sent: URLSearchParams[];
const env = () => bindings.current as unknown as Env;

// Stripe's HTTP API is the only fake; checkout creation and fulfillment run the real code.
function fakeStripe() {
  sessions = new Map(); sent = [];
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    if (url.origin !== 'https://api.stripe.com' || init?.redirect !== 'manual') throw Error('Unexpected outbound request');
    if (url.pathname === `/v1/prices/${priceId}`) return Response.json(price);
    if (url.pathname === '/v1/checkout/sessions' && init?.method === 'POST') {
      const params = new URLSearchParams(String(init.body)); sent.push(params);
      const id = `cs_test_guest${sessions.size + 1}`;
      const metadata = Object.fromEntries(Array.from(params).filter(([key]) => key.startsWith('metadata[')).map(([key, value]) => [key.slice(9, -1), value]));
      const session = { id, client_reference_id: params.get('client_reference_id'), metadata, payment_intent: `pi_guest${sessions.size + 1}` };
      sessions.set(id, session);
      return Response.json({ ...base(session), status: 'open', payment_status: 'unpaid', payment_intent: null, url: `https://checkout.stripe.com/c/pay/${id}` });
    }
    const retrieved = /^\/v1\/checkout\/sessions\/(cs_test_\w+)$/.exec(url.pathname);
    if (retrieved && sessions.has(retrieved[1])) {
      const session = sessions.get(retrieved[1])!;
      return Response.json({ ...paid(session),
        payment_intent: { id: session.payment_intent, object: 'payment_intent', livemode: false, status: 'succeeded', amount: 990, amount_received: 990, currency: 'usd', metadata: session.metadata },
        line_items: { object: 'list', has_more: false, data: [{ id: 'li_fixture123', object: 'item', quantity: 1, amount_total: 990, amount_subtotal: 990, currency: 'usd', price }] } });
    }
    throw Error('Unexpected Stripe request');
  });
}
function base(session: FakeSession) {
  return { id: session.id, object: 'checkout.session', livemode: false, mode: 'payment', amount_total: 990, amount_subtotal: 990, currency: 'usd', client_reference_id: session.client_reference_id, metadata: session.metadata };
}
function paid(session: FakeSession) { return { ...base(session), status: 'complete', payment_status: 'paid', payment_intent: session.payment_intent }; }
function paymentEvent(session: FakeSession, id = 'evt_guest123', type = 'checkout.session.completed') {
  return { id, object: 'event', type, livemode: false, created: Math.floor(Date.now() / 1000), data: { object: paid(session) } } as unknown as Stripe.Event;
}

const request = (path: string, init: { cookie?: string; body?: unknown; ip?: string } = {}) => new Request(origin + path, {
  method: init.body === undefined ? 'GET' : 'POST',
  headers: { origin, 'Content-Type': 'application/json', 'cf-connecting-ip': init.ip ?? '192.0.2.9', ...(init.cookie ? { cookie: init.cookie } : {}) },
  body: init.body === undefined ? undefined : JSON.stringify(init.body),
});
const sessionCookie = (response: Response) => response.headers.getSetCookie().find(value => value.startsWith('migos_session='))?.split(';')[0];
async function buy(cookie?: string, ip?: string) {
  const response = await checkout(request('/api/checkout', { cookie, ip, body: { packId: 'starter', locale: 'en' } }), {});
  const body = await response.json() as { checkoutUrl?: string; orderId?: string; error?: string };
  return { response, body, cookie: sessionCookie(response) ?? cookie };
}
const sessionFor = (orderId: string) => [...sessions.values()].find(session => session.client_reference_id === orderId)!;
const user = (id: string) => sqlite.prepare('SELECT id,email,guest,merged_into,credits FROM users WHERE id=?').get(id) as { id: string; email: string; guest: number; merged_into: string | null; credits: number };
const signedIn = (cookie: string | undefined) => auth.currentUser(new Request(origin + '/api/me', { headers: cookie ? { cookie } : {} }), env());
async function account(email: string) {
  const response = await auth.registerEmail(request('/api/auth/email/register', { body: { email, password } }), env());
  return { cookie: sessionCookie(response)!, id: (await signedIn(sessionCookie(response)))!.id };
}

beforeEach(() => {
  ({ db, sqlite } = database());
  bindings.current = { ...jobEnv(db), PAYMENT_PROVIDER: 'stripe', STRIPE_MODE: 'test', STRIPE_SECRET_KEY: 'sk_test_fixtureOnly123', STRIPE_WEBHOOK_SECRET: 'whsec_fixtureOnly123', STRIPE_PRICE_STARTER: priceId };
  fakeStripe();
});
afterEach(() => { vi.restoreAllMocks(); sqlite.close(); });

describe('checkout without sign-in', () => {
  it('creates a browser-bound guest whose Stripe checkout collects the buyer email', async () => {
    const first = await buy();
    expect(first.response.status).toBe(200);
    expect(first.body.checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_guest1');
    expect(first.response.headers.get('set-cookie')).toContain('HttpOnly; SameSite=Lax');
    const guest = (await signedIn(first.cookie))!;
    expect(guest).toMatchObject({ guest: true, credits: 0, name: 'Guest' });
    expect(user(guest.id)).toMatchObject({ guest: 1, merged_into: null });
    expect(sqlite.prepare('SELECT user_id,status FROM orders WHERE id=?').get(first.body.orderId!)).toEqual({ user_id: guest.id, status: 'pending' });
    expect(sent[0].has('customer_email')).toBe(false);
    expect(sent[0].get('metadata[userId]')).toBe(guest.id);
    const profile = await (await me(request('/api/me', { cookie: first.cookie }), {})).json();
    expect(profile).toMatchObject({ user: { id: guest.id, guest: true, email: '' }, credits: 0 });

    // The same browser keeps one guest account across repeated checkouts.
    const second = await buy(first.cookie);
    expect(second.response.headers.get('set-cookie')).toBeNull();
    expect(sqlite.prepare('SELECT count(*) AS n FROM users WHERE guest=1').get()).toEqual({ n: 1 });
    expect(sqlite.prepare('SELECT count(DISTINCT user_id) AS n FROM orders').get()).toEqual({ n: 1 });
  });

  it('keeps signed-in checkout bound to the account and prefilled with its email', async () => {
    const existing = await account('buyer@example.test');
    const { body } = await buy(existing.cookie);
    expect(sqlite.prepare('SELECT user_id FROM orders WHERE id=?').get(body.orderId!)).toEqual({ user_id: existing.id });
    expect(sent[0].get('customer_email')).toBe('buyer@example.test');
    expect(sqlite.prepare('SELECT count(*) AS n FROM users WHERE guest=1').get()).toEqual({ n: 0 });
  });

  it('credits a paid guest order once and lets the guest session spend it', async () => {
    const { body, cookie } = await buy();
    const guest = (await signedIn(cookie))!;
    const session = sessionFor(body.orderId!);
    await applyStripeEvent(env(), paymentEvent(session));
    await applyStripeEvent(env(), paymentEvent(session));
    await applyStripeEvent(env(), paymentEvent(session, 'evt_async123', 'checkout.session.async_payment_succeeded'));
    expect(user(guest.id).credits).toBe(300);
    expect(sqlite.prepare("SELECT count(*) AS n FROM credit_ledger WHERE kind='payment'").get()).toEqual({ n: 1 });
    await reserveGeneration(db, guest.id, 'guest-video', 'video', {}, 300);
    expect(user(guest.id).credits).toBe(0);
  });

  it('rejects unknown packs before creating a guest and rate-limits anonymous checkout per IP', async () => {
    const unknown = await checkout(request('/api/checkout', { body: { packId: 'free', locale: 'en' } }), {});
    expect(unknown.status).toBe(400);
    expect(sqlite.prepare('SELECT count(*) AS n FROM users WHERE guest=1').get()).toEqual({ n: 0 });
    for (let attempt = 0; attempt < 30; attempt++) expect((await buy(undefined, '198.51.100.7')).response.status).toBe(200);
    const limited = await buy(undefined, '198.51.100.7');
    expect(limited.response.status).toBe(429);
    expect(limited.body.error).toBe('Too many checkout attempts. Please try again in 15 minutes.');
    expect((await buy(undefined, '198.51.100.8')).response.status).toBe(200);
  });

  it('keeps the guest session when checkout creation fails so a retry reuses it', async () => {
    bindings.current = { ...bindings.current, STRIPE_PRICE_STARTER: undefined };
    const failed = await buy();
    expect(failed.response.status).toBe(503);
    expect(failed.cookie).toBeDefined();
    bindings.current = { ...bindings.current, STRIPE_PRICE_STARTER: priceId };
    const retried = await buy(failed.cookie);
    expect(retried.response.status).toBe(200);
    expect(sqlite.prepare('SELECT count(*) AS n FROM users WHERE guest=1').get()).toEqual({ n: 1 });
  });

  it('does not open Waffo checkout for a guest without a real email', async () => {
    const guest = await createGuestUser(db);
    await expect(createCheckout({ ...env(), PAYMENT_PROVIDER: 'waffo' }, guest, 'starter')).rejects.toMatchObject({ status: 401 });
    expect(sqlite.prepare('SELECT count(*) AS n FROM orders').get()).toEqual({ n: 0 });
  });
});

describe('keeping guest credits after sign-in', () => {
  async function paidGuest() {
    const { body, cookie } = await buy();
    const session = sessionFor(body.orderId!);
    await applyStripeEvent(env(), paymentEvent(session));
    return { cookie: cookie!, id: (await signedIn(cookie))!.id, orderId: body.orderId!, session };
  }

  it('upgrades the guest in place when it signs up, keeping credits and orders', async () => {
    const guest = await paidGuest();
    await reserveGeneration(db, guest.id, 'guest-video', 'video', {}, 100);
    const response = await auth.registerEmail(request('/api/auth/email/register', { cookie: guest.cookie, body: { email: 'New@Example.test', password } }), env());
    expect(response.status).toBe(200);
    expect(await signedIn(guest.cookie)).toBeNull();
    expect(await signedIn(sessionCookie(response))).toMatchObject({ id: guest.id, email: 'new@example.test', guest: false, credits: 200 });
    expect(user(guest.id)).toMatchObject({ guest: 0, merged_into: null });
    const login = await auth.loginEmail(request('/api/auth/email/login', { body: { email: 'new@example.test', password } }), env());
    expect(await signedIn(sessionCookie(login))).toMatchObject({ id: guest.id, credits: 200 });
    expect(sqlite.prepare('SELECT count(*) AS n FROM credit_ledger WHERE kind=?').get('transfer')).toEqual({ n: 0 });
  });

  it('refuses to upgrade a guest onto an email another account already uses', async () => {
    await account('taken@example.test');
    const guest = await paidGuest();
    await expect(auth.registerEmail(request('/api/auth/email/register', { cookie: guest.cookie, body: { email: 'TAKEN@example.test', password } }), env())).rejects.toMatchObject({ status: 409 });
    expect(user(guest.id)).toMatchObject({ guest: 1, credits: 300 });
    expect(await signedIn(guest.cookie)).toMatchObject({ id: guest.id });
  });

  it('moves the guest balance into an existing account on sign-in and shows its orders there', async () => {
    const existing = await account('member@example.test');
    const guest = await paidGuest();
    const login = await auth.loginEmail(request('/api/auth/email/login', { cookie: guest.cookie, body: { email: 'member@example.test', password } }), env());
    expect(await signedIn(sessionCookie(login))).toMatchObject({ id: existing.id, credits: 300 });
    expect(user(guest.id)).toMatchObject({ credits: 0, guest: 1, merged_into: existing.id });
    expect(await signedIn(guest.cookie)).toBeNull();
    const transfers = sqlite.prepare("SELECT user_id,amount FROM credit_ledger WHERE kind='transfer' ORDER BY amount").all();
    expect(transfers).toEqual([{ user_id: guest.id, amount: -300 }, { user_id: existing.id, amount: 300 }]);
    const listed = await (await orders(request('/api/orders', { cookie: sessionCookie(login) }), {})).json() as { orders: { id: string; status: string }[] };
    expect(listed.orders).toEqual([expect.objectContaining({ id: guest.orderId, status: 'paid' })]);

    // Replaying the already-moved payment neither fails nor credits anyone again.
    await applyStripeEvent(env(), paymentEvent(guest.session, 'evt_replay123'));
    expect(user(existing.id).credits).toBe(300);
    expect(user(guest.id).credits).toBe(0);
  });

  it('forwards a guest order paid after the merge exactly once', async () => {
    const existing = await account('late@example.test');
    const { body, cookie } = await buy();
    const guestId = (await signedIn(cookie))!.id;
    await auth.loginEmail(request('/api/auth/email/login', { cookie, body: { email: 'late@example.test', password } }), env());
    expect(user(guestId)).toMatchObject({ merged_into: existing.id, credits: 0 });
    const session = sessionFor(body.orderId!);
    await applyStripeEvent(env(), paymentEvent(session));
    await applyStripeEvent(env(), paymentEvent(session));
    await applyStripeEvent(env(), paymentEvent(session, 'evt_async123', 'checkout.session.async_payment_succeeded'));
    expect(user(existing.id).credits).toBe(300);
    expect(user(guestId).credits).toBe(0);
    expect(sqlite.prepare("SELECT count(*) AS n FROM credit_ledger WHERE kind='payment'").get()).toEqual({ n: 1 });
    expect(sqlite.prepare("SELECT sum(amount) AS total, count(*) AS n FROM credit_ledger WHERE kind='transfer'").get()).toEqual({ total: 0, n: 2 });
  });

  it('does not merge or alter anything when the sign-in fails', async () => {
    await account('member@example.test');
    const guest = await paidGuest();
    await expect(auth.loginEmail(request('/api/auth/email/login', { cookie: guest.cookie, body: { email: 'member@example.test', password: 'wrong password' } }), env())).rejects.toMatchObject({ status: 401 });
    expect(user(guest.id)).toMatchObject({ credits: 300, merged_into: null });
    expect(await signedIn(guest.cookie)).toMatchObject({ id: guest.id });
  });
});

describe('keeping guest credits after Google sign-in', () => {
  const clientId = 'test-client';
  const profile = { iss: 'https://accounts.google.com', aud: clientId, sub: 'google-guest-user', email: 'google@example.test', email_verified: true, name: 'Google User' };
  const encode = (value: string | Uint8Array) => Buffer.from(value).toString('base64url');
  let privateKey: CryptoKey, jwk: JsonWebKey;
  beforeAll(async () => {
    const keys = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    privateKey = keys.privateKey;
    jwk = { ...await crypto.subtle.exportKey('jwk', keys.publicKey), kid: 'fixture-key', alg: 'RS256', use: 'sig' } as JsonWebKey;
  });
  beforeEach(() => {
    bindings.current = { DB: db, APP_URL: origin, GOOGLE_CLIENT_ID: clientId };
    vi.spyOn(globalThis, 'fetch').mockImplementation(async url => {
      if (String(url) === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({ keys: [jwk] }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
      throw Error('Unexpected external request');
    });
  });
  async function oneTap(cookie: string) {
    const started = await auth.startOneTap(new Request(origin + '/api/auth/google/one-tap'), env());
    const { nonce } = await started.json() as { nonce: string };
    const now = Math.floor(Date.now() / 1000);
    const message = encode(JSON.stringify({ alg: 'RS256', kid: 'fixture-key' })) + '.' + encode(JSON.stringify({ ...profile, iat: now, exp: now + 3600, nonce }));
    const credential = message + '.' + encode(new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(message))));
    const nonceCookie = started.headers.get('set-cookie')!.split(';')[0];
    const response = await auth.finishOneTap(new Request(origin + '/api/auth/google/one-tap', { method: 'POST', headers: { origin, 'Content-Type': 'application/json', cookie: `${cookie}; ${nonceCookie}` }, body: JSON.stringify({ credential }) }), env());
    return signedIn(sessionCookie(response));
  }
  async function guestWithCredits(credits: number) {
    const guest = await createGuestUser(db);
    const cookie = (await auth.createSession(guest.id, env())).split(';')[0];
    sqlite.prepare("INSERT INTO credit_ledger(id,user_id,amount,kind,reference_id) VALUES(?,?,?,'payment',?)").run(`${guest.id}:payment`, guest.id, credits, guest.id);
    return { id: guest.id, cookie };
  }

  it('upgrades the guest in place for a new Google identity', async () => {
    const guest = await guestWithCredits(300);
    expect(await oneTap(guest.cookie)).toMatchObject({ id: guest.id, email: 'google@example.test', guest: false, credits: 300 });
    expect(sqlite.prepare('SELECT google_sub,guest FROM users WHERE id=?').get(guest.id)).toEqual({ google_sub: profile.sub, guest: 0 });
  });

  it('moves the guest balance into the account that already owns the Google identity', async () => {
    sqlite.prepare('INSERT INTO users(id,email,name,google_sub,credits) VALUES(?,?,?,?,0)').run('google-member', profile.email, profile.name, profile.sub);
    const guest = await guestWithCredits(1200);
    expect(await oneTap(guest.cookie)).toMatchObject({ id: 'google-member', credits: 1200 });
    expect(user(guest.id)).toMatchObject({ credits: 0, merged_into: 'google-member' });
    expect(await signedIn(guest.cookie)).toBeNull();
  });
});
