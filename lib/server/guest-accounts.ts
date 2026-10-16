import type { User } from '../contracts';

export type GuestUser = User & { credits: number; guest: true };

// A guest has no credentials: the browser session that created it is the only
// proof of ownership, so its email is a unique placeholder that never logs in.
export async function createGuestUser(db: D1Database): Promise<GuestUser> {
  const id = crypto.randomUUID();
  const email = `guest-${id}@guest.invalid`;
  await db.prepare('INSERT INTO users(id,email,name,guest) VALUES(?,?,?,1)').bind(id, email, 'Guest').run();
  return { id, email, name: 'Guest', credits: 0, guest: true };
}

// Signing in to an existing account from a guest session moves the guest's
// whole balance there in one transaction. Orders and videos stay on the guest
// record (media paths are owned by user id); merged_into keeps orders visible
// and lets a later payment for a guest order follow the balance.
export async function mergeGuest(db: D1Database, guestId: string, targetId: string): Promise<void> {
  if (guestId === targetId) return;
  const ref = crypto.randomUUID();
  await db.batch([
    db.prepare('UPDATE users SET merged_into=? WHERE id=? AND guest=1 AND merged_into IS NULL').bind(targetId, guestId),
    db.prepare(`INSERT INTO credit_ledger(id,user_id,amount,kind,reference_id)
      SELECT ?,id,-credits,'transfer',? FROM users WHERE id=? AND guest=1 AND merged_into=? AND credits>0`)
      .bind(`${ref}:transfer-out`, `${ref}:out`, guestId, targetId),
    db.prepare(`INSERT INTO credit_ledger(id,user_id,amount,kind,reference_id)
      SELECT ?,?,-amount,'transfer',? FROM credit_ledger WHERE kind='transfer' AND reference_id=? AND user_id=?`)
      .bind(`${ref}:transfer-in`, targetId, `${ref}:in`, `${ref}:out`, guestId),
    db.prepare('DELETE FROM sessions WHERE user_id=?').bind(guestId),
  ]);
}

// Appended to payment fulfillment: when a guest order is paid after the guest
// was merged, forward exactly that order's credits. The balance guard skips
// replays whose credits already moved with the merge.
export function forwardMergedGuestPayment(db: D1Database, orderId: string): D1PreparedStatement[] {
  return [
    db.prepare(`INSERT INTO credit_ledger(id,user_id,amount,kind,reference_id)
      SELECT o.id||':transfer-out',o.user_id,-o.credits,'transfer',o.id||':out' FROM orders o JOIN users u ON u.id=o.user_id
      WHERE o.id=? AND o.status='paid' AND u.guest=1 AND u.merged_into IS NOT NULL AND u.credits>=o.credits
      ON CONFLICT(kind,reference_id) DO NOTHING`).bind(orderId),
    db.prepare(`INSERT INTO credit_ledger(id,user_id,amount,kind,reference_id)
      SELECT o.id||':transfer-in',u.merged_into,o.credits,'transfer',o.id||':in' FROM orders o JOIN users u ON u.id=o.user_id
      WHERE o.id=? AND EXISTS(SELECT 1 FROM credit_ledger WHERE kind='transfer' AND reference_id=o.id||':out')
      ON CONFLICT(kind,reference_id) DO NOTHING`).bind(orderId),
  ];
}
