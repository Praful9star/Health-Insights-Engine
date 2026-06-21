/**
 * Static prerender script — generates per-route HTML files with:
 *  1. Route-specific head metadata (<title>, canonical, og:*, twitter:*)
 *  2. React-rendered body content via react-dom/server (SSR) so non-JS
 *     crawlers receive meaningful HTML in <div id="root">.
 *
 * Run AFTER:
 *   vite build                         → dist/public/  (client bundle)
 *   vite build --ssr src/entry-server.tsx → dist/server/  (SSR bundle)
 *
 * Usage: node prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "dist/public");
const templatePath = join(distDir, "index.html");

const BASE_URL = "https://curecheck.in";
const OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

// ---------------------------------------------------------------------------
// Mock browser globals BEFORE importing the SSR bundle.
// Many packages guard with `typeof window` / `typeof localStorage`, so we
// set these up to avoid ReferenceErrors in module-level code.
// ---------------------------------------------------------------------------
if (typeof globalThis.localStorage === "undefined") {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}
if (typeof globalThis.sessionStorage === "undefined") {
  globalThis.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}
if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
if (typeof globalThis.requestAnimationFrame === "undefined") {
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 16);
}
if (typeof globalThis.cancelAnimationFrame === "undefined") {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}
if (typeof globalThis.navigator === "undefined") {
  globalThis.navigator = { userAgent: "Node.js/SSR", language: "en" };
}

// ---------------------------------------------------------------------------
// Route metadata: [path, title, description]
// ---------------------------------------------------------------------------
const ROUTES = [
  [
    "/",
    "CureCheck — AI Health Platform for India | Reports, Medicines & More",
    "India's free AI health platform. Decode blood reports in plain language, check medicines, verify health myths, track fitness, find hospitals and get emergency guides — in Hindi & English.",
  ],
  [
    "/claim-checker",
    "Health Claim Checker — Verify WhatsApp Health Forwards",
    "Paste any WhatsApp health claim and get an AI-powered credibility score with red flags, safer interpretation, and doctor questions. Free for India.",
  ],
  [
    "/symptom-checker",
    "Symptom Checker — AI-Powered Health Assessment for India",
    "Describe your symptoms and get an AI assessment of possible causes, urgency level, and questions to ask your doctor. Free tool, built for India.",
  ],
  [
    "/report-explainer",
    "Medical Report Explainer — Decode Your Lab Reports",
    "Upload your CBC, thyroid, or any lab report and get a plain-language explanation of your results in Hindi and English. Free AI health tool for India.",
  ],
  [
    "/medicine-explainer",
    "Medicine Explainer — Understand Your Medications",
    "Get plain-language explanations of any medicine prescribed in India — uses, dosage, side effects, and drug interactions. Free AI health tool.",
  ],
  [
    "/disease-journey",
    "Disease Journey Map — Understand Your Condition",
    "Enter any disease to get a clear phase-by-phase journey map with common experiences, warning signs, and care tips tailored for India.",
  ],
  [
    "/myth-buster",
    "Health Myth Buster — Fact-Check Indian Health Claims",
    "Science-backed verdicts on common Indian health myths — from turmeric to giloy, Ayurveda to modern medicine. Free fact-checking tool.",
  ],
  [
    "/health-timeline",
    "Health Timeline — Track Your Medical History",
    "Log and track your health reports, symptoms, and test results over time. Visualise trends and prepare better for doctor visits. Free tool for India.",
  ],
  [
    "/fitness-hub",
    "Fitness Hub — Personalised Workout & Wellness Plans",
    "Get AI-tailored fitness and wellness recommendations built around Indian lifestyles, dietary habits, and health goals. Track daily progress free.",
  ],
  [
    "/mental-health",
    "Mental Health Support — Resources & Helplines for India",
    "Compassionate mental health tools and resources for India — stress assessment, grounding techniques, crisis helplines, and therapist directories.",
  ],
  [
    "/hospitals",
    "Hospital Finder — Find Hospitals Near You in India",
    "Find hospitals, clinics, and healthcare centres near you across India with ratings, specialties, and contact details. Uses your location.",
  ],
  [
    "/calculators",
    "Health Calculators — BMI, Calories & More for India",
    "Free health calculators for BMI, daily calorie needs, ideal weight, water intake, and more — calibrated for Indian body types.",
  ],
  [
    "/emergency",
    "Emergency Guide — First Aid & Emergency Contacts India",
    "India-specific first aid guides and emergency contacts — 108, AIIMS, poison control, and local hospitals. Works offline. Free.",
  ],
  [
    "/vaccines",
    "Vaccine Guide — India's Immunisation Schedule",
    "Complete vaccine schedules for children and adults in India per the National Immunization Schedule — with FAQs and where to get vaccinated.",
  ],
  [
    "/ayurveda",
    "Ayurveda Guide — Evidence-Based Traditional Medicine",
    "Learn which Ayurvedic herbs and home remedies have scientific backing and which are myths. Safe, honest guidance for Indian traditional medicine.",
  ],
  [
    "/insurance",
    "Health Insurance Guide — Understand Your Policy in India",
    "Understand your Indian health insurance policy, claim process, and coverage limits in plain language. Includes free government schemes.",
  ],
  [
    "/pregnancy",
    "Pregnancy Guide — Week-by-Week Health Information India",
    "Week-by-week pregnancy guidance for Indian mothers — nutrition, ANC tests, warning signs, and questions to ask your doctor. Free tracker.",
  ],
  [
    "/news",
    "Health News — Latest Medical Updates for India",
    "Latest health news, drug approvals, and medical research updates relevant to Indian patients and healthcare. Updated daily.",
  ],
  [
    "/drug-interaction",
    "Drug Interaction Checker — Safe Medication Use in India",
    "Check if your medicines interact dangerously with each other. Free AI-powered drug interaction checker for India. Enter up to 5 medicines.",
  ],
  [
    "/doctor-prep",
    "Doctor Appointment Prep — Get More From Your Visit",
    "Prepare smarter questions and notes before your doctor visit. Never leave confused or forget your concerns again. Free AI tool for India.",
  ],
  [
    "/premium",
    "CureCheck Premium — Advanced AI Health Tools",
    "Unlock unlimited AI health analysis, priority report explanation, and ad-free experience with CureCheck Premium. Built for India.",
  ],
  [
    "/weather",
    "Health Weather — Air Quality & Allergy Alerts India",
    "Real-time air quality index, pollen counts, and personalised health advisories based on your local weather across India.",
  ],
  [
    "/about",
    "About CureCheck — Our Mission & Values",
    "CureCheck fights health misinformation in India with free, AI-powered tools. Learn about our mission, values, and how we work.",
  ],
  [
    "/login",
    "Sign In — CureCheck",
    "Sign in to CureCheck to save your health history, access premium tools, and personalise your experience.",
  ],
];

// ---------------------------------------------------------------------------
// Head metadata builder
// ---------------------------------------------------------------------------
function buildHeadBlock(path, title, description) {
  const canonical = path === "/" ? BASE_URL + "/" : BASE_URL + path;
  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="CureCheck" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OG_IMAGE}" />
    <meta name="twitter:image:alt" content="${title}" />`.trim();
}

/**
 * Replace the title+meta block (from <title> up to the first <link rel="icon">)
 * with route-specific tags.
 */
function injectHead(template, path, title, description) {
  const headBlock = buildHeadBlock(path, title, description);
  const metaBlockRegex = /(<title>[\s\S]*?<\/title>[\s\S]*?)(<link rel="icon")/;
  if (!metaBlockRegex.test(template)) {
    return template.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  }
  return template.replace(metaBlockRegex, (_m, _before, iconTag) => {
    return `${headBlock}\n    ${iconTag}`;
  });
}

/**
 * Replace the SPA shell root div (empty OR already containing content from a
 * previous prerender run) with the SSR-rendered body so crawlers see actual
 * page markup. Handles both `<div id="root"></div>` and filled variants.
 */
function injectBody(template, bodyHtml) {
  if (!bodyHtml) return template;
  // Match <div id="root"> ... </div> where ... can be empty or already filled.
  // Use a lazy match to avoid grabbing sibling elements after </div>.
  // Anchored to the specific id attribute to avoid false positives.
  return template.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${bodyHtml}</div>`,
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const template = readFileSync(templatePath, "utf8");

// Import the SSR render function (built by `vite build --ssr`)
let ssrRender = null;
try {
  const ssrBundle = await import(
    join(__dirname, "dist/server/entry-server.js")
  );
  ssrRender = ssrBundle.render;
  console.log("✓ SSR bundle loaded — body content will be prerendered.\n");
} catch (err) {
  console.warn(
    `⚠  SSR bundle not found or failed to load (${err.message}).\n` +
      `   Falling back to head-only prerender (metadata will still be injected).\n`,
  );
}

let generated = 0;

for (const [path, title, description] of ROUTES) {
  // 1. Inject route-specific head metadata
  let html = injectHead(template, path, title, description);

  // 2. Inject SSR body HTML
  if (ssrRender) {
    try {
      const bodyHtml = ssrRender(path);
      html = injectBody(html, bodyHtml);
    } catch (err) {
      console.warn(`  ⚠  SSR render failed for ${path}: ${err.message}`);
    }
  }

  // 3. Write file
  if (path === "/") {
    writeFileSync(templatePath, html, "utf8");
    console.log(`✓  /  →  dist/public/index.html`);
  } else {
    const routeDir = join(distDir, path.slice(1));
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, "index.html"), html, "utf8");
    console.log(`✓  ${path}  →  dist/public${path}/index.html`);
  }

  generated++;
}

console.log(`\nPrerendered ${generated} routes.`);
