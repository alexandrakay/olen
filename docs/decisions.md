# olen — Design Decisions

Locked decisions from the pre-build design session. These override the PRD where they conflict.

---

## App States

Three states, determined on every Today tab load:

1. **Morning** — local time 05:00–18:00, no check-in done today → morning check-in screen
2. **Mid-day** — check-in done, local time before 18:00 → persisted pick card + completion button
3. **Evening** — local time ≥ 18:00 → Download flow (full content swap)

Today tab shifts to plum night background at 18:00 unconditionally. Morning check-in available until 18:00 regardless of notification open time. Download never shows if `checkins` collection is empty (day zero rule — not time-based).

**Routing order:** auth check → onboarding check → app state routing. Always in that order.

---

## Morning Check-In

One screen. Two questions. Implicit submit at 350ms after second selection. No confirm button.

**Time available:**
| Label | Stored (mins) |
|---|---|
| 15–30 min | 20 |
| 30–60 min | 45 |
| 1–2 hours | 75 |
| 2+ hours | 120 |

**Energy level:**
| Label | Stored (1–5) |
|---|---|
| Running on fumes | 1 |
| Low | 2 |
| Steady | 3 |
| Good | 4 |
| Locked in | 5 |

Defaults pre-selected: 30–60 min + Steady.

---

## Scoring Function

```
score(candidate) =
  urgencyScore
  + energyScore  * 0.75
  + timeScore    * 0.65
  + neglectScore * 0.55
  + todScore     * lerp(0, 0.8, dataMaturity)
  + dowScore     * lerp(0, 0.6, dataMaturity)
```

**Urgency is a floor raiser, not a ceiling setter.** A due-today task surfaces to the top unless energy mismatch is catastrophic. Does not guarantee the pick if energy mismatch is severe. Document this in pseudocode comments.

### Urgency Score
| Condition | Score |
|---|---|
| Due today | 10.0 |
| Overdue | 10.0 (cap — no stacking, no guilt) |
| Due tomorrow | 2.0 |
| Due within 7 rolling days | 1.5 |
| 8+ days out (with or without due date) | 0.0 |
| No due date | 0.0 |

Rolling 7 days from now — not calendar week (avoids Sunday cliff effect).

### Energy Score
Exact match = 1.0, one level off = 0.6, two levels off = 0.2.
`energyRequired: null` → 0.4 (reduced weight, not penalized, matches any level).

### Time Score
Fits within `timeAvailableMins` = 1.0. 50%+ over = 0.0.
`estimatedMins: null`:
- Short window (≤45 min) → 0.3
- Long window (≥75 min) → 0.6

### Neglect Score
Days since `lastFocusedAt` on context. 0 days = 0.0, 7+ days = 1.0 (linear).
`lastFocusedAt: null` → max neglect (7+ days).

`lastFocusedAt` updates on **accepted morning pick only** — both task picks and context picks within the context. Task creation does NOT update it. Task completion does NOT update it unless it was the accepted morning pick.

### dataMaturity
```
min(1.0, completedDownloads / 60)
```
Where `completedDownloads` = count of download documents with `completedFocusTask !== null`.

Derived on the fly at morning check-in screen load. Stored in React state for that screen's lifetime only. **Never written to Firestore.** Recalculates on reopen — same value until next Download completes.

Two-tier counting:
- `totalDownloads` → denominator for `dataMaturity`
- `qualityDownloads` (checkin `userAccepted: true` AND `completedFocusTask: 'yes'`) → pattern writer confidence weighting only

Post-MVP: split into `timeOfDayMaturity` and `dayOfWeekMaturity` per-signal. `timeOfDayMaturity` = how many distinct hour buckets have ≥3 data points. `dayOfWeekMaturity` = how many distinct days of week have ≥3 data points.

### Inbox Sort (outside morning session)
Neglect + urgency only. No `timeScore` or `energyScore` — those require context the inbox doesn't have.

### Cold-Start Tiebreaker
When all signals are equal (day one, no data), use `priority` field on context (onboarding order). Lower number wins. `priority` loses influence as `dataMaturity` rises — document this in the field definition.

### Candidate Pool Exclusions
- `status: done | snoozed | someday | archived` → excluded
- Contexts where `isNonNegotiable: true` → excluded from pick queue
- **Exception:** tasks within non-negotiable contexts score normally if they have urgency. Exclusion applies to the context pick, not to tasks that live inside it.
- Context picks only surface when task inbox is sparse OR context score significantly outscores all tasks. High neglect on a context when tasks exist = "add a task here" nudge, not a morning pick. Surfacing a context over a legitimate task is a scoring bug.

---

## Pick Card

Claude generates **one thing**: a 1–2 sentence line in Olen voice that embeds the reason. No separate "why" section. The line IS the why.

Example: *"You have 45 minutes and your energy's steady. Builder has been quiet for 5 days — this is the window."*

Card layout: task title (large, Outfit 500) → context color band → Claude line (Lexend 300) → estimated time if set (caption, muted).

Actions: **"Let's do it"** (apricot) / **"Not this one"** (ghost).

**Day-one special branch** (when `completedDownloads === 0`):
*"You're just getting started — olen picked [context] because you named it first. Check in tonight and it'll start learning."*
Requires a specific system prompt branch. Never runs after day one.

**Context pick framing** (Claude instruction):
One low-pressure sentence. No imperative verbs. No "you should."
Example: *"You haven't touched School in 6 days. Even 20 minutes on anything in that space moves it forward."*

**Pick text failure fallback** (static string — no Claude, no error state):
*"You have [timeLabel] and your energy is [energyLabel]. [Task title] is up next."*

---

## Rejection Flow

- Queue computed **once** at check-in time, **frozen**, served in order. Never recomputed between rejections.
- Session rejection counter is ephemeral state only. Rejection events log permanently as individual records (`userAccepted: false`).
- `pickPosition: 1 | 2 | 3` added to checkin document — which pick in the queue was ultimately accepted.
- Accepted backup writes to `pickedTaskId` normally. No special flag.
- Accepting any pick resets the consecutive counter to zero.

**Third rejection** replaces card entirely:
> *"Nothing's clicking today. That's fine — want to call it or keep looking?"*

- "Call it" → skip state. Mid-day state empty. Download Q1: *"Did you work on anything today?"*
- "Keep looking" → opens task inbox for self-select. User picks manually. Accepted pick writes normally. (The one place in the product where self-selection is appropriate — scoring function has demonstrably failed for this session.)

Three-rejection message uses Sonnet. Static fallback if Claude fails.

---

## Context Picks

**Completion:** single tap — "I did something on this." → `completedFocusTask: true` regardless of pick type.

**Download Q1 forks by pick type:**
- Task pick: *"Did you get to [task title]?"*
- Context pick: *"Did you spend any time on [context label]?"*
- Skip state: *"Did you work on anything today?"*

Same boolean, lower implied bar for context picks. Intentional.

---

## The Download

**Q1** — tri-state string, NOT boolean: `'yes' | 'partial' | 'no'`

Q3 triggers on Q1 = `'no'` OR `'partial'`. Not on `'yes'`.

**Q3 derailer options:**
| Label | `derailerType` |
|---|---|
| "Life got loud" | `external` |
| "I ran out of steam" | `energy` |
| "Honestly not sure" | `unclear` |

Freetext collapsed by default, expands on tap, 280 char limit. Always available.

**Q2 evening energy scale:** Depleted(1) / Low(2) / Okay(3) / Good(4) / Solid(5)

**Non-negotiable question:**
Gated on: chaos day (`derailerType !== null`) AND the non-negotiable was scheduled for that day.
Third option: "Wasn't scheduled today" → writes `null` (not false).

**Closing line:**
- Q1 = 'yes': *"Nice work. See you tomorrow."*
- Q1 = 'partial' or 'no': *"Got it. See you tomorrow."*

Download is a **full content swap** on Today tab. Not a modal. No dismiss gesture.

**Mid-day completion pre-fill:**
If `pickedTaskId.status === 'done'` AND `completedFrom === 'mid-day'`:
- 'yes' pre-selected, subtext: *"marked done at [HH:MM]"* (Lexend 300, muted — factual, no congratulation)
- User must confirm with one tap. **Never auto-submitted.**

Non-pre-fill cases: any other task status, no mid-day interaction, task swapped mid-day.

**Standing principle: Olen observes, the user confirms.** Never infer signal the user didn't consciously provide. Applies everywhere: energy patterns, streak-adjacent logic, auto-archiving, all of it.

---

## Non-Negotiables

- Non-negotiable contexts excluded from pick queue entirely.
- Tasks within non-negotiable contexts score normally. Urgency overrides regardless of parent context status.
- `nonNegotiablesProtected: { [contextId]: boolean | null }` — per-non-negotiable, not a single boolean.
  - `true` = happened as intended
  - `false` = explicitly skipped or displaced
  - `null` = unknown (Download completed before the window, or day-of-week mismatch)
- Silent default `true` only fires **after** the non-negotiable's typical window has passed. Otherwise writes `null`.
- Nightly function resolves lingering nulls on non-negotiable days to `true` (assumes protected if no contrary signal).
- Cap: 3 non-negotiables. Gentle block if exceeded: *"You already have 3 non-negotiables. These work best when they're the things you truly won't compromise on."*

---

## Task Inbox

**Row:** context eyebrow label (Lexend 10px, uppercase, 0.1em tracking) + title + due date if set. Context color band at 4px left edge. No energy badge.

**Snoozed tasks:** visible but visually muted — not hidden.

**Swipe right:** complete. `status: done`, `completedAt`, `completedFrom: 'inbox'`. Row animates out.

**Swipe left:** snooze until tomorrow. `status: snoozed`, `snoozedUntil: tomorrow midnight local`. No duration picker. `snoozeCount` increments.

**Third snooze prompt** (bottom sheet, appears before third snooze writes):
> *"You've snoozed this a few times. Still on your radar?"*
**Never a literal count.** "A few times" is load-bearing vagueness.

Options:
- "Yes, snooze again" → snoozes, counter resets to 0
- "Move it to someday" → `status: someday`
- "Remove it" → `status: archived` + 4-second undo toast

Counter is per-cycle, not cumulative across the task's lifetime. A task can return from someday and start a new snooze cycle.

**`status: someday`:** collapsed section at bottom of inbox, one tap to expand. Excluded from scoring and default sort. Manual reactivation resets snooze counter to 0.

### Add Task (inline pinned row)
Expands on tap with scroll-into-view on keyboard appear.
- Context: horizontal chips, last-used pre-selected
- Due date: Today / Tomorrow / This week / Pick a date (full picker only on last option)
- Submit: return key or tap-outside with title filled. Empty title = silent abandon.
- Desktop: Cmd+K or Cmd+N focuses input from anywhere

Empty state: *"Add something you're trying to move forward."*

**Post-acceptance prompt** (after morning pick accepted):
*"How long do you think this'll take?"* — four preset buttons (20/45/75/120), optional, writes `estimatedMins`.

---

## Task Detail

**Shown:** context chip with band color (tappable to swap), title (inline editable), due date (presets), estimated time (20/45/75/120/150), energy badge (tappable to override).

**Not shown:** `pickedCount` (intentionally hidden v1 — revisit for derived insights), `createdAt`, `completedAt`.

**Energy override:** writes `energyOverrideAt`, `energyOverrideValue`, `energyOverridden: true`. Does NOT overwrite `energyRequired`. `energyOverridden: true` prevents Claude from ever overwriting.

**Actions:** "Mark done" (apricot primary) / "Snooze" (ghost) / "Archive" (text link, below visual separator — not adjacent to primary actions).

---

## Energy Inference

Async. Task writes immediately with `energyRequired: null`. Claude (Haiku) fires in background.

**Output schema (strict — no coercion):**
```json
{ "energyRequired": "low" | "medium" | "high", "estimatedMins": 20 | 45 | 75 | 120 | null }
```
Any value outside exact sets → failure. If Claude returns `estimatedMins: 30`, reject it. Do not round.

Max-length check on morning pick text (~200 chars, 2 sentences). If longer → treat as failure.

Failure: one silent retry, then `energyRequired: 'medium'`, `estimatedMins: null`. No UI indication ever.

`promptVersion: 'energy-v1'` written with every result.

If `energyOverridden: true` → skip inference entirely.

---

## Claude API

| Touchpoint | Model | Notes |
|---|---|---|
| Task energy + time | `claude-haiku-4-5-20251001` | Structured output, latency matters, voice doesn't |
| Morning pick text | `claude-sonnet-4-6` | User reads this — voice quality is the product |
| Three-rejection check-in | `claude-sonnet-4-6` | Low-frequency, emotional moment, use Sonnet for consistency |

**`promptVersion` field written alongside every Claude output.** Enables auditing when prompts change.

**System prompt anchors for all voice calls:**
- Short sentences. No filler.
- Never use "excited", "solopreneur", em dashes, or "ADHD"
- Low energy is data, not failure. No guilt language.
- First person from Olen's perspective, not a coach's
- Output only the JSON object. No preamble, no explanation.

`timeAvailableMins` in morning pick prompt comes from user-entered morning check-in value — real signal, not inferred.

---

## Navigation

**Mobile (<768px):** Bottom nav — Today / Inbox / Account (person icon)

**Desktop (≥768px):** Left sidebar — icon-only at md, icon + label at lg

Today tab owns all three states. Color shifts with app state:
- Morning + mid-day: cream, apricot accents
- Evening: plum night, lavender accents

Inbox stays cream always.

Mid-day state: persisted pick card + "Mark done" button + "See your inbox →" link. Nothing else.

Download: full content swap on Today. Not a modal. No dismiss gesture.

Account: contexts management one tap from Account root.

---

## Context Management (Post-Onboarding)

- Soft limit: 7 active contexts. Dismissible warning at 7 — not a hard block.
- Archived contexts excluded from scoring, pick queue, all UI except "Show archived" toggle.
- Archive with incomplete tasks: bottom sheet — "Move all to another context" (bulk move) OR "Mark all done" (bulk complete). Resolves in one interaction.
- `previousLabel` (single field, not array) written on label edit. Used by pattern writer for rename continuity.
- Non-negotiable cap: 3, gentle block.
- Account UI: chevron expands row. Swipe left reveals archive. `+` at bottom.

---

## Notifications

Default send time seeded from `schedulePriors.morningWindow`:
| morningWindow | `notificationTime` |
|---|---|
| before 9am | 07:30 |
| 9–11am | 09:00 |
| after 11am | 10:30 |
| varies | 08:00 |

Copy: *"Ready when you are."* Single line, no rotation in MVP.

Single notification per morning. No second nudge.

Email fallback fires 15 minutes before configured push time. Never both push and email same morning.

Cloud Function always pairs `notificationTime` with `users.timezone` (IANA).

---

## Trial + Paywall

- `trialEndsAt = createdAt + 14 days`
- Expiry check: `today's local date > date component of trialEndsAt` (midnight local — not exact timestamp)
- Grace period: 24 hours before hard wall activates (absorbs Stripe webhook latency)
- Hard wall: no access to any feature. Data fully preserved.

Paywall copy uses `completedDownloads` count (not days elapsed):
> *"olen has logged [n] days with you. It's just getting started."*

No "maybe later." No "remind me tomorrow."

Price: $12/mo at launch. Annual ($96/year) configured in Stripe now, not surfaced at paywall.

Stripe: hosted Checkout. Return URL → Today tab.

---

## Onboarding

Two fields: `onboardingStep: number` (1–5) and `onboardingComplete: boolean`.

`onboardingStep` only ever increments. Back navigation is visual only — never triggers writes or decrements.

Each screen writes its own fields on advance. Back into a skipped screen allows filling it in; tapping next returns to current `onboardingStep`.

Progress bar animates in on resume. No copy, no modal.

Server-side recovery: nightly function sets `onboardingComplete: true` for users where `onboardingStep: 5`, `onboardingComplete: false`, `createdAt > 48 hours ago`.

**Post-onboarding holding screen:**
One line only: *"You're all set. Olen will check in with you tomorrow morning."*
Single action: "See your task inbox →" text link.
Push permission request beneath the copy. Email fallback if declined.
No task preview, no context bands.

First morning check-in: available when local clock enters 05:00–12:00 window after `onboardingCompletedAt`. Not midnight.

---

## Unauthenticated State

Hybrid splash — not a marketing page:
```
olen.

The focus tool for people with too much going on.

[Continue with Google]
```
Cream background. Deep Brown logo. Apricot CTA. No feature list, no pricing, no separate marketing page in this repo.

---

## Pattern Writer

**Four pattern types:**

**`energy-window`:** Group by `checkinHour`, avg `energyActual`. Write when `sampleSize ≥ 5`. `confidence = min(1.0, max(0.0, sampleSize / 20))`.

**`neglect`:** Avg days between `lastFocusedAt` updates per context. Write when `sampleSize ≥ 4`. Simplified claim: *"[Context] averages [N] days between focus sessions."*

**`derailer`:** `derailerType` frequency over 30 days. Write when one type ≥ 40% of non-completion events.

**`non-neg`:** `protectedRatio = days completed / days active in window`. Write when `sampleSize ≥ 6`. Claim: *"You protect [context] about [X]% of the time."*

**Confidence thresholds:**
- < 0.4 → internal use only, don't surface to user
- 0.4–0.7 → use in scoring, don't show in Debrief
- > 0.7 → eligible for Debrief copy

**Staleness:** patterns older than 14 days treated as absent by scoring function.

`patternVersion` field on every pattern document (e.g., `'energy-window-v1'`).

---

## Data Model Changes vs PRD

| Field | PRD | Locked |
|---|---|---|
| `completedFocusTask` | `boolean` | `'yes' \| 'partial' \| 'no'` (tri-state string) |
| `nonNegotiableProtected` | `boolean` | `{ [contextId]: boolean \| null }` |
| `tasks.status` | `inbox \| active \| done \| snoozed` | add `someday \| archived` |
| `tasks.completedFrom` | not in PRD | `'morning-pick' \| 'inbox' \| 'mid-day'` |
| `tasks.energyOverrideAt` | not in PRD | `timestamp \| null` |
| `tasks.energyOverrideValue` | not in PRD | `string \| null` |
| `tasks.snoozedUntil` | not in PRD | `timestamp \| null` |
| `tasks.snoozeCount` | not in PRD | `number` (per-cycle) |
| `tasks.promptVersion` | not in PRD | `string` |
| `contexts.previousLabel` | not in PRD | `string` |
| `checkins.pickPosition` | not in PRD | `1 \| 2 \| 3` |
| `checkins.promptVersion` | not in PRD | `string` |
| `patterns.patternVersion` | not in PRD | `string` |
| `users.onboardingCompletedAt` | not in PRD | `timestamp` |
| `users.notificationTime` | not in PRD | `string` (HH:MM) |

---

## Open Questions

- **Mid-day task swap:** if user swapped tasks mid-day and completed the new one, what does Download Q1 ask about? Flag for Sprint 3 resolution.
- **iOS trigger:** revenue, DAU, or a specific feature need (notifications, widgets)?
