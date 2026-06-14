# CureCheck

AI-powered healthcare information platform for Indian users — verifies health claims, maps disease journeys, and explains medical reports in plain language.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, `/api`)
- `pnpm --filter @workspace/curecheck run dev` — run the frontend (port 25201, `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `GROQ_API_KEY` — Groq API key for llama-3.3-70b-versatile
- Required env: `SESSION_SECRET` — session secret for Express

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v4 + wouter routing + framer-motion
- API: Express 5 + Groq SDK (llama-3.3-70b-versatile)
- DB: PostgreSQL + Drizzle ORM (future use)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Fonts: Bricolage Grotesque (headings) + Inter (body)
- Theme: Blue-teal healthcare palette, glassmorphism, dark mode via next-themes

## Where things live

- `lib/api-spec/` — OpenAPI spec (source of truth for API contract)
- `lib/api-zod/` — generated Zod schemas for request/response validation
- `lib/api-client-react/` — generated React Query hooks (`useCheckHealthClaim`, `useGetDiseaseJourney`, `useExplainMedicalReport`)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/api-server/src/lib/groq.ts` — Groq client with mock fallbacks
- `artifacts/curecheck/src/pages/` — frontend pages
- `artifacts/curecheck/src/components/` — shared UI components (navbar, disclaimer-banner, theme-provider)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → Zod validation on both ends
- All three AI features are POST mutations (not queries) since they require user input
- Groq with realistic mock fallbacks — if `GROQ_API_KEY` is missing, mocks return India-specific health data
- `response_format: json_object` used in Groq calls to ensure parseable output
- ThemeProvider wraps next-themes, exports `useTheme` for navbar dark mode toggle
- Disclaimer banner shown on every page above the navbar via App.tsx layout

## Product

- **Health Claim Checker** — paste a WhatsApp forward or health claim, get a credibility score (0-100), verdict, red flags, safer interpretation, and doctor questions
- **Disease Journey Map** — enter a disease + age group, get a phase-by-phase journey with common experiences and warning signs
- **Report Explainer** — paste a CBC, thyroid, or any lab report, get plain-language findings, key term explanations, and doctor questions
- Never diagnoses or prescribes — educational only. Disclaimer on every page.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- All API routes are under `/api/` prefix (handled by shared proxy from `artifact.toml`)
- When Groq JSON parse fails, server falls back to mock response (never returns 500 to the user)
- Dark mode applies `.dark` class to `document.documentElement` via next-themes `attribute="class"`
- `pnpm run dev` at root doesn't work — run workflows individually

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
