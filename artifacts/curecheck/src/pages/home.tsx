import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, lazy, Suspense, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import PageMeta from "@/components/page-meta";
import {
  FileSearch, Pill, ArrowRight,
  ShieldCheck, TrendingUp,
  Activity, FlaskConical, MapPin, Share2,
  Brain, Leaf, Syringe, Baby, Newspaper, Calculator, PhoneCall, Shield, Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CureCheckMark } from "@/components/logo";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/language-context";
import DailyCheckIn from "@/components/daily-checkin";
const WhatsAppShare = lazy(() => import("@/components/whatsapp-share").then(m => ({ default: m.WhatsAppShare })));
const NewsTicker = lazy(() => import("@/components/news-ticker"));
const WeatherWidget = lazy(() => import("@/components/weather-widget"));

/* ─── Animation variants ───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ─── ECG animation — glowing ────────────────────────────────────────── */
function EcgAnimation() {
  const path = "M0,28 L130,28 L145,28 L153,5 L161,51 L168,5 L176,51 L183,28 L313,28 L328,28 L336,5 L344,51 L351,5 L359,51 L366,28 L496,28 L511,28 L519,5 L527,51 L534,5 L542,51 L549,28 L679,28 L694,28 L702,5 L710,51 L717,5 L725,51 L732,28 L862,28 L877,28 L885,5 L893,51 L900,5 L908,51 L915,28 L1045,28 L1060,28 L1068,5 L1076,51 L1083,5 L1091,51 L1098,28 L1228,28 L1243,28 L1251,5 L1259,51 L1266,5 L1274,51 L1281,28 L1440,28";
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="flex ecg-scroll" style={{ width: "200%" }}>
        {[0, 1].map((k) => (
          <svg key={k} viewBox="0 0 1440 56" className="h-16" style={{ width: "50%", flexShrink: 0 }} preserveAspectRatio="none">
            {/* Glow layer */}
            <path d={path} fill="none" stroke="hsl(183 100% 60%)" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.18"
              style={{ filter: "none" }} />
            {/* Main line */}
            <path d={path} fill="none" stroke="hsl(183 100% 55%)" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
              style={{ filter: "drop-shadow(0 0 6px hsl(183 100% 60% / 0.9))" }} />
          </svg>
        ))}
      </div>



    </div>
  );
}



/* ─── Primary tools ──────────────────────────────────────────────────── */
const PRIMARY_TOOLS = [
  {
    icon: FileSearch, href: "/report-explainer",
    accent: "text-primary", bg: "bg-primary/10",
    title: { en: "AI Report Explainer", hi: "AI रिपोर्ट व्याख्याकार" },
    desc: { en: "Paste any blood test, thyroid panel or CBC. Get plain-English (or Hindi) explanation, abnormal values highlighted with why they matter, and exact questions to ask your doctor.", hi: "कोई भी ब्लड टेस्ट, थायरॉइड या CBC पेस्ट करें। सरल हिंदी में समझाव, असामान्य मान क्यों मायने रखते हैं, और डॉक्टर से पूछने के सटीक सवाल।" },
    primary: true,
  },
  {
    icon: Pill, href: "/medicine-explainer",
    accent: "text-violet-400", bg: "bg-violet-500/10",
    title: { en: "Medicine Guide", hi: "दवा मार्गदर्शिका" },
    desc: { en: "Enter any medicine name. Get what it does, side effects, best time to take, and key precautions.", hi: "कोई भी दवा का नाम डालें। वो क्या करती है, दुष्प्रभाव, कब लें, और सावधानियाँ।" },
    primary: false,
  },
  {
    icon: Stethoscope, href: "/symptom-checker",
    accent: "text-sky-400", bg: "bg-sky-500/10",
    title: { en: "Symptom Checker", hi: "लक्षण जांच" },
    desc: { en: "Describe your symptoms. Get a plain-language overview of possible causes and when to see a doctor.", hi: "अपने लक्षण बताएं। संभावित कारणों और डॉक्टर से कब मिलें का सरल विवरण पाएं।" },
    primary: false,
  },
];

const ALL_TOOLS = [
  { icon: Stethoscope, href: "/symptom-checker",   accent: "text-sky-400",     bg: "bg-sky-500/10",     en: "Symptom Checker",      hi: "लक्षण जांच"          },
  { icon: Activity,    href: "/disease-journey",   accent: "text-violet-400",  bg: "bg-violet-500/10",  en: "Disease Journey",      hi: "रोग यात्रा"          },
  { icon: FlaskConical,href: "/claim-checker",     accent: "text-rose-400",    bg: "bg-rose-500/10",    en: "Claim Checker",        hi: "दावा जांच"           },
  { icon: Pill,        href: "/drug-interaction",  accent: "text-red-400",     bg: "bg-red-500/10",     en: "Drug Interactions",    hi: "दवा इंटरेक्शन"      },
  { icon: Calculator,  href: "/calculators",       accent: "text-teal-400",    bg: "bg-teal-500/10",    en: "Health Calculators",   hi: "कैलकुलेटर"          },
  { icon: MapPin,      href: "/hospitals",         accent: "text-emerald-400", bg: "bg-emerald-500/10", en: "Hospital Finder",      hi: "अस्पताल खोजें"      },
  { icon: PhoneCall,   href: "/emergency",         accent: "text-orange-400",  bg: "bg-orange-500/10",  en: "Emergency & First Aid",hi: "आपातकाल"            },
  { icon: Brain,       href: "/mental-health",     accent: "text-purple-400",  bg: "bg-purple-500/10",  en: "Mental Health",        hi: "मानसिक स्वास्थ्य"  },
  { icon: Syringe,     href: "/vaccines",          accent: "text-cyan-400",    bg: "bg-cyan-500/10",    en: "Vaccine Schedule",     hi: "टीकाकरण"            },
  { icon: Leaf,        href: "/ayurveda",          accent: "text-lime-400",    bg: "bg-lime-500/10",    en: "Ayurveda Guide",       hi: "आयुर्वेद"           },
  { icon: Shield,      href: "/insurance",         accent: "text-indigo-400",  bg: "bg-indigo-500/10",  en: "Insurance Guide",      hi: "बीमा गाइड"          },
  { icon: Baby,        href: "/pregnancy",         accent: "text-pink-400",    bg: "bg-pink-500/10",    en: "Pregnancy Tracker",    hi: "गर्भावस्था"         },
  { icon: Newspaper,   href: "/news",              accent: "text-amber-400",   bg: "bg-amber-500/10",   en: "Health News",          hi: "स्वास्थ्य समाचार"  },
  { icon: TrendingUp,  href: "/myth-buster",       accent: "text-rose-400",    bg: "bg-rose-500/10",    en: "Myth Buster",          hi: "मिथक बस्टर"         },
];


const FAQS = [
  { q: { en: "Is CureCheck a replacement for a doctor?", hi: "क्या CureCheck डॉक्टर का विकल्प है?" }, a: { en: "Absolutely not. CureCheck helps you understand your reports so you can have better conversations with your doctor. It never diagnoses or prescribes.", hi: "बिल्कुल नहीं। CureCheck आपको रिपोर्ट समझने में मदद करता है ताकि आप डॉक्टर से बेहतर बात कर सकें। यह कभी निदान या दवा नहीं देता।" } },
  { q: { en: "Is my health data private?", hi: "क्या मेरा डेटा सुरक्षित है?" }, a: { en: "Your queries are never stored on our servers. The Health Timeline saves data locally on your device only — nothing leaves your browser.", hi: "आपके प्रश्न हमारे सर्वर पर कभी संग्रहीत नहीं होते। स्वास्थ्य समयरेखा केवल आपके डिवाइस पर स्थानीय रूप से सहेजी जाती है।" } },
  { q: { en: "Which reports does it support?", hi: "कौन सी रिपोर्ट समझा सकता है?" }, a: { en: "CBC, thyroid panel, lipid profile, blood glucose, HbA1c, liver function, kidney function, Vitamin D, iron studies, and most other Indian lab reports.", hi: "CBC, थायरॉइड, लिपिड प्रोफ़ाइल, ब्लड ग्लूकोज़, HbA1c, लिवर फंक्शन, किडनी फंक्शन, विटामिन D और अधिकतर भारतीय लैब रिपोर्ट।" } },
  { q: { en: "Is the Fitness Hub medically accurate?", hi: "क्या फिटनेस केंद्र चिकित्सकीय रूप से सटीक है?" }, a: { en: "The Fitness Hub provides general nutrition and wellness guidance for healthy adults. It is not medical advice. Always consult a doctor for medical conditions.", hi: "फिटनेस केंद्र स्वस्थ वयस्कों के लिए सामान्य पोषण और स्वास्थ्य मार्गदर्शन देता है। यह चिकित्सा सलाह नहीं है।" } },
  { q: { en: "Is this service free?", hi: "क्या यह सेवा मुफ्त है?" }, a: { en: "Yes, completely free. No subscription. No account required to analyze a report or check a medicine.", hi: "हाँ, पूरी तरह मुफ्त। कोई subscription नहीं। Report analyze करने या दवा चेक करने के लिए कोई account नहीं चाहिए।" } },
];

/* ─── useBelowFold — defers below-fold render until sentinel is visible ── */
function useBelowFold(rootMargin = "300px") {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

/* ════════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { language, t } = useLanguage();
  const { ref: belowFoldRef, visible: belowFoldVisible } = useBelowFold("300px");

  return (
    <div className="relative z-10">
      <PageMeta
        title="CureCheck — Free AI Health Information for Indians"
        description="Free AI-powered health platform for India. Check health claims from WhatsApp forwards, understand symptoms, decode medical reports, and learn about medicines — in Hindi &amp; English."
        path="/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": FAQS.map(f => ({
            "@type": "Question",
            "name": f.q.en,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.a.en
            }
          }))
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalWebPage",
          "name": "CureCheck — Free AI Health Information for Indians",
          "url": "https://curecheck.in",
          "description": "Free AI-powered health platform for India covering health claim checking, symptom analysis, medical report explanation, and medicine information.",
          "audience": { "@type": "Patient" },
          "medicalAudience": { "@type": "MedicalAudience", "audienceType": "Patient" },
          "about": { "@type": "MedicalCondition", "name": "General Health Information" },
          "inLanguage": ["en-IN", "hi-IN"]
        })}</script>
      </Helmet>

      {/* ══ NEWS TICKER ══════════════════════════════════════════════ */}
      <Suspense fallback={null}>
        <NewsTicker />
      </Suspense>

      <DailyCheckIn />

      {/* ══ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative  overflow-hidden pt-16 pb-32 px-4" aria-label="Hero">

        {/* Big central glow behind content */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[420px] rounded-full"
            style={{
              background: "transparent",
              filter: "none",
            }} />
          {/* Purple accent blob — top right */}
          <div className="absolute -top-20 right-0 w-[380px] h-[380px] rounded-full"
            style={{ background: "transparent", filter: "none" }} />
          {/* Teal blob — bottom left */}
          <div className="absolute bottom-0 -left-10 w-[300px] h-[300px] rounded-full"
            style={{ background: "transparent", filter: "none" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-7">
            <div className="flex items-center gap-3">
              <CureCheckMark size={40} id="hero-logo" />
              <span className="font-serif font-800 text-foreground text-3xl tracking-tight leading-none">
                Cure<span className="text-primary">Check</span>
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-serif font-800 [letter-spacing:var(--type-tracking-h1)] [line-height:var(--type-leading-display)] text-foreground max-w-3xl"
          >
            {t("AI Report Explainer You Can Understand", "AI रिपोर्ट व्याख्याकार जिसे आप समझ सकते हैं")}
          </motion.h1>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-8 w-full max-w-lg mx-auto"
          >
             <div className="glass-panel rounded-2xl p-5 border border-border/40 text-left bg-background/50 backdrop-blur-md relative overflow-hidden">


                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                     <FileSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-700 text-foreground">
                      {t("Report Analysis", "रिपोर्ट विश्लेषण")}
                    </h3>
                    <p className="text-xs text-muted-foreground">Demo Data</p>
                  </div>
                </div>

                <div role="list" aria-label="Sample report values" className="space-y-2">
                  <div role="listitem" aria-label="Hemoglobin 10.2 g/dL — Low" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-600 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span aria-hidden="true">{t("Hemoglobin", "हीमोग्लोबिन")}</span>
                    <span aria-hidden="true" className="data-value">10.2<span className="data-unit">g/dL</span></span>
                    <span aria-hidden="true" className="data-status">LOW</span>
                  </div>
                  <div role="listitem" aria-label="Blood Sugar 142 mg/dL — High" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-600 bg-red-500/10 text-red-400 border border-red-500/20">
                    <span aria-hidden="true">{t("Blood Sugar", "रक्त शर्करा")}</span>
                    <span aria-hidden="true" className="data-value">142<span className="data-unit">mg/dL</span></span>
                    <span aria-hidden="true" className="data-status">HIGH</span>
                  </div>
                  <div role="listitem" aria-label="Platelets 2,40,000 /mcL — Normal" className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-600 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span aria-hidden="true">{t("Platelets", "प्लेटलेट्स")}</span>
                    <span aria-hidden="true" className="data-value">2,40,000<span className="data-unit">/mcL</span></span>
                    <span aria-hidden="true" className="data-status">NORMAL</span>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                   {t("Plain-English explanation, abnormal values highlighted with why they matter, and exact questions to ask your doctor.", "सरल हिंदी में समझाव, असामान्य मान क्यों मायने रखते हैं, और डॉक्टर से पूछने के सटीक सवाल।")}
                </p>
             </div>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-8 flex justify-center w-full"
          >
            <Link href="/report-explainer">
              <Button size="lg"
                className="gap-2 rounded-full px-8 h-12 text-base font-700"
                data-testid="button-hero-report"
              >
                <FileSearch className="w-5 h-5" />
                {t("Analyze My Report", "मेरी रिपोर्ट Analyze करें")}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* ECG line — glowing */}
        <EcgAnimation />
      </section>

      {/* ══ WEATHER + HEALTH TIPS ════════════════════════════════════ */}
      <section className="px-4 pt-6 pb-0" aria-label="Weather and health tips">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <Suspense fallback={<div className="h-20 rounded-2xl bg-muted/20 animate-pulse" />}>
              <WeatherWidget />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* ══ PRIMARY TOOLS ════════════════════════════════════════════ */}
      <section className="py-16 px-4" aria-labelledby="primary-tools-heading">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-8">
            <p className="mono-label text-primary/80 mb-3">{t("Start here", "यहाँ से शुरू करें")}</p>
            <h2 id="primary-tools-heading" className="text-3xl sm:text-4xl font-serif font-800 text-foreground">
              {t("Paste a report. Understand it in minutes.", "रिपोर्ट paste करें। मिनटों में समझें।")}
            </h2>
          </motion.div>

          <div className="flex flex-col gap-3">
            {PRIMARY_TOOLS.map((tool, i) => (
              <motion.div key={tool.href} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                {tool.primary ? (
                  <Link href={tool.href}>
                    <div className="group glass-panel rounded-2xl p-7 border border-primary/40 hover:border-primary/70 transition-all cursor-pointer">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl ${tool.bg} ${tool.accent} flex items-center justify-center`}>
                          <tool.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-serif font-700 text-foreground">
                          {language === "hi" ? tool.title.hi : tool.title.en}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {language === "hi" ? tool.desc.hi : tool.desc.en}
                      </p>
                      <Button size="sm" className="gap-2 rounded-full px-5 pointer-events-none" data-testid="button-primary-report">
                        <FileSearch className="w-4 h-4" /> {t("Analyze My Report", "मेरी रिपोर्ट analyze करें")}
                      </Button>
                    </div>
                  </Link>
                ) : (
                  <Link href={tool.href}>
                    <div className="group glass-panel rounded-xl p-5 border border-border/30 hover:border-border/60 transition-all cursor-pointer flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-xl ${tool.bg} ${tool.accent} flex items-center justify-center flex-shrink-0`}>
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-serif font-700 text-foreground">
                          {language === "hi" ? tool.title.hi : tool.title.en}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {language === "hi" ? tool.desc.hi : tool.desc.en}
                        </p>
                      </div>
                      <span className={`text-xs font-600 ${tool.accent} flex-shrink-0`}>Open →</span>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div ref={belowFoldRef} aria-hidden="true" />
      {belowFoldVisible && (
        <>
      {/* ══ MORE TOOLS ═══════════════════════════════════════════════ */}
      <section className="py-10 px-4 border-t border-border/20" aria-label="More tools">
        <div className="max-w-2xl mx-auto">
          <p className="mono-label text-muted-foreground/60 mb-4">{t("More tools", "अधिक उपकरण")}</p>
          <div className="flex flex-wrap gap-2">
            {ALL_TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href}>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 hover:border-border/60 transition-colors cursor-pointer">
                  <tool.icon className={`w-3.5 h-3.5 ${tool.accent}`} />
                  <span className="text-xs font-500 text-foreground/80">{language === "hi" ? tool.hi : tool.en}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════ */}
      <section className="py-16 px-4" aria-labelledby="how-it-works-heading">
        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
            <p className="mono-label text-primary/80 mb-3">{t("How It Works", "कैसे काम करता है")}</p>
            <h2 id="how-it-works-heading" className="text-3xl sm:text-5xl font-serif font-800 text-foreground">{t("Paste, read, ask.", "Paste करें, पढ़ें, पूछें।")}</h2>
          </motion.div>
          <div className="divide-y divide-border/30">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="py-6 grid sm:grid-cols-[1fr_1.5fr] gap-3 sm:gap-8 items-baseline">
              <p className="font-serif font-700 text-foreground text-lg">Paste your CBC or blood test</p>
              <p className="text-muted-foreground text-sm leading-relaxed">We flag values outside Indian reference ranges and explain each one in plain language — no jargon.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="py-6 grid sm:grid-cols-[1fr_1.5fr] gap-3 sm:gap-8 items-baseline">
              <p className="font-serif font-700 text-foreground text-lg">Type a medicine name</p>
              <p className="text-muted-foreground text-sm leading-relaxed">You get what it treats, when to take it, common side effects, and interactions to watch — in one page.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="py-6 grid sm:grid-cols-[1fr_1.5fr] gap-3 sm:gap-8 items-baseline">
              <p className="font-serif font-700 text-foreground text-lg">Show the output to your doctor</p>
              <p className="text-muted-foreground text-sm leading-relaxed">We generate the exact questions to ask at your appointment, based on your specific values. Most consultations run under 10 minutes — arriving prepared makes them count.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ VERIFIABLE TRUST & PRIVACY ═════════════════════════════════════ */}
      <section className="py-16 px-4 relative overflow-hidden" aria-labelledby="privacy-heading">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mono-label text-primary mb-4">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              {t("Privacy & Accuracy", "गोपनीयता और सटीकता")}
            </div>
            <h2 id="privacy-heading" className="text-2xl sm:text-3xl font-serif font-800 text-foreground">
              {t("How we protect you and your data", "हम आपकी और आपके डेटा की सुरक्षा कैसे करते हैं")}
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto divide-y divide-border/30">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
              className="py-6">
              <h3 className="font-serif font-700 text-foreground text-lg mb-2">We never store your report.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Queries go to the AI model and return immediately — nothing is logged to a database. Your report text is discarded after the response is sent.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
              className="py-6">
              <h3 className="font-serif font-700 text-foreground text-lg mb-2">Indian lab ranges, not US averages.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Haemoglobin reference ranges differ for Indian women. HbA1c cut-offs follow ICMR and RSSDI guidelines. We use Indian population norms, not default Western values.</p>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
              className="py-6">
              <h3 className="font-serif font-700 text-foreground text-lg mb-2">This is not a diagnosis.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">CureCheck translates numbers into plain language. It cannot examine you, order tests, or replace a consultation. The output is a preparation tool — not a verdict.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ PLATFORM STATS / WHY ═════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="rounded-[1.75rem] p-8 sm:p-12 text-center relative overflow-hidden border border-border/40"
            style={{
              background: "transparent",
              backdropFilter: "blur(24px)",
            }}>
            <div className="absolute inset-0  opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <p className="mono-label text-primary/80 mb-3">{t("Why CureCheck?", "CureCheck क्यों?")}</p>
              <div className="space-y-8 text-left">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-800 text-foreground mb-2">14 tools. One page. No account.</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">Symptom checker, CBC explainer, drug interactions, ayurveda guide, pregnancy tracker — all free, all in Hindi and English. Open any tool in under 3 taps.</p>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-800 text-foreground mb-2">Your data never leaves your device.</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">The Health Timeline stores every report analysis in your browser's localStorage — not on our servers. We see no queries, no names, no reports.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-4" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
            <p className="mono-label text-primary/80 mb-3">FAQ</p>
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-serif font-800 text-foreground">{t("Questions, answered", "सवालों के जवाब")}</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-panel rounded-2xl border-none px-5">
                <AccordionTrigger className="text-left font-600 text-foreground hover:no-underline py-5">
                  {language === "hi" ? f.q.hi : f.q.en}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {language === "hi" ? f.a.hi : f.a.en}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ══ WHATSAPP SHARE BANNER ════════════════════════════════════ */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-2xl p-8 border border-emerald-500/25 relative overflow-hidden text-center"
              style={{
                background: "transparent",
                backdropFilter: "blur(20px)",
                boxShadow: "none",
              }}>
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "transparent", filter: "none" }} />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-700 text-foreground mb-2">
                  {t("Know someone who needs this?", "किसी की मदद कर सकते हैं?")}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  {t(
                    "Share CureCheck with your family and friends. They can analyze a report without downloading an app or creating an account.",
                    "CureCheck को परिवार और दोस्तों के साथ शेयर करें। कोई app download या account नहीं — सीधे report analyze करें।",
                  )}
                </p>
                <Suspense fallback={null}>
                  <WhatsAppShare
                    text={t(
                      `🏥 CureCheck — India's free AI health platform!\n\n✅ Analyze your medical reports in plain language\n✅ Check any medicine — uses, side effects & timing\n✅ Track fitness, steps & streaks\n✅ Bust health myths with science\n\n100% Free. No signup needed.\n👉 curecheck.in`,
                      `🏥 CureCheck — भारत का मुफ्त AI health platform!\n\n✅ Medical reports को सरल भाषा में समझें\n✅ किसी भी दवा के बारे में जानें\n✅ Fitness, steps और streaks track करें\n✅ Science से health myths तोड़ें\n\n100% मुफ्त। कोई signup नहीं।\n👉 curecheck.in`,
                    )}
                    label={t("Share CureCheck on WhatsApp", "WhatsApp पर शेयर करें")}
                    className=" rounded-full px-8 h-12 text-base"
                  />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative rounded-[2rem] p-10 sm:p-14 text-center overflow-hidden border border-primary/20"
            style={{
              background: "transparent",
              backdropFilter: "blur(24px)",
              boxShadow: "none",
            }}>
            <div className="absolute inset-0  opacity-50 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-serif font-800 text-foreground">
                {t("Your next report is waiting.", "आपकी अगली रिपोर्ट ready है।")}
              </h2>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
                {t("Paste it in. Understand it in minutes.", "Paste करें। मिनटों में समझें।")}
              </p>
              <div className="mt-8 flex justify-center">
                <Link href="/report-explainer">
                  <Button size="lg"
                    className="gap-2 rounded-full px-8 h-12 font-700"
                    style={{ boxShadow: "none" }}
                    data-testid="button-cta-report"
                  >
                    <FileSearch className="w-5 h-5" /> {t("Analyze My Report", "मेरी रिपोर्ट analyze करें")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

        </>
      )}
    </div>
  );
}
