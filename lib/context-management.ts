export const SOFT_LIMIT = 7;
export const NON_NEG_CAP = 3;

export const SOFT_LIMIT_WARNING =
  "You have 7 active contexts. dot works best when you're tracking what actually competes for your attention — consider archiving one before adding another.";

export const NON_NEG_CAP_MESSAGE =
  "You already have 3 non-negotiables. These work best when they're the things you truly won't compromise on.";

export function canAddContext(activeCount: number): { allowed: boolean; warn: boolean } {
  return { allowed: true, warn: activeCount >= SOFT_LIMIT };
}

export function canAddNonNeg(nonNegCount: number): boolean {
  return nonNegCount < NON_NEG_CAP;
}
