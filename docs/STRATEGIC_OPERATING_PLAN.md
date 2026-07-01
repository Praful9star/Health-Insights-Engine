# CureCheck — Strategic Operating Plan

**Author role:** Acting CEO / CPO / CSO / Head of Growth / Lead Investor
**Date:** 2026-07-01
**Mandate:** Maximize the probability that CureCheck becomes a ₹1,000+ crore healthcare company in India within 10 years.
**Basis:** Full review of the production codebase (`Health-Insights-Engine`), the live product surface it ships (curecheck.in), and the Indian healthtech competitive landscape.

This is not a list of suggestions. It is a set of decisions, with the reasoning behind each, and an ordered execution plan against this exact codebase.

---

## Phase 1 — Brutal Assessment

### What CureCheck currently is

An AI-powered consumer health *portal* for India. The codebase ships **33 pages and a 22-tool catalog**: report explainer, health claim checker, symptom checker, disease journey, medicine explainer, drug interaction checker, doctor prep, myth buster, ayurveda, pregnancy, cycle tracker, mental health, fitness hub, health calculators, vaccines, insurance, hospital finder, emergency, health news ticker, a **weather widget**, a document vault, and a health timeline. Hindi + English. PWA. Premium tier at ₹99/month / ₹499/year via Razorpay payment links. Every AI feature is a prompt to Groq's `llama-3.3-70b-versatile`, with **silent mock fallbacks when the AI call fails**.

### What it claims to solve

"Health clarity for Indians" — understand your lab report, verify WhatsApp health forwards, prepare for doctor visits, in plain Hindi/English.

### Is the problem worth solving?

**The core problem is real and enormous.** India runs ~1.5–2 billion diagnostic tests a year. The typical patient receives a PDF full of numbers, flags, and US-derived reference ranges, and gets 2–4 minutes with a doctor to understand it. Health misinformation on WhatsApp is a genuine public-health crisis. Low health literacy + high out-of-pocket spend (~50% of Indian health expenditure) means bad information directly costs families money and lives.

**But the product as built does not solve it in a defensible way.** It answers questions the way ChatGPT answers questions — with a general-purpose LLM and a disclaimer.

### Will customers pay?

**For health *information* in India: essentially never.** Indian consumers pay for outcomes and transactions — a test, a medicine, a consult, a policy — not for explanations. Practo learned this; every content-first healthtech learned this. The ₹99/month premium tier is monetizing the one thing Indians have infinite free substitutes for (ChatGPT, Gemini, Google, the family WhatsApp doctor-uncle). And the product currently *contradicts its own pricing*: the homepage FAQ says "Yes, completely free. We believe health clarity should never sit behind a paywall" while `/premium` sells a ₹99 subscription. That single contradiction is a trust-killer on a trust product.

### Is the market large enough?

The Indian healthcare market is ~$180B+ and diagnostics alone is a ~₹1.3 lakh crore market growing double digits. Yes — **the market is large enough, but "AI health explanations" is not a market. It's a feature.** The market is the transaction layer around the explanation.

### Does the product create real value today?

Partially, and it undermines itself:

1. **The mock fallback is disqualifying.** `groq.ts` returns fabricated "realistic" health data when the API fails, "never returns 500 to the user." A health product that silently invents answers when its AI is down has chosen uptime over truth. One screenshot of a wrong mock verdict on a real report ends the company.
2. **The privacy story is incoherent.** The FAQ promises "your queries are never stored on our servers… nothing leaves your browser," while the codebase has a Supabase-backed vault, profile, history, and health-data tables. Either claim could be fine; claiming both is a liability.
3. **22 tools = zero identity.** Weather widgets, news tickers, ayurveda pages, insurance explainers — this is a 2005 health portal wearing a 2026 AI skin. Nobody can say in one sentence what CureCheck is *for*, so nobody remembers to come back.
4. **`llama-3.3-70b` prompted directly on medical content, with no eval suite, no clinical review, no versioned knowledge base**, is not a medical-grade pipeline. It is a demo.

**Verdict: real problem, large market, wrong product shape, wrong monetization, self-sabotaging trust posture. Salvageable — one of the 22 tools is a company. The other 21 are camouflage.**

---

## Phase 2 — Failure Simulation (post-mortem, written from 2029)

*CureCheck shut down in 2029. Here's why.*

Ranked by **probability × severity**:

1. **No wedge, no habit (P: very high, S: fatal).** CureCheck tried to be everything, so it became the app you used once after a scary WhatsApp forward and never opened again. Health information is episodic; without owning a *recurring* moment (a test result arriving, a chronic condition being tracked), DAU stayed near zero and retention curves went to the floor by day 30.
2. **ChatGPT ate the category (P: very high, S: fatal).** By 2027, every Indian smartphone had a free frontier-model assistant that read lab reports, in Hindi, with vision, better than a prompted llama-70b. "Purpose-built for India" was a landing-page claim, not a data asset — CureCheck had no proprietary Indian reference-range corpus, no longitudinal patient data (it stored the timeline in localStorage!), nothing a general model couldn't replicate in one prompt.
3. **Monetization never worked (P: high, S: fatal).** ₹99/month for explanations converted <0.5% of a small user base. No transaction revenue (no lab bookings, no pharmacy, no consults) meant revenue never crossed ₹10 lakh/year. The free/premium messaging contradiction depressed conversion further.
4. **Trust incident (P: medium, S: fatal).** A journalist discovered the mock-fallback behavior — the app returning fabricated credibility scores during a Groq outage — or a user acted on a hallucinated report explanation. In health, one incident is terminal for an unknown brand.
5. **Investors passed because there was nothing to underwrite (P: high, S: severe).** No retention, no revenue, no data moat, no clinical advisor, no regulatory strategy for a product adjacent to medical advice, one founder, and a feature set a Practo intern could clone in a quarter. Every VC said the same thing: "This is a feature of an LLM, not a company."
6. **Distribution never compounded (P: high, S: severe).** Growth was SEO + word of mouth against incumbents (Tata 1mg, Practo, Apollo 24/7) with hundreds of crores in brand spend, and against ChatGPT with zero CAC. CureCheck had no channel it owned.
7. **Founder assumptions that proved wrong:**
   - "More tools = more reasons to visit" → more tools = no identity.
   - "Indians will pay for health clarity" → Indians pay for health *transactions*.
   - "Local-only data storage is a privacy feature" → it destroyed the only possible data moat *and* wasn't even true.
   - "Disclaimers make an AI health product safe" → regulators and journalists don't read disclaimers.
   - "A wrapper around Groq is a product" → the model is the commodity; the data and distribution are the product.

---

## Phase 3 — Competitive Reality Check

| Player | Their game | Can CureCheck beat them at it? |
|---|---|---|
| **Tata 1mg** | Pharmacy + diagnostics e-commerce, massive brand | No. Capital + supply chain game. |
| **Practo** | Doctor discovery + consults | No. Two-sided marketplace with 15-year head start. |
| **Apollo 24/7 / MediBuddy** | Hospital-system & insurer-attached care | No. Institutional distribution. |
| **Eka Care** | ABDM-native PHR + doctor EMR | Partially — Eka is doctor-first; the consumer PHR experience is weak. |
| **HealthPlix / practice EMRs** | Doctor workflow software | No, and shouldn't try. |
| **ChatGPT / Gemini** | General health Q&A, free | **No — and this must be internalized.** Never compete on "ask a health question." |
| **Local diagnostic labs (the ~100,000 small/regional labs outside SRL/Lal/Thyrocare)** | Testing, zero digital patient relationship | **This is the opening.** |

### Where CureCheck cannot win
Anything requiring capital, supply chains, two-sided liquidity, or brand spend: pharmacy delivery, teleconsult marketplaces, insurance, hospital tie-ups at the top end. And anything a frontier LLM does for free: general symptom Q&A, myth checking, health chat.

### Where CureCheck can dominate
**The lab report itself.** Nobody owns the moment an Indian receives a diagnostic report:
- Labs (especially the long tail of regional labs) send a PDF on WhatsApp and the relationship ends there. They have no retention product, no retest reminders, no patient app — and they *feel* this as churn to Tata 1mg.
- Incumbents treat the report as a receipt, not a product. 1mg explains your report only to upsell; Practo doesn't touch it; Eka stores it but barely interprets it.
- ChatGPT explains a report *once* but keeps no structured longitudinal record, has no Indian reference-range corpus, no ABDM integration, no retest workflow, and no lab relationship.

### Ignored opportunities / underserved segments
1. **Tier-2/3 patients with chronic conditions** (diabetes, thyroid, anemia, kidney) who test every 3–6 months and track results in a plastic bag of PDFs.
2. **The regional lab long tail** that needs a white-label patient experience to survive against national chains.
3. **ABDM/ABHA rails**: government-built health-record interoperability that incumbents are adopting slowly and startups can be *native* to.
4. **Hindi-first, WhatsApp-first delivery**: everyone builds apps; the user lives in WhatsApp.

### The unfair advantage a startup can create
**A structured, longitudinal corpus of Indian lab results with India-calibrated reference ranges, acquired through lab-side distribution.** Incumbents can't do the lab long tail (channel conflict — 1mg *competes* with those labs), and ChatGPT structurally can't (no persistence, no distribution deal, no consent framework). That corpus compounds: better parsing → better explanations → more lab partners → more data.

---

## Phase 4 — Redesign From Zero

**Decision: CureCheck becomes the report-intelligence and patient-retention layer for Indian diagnostics.** One product, two faces:

- **For patients:** every lab report you've ever taken — parsed, explained in Hindi/English, tracked over time, with clear "what changed, what to watch, when to retest."
- **For labs:** a white-label "smart report" delivered on WhatsApp that brings the patient back for the retest — sold as a retention product, priced per report.

| | Decision |
|---|---|
| **Mission** | Every Indian understands every medical report they receive — and never loses one. |
| **Vision** | The default layer between India's diagnostic labs and their patients: the health record Indians actually use. |
| **Core problem** | Lab reports are unintelligible receipts; patients don't understand them, don't track them, and don't come back for follow-up testing. |
| **Ideal customer (wedge)** | The chronic tester: 30–60, diabetes/thyroid/lipid/kidney panels every 3–6 months, tier-1/2/3, Hindi-comfortable, lives on WhatsApp. ~100M+ people. Secondary customer: the regional lab that serves them. |
| **Value prop (patient)** | "Bhejo report, samjho report." Send any lab report on WhatsApp → structured explanation, trend vs. your last results, retest reminder. Free. |
| **Value prop (lab)** | "Your patients come back." Smart reports under your brand, retest reminders, repeat-visit analytics. ₹3–5 per report or ₹2,000–10,000/month per collection center. |
| **Business model** | B2B2C SaaS + transactions: (1) per-report/white-label fees from labs, (2) retest booking commissions (7–15% of test value), (3) later: anonymized population-health data products for insurers/pharma under DPDP-compliant consent. **Consumer product stays free. Kill the ₹99 subscription.** |
| **Product strategy** | One flow executed to perfection (report in → structured record + explanation + trend + reminder out), delivered WhatsApp-first, web as the record/deep-dive surface, ABDM-native from month 6. |

### Why this is superior to the current version
1. It monetizes a **transaction** (the retest, the lab's retention spend), not information.
2. It creates the **only defensible asset** available at this size: structured longitudinal Indian lab data + lab distribution contracts.
3. It rides a **recurring trigger** (test every 3–6 months) instead of an episodic one (scary forward), fixing retention structurally.
4. It has a **channel incumbents can't take**: regional labs will never hand patient relationships to Tata 1mg (their competitor), but will pay a neutral layer.
5. It's **buildable by one founder**: the hardest part is parsing + one lab pilot, not liquidity on a marketplace.

---

## Phase 5 — Product Blueprint

**Information architecture (entire product):**
```
WhatsApp Bot (primary interface)          Web App (record + depth)
├─ Send report (PDF/photo)                ├─ Health Record (timeline of all results, per-analyte trends)
├─ Explanation card (HI/EN)               ├─ Report detail (parsed values, ranges, plain-language)
├─ "What changed since last time"         ├─ Doctor Prep (auto-generated Qs from YOUR data)
├─ Retest reminders                       ├─ Share-with-doctor link / ABHA sync
└─ Book retest (partner lab)              └─ Family profiles

Lab Portal (B2B)
├─ Report upload API / bulk WhatsApp dispatch (white-label)
├─ Retention dashboard (retest conversion, repeat rate)
└─ Billing
```

**Feature decisions** (priority P0 = first 90 days, P1 = months 4–9, P2 = year 2):

| Feature | Why it exists | Impact | Complexity | Priority |
|---|---|---|---|---|
| **Report ingestion pipeline** — OCR + deterministic parsers for top 20 Indian lab formats + LLM extraction fallback + human-verified test catalog (LOINC-mapped, Indian ranges) | The company IS this pipeline. LLM-only extraction is not medical-grade. | Foundation of everything | High | **P0** |
| **Explanation engine** — LLM narrates *from parsed structured data only*, grounded in the audited test catalog; evals on a golden set of real reports; refuses instead of guessing | Trust. Kills hallucination class of errors. Replaces the current raw-prompt approach. | Core value | Medium | **P0** |
| **Server-side health record with explicit consent** (replaces localStorage timeline) | The data moat. Local-only storage = no company. DPDP-compliant consent flow. | Moat + retention | Medium | **P0** |
| **WhatsApp bot (Business API)** — send report, get explanation, get reminders | Meets the user where the report already arrives. 10x lower friction than app install. | Primary acquisition + retention channel | Medium | **P0** |
| **Per-analyte trend view** ("Your HbA1c: 8.1 → 7.4 → 6.9") | The single most emotionally powerful screen in the product; reason to send *every* report. | Retention | Low (once parsing exists) | **P0** |
| **Retest reminders** (test-specific intervals, doctor-notes aware) | Drives the monetizable transaction. | Revenue engine | Low | **P0** |
| **Doctor Prep from your own data** (keep, rebuild on structured record) | Bridges to the consult; doctors become promoters instead of skeptics. | Trust + virality | Low | P1 |
| **Lab partner portal + white-label dispatch** | The B2B revenue line and distribution engine. | Revenue + moat | Medium | **P1** |
| **Retest booking with partner labs** | Commission revenue; completes the loop. | Revenue | Medium | P1 |
| **ABHA/ABDM integration** (link records, PHR compliance) | Regulatory tailwind, credibility, future-proof distribution. | Moat | Medium-high | P1 |
| **Family profiles** | Health decisions in India are family decisions; the son manages the parents' reports. | Retention + expansion | Low | P1 |
| **Share-with-doctor link** (clean one-page summary) | Doctor-facing surface without building an EMR; seeds future doctor product. | Virality + trust | Low | P1 |
| **Population-health data products** (aggregated, consented, anonymized) | Second revenue curve (insurers, pharma RWE). | Revenue at scale | High | P2 |
| **Claim Checker** | Keep as free top-of-funnel SEO/viral surface ONLY — it's the best link-bait in the codebase. No investment beyond maintenance. | Acquisition | — | P1 (maintain) |
| **KILL: symptom checker, ayurveda, pregnancy, cycle tracker, mental health, fitness hub, weather, news ticker, insurance, hospital finder, vaccines, calculators, emergency, medicine explainer, drug interaction, disease journey, premium/paywall** | Each one dilutes identity, adds medico-legal surface, and competes with free frontier models. Weather widgets do not belong in a healthcare company. | Focus | — | **P0 (delete)** |

**Trust-building mechanisms (non-negotiable, P0):**
1. **Delete mock fallbacks.** If the pipeline can't parse or the model fails, say so: "We couldn't read this report reliably — a human will review it within 24h" (and actually review it; this doubles as training data).
2. **Named medical review board** (start with 2–3 MD advisors; their names and review process on every explanation: "Explanation framework reviewed by Dr. X, MD Pathology").
3. **One honest privacy policy** matching the actual architecture: consented server storage, DPDP-compliant, delete-anytime, never sold at individual level.
4. **Confidence surfacing**: show parse confidence per value; low-confidence values flagged, never narrated as fact.
5. **Public accuracy report**: quarterly, publish parser accuracy on a benchmark set.

**AI integration decisions:** replace the single Groq `llama-3.3-70b` prompt-and-pray with a pipeline: (a) vision-capable model for OCR/extraction (with deterministic parsers for known formats first), (b) audited structured knowledge base (test catalog, Indian reference ranges) as the *only* source of medical claims, (c) LLM used solely for narration/translation over structured facts, (d) eval harness with a golden set of ≥500 real anonymized Indian reports gating every model/prompt change. Model choice becomes swappable and unimportant — the catalog and evals are the asset.

---

## Phase 6 — Growth Engine

**First 100 users (weeks 1–6): founder-manual, zero code beyond the pipeline.**
Post in 20 Indian diabetes/thyroid Facebook groups, subreddits (r/india, r/IndiaHealth), and family WhatsApp networks: "Send me your lab report, I'll send back a plain-Hindi explanation + trend chart, free." Personally process every report through the pipeline; call 30 of these users. This is customer development wearing a growth costume — it builds the golden eval set *and* the first testimonials simultaneously.

**First 1,000 users (months 2–4): one channel — WhatsApp forwarding of the output.**
Every explanation card ends with "Forward this to family • Send any report to +91-XXXXX." The output artifact is the ad; a well-designed Hindi trend card gets forwarded in exactly the networks where the next chronic tester lives. Target: viral coefficient from the artifact, measured. Supplement with 30 SEO pages that the existing prerender pipeline (`prerender.mjs`) already supports — but rebuilt around **test-name intent**: "RDW high meaning in Hindi," "TSH 6.5 kya karein," "HbA1c 7.2 normal hai kya." These queries have huge Indian volume and garbage competition.

**First 10,000 users (months 4–9): the first lab partnerships.**
Sign 3–5 regional labs / collection centers (founder sells door-to-door in one city — pick one: Lucknow, Jaipur, or Indore, where national chains are squeezing local labs). Their pitch is printed on every report and sent with every WhatsApp PDF: "Understand this report — free." A single mid-size lab does 200–500 reports/day; five labs = 10,000 patients/quarter at effectively zero CAC. This is also where B2B revenue starts.

**First 100,000 users (months 9–24): lab channel × repeatable sales + doctor pull.**
Hire 2 lab-channel salespeople; standardize the white-label offer; expand to 50–100 collection centers across 3 cities. Layer in the share-with-doctor link: every shared summary exposes a doctor to 1 clean CureCheck artifact per patient; doctors who like it tell patients to "put your reports in that app." Continue test-name SEO to 500+ pages. **Deliberately excluded:** paid ads (CAC will never beat the lab channel), app-store plays, influencer marketing, and general health content.

---

## Phase 7 — Moat Creation

1. **Data moat (primary):** the only structured, longitudinal, consented corpus of Indian lab results with India-calibrated reference ranges. Each report improves parsers (format coverage) and the reference corpus (population calibration). After ~5M reports, CureCheck can answer "what's normal for a 45-year-old vegetarian woman in UP" — something neither ChatGPT nor 1mg can. This requires server-side storage (hence killing localStorage-as-privacy-strategy).
2. **Distribution moat:** signed lab contracts with white-label integration. Switching costs are real (patient comms run through CureCheck), and channel conflict blocks incumbents — Tata 1mg cannot be the neutral layer for labs it competes with.
3. **Network effects:** family profiles (one member enrolls the household), doctor-share links (each doctor touched becomes a referral source), and lab-side: more patient retention data → better benchmarking product for labs → more labs.
4. **Brand moat:** own one sentence — *"Report aayi? CureCheck pe daalo."* A brand about one moment beats a portal about everything. The claim checker remains the PR/viral surface feeding this brand.
5. **AI advantage:** not the model — the **eval corpus, audited test catalog, and format parsers**. Models depreciate weekly; a golden set of 50,000 verified Indian report parses does not.
6. **Regulatory moat (later):** ABDM-native architecture + DPDP-grade consent infrastructure becomes a compliance asset competitors must rebuild.

---

## Phase 8 — 10-Year Roadmap

**Year 1 — Prove the wedge.**
Q1: kill 18 tools, delete mock fallbacks, ship parsing pipeline + consented server record + WhatsApp bot. Q2: 1,000 WAU, golden eval set ≥500 reports, 2 MD advisors named. Q3: first 3 lab partners, first B2B revenue. Q4: 10,000 users, 25%+ month-3 retention among chronic testers, retest-reminder → booking loop live. **Milestone to survive: a cohort that sends its *second* report.**

**Year 3 — Own one region's diagnostic layer.**
150+ lab/collection-center partners across 3–5 cities; 500K users; 3M+ reports parsed; ABDM integration live; revenue ₹4–8 crore ARR (70% lab SaaS, 30% booking commissions); seed + Series A raised (~₹40–60 crore total). **Milestone: labs renew because retest conversion demonstrably improves (target +15–25%).**

**Year 5 — National layer.**
2,000+ lab partners including one national chain OR a Tier-1 hospital-lab system; 5M users; 30M+ reports; population-health data products launched with 2 insurers; revenue ₹60–100 crore ARR; Series B. Doctor-side product (report inbox for physicians) opens the second market. **Milestone: CureCheck data cited in an Indian clinical/public-health publication — the credibility flywheel.**

**Year 10 — The health record Indians actually use.**
30M+ users, 100,000+ lab touchpoints, the default PHR on ABDM rails; revenue ₹400–700 crore across lab SaaS, transaction commissions, insurer/pharma data products, and doctor tools. At 4–8x revenue multiples for profitable healthtech infrastructure, that is a ₹2,000–5,000 crore company — the ₹1,000 crore bar is crossed between years 7 and 9. **Milestone: when a patient changes labs, the lab asks for their CureCheck ID.**

---

## Phase 9 — Investment Committee Review

**Would I invest in CureCheck as it exists today?** No. It is a feature buffet on a commodity model with contradictory monetization, no retention mechanism, no data asset, and a trust-destroying fallback behavior. No institutional investor funds this version.

**Would I invest in the redesigned company?** Yes — at pre-seed, **₹8–12 crore post-money for ₹1.5–2 crore**, contingent on evidence:
1. 500 users who sent a **second** report unprompted (retention proof).
2. One signed lab pilot with a paying LOI (channel proof).
3. Parser accuracy ≥98% on the top-10 formats, published (product proof).
4. A named medical advisor and a DPDP-compliant consent architecture (trust proof).

**Remaining risks, honestly:** (a) frontier models + WhatsApp AI assistants commoditize explanation faster than the data moat forms — mitigated only by lab distribution speed; (b) lab sales cycles drag (labs are cash businesses run on thin margins) — mitigated by per-report pricing with zero setup cost; (c) regulatory tightening on AI health tools — mitigated by the "explain, never diagnose" line, medical review board, and ABDM alignment; (d) single-founder execution risk on a B2B2C motion — the first hire must be a lab-channel operator, not an engineer.

---

## Execution Plan Against This Codebase

The stack (pnpm workspaces, React/Vite, Express 5, contract-first OpenAPI→Orval→Zod, Supabase/Drizzle, Razorpay, prerender SEO) is **kept** — the architecture problem is not the framework, it's what's built on it. Ordered changes:

### Sprint 0 (week 1) — Stop the bleeding (trust + honesty)
1. **Delete mock fallbacks** in `artifacts/api-server/src/lib/groq.ts` and every route that uses them. Failures return an honest "couldn't process" state with a review-queue entry. *(Why first: it's the existential trust risk and a one-day change.)*
2. **Resolve the free/premium contradiction**: remove the ₹99 premium — delete `pages/premium.tsx`, `components/paywall.tsx`, `routes/payments.ts`, `routes/entitlement.ts`, `supabase/migrations/002_premium.sql`/`005_subscriptions.sql` usage. Consumer product is free, full stop. *(Razorpay integration knowledge is preserved in git history for the future lab-billing and retest-booking flows.)*
3. **Rewrite the privacy policy + FAQ** (`pages/privacy.tsx`, home FAQ) to match reality, ahead of the consent work in Sprint 2.

### Sprint 1 (weeks 2–4) — Focus the product
4. **Cut the tool catalog** (`src/data/tool-catalog.ts`, router in `App.tsx`, `mobile-bottom-nav.tsx`, `explore-sheet.tsx`): keep report-explainer, health-timeline, doctor-prep, claim-checker, vault. Delete pages + routes for the other ~17 tools (weather, news, ayurveda, fitness, insurance, hospital-finder, pregnancy, cycle-tracker, mental-health, calculators, vaccines, emergency, symptom-checker, medicine-explainer, drug-interaction, disease-journey, myth-buster stays only as static SEO pages). 301 old URLs in the prerender/rewrite maps to preserve SEO equity.
5. **Reposition home** (`pages/home.tsx`): one promise — "Understand every lab report. Track every value. Hindi ya English." Remove weather widget, news ticker, quote of day, daily myth from the hero surface.

### Sprint 2 (weeks 3–8) — Build the actual company
6. **Report ingestion pipeline** (new `lib/report-parser` package): extend the existing `routes/ocr-report.ts` into OCR → format detection → deterministic parsers for the top formats (start with the 3 formats most seen in the first 100 manual users) → LLM extraction fallback → confidence scores. Add `lib/test-catalog`: LOINC-mapped analyte definitions with Indian reference ranges, human-audited, versioned in-repo.
7. **Eval harness** (`scripts/evals`): golden set of anonymized real reports; CI gate — no prompt/model/parser change merges without eval pass. This replaces "trust the model" with "trust the tests."
8. **Consented server-side health record**: new migrations (`observations` table keyed by analyte × date × user), explicit consent flow at first save, DPDP-compliant delete. Migrate the localStorage timeline in (`pages/health-timeline.tsx` gains an import step). Per-analyte **trend view** ships here.
9. **Explanation engine rebuild** (`routes/report-explainer.ts`): LLM narrates only from parsed values + catalog facts; refusal path when confidence is low.

### Sprint 3 (weeks 8–14) — Distribution surfaces
10. **WhatsApp Business API bot** (new `artifacts/whatsapp-bot`): report in → explanation card + trend image out; reminder scheduler (extends `routes/notifications.ts` infrastructure).
11. **Retest reminders + doctor-share links**: reminder intervals in the test catalog; public read-only summary route (prerender-friendly).
12. **Test-name SEO pages**: generate ~100 analyte pages ("TSH high in Hindi") from the test catalog through the existing `prerender.mjs` pipeline — the catalog becomes the CMS.

### Sprint 4 (months 4–6) — B2B layer
13. **Lab partner portal** (new artifact): bulk upload/API, white-label WhatsApp dispatch, retention dashboard, per-report billing (Razorpay returns here, on the B2B side where it belongs).
14. **ABHA linking** begins.

Everything above is sequenced so that each sprint ships user-visible value, the trust fixes land before any growth push, and the data moat (structured record) exists before the distribution engine (labs, WhatsApp) pours users in.

---

## The One-Paragraph Version

CureCheck today is a 22-tool AI health portal that nobody will pay for, competing with free frontier models on their home turf, with a fallback behavior that fabricates health answers. The company inside it is one tool: the report explainer. Rebuild around it — **the report-intelligence and patient-retention layer for Indian diagnostics** — free and WhatsApp-first for patients, sold per-report to the 100,000 regional labs that national chains are squeezing, on a foundation of deterministic parsing, an audited Indian test catalog, and a consented longitudinal record. That version has a recurring trigger, a transaction to monetize, a channel incumbents can't take, and a data asset that compounds. The current version has none of the four.
