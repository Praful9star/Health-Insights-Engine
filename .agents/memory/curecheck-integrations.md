---
name: CureCheck integrations
description: Live integration details for Razorpay, Sanity, Sentry, and Claude migration
---

## Razorpay Payment Links (live)

Created via Curecheck MCP (`mcpCurecheck_createPaymentLink`):
- Monthly ₹99: https://rzp.io/rzp/jywNeGo (plink_T2XRXoCGNR9PYN)
- Annual ₹499: https://rzp.io/rzp/y4J1B3a (plink_T2XRgx5BAjzf95)

Stored in env vars: `RAZORPAY_PREMIUM_MONTHLY_LINK`, `RAZORPAY_PREMIUM_ANNUAL_LINK`
Frontend page: `/premium` (artifacts/curecheck/src/pages/premium.tsx) — hardcoded URLs.

## Sanity CMS

Project ID: `tqmjf1jn`, dataset: `production`, org: `o7lPByVvV`
Env vars set: `SANITY_PROJECT_ID`, `SANITY_DATASET`
Vite defines: `__SANITY_PROJECT_ID__`, `__SANITY_DATASET__`
Schema deployment via `mcpSanity_deploySchema` requires `schemaDeclaration` string format (not object).

## Sentry

Org: `praful-srivastava` (region: https://us.sentry.io)
`create_project` is NOT available via Sentry MCP — must create project at sentry.io manually.
@sentry/react installed in frontend. Sentry init in main.tsx reads `__SENTRY_DSN__` define (from `SENTRY_DSN` env var).
User needs to: create project at sentry.io → get DSN → set `SENTRY_DSN` env var.

## Claude (Anthropic) — replaced Groq

All AI routes use `claudeChat` / `claudeVision` from `artifacts/api-server/src/lib/claude.ts`.
Model: `claude-sonnet-4-6`. Uses `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY`.
`isAiAvailable()` replaces the old `!!getGroqClient()` check.
lib: `lib/integrations-anthropic-ai` — needs `tsc --build lib/integrations-anthropic-ai` to generate declarations before api-server typecheck.
