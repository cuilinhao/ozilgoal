import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { creditPacks } from '../content/pricing';
import { SUPPORT_EMAIL } from '../content/support';

const read = (path: string) => readFileSync(path, 'utf8');

describe('standalone Ozil brand and pricing', () => {
  it('uses an independent support address and one-time four-pack pricing', () => {
    expect(SUPPORT_EMAIL).toBe('cuilinhao2021@gmail.com');
    expect(creditPacks.map(({ id, amountCents, credits }) => [id, amountCents, credits])).toEqual([
      ['starter', 990, 300], ['creator', 2990, 1200], ['pro', 4990, 2200], ['business', 9990, 5000],
    ]);
    expect(read('components/pricing-cards.tsx')).not.toMatch(/Wan 3\.0|AI Rap Song Generator|estimateVideoCredits/);
  });

  it('contains no former site brand or account-sharing promise in published Ozil copy', () => {
    for (const path of [
      'content/ozil-goal-pages.json', 'content/ozil-blog/en.ts', 'content/ozil-blog/pt.ts',
      'content/ozil-blog/es.ts', 'components/ozil-goal/credits.tsx', 'components/ozil-goal/route-choice.ts',
      'components/ozil-goal/blog.tsx', 'components/ozil-goal/blog-metadata.ts',
    ]) expect(read(path)).not.toMatch(/migosai|LobbyDuo|existing Migos account|saldo compartilhado|créditos compartilhados|otros generadores del sitio|estimaciones de videos Wan/i);
  });
});
