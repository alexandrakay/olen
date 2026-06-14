# olen — Brand Reference

Quick reference for implementation. Full guide is in the brand guidelines document.

---

## Colors

### Primary
| Token | Hex | Use |
|---|---|---|
| `cream` | `#FAF6EE` | Morning background, primary surface, inbox |
| `apricot` | `#F0956A` | Primary action, CTA, logo period (morning) |
| `sage` | `#7BBFAA` | Insight, "Olen noticed" moments |
| `lavender` | `#B8A4D8` | Evening mode, logo period (evening) |
| `yellow` | `#F4D080` | Energy picker, morning warmth |
| `brown` | `#3D2C20` | Body text, logo, dark surfaces |

### Secondary
| Token | Hex | Use |
|---|---|---|
| `plum` | `#2A1F2E` | Evening background, Download mode |
| `apricot-wash` | `#FDE8D8` | Action card backgrounds, Work context |
| `sage-wash` | `#D8EDE6` | Insight cards, School context |
| `lavender-wash` | `#E8DCEE` | Evening cards, Personal context |
| `yellow-wash` | `#FDF4DC` | Energy card, non-negotiable, builder context |
| `bone` | `#EDE4D4` | Borders, dividers, inactive states |

### Rules
- Apricot is for action only
- Sage is for insight only
- Lavender belongs to evening
- Yellow belongs to energy and morning
- Never pure black (`#000`) or pure white (`#FFF`) as surfaces

---

## Context Color Bands

| Context type | Background | Text |
|---|---|---|
| Work | `#FDE8D8` Apricot Wash | `#3D2C20` Deep Brown |
| School | `#D8EDE6` Sage Wash | `#1E3D30` Dark Sage |
| Personal / Builder | `#E8DCEE` Lavender Wash | `#2E1E40` Dark Plum |
| Non-negotiable | `#FDF4DC` Yellow Wash | `#3D2C10` Dark Amber |

---

## Typography

```
Outfit: 400, 500, 600 — headings, display, logo
Lexend: 300, 400, 500 — body, labels, captions
```

| Role | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Display | Outfit | 42–52px | 600 | -0.5–1px tracking |
| H1 | Outfit | 28px | 500 | -0.25px tracking |
| H2 | Outfit | 22px | 500 | |
| H3 | Outfit | 18px | 500 | Card titles, pick titles |
| Body | Lexend | 15px | 300 | 1.7 line height |
| Body small | Lexend | 13px | 400 | 1.6 line height |
| Eyebrow | Lexend | 10px | 500 | Uppercase, 0.1em tracking, apricot or lavender |
| Caption | Lexend | 12px | 300 | Muted, metadata |

---

## Logo

`olen.` — always lowercase, period always present.

- Font: Outfit 600
- Period color: Apricot (morning), Lavender (evening)
- Minimum size: 18px

---

## Morning vs Evening Mode

| | Morning | Evening |
|---|---|---|
| Background | `#FAF6EE` Cream | `#2A1F2E` Plum Night |
| Text | `#3D2C20` Deep Brown | `#FAF6EE` Cream |
| Primary accent | `#F0956A` Apricot | `#B8A4D8` Lavender |
| Blur orbs | Apricot + Yellow | Lavender + faint Apricot |
| Logo period | Apricot | Lavender |
| Feel | Warm, energizing | Softer, reflective |

Today tab applies morning mode during morning and mid-day states. Evening mode at 18:00 unconditionally.
Inbox stays cream always.

---

## Spacing Scale

| Token | Value | Use |
|---|---|---|
| xs | 4px | Internal component gaps |
| sm | 8px | Between related elements |
| md | 12px | Component padding (tight) |
| lg | 16px | Standard padding |
| xl | 24px | Section gaps, card padding |
| 2xl | 40px | Section breathing room |

---

## Border Radius

| Value | Use |
|---|---|
| 4px | Badges, small chips |
| 8px | Inputs, small buttons |
| 12px | Cards, content panels |
| 14–16px | Hero containers, mode containers |

---

## Blur Orbs

`filter: blur(40–50px)`, `opacity: 0.2–0.35`. Never sharp. Never more than 3 per surface. Always positioned off-edge (partially cropped by container).

---

## Voice

**Calm and direct.** Short sentences. No filler. Gets to the point.

**Dry, not cold.** Warmth underneath the directness. Never clinical, never chirpy, never preachy.

**Zero guilt.** Missed days are invisible. Low energy is data, not failure.

**Honest.** "Based on 8 check-ins" — not "Olen knows you perfectly."

### Words Olen never uses
- "solopreneur"
- "excited to share" / "thrilled to announce"
- "I've been reflecting on"
- "this really resonates"
- "ADHD app" (in any owned channel, ever)
- em dashes (anywhere, ever)

### Do not
- No streaks. Ever.
- No overdue task counts, no red badges
- No guilt language of any kind
- No top-3 picks
- No "excited to share" or LinkedIn-template language
- No excessive animation

### Always
- Sentence case everywhere — headings, buttons, labels
- Forgiveness language in empty, error, and return states
- Short copy. Trust the user.
- `olen` always lowercase
- Period in the logo always

---

## Key Copy

| Moment | Copy |
|---|---|
| Tagline | The focus tool for people with too much going on. |
| Re-entry | Welcome back. Let's figure out today. |
| Unauthenticated splash | The focus tool for people with too much going on. |
| Notification | Ready when you are. |
| Holding screen | You're all set. Olen will check in with you tomorrow morning. |
| Post-onboarding action | See your task inbox → |
| Morning pick (day one) | You're just getting started — olen picked [context] because you named it first. Check in tonight and it'll start learning. |
| Third rejection | Nothing's clicking today. That's fine — want to call it or keep looking? |
| Download close (yes) | Nice work. See you tomorrow. |
| Download close (partial/no) | Got it. See you tomorrow. |
| Empty inbox | Add something you're trying to move forward. |
| Snooze prompt | You've snoozed this a few times. Still on your radar? |
| Paywall | olen has logged [n] days with you. It's just getting started. |
| Paywall data line | Your tasks, contexts, and history are saved and waiting. |
| Mid-day empty (skip state) | Take it easy today. |
