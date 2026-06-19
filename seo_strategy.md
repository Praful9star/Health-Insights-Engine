# SEO Strategy

## In scope
- Public CureCheck web routes served by `artifacts/curecheck`
- Public landing, informational, and tool pages intended for search, social sharing, and AI citation
- Route clusters currently exposed in the router, including the myth library and its detail URLs

## Out of scope
- API endpoints under `/api/**`
- Authenticated or account-oriented surfaces not intended for search discovery
- Dev-only mockup artifact (`artifacts/mockup-sandbox/**`)
- Separate ad artifact (`artifacts/curecheck-ad/**`)

## Target audience
- Indian consumers seeking plain-language health information and educational explainers
- Users who need English- and Hindi-friendly guidance around symptoms, medicines, reports, and health misinformation

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
- CureCheck is no longer a pure SPA for public pages. It now uses a hybrid static-prerender pipeline driven by `prerender.mjs` plus explicit static rewrites in `.replit-artifact/artifact.toml`.
- Most primary public routes now ship prerendered HTML with route-specific titles, descriptions, canonicals, and social tags.
- The largest remaining SEO gap is route drift: any public URL omitted from the prerender map and rewrite map loses first-response HTML fidelity, even if the client app can recover after hydration.
- `/myth-buster/:slug` is the highest-impact remaining route cluster because it is exposed publicly but still falls back to the home shell for first-response HTML.
- `robots.txt` and `llms.txt` are currently healthy and do not appear to block mainstream search or AI crawlers.
