# Threat Model

## Project Overview

CureCheck is a public React + Express healthcare information app for Indian users. The production attack surface is a set of unauthenticated `/api` endpoints that accept user health questions, report text, and report images, then call Groq models server-side to generate educational responses. The mockup sandbox artifact is development-only and should not be treated as a production surface.

## Assets

- **User health inputs** — symptom descriptions, disease names, medicine names, medical report text, and report images. These are sensitive health-related data and should be minimized in storage and logs.
- **Application secrets** — `GROQ_API_KEY`, `SESSION_SECRET`, and any future database credentials. Compromise would enable account or provider abuse.
- **Provider budget and service availability** — Groq-backed endpoints are compute- and cost-bearing resources. Abuse can create direct spend and deny service to real users.
- **Client-side stored history** — the health timeline stored in browser localStorage may contain report-derived details on shared devices.

## Trust Boundaries

- **Browser to API** — all user prompts, report text, and OCR image payloads cross from an untrusted client into the Express API.
- **API to Groq** — the server forwards user-controlled health content to Groq using a secret API key and bears the cost of each request.
- **API to logs** — request handling code can copy user-derived fields into server logs, creating a secondary disclosure surface.
- **Client to localStorage** — report summaries and timeline data are persisted in the browser and inherit the browser/device trust model rather than server protections.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox/` is not production-reachable under the current deployment assumptions and should normally be ignored during production scans.

## Scan Anchors

- Production server entry points: `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/*.ts`
- Highest-risk paths: Groq-backed POST routes and `artifacts/api-server/src/routes/ocr-report.ts`
- Public surface: all current `/api` routes are unauthenticated; there is no separate admin surface yet
- Dev-only area to ignore unless proven reachable: `artifacts/mockup-sandbox/`

## Threat Categories

### Tampering

All request bodies must be validated server-side before they influence prompts or downstream API calls. The current architecture correctly uses generated Zod schemas, but future changes must keep validation at the API boundary rather than relying on frontend checks.

### Information Disclosure

User-submitted health content is sensitive even when the app is educational rather than diagnostic. Production handlers must avoid writing raw health inputs to logs, error messages, analytics, or other secondary sinks, and responses must not expose stack traces or provider internals.

### Denial of Service

The public API exposes multiple unauthenticated, billable AI operations. The system must enforce abuse controls such as rate limiting, quotas, and sensible request bounds so an attacker cannot convert the Groq integration into a cost-amplification or service-exhaustion vector.

### Elevation of Privilege

There is no user/admin privilege model yet, so classic authorization flaws are limited today. The more relevant privilege boundary is between anonymous internet users and the server-side Groq key: untrusted callers must not be able to freely consume privileged provider access without server-side abuse protections.
