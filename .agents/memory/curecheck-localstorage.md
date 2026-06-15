---
name: CureCheck localStorage features
description: How fitness, timeline, and challenge data is persisted; hook API and storage keys.
---

## Hook
`useHealthStorage()` from `artifacts/curecheck/src/hooks/use-health-storage.ts`

Returns: `todayEntry`, `updateToday`, `weeklyData`, `streaks`, `challenges`, `joinChallenge`, `logChallengeDay`, `timeline`, `saveToTimeline`, `deleteTimelineEntry`

Helper exports: `computeScore(day)`, `todayStr()`, `extractBiomarkers(findings[])`

## Storage keys
- `cc_fitness_v2` — map of `dateStr → FitnessDay` (sleep, water, steps, workout, score)
- `cc_challenges_v2` — `Challenge[]` (id, title, completedDays[])
- `cc_timeline_v2` — `TimelineEntry[]` (id, date, label, summary, biomarkers)

## Score formula
`computeScore`: sleep (max 25) + water (max 25) + steps (max 25) + workout (0|25) = 0–100

## Myth data shape
DAILY_MYTHS in `src/data/myths.ts` uses `{ myth: {en,hi}, truth: {en,hi}, score: number }` — the field is `score`, NOT `credibility`. CredibilityBar accepts `score` prop.

**Why:** Caught a tsc error (`.credibility` does not exist) when wiring myth-buster.tsx — field has always been `score`.
