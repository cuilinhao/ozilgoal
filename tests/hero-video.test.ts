import { describe, expect, it } from 'vitest';
import { serveHeroVideo } from '../lib/server/hero-video';

const url = 'https://example.test/ozil-goal/samples/ozil-ai-goal-hero.mp4';
// Reproduce the production asset service: complete bodies without range headers.
const assets = {
  fetch: async () => new Response('0123456789', {
    headers: { 'Content-Type': 'video/mp4', ETag: '"clip-v1"' },
  }),
} as unknown as Pick<Fetcher, 'fetch'>;

describe('homepage video byte ranges', () => {
  it.each([
    ['bytes=2-5', '2345', 'bytes 2-5/10'],
    ['bytes=7-', '789', 'bytes 7-9/10'],
    ['bytes=-3', '789', 'bytes 7-9/10'],
    ['bytes=8-99', '89', 'bytes 8-9/10'],
  ])('serves the requested bytes for %s', async (range, body, contentRange) => {
    const response = await serveHeroVideo(new Request(url, { headers: { Range: range } }), assets);
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe(contentRange);
    expect(response.headers.get('Content-Length')).toBe(String(body.length));
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
    expect(await response.text()).toBe(body);
  });

  it('returns the full video and length without a range', async () => {
    const response = await serveHeroVideo(new Request(url), assets);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Length')).toBe('10');
    expect(await response.text()).toBe('0123456789');
  });

  it('returns full metadata and no body for HEAD even with Range', async () => {
    const response = await serveHeroVideo(new Request(url, { method: 'HEAD', headers: { Range: 'bytes=2-5' } }), assets);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Length')).toBe('10');
    expect(await response.text()).toBe('');
  });

  it.each(['bytes=10-', 'bytes=6-2', 'bytes=-0'])('rejects unsatisfiable range %s', async range => {
    const response = await serveHeroVideo(new Request(url, { headers: { Range: range } }), assets);
    expect(response.status).toBe(416);
    expect(response.headers.get('Content-Range')).toBe('bytes */10');
    expect(await response.text()).toBe('');
  });

  it.each(['bytes=0-1,4-5', 'invalid'])('ignores unsupported or malformed range %s', async range => {
    const response = await serveHeroVideo(new Request(url, { headers: { Range: range } }), assets);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('0123456789');
  });

  it.each([['"clip-v1"', 206, '2345'], ['"older-clip"', 200, '0123456789']])('honors If-Range %s', async (validator, status, body) => {
    const response = await serveHeroVideo(new Request(url, { headers: { Range: 'bytes=2-5', 'If-Range': validator } }), assets);
    expect(response.status).toBe(status);
    expect(await response.text()).toBe(body);
  });

  it('preserves missing asset errors', async () => {
    const missing = { fetch: async () => new Response('Not found', { status: 404 }) } as unknown as Pick<Fetcher, 'fetch'>;
    const response = await serveHeroVideo(new Request(url, { headers: { Range: 'bytes=2-5' } }), missing);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not found');
  });
});
