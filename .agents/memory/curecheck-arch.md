---
name: CureCheck architecture
description: Key patterns and gotchas for adding features to CureCheck
---

## Adding a new AI feature (required order)

1. Add endpoint + schemas to `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen` — generates Zod schemas in `lib/api-zod/` and React Query hooks in `lib/api-client-react/`
3. Build `artifacts/api-server/src/routes/<feature>.ts` — import Zod body/response schemas from `@workspace/api-zod`
4. Register in `artifacts/api-server/src/routes/index.ts`
5. Build `artifacts/curecheck/src/pages/<feature>.tsx` — use generated hook from `@workspace/api-client-react`
6. Add route in `artifacts/curecheck/src/App.tsx`
7. Add nav link in `artifacts/curecheck/src/components/navbar.tsx`
8. Restart the API server workflow to pick up new routes

**Why:** Zod schemas come from codegen — importing from `@workspace/api-zod` before running codegen causes TS errors.

## Key files

- Language context: `artifacts/curecheck/src/contexts/language-context.tsx` — `useLanguage()` → `{language, setLanguage, t(en, hi)}`
- WhatsApp share: `artifacts/curecheck/src/components/whatsapp-share.tsx`
- All API routes accept `language?: "en" | "hi"` in request body
- Mock fallbacks in every route — never returns 500

## Ports

- API server: 8080, path `/api`
- Frontend: 25201, path `/`
- EADDRINUSE errors: restart the workflow (don't restart both at once — they can collide)

## Features built

- `/symptom-checker` — urgency triage, possible causes, red flags
- `/claim-checker` — credibility score, verdict badge, WhatsApp share
- `/disease-journey` — phase-by-phase timeline
- `/report-explainer` — CBC/thyroid plain-language breakdown
- `/medicine-explainer` — side effects, food interactions, Jan Aushadhi tip
- Daily Myth Buster on homepage (30 myths, rotates by day of year)
- Hindi/English toggle — stored in localStorage as `curecheck-lang`
