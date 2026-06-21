import { initializeApp } from "firebase-admin/app";

initializeApp();

// Sprint 5: trial expiry check (nightly scheduled function)
// export { checkTrialExpiry } from "./scheduled/trial-expiry";

// Sprint 6: pattern writer (nightly scheduled function)
// export { writePatterns } from "./scheduled/pattern-writer";

// Sprint 6: non-negotiable null resolver (nightly)
// export { resolveNonNegNulls } from "./scheduled/non-neg-resolver";

// Sprint 3: morning notifications (every 30 min)
export { sendMorningNotifications } from "./scheduled/send-notifications";

// Sprint 1: onboarding recovery (nightly)
// export { recoverOnboarding } from "./scheduled/onboarding-recovery";

// Sprint 2: energy inference on task creation
export { inferTaskEnergy } from "./triggers/infer-task-energy";

// Sprint 5: Stripe webhook handler
// export { stripeWebhook } from "./https/stripe-webhook";

export {};
