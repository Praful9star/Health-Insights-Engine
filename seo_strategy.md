# SEO Strategy

## In scope
- Public CureCheck web routes served by `artifacts/curecheck`
- Landing page (`/`)
- Public tool and informational routes:
  - `/report-explainer`
  - `/medicine-explainer`
  - `/health-timeline`
  - `/fitness-hub`
  - `/myth-buster`
  - `/symptom-checker`
  - `/disease-journey`
  - `/claim-checker`
  - `/about`

## Out of scope
- API endpoints under `/api/**`
- Dev-only mockup artifact (`artifacts/mockup-sandbox/**`)
- Separate ad artifact (`artifacts/curecheck-ad/**`)
- Generated 404 route behavior except where it affects crawlability of public routes

## Target audience
- Indian consumers seeking plain-language health information and educational explainers
- Users who need English and Hindi-friendly health guidance

## Primary keywords
- Inferred, subject to refinement:
  - health claim checker india
  - medical report explainer india
  - medicine explainer india
  - symptom checker india
  - disease journey information
  - health misinformation india

## Dismissed categories
- None yet

## Notes from latest scan
- Public routes are currently served as a Vite SPA with client-side `wouter` routing rather than SSR or prerendered HTML.
- The highest-impact SEO work is to give each public route a real first-response HTML document with route-specific metadata.
