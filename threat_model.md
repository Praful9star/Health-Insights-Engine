# Threat Model

## Project Overview

CureCheck is a public React + Express healthcare information app for Indian users. The production attack surface includes unauthenticated `/api` endpoints that accept user health questions, report text, and report images, then call Groq, Claude Vision, and NewsAPI server-side using project-controlled credentials. Production also includes an authenticated Supabase-backed profile and health-data sync surface used by signed-in users. The mockup sandbox artifact is development-only and should not be treated as a production surface.

## Assets

- **User health inputs** — symptom descriptions, disease names, medicine names, medical report text, and report images. These are sensitive health-related data and should be minimized in storage and logs.
- **Cloud-synced health history** — report summaries, doctor questions, biomarkers, fitness history, reminders, saved articles, and other timeline data synced between the browser and Supabase. Cross-account mixing or disclosure is high impact.
- **Application secrets** — `GROQ_API_KEY`, `SESSION_SECRET`, `ONESIGNAL_REST_API_KEY`, Supabase credentials, and any future database credentials. Compromise would enable account or provider abuse.
- **Provider budget and service availability** — Groq-, Claude-, and NewsAPI-backed endpoints are compute- and cost-bearing resources. Abuse can create direct spend and deny service to real users.
- **Client-side stored history** — the health timeline and related saved state stored in browser localStorage may contain report-derived details on shared devices.

## Trust Boundaries

- **Browser to API** — all user prompts, report text, OCR image payloads, and news queries cross from an untrusted client into the Express API.
- **API to providers** — the server forwards user-controlled content to Groq and Claude, and forwards search terms to NewsAPI, using privileged server-side credentials and bearing the cost of each request.
- **API to logs** — request handling code can copy user-derived fields into server logs, creating a secondary disclosure surface.
- **Browser to Supabase-authenticated data** — signed-in users can read and write profile and health-data rows through authenticated browser sessions guarded by Supabase auth and RLS.
- **Client to localStorage** — report summaries, fitness data, reminders, and saved articles are persisted in the browser and inherit the browser/device trust model rather than server protections.
- **localStorage to Supabase sync** — local browser state is merged with server-side health data on login, so ownership boundaries must be preserved across sign-in, sign-out, and shared-device reuse.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox/` is not production-reachable under the current deployment assumptions and should normally be ignored during production scans.

## Scan Anchors

- Production server entry points: `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`
- Highest-risk anonymous paths: provider-backed POST routes and `artifacts/api-server/src/routes/ocr-report.ts`
- Authenticated data-sync path: `artifacts/curecheck/src/contexts/auth-context.tsx`, `artifacts/curecheck/src/lib/supabase-sync.ts`, `artifacts/curecheck/src/hooks/use-health-storage.ts`
- Authenticated API path: `artifacts/api-server/src/routes/profile.ts`
- Secret-gated internal path: `artifacts/api-server/src/routes/notifications.ts`
- Dev-only area to ignore unless proven reachable: `artifacts/mockup-sandbox/`

## Threat Categories

### Tampering

All request bodies must be validated server-side before they influence prompts or downstream API calls. The current architecture often uses generated Zod schemas, but future changes must keep validation at the API boundary rather than relying on frontend checks or ad hoc inline validation.

### Information Disclosure

User-submitted health content and synced timeline data are sensitive even when the app is educational rather than diagnostic. Production handlers must avoid writing raw health inputs to logs, error messages, analytics, or other secondary sinks. Browser-stored health history must not be silently reassigned to a different authenticated account when a shared device is reused.

### Denial of Service

The public API exposes multiple unauthenticated, billable AI and news-provider operations. The system must enforce abuse controls such as rate limiting, quotas, concurrency guards, and sensible request bounds so an attacker cannot convert the provider integrations into a cost-amplification or service-exhaustion vector.

### Elevation of Privilege

There is no true server-side admin role today, so classic admin authorization flaws are limited. The more important privilege boundaries are between anonymous internet users and the server-side provider credentials, and between one signed-in user's browser-resident health data and another signed-in user's synced account state. Those boundaries must not be crossed implicitly by login or sync behavior.
