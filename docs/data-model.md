# olen — Firestore Data Model

Canonical data model. Where this conflicts with the PRD, this document wins.

---

## `users/{uid}`

```typescript
interface User {
  uid: string
  email: string
  displayName: string
  bio: string                    // Freeform. Prepended to all Claude prompts.
  createdAt: Timestamp
  onboardingCompletedAt: Timestamp | null
  trialEndsAt: Timestamp         // createdAt + 14 days
  onboardingStep: number         // 1–5. Increments only, never decrements.
  onboardingComplete: boolean
  subscriptionStatus: 'trial' | 'active' | 'cancelled' | 'expired' | 'past_due'
  stripeCustomerId: string | null
  timezone: string               // IANA tz string (e.g. "America/New_York")
  schedulePriors: {
    morningWindow: 'before-9am' | '9-11am' | 'after-11am' | 'varies'
    chaoticDays: number[]        // 0–6, Sun=0
    energyPeak: 'morning' | 'midday' | 'evening' | 'unpredictable'
  }
  notificationsEnabled: boolean
  notificationTime: string       // HH:MM (e.g. "07:30")
  energyBaseline: number         // 0–10, learned over time
}
```

---

## `users/{uid}/contexts/{contextId}`

```typescript
interface Context {
  id: string
  label: string
  previousLabel: string | null   // Last label before most recent edit. NOT a history array.
                                 // Used by pattern writer for rename continuity.
  description: string            // "What does progress look like in this area?"
  isNonNegotiable: boolean
  nonNegotiableDetail: string | null  // e.g. "Barre — usually 6am Tues/Thurs"
  priority: number               // Onboarding order. Cold-start tiebreaker ONLY.
                                 // Loses influence as dataMaturity rises. See scoring function.
  status: 'active' | 'archived'
  lastFocusedAt: Timestamp | null  // Updated on accepted morning pick only.
                                   // NOT on task creation. NOT on task completion
                                   // unless it was the accepted morning pick.
  createdAt: Timestamp
}
```

### Notes
- Non-negotiable contexts are excluded from the morning pick queue.
- Tasks within non-negotiable contexts score normally (urgency overrides parent context exclusion).
- Archived contexts excluded from: scoring, pick queue, inbox context filter, task creation context selector.
- `priority` field exists for cold-start only — document this so future-you doesn't repurpose it.

---

## `users/{uid}/tasks/{taskId}`

```typescript
interface Task {
  id: string
  title: string
  contextId: string              // FK → contexts
  status: 'inbox' | 'active' | 'done' | 'snoozed' | 'someday' | 'archived'
  dueDate: Timestamp | null
  energyRequired: 'low' | 'medium' | 'high' | null  // Claude-inferred async. null while pending.
  energyOverridden: boolean      // true = user set manually. Claude never overwrites when true.
  energyOverrideAt: Timestamp | null
  energyOverrideValue: 'low' | 'medium' | 'high' | null
  estimatedMins: 20 | 45 | 75 | 120 | 150 | null  // Claude-inferred or user-set.
  promptVersion: string | null   // e.g. "energy-v1". Written with Claude inference result.
  snoozedUntil: Timestamp | null // Set on swipe-left snooze. Tomorrow midnight local.
  snoozeCount: number            // Per-cycle. Resets to 0 after third-snooze prompt engagement.
  pickedCount: number            // Intentionally hidden in v1. Revisit for derived insights.
  completedAt: Timestamp | null
  completedFrom: 'morning-pick' | 'inbox' | 'mid-day' | null
  createdAt: Timestamp
}
```

### Notes on `completedFrom`
- `'morning-pick'` → only source that updates `lastFocusedAt` on parent context
- `'inbox'` → task completed via swipe-right in inbox
- `'mid-day'` → task completed via "Mark done" on Today tab during mid-day state
- `completedFrom: 'mid-day'` triggers Download Q1 pre-fill logic

### Notes on `estimatedMins`
Null scoring in the scoring function:
- Short window (≤45 min available) → 0.3
- Long window (≥75 min available) → 0.6

Claude returns one of `20 | 45 | 75 | 120 | null`. Strict validation — no coercion.
If Claude returns `30`, reject it. Do not round.

---

## `users/{uid}/checkins/{date}` (doc ID = YYYY-MM-DD)

```typescript
interface Checkin {
  date: string                   // YYYY-MM-DD
  checkinHour: number            // 0–23. Primary learning axis.
  dayOfWeek: number              // 0–6, Sun=0
  timeAvailableMins: 20 | 45 | 75 | 120  // User-entered. Real signal, not inferred.
  energyLevel: 1 | 2 | 3 | 4 | 5
  pickedTaskId: string | null
  pickedContextId: string | null
  pickPosition: 1 | 2 | 3       // Which pick in the frozen queue was ultimately accepted.
                                 // Signal: if pick #2 accepted at high rate, scoring is miscalibrated.
  pickedSuggestion: string       // Claude-generated text shown to user.
  promptVersion: string          // e.g. "pick-v1"
  userAccepted: boolean | null   // null = not yet resolved
  createdAt: Timestamp
}
```

### Notes
- Rejection events log permanently as individual records with `userAccepted: false`.
- Counter (consecutive rejections) is ephemeral session state only — never persisted.
- Queue computed once at check-in time, frozen, served in order. Never recomputed between rejections.

---

## `users/{uid}/downloads/{date}` (doc ID = YYYY-MM-DD)

```typescript
interface Download {
  date: string                   // YYYY-MM-DD
  completedFocusTask: 'yes' | 'partial' | 'no'  // IMPORTANT: tri-state string, NOT boolean
  energyActual: 1 | 2 | 3 | 4 | 5
  derailerType: 'external' | 'energy' | 'unclear' | null
  derailerNote: string | null    // Freetext, max 280 chars
  nonNegotiablesProtected: {     // Per-non-negotiable, NOT a single boolean
    [contextId: string]: boolean | null
    // true = protected as intended
    // false = explicitly skipped or displaced
    // null = unknown (Download before window, or not scheduled today)
  }
  energyDelta: number            // energyActual - morning energyLevel (calculated at write time)
  createdAt: Timestamp
}
```

### Notes
- Q3 (derailer) only captured when `completedFocusTask === 'no' || 'partial'`
- Non-negotiable question gated on: chaos day AND non-neg scheduled for today
- "Wasn't scheduled today" → writes `null` (not `false`) to prevent false negatives
- `energyDelta` calculated and written at Download completion — not by nightly function

---

## `users/{uid}/patterns/{patternId}`

```typescript
interface Pattern {
  type: 'energy-window' | 'neglect' | 'derailer' | 'non-neg'
  patternVersion: string         // e.g. "energy-window-v1". Written with every pattern.
  contextId: string | null
  dayOfWeek: number | null
  hourRange: [number, number] | null
  insight: string                // Human-readable claim. Shown in Debrief (post-MVP).
  confidence: number             // 0.0–1.0. Floored at 0.0, capped at 1.0.
                                 // < 0.4 = internal only, don't surface to user
                                 // 0.4–0.7 = use in scoring, don't show in Debrief
                                 // > 0.7 = eligible for Debrief copy
  sampleSize: number
  lastUpdated: Timestamp         // Patterns older than 14 days treated as absent by scoring function
}
```

---

## Top-level collections

### `waitlist/{email}`
```typescript
interface WaitlistEntry {
  email: string
  createdAt: Timestamp
}
```
Written by coming soon page. No auth required.

---

## Key invariants

1. `completedFocusTask` is a tri-state string (`'yes' | 'partial' | 'no'`), never boolean
2. `nonNegotiablesProtected` is per-context (`{ [contextId]: boolean | null }`), never a single value
3. `onboardingStep` only ever increments — never decrements
4. `lastFocusedAt` updates on accepted morning pick only — nothing else
5. `energyRequired` is never overwritten once `energyOverridden: true`
6. `dataMaturity` is never written to Firestore — derived on the fly always
7. `pickPosition` (1/2/3) written on every accepted pick — used for scoring calibration
8. `promptVersion` written alongside every Claude output — enables audit when prompts change
9. `snoozeCount` is per-cycle — resets after third-snooze prompt engagement
10. `completedFrom` distinguishes intent vs. completion path — used by pattern writer post-MVP
