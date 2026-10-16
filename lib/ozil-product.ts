import { creditPacks } from '@/content/pricing';
import { OZIL_GOAL_CONFIG, OZIL_GOAL_COST } from './ozil-goal';

// Public descriptions use the same values as checkout and generation.
const starter = creditPacks.find(pack => pack.id === 'starter')!;
export const ozilProductFacts = {
  price: (starter.amountCents / 100).toFixed(2),
  credits: starter.credits,
  videos: Math.floor(starter.credits / OZIL_GOAL_COST),
  cost: OZIL_GOAL_COST,
  duration: OZIL_GOAL_CONFIG.duration,
  aspect: OZIL_GOAL_CONFIG.aspect,
  resolution: OZIL_GOAL_CONFIG.resolution,
} as const;

const tokens: Record<string, string | number> = {
  OZIL_GOAL_COST: ozilProductFacts.cost,
  OZIL_GOAL_DURATION: ozilProductFacts.duration,
  OZIL_GOAL_ASPECT: ozilProductFacts.aspect,
  OZIL_GOAL_RESOLUTION: ozilProductFacts.resolution,
  OZIL_STARTER_PRICE: ozilProductFacts.price,
  OZIL_STARTER_CREDITS: ozilProductFacts.credits,
  OZIL_STARTER_VIDEOS: ozilProductFacts.videos,
};

export function expandOzilProductText(value: string): string {
  return value.replace(/\{\{(\w+)\}\}/g, (match, name: string) => Object.hasOwn(tokens, name) ? String(tokens[name]) : match);
}

export const productCopy = {
  title: 'Your video, price and access',
  output: 'Output',
  outputValue: '{duration}-second MP4 · {aspect} · {resolution} · with sound',
  scope: 'One photo becomes the preset goalkeeper, chest-control and sliding-defender scene. Free kicks, custom celebrations and stadium changes are not supported.',
  price: 'Minimum purchase',
  priceValue: 'USD {price} for {credits} credits',
  videoCount: '{cost} credits per video · Full videos in the Starter pack: {videos}',
  oneTime: 'One-time purchase. No subscription or automatic renewal.',
  guest: 'Guest checkout',
  guestSummary: 'Buy credits and generate without registering.',
  guestAccess: "Guest access depends on this browser's session. Clearing cookies, switching browsers or letting the session expire can make guest credits and videos inaccessible.",
  accountHelp: 'Register a new account from this guest session to keep its credits and videos. Signing in to an existing account transfers the remaining credits, but guest videos do not move. Download completed videos before switching accounts.',
  refunds: 'Failures and refunds',
  refund: 'Confirmed failed generations return credits, not a cash refund. A successful result you dislike is generally not refundable.',
  privacy: 'Uploads have no fixed automatic deletion schedule. Contact support to request deletion; expiring links do not delete files.',
  pricingLink: 'Compare credit packs',
  refundLink: 'Read the refund policy',
  privacyLink: 'Photo storage and deletion requests',
  pricingIntro: 'Start with USD {price} for {credits} credits. Each video uses {cost} credits. Buy a one-time pack; there is no subscription or automatic renewal.',
  pricingMetadata: 'Compare one-time credit packs for Ozil Goal Generator. Each {{OZIL_GOAL_DURATION}}-second AI football video costs {{OZIL_GOAL_COST}} credits. Starter: USD {{OZIL_STARTER_PRICE}}.',
  termsAccount: 'You can purchase credits and generate videos as a guest without registering. Guest access relies on the current browser session. If you register or sign in, provide accurate account information, keep your sign-in method secure, and tell us promptly if you suspect unauthorized access.',
  referenceCaption: 'Third-party trend reference, not a result generated on this site. Your video uses your own photo; movement, clothing and identity can vary.',
  schemaDescription: 'Create a {duration}-second, {aspect} video with sound from one authorized photo. Each generation costs {cost} credits; confirmed failed generations return credits.',
  downloadNotice: 'Follow progress in My videos and download completed results before switching accounts.',
} as const;
