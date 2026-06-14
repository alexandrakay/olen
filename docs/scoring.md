# olen — Scoring Function

Rule-based scoring for the morning pick. Runs client-side. Returns a frozen queue of up to 3 candidates.

---

## Formula

```typescript
function score(candidate: Candidate, context: ScoringContext): number {
  return (
    urgencyScore(candidate, context)
    + energyScore(candidate, context) * 0.75
    + timeScore(candidate, context)   * 0.65
    + neglectScore(candidate)         * 0.55
    + todScore(candidate)             * lerp(0, 0.8, context.dataMaturity)
    + dowScore(candidate)             * lerp(0, 0.6, context.dataMaturity)
  )
}
```

**Key principle:** Urgency is a floor raiser, not a ceiling setter. A due-today task surfaces to the top unless energy mismatch is catastrophic. But urgency does not guarantee the pick — a task due today with high energy requirement against a user at energy level 1 can still be outscored by a better-fitting candidate.

---

## Urgency Score

```typescript
function urgencyScore(candidate: Candidate, context: ScoringContext): number {
  const { dueDate } = candidate
  const { now } = context

  if (!dueDate) return 0.0

  const daysUntilDue = differenceInDays(dueDate, now)

  if (daysUntilDue < 0) return 10.0    // Overdue — cap at 10.0, no stacking
  if (daysUntilDue === 0) return 10.0  // Due today
  if (daysUntilDue === 1) return 2.0   // Due tomorrow
  if (daysUntilDue <= 7) return 1.5    // Due within 7 rolling days
  return 0.0                            // 8+ days out: 0.0, even with a due date
}
```

**Rolling 7 days from now — NOT calendar week.** Calendar week creates cliff effects on Sundays (a task due "next Monday" scores 1.5 on Sunday, 0.0 on Monday). Rolling window avoids this.

Overdue caps at 10.0 — does not accumulate higher. A task 3 weeks overdue does not outscore a task due today.

---

## Energy Score

```typescript
function energyScore(candidate: Candidate, context: ScoringContext): number {
  const { energyRequired } = candidate
  const { energyLevel } = context // 1–5

  if (energyRequired === null) return 0.4  // Reduced weight, not penalized

  const requiredLevel = energyLevelMap[energyRequired] // low=2, medium=3, high=4 (midpoints)
  const diff = Math.abs(energyLevel - requiredLevel)

  if (diff === 0) return 1.0
  if (diff === 1) return 0.6
  return 0.2  // Two or more levels off
}
```

`energyRequired: null` scores 0.4 against any energy level. Task is not penalized for missing inference data, but doesn't get the full energy match boost.

---

## Time Score

```typescript
function timeScore(candidate: Candidate, context: ScoringContext): number {
  const { estimatedMins } = candidate
  const { timeAvailableMins } = context

  if (estimatedMins === null) {
    // Window-dependent scoring for unknown time
    return timeAvailableMins <= 45 ? 0.3 : 0.6
  }

  const ratio = estimatedMins / timeAvailableMins
  if (ratio <= 1.0) return 1.0         // Fits
  if (ratio >= 1.5) return 0.0         // 50%+ over available
  return lerp(1.0, 0.0, (ratio - 1.0) / 0.5)  // Linear between 100% and 150%
}
```

---

## Neglect Score

```typescript
function neglectScore(candidate: Candidate): number {
  const { lastFocusedAt } = candidate.context

  if (!lastFocusedAt) return 1.0  // null = never focused = max neglect

  const daysSince = differenceInDays(new Date(), lastFocusedAt)
  return Math.min(1.0, daysSince / 7)  // Linear 0→1 over 7 days
}
```

`lastFocusedAt` updates on accepted morning pick only. Not on task creation, not on completion (unless it was the accepted morning pick).

---

## Learned Signals (tod / dow)

Zero-weighted in MVP until `patterns` collection has data. Structure present for Sprint 6.

```typescript
function todScore(candidate: Candidate): number {
  // Reads energy-window pattern for current checkinHour
  // Returns 0.0 if no pattern exists or confidence < 0.4
  return 0.0  // MVP
}

function dowScore(candidate: Candidate): number {
  // Reads energy-window pattern for current dayOfWeek
  // Returns 0.0 if no pattern exists or confidence < 0.4
  return 0.0  // MVP
}
```

Weighted by `lerp(0, maxWeight, dataMaturity)`:
- `todScore` max weight: 0.8
- `dowScore` max weight: 0.6

Post-MVP: split into `timeOfDayMaturity` and `dayOfWeekMaturity` per-signal.

---

## dataMaturity

```typescript
function getDataMaturity(completedDownloadsCount: number): number {
  return Math.min(1.0, completedDownloadsCount / 60)
}
```

- Day 1: `0.0` — learned signals contribute nothing
- 30 downloads (1 month daily): `0.5` — meaningful but not dominant
- 60 downloads (2 months daily): `1.0` — fully weighted

Calculated once at morning check-in screen load from count of `downloads` where `completedFocusTask !== null`. Stored in React state for that screen's lifetime. **Never written to Firestore.** Recalculates on reopen.

---

## Candidate Pool

```typescript
function buildCandidatePool(tasks: Task[], contexts: Context[]): Candidate[] {
  const eligibleTasks = tasks.filter(t =>
    (t.status === 'inbox' || t.status === 'active') &&
    !isNonNegotiableContext(t.contextId, contexts)
    // Exception: if task has urgency (dueDate within 7 days or overdue),
    // include it regardless of non-negotiable context status.
    // Urgency overrides the non-negotiable exclusion.
  )

  const eligibleContexts = contexts.filter(c =>
    c.status === 'active' &&
    !c.isNonNegotiable &&
    shouldSurfaceContextPick(c, eligibleTasks)
    // Context picks only when inbox is sparse OR context score >> all task scores.
    // High neglect + tasks exist = "add a task" nudge, NOT a context pick.
  )

  return [...eligibleTasks, ...eligibleContexts]
}
```

---

## Queue + Cold Start

```typescript
function buildQueue(candidates: Candidate[], context: ScoringContext): ScoringResult {
  if (candidates.length === 0) {
    return { empty: true, queue: [], pick: null, dataMaturity: context.dataMaturity }
  }

  const scored = candidates
    .map(c => ({ candidate: c, score: score(c, context) }))
    .sort((a, b) => b.score - a.score)

  // Cold-start tiebreaker: when all scores are equal (day one),
  // use context.priority (onboarding order). Lower number wins.
  // priority loses influence as dataMaturity rises — it only fires when
  // everything else is flat. See Context.priority field documentation.

  const queue = scored.slice(0, 3).map(s => s.candidate)

  return {
    empty: false,
    queue,         // Frozen at this moment. Never recomputed between rejections.
    pick: queue[0],
    dataMaturity: context.dataMaturity,
  }
}
```

**The queue is frozen.** After `buildQueue` returns, do not call it again until the next morning check-in. Recomputing between rejections risks surfacing the same candidate again (especially with sparse inbox), breaking the "next candidate" promise.

---

## Inbox Sort (outside morning session)

Outside of the morning check-in, the inbox uses a simpler sort: **neglect + urgency only**.

No `timeScore` or `energyScore` — those require the morning check-in inputs (`timeAvailableMins`, `energyLevel`) that aren't available when the user is just browsing.

```typescript
function inboxScore(task: Task, context: Context): number {
  return urgencyScore(task, { now: new Date() }) + neglectScore({ context })
}
```

---

## Empty Inbox Handling

When `buildQueue` returns `{ empty: true }`, skip the pick flow entirely. Show:

> *"Nothing in your list yet. What's one thing you want to get done today?"*

Freeform input → creates task → that task becomes the pick (no scoring needed). This also handles the edge case of a user who deletes everything between onboarding and their first morning check-in.
