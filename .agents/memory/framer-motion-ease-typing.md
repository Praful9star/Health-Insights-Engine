---
name: framer-motion ease array typing
description: Why cubic-bezier ease arrays in framer-motion transitions need a tuple cast to typecheck in this repo.
---

In curecheck (and any TS package using framer-motion here), a cubic-bezier easing written inline as `ease: [0.22, 1, 0.36, 1]` fails `tsc` because the literal is inferred as `number[]`, not the 4-tuple framer-motion's `Easing` type expects.

**Rule:** cast every inline bezier ease to a 4-tuple: `ease: [0.22, 1, 0.36, 1] as [number, number, number, number]`. Applies in both `variants` transition objects and inline `transition={{ ... }}` props.

**Why:** `vite build` skips typechecking, so these errors stay invisible until `pnpm --filter @workspace/curecheck run typecheck` runs — a deployed app can still carry the error. When adding new motion transitions, add the cast up front.

**How to apply:** before declaring typecheck clean, `rg "ease: \[" artifacts/curecheck/src` and confirm each match has the tuple cast.
