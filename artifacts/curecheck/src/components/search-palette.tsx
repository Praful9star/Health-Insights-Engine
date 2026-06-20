import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch, Stethoscope, Pill, AlertCircle, Activity, Calculator,
  Dumbbell, Brain, Baby, Syringe, Wind, ShieldCheck, Lightbulb,
  Leaf, MapPin, AlertTriangle, Shield, Map, ClipboardList, Newspaper,
  Search, ArrowRight,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────── */
type SearchItem = {
  id: string;
  href: string;
  icon: React.ElementType;
  name: { en: string; hi: string };
  desc: { en: string; hi: string };
  keywords: string[];
};

/* ── Search index ───────────────────────────────────────────────────── */
const SEARCH_INDEX: SearchItem[] = [
  {
    id: "report-explainer",
    href: "/report-explainer",
    icon: FileSearch,
    name: { en: "Report Explainer", hi: "रिपोर्ट व्याख्याकार" },
    desc: { en: "Understand your lab report in plain language", hi: "लैब रिपोर्ट को सरल भाषा में समझें" },
    keywords: ["blood test", "lab report", "CBC", "रिपोर्ट", "खून की जांच", "haemoglobin", "thyroid", "lipid", "glucose", "pathology", "test results"],
  },
  {
    id: "symptom-checker",
    href: "/symptom-checker",
    icon: Stethoscope,
    name: { en: "Symptom Checker", hi: "लक्षण जांच" },
    desc: { en: "Check your symptoms and decide next steps", hi: "लक्षण जांचें और आगे क्या करें जानें" },
    keywords: ["fever", "बुखार", "symptoms", "दर्द", "pain", "cold", "cough", "headache", "सिरदर्द", "diagnosis", "लक्षण"],
  },
  {
    id: "medicine-explainer",
    href: "/medicine-explainer",
    icon: Pill,
    name: { en: "Medicine Explainer", hi: "दवा व्याख्याकार" },
    desc: { en: "Uses, dosage, and side effects of any medicine", hi: "किसी भी दवा के उपयोग और दुष्प्रभाव" },
    keywords: ["medicine", "tablet", "दवा", "side effects", "dosage", "drug", "capsule", "syrup", "दुष्प्रभाव", "खुराक", "paracetamol", "metformin"],
  },
  {
    id: "drug-interaction",
    href: "/drug-interaction",
    icon: AlertCircle,
    name: { en: "Drug Interactions", hi: "दवाओं का मेल" },
    desc: { en: "Check if two medicines are safe to take together", hi: "दो दवाएं एक साथ लेना सुरक्षित है?" },
    keywords: ["drug interaction", "दवाओं का मेल", "medicine combination", "safe together", "mix", "combination", "दवा मिलाना"],
  },
  {
    id: "health-timeline",
    href: "/health-timeline",
    icon: Activity,
    name: { en: "Health Timeline", hi: "स्वास्थ्य टाइमलाइन" },
    desc: { en: "Track your report trends over time", hi: "अपनी रिपोर्ट के रुझान ट्रैक करें" },
    keywords: ["timeline", "history", "track", "टाइमलाइन", "इतिहास", "trends", "record", "past reports"],
  },
  {
    id: "fitness-hub",
    href: "/fitness-hub",
    icon: Dumbbell,
    name: { en: "Fitness Hub", hi: "फिटनेस हब" },
    desc: { en: "Fitness score, streaks, and Indian diet plans", hi: "फिटनेस स्कोर, स्ट्रीक और भारतीय डाइट" },
    keywords: ["fitness", "exercise", "workout", "diet", "nutrition", "gym", "फिटनेस", "व्यायाम", "डाइट", "calories", "weight loss"],
  },
  {
    id: "mental-health",
    href: "/mental-health",
    icon: Brain,
    name: { en: "Mental Health", hi: "मानसिक स्वास्थ्य" },
    desc: { en: "Mood tracking and stress management tools", hi: "मूड और तनाव प्रबंधन उपकरण" },
    keywords: ["mental health", "stress", "anxiety", "mood", "depression", "मानसिक", "तनाव", "चिंता", "नींद", "sleep", "wellbeing"],
  },
  {
    id: "pregnancy",
    href: "/pregnancy",
    icon: Baby,
    name: { en: "Pregnancy Tracker", hi: "गर्भावस्था ट्रैकर" },
    desc: { en: "Week-by-week pregnancy guidance", hi: "सप्ताह-दर-सप्ताह गर्भावस्था मार्गदर्शन" },
    keywords: ["pregnancy", "गर्भावस्था", "baby", "maternity", "trimester", "antenatal", "prenatal", "week", "shishu"],
  },
  {
    id: "vaccines",
    href: "/vaccines",
    icon: Syringe,
    name: { en: "Vaccine Schedule", hi: "टीकाकरण अनुसूची" },
    desc: { en: "India immunisation chart and reminders", hi: "भारत टीकाकरण चार्ट और याद दिलाना" },
    keywords: ["vaccine", "vaccination", "टीका", "टीकाकरण", "immunisation", "immunization", "injection", "child vaccine", "covid"],
  },
  {
    id: "calculators",
    href: "/calculators",
    icon: Calculator,
    name: { en: "Health Calculators", hi: "स्वास्थ्य कैलकुलेटर" },
    desc: { en: "BMI, calories, ideal weight and more", hi: "BMI, कैलोरी, आदर्श वजन और अधिक" },
    keywords: ["BMI", "calculator", "कैलकुलेटर", "calories", "weight", "height", "ideal weight", "body mass", "वजन"],
  },
  {
    id: "myth-buster",
    href: "/myth-buster",
    icon: Lightbulb,
    name: { en: "Myth Buster", hi: "मिथक बस्टर" },
    desc: { en: "Science vs. common health hearsay", hi: "विज्ञान बनाम आम अफवाह" },
    keywords: ["myth", "fact", "fake", "misinformation", "मिथक", "अफवाह", "whatsapp", "forward", "rumour", "true or false"],
  },
  {
    id: "claim-checker",
    href: "/claim-checker",
    icon: ShieldCheck,
    name: { en: "Claim Checker", hi: "दावा जांच" },
    desc: { en: "Verify WhatsApp health forwards", hi: "WhatsApp फॉरवर्ड सत्यापित करें" },
    keywords: ["claim", "verify", "दावा", "जांच", "whatsapp", "forward", "fake news", "fact check", "health claim"],
  },
  {
    id: "ayurveda",
    href: "/ayurveda",
    icon: Leaf,
    name: { en: "Ayurveda Guide", hi: "आयुर्वेद गाइड" },
    desc: { en: "Traditional Indian remedies explained", hi: "पारंपरिक भारतीय उपचार की जानकारी" },
    keywords: ["ayurveda", "आयुर्वेद", "herbal", "traditional", "remedy", "neem", "turmeric", "haldi", "desi", "natural"],
  },
  {
    id: "hospitals",
    href: "/hospitals",
    icon: MapPin,
    name: { en: "Hospital Finder", hi: "अस्पताल खोजें" },
    desc: { en: "Find hospitals and clinics near you", hi: "पास के अस्पताल और क्लीनिक खोजें" },
    keywords: ["hospital", "clinic", "doctor", "अस्पताल", "क्लीनिक", "nearby", "near me", "emergency", "OPD", "AIIMS"],
  },
  {
    id: "emergency",
    href: "/emergency",
    icon: AlertTriangle,
    name: { en: "Emergency & First Aid", hi: "आपातकाल और प्राथमिक चिकित्सा" },
    desc: { en: "First aid steps and emergency helplines", hi: "प्राथमिक चिकित्सा और आपातकालीन हेल्पलाइन" },
    keywords: ["emergency", "first aid", "आपातकाल", "helpline", "ambulance", "108", "accident", "injury", "poison"],
  },
  {
    id: "insurance",
    href: "/insurance",
    icon: Shield,
    name: { en: "Insurance Guide", hi: "बीमा गाइड" },
    desc: { en: "Understand your health insurance policy", hi: "अपनी स्वास्थ्य बीमा पॉलिसी समझें" },
    keywords: ["insurance", "बीमा", "health insurance", "policy", "claim", "PMJAY", "Ayushman", "coverage", "premium"],
  },
  {
    id: "disease-journey",
    href: "/disease-journey",
    icon: Map,
    name: { en: "Disease Journey", hi: "रोग यात्रा" },
    desc: { en: "Condition explainers with phase-by-phase guide", hi: "स्थिति की चरण-दर-चरण व्याख्या" },
    keywords: ["disease", "condition", "रोग", "diabetes", "hypertension", "cancer", "heart", "kidney", "liver", "journey", "stages"],
  },
  {
    id: "doctor-prep",
    href: "/doctor-prep",
    icon: ClipboardList,
    name: { en: "Doctor Visit Prep", hi: "डॉक्टर तैयारी" },
    desc: { en: "Questions to ask at your appointment", hi: "डॉक्टर से पूछने के सवाल" },
    keywords: ["doctor", "appointment", "डॉक्टर", "questions", "consultation", "visit", "prepare", "तैयारी", "सवाल"],
  },
  {
    id: "news",
    href: "/news",
    icon: Newspaper,
    name: { en: "Health News", hi: "स्वास्थ्य समाचार" },
    desc: { en: "Latest Indian health news and updates", hi: "नवीनतम भारतीय स्वास्थ्य समाचार" },
    keywords: ["news", "समाचार", "health news", "latest", "update", "India", "ICMR", "WHO", "health alert"],
  },
  {
    id: "weather",
    href: "/weather",
    icon: Wind,
    name: { en: "Weather & Health", hi: "मौसम और स्वास्थ्य" },
    desc: { en: "Air quality, pollen, and weather health tips", hi: "वायु गुणवत्ता और मौसम स्वास्थ्य सुझाव" },
    keywords: ["weather", "मौसम", "air quality", "AQI", "pollution", "pollen", "season", "monsoon", "heat", "humidity"],
  },
];

/* ── Fuzzy scoring ──────────────────────────────────────────────────── */
function scoreItem(item: SearchItem, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  const nameLower = item.name.en.toLowerCase();
  const nameHiLower = item.name.hi.toLowerCase();
  const descLower = item.desc.en.toLowerCase();
  const descHiLower = item.desc.hi.toLowerCase();
  const keywordsLower = item.keywords.map(k => k.toLowerCase());

  // Exact match
  if (nameLower === q || nameHiLower === q) return 100;
  // Starts with
  if (nameLower.startsWith(q) || nameHiLower.startsWith(q)) return 80;
  // Name includes
  if (nameLower.includes(q) || nameHiLower.includes(q)) return 60;
  // Exact keyword match
  if (keywordsLower.some(k => k === q)) return 40;
  // Keyword starts with / includes
  if (keywordsLower.some(k => k.startsWith(q))) return 35;
  if (keywordsLower.some(k => k.includes(q))) return 30;
  // Description includes
  if (descLower.includes(q) || descHiLower.includes(q)) return 30;

  // Multi-word partial: every word in query matches somewhere
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const allTargets = [nameLower, nameHiLower, descLower, descHiLower, ...keywordsLower].join(" ");
    if (words.every(w => allTargets.includes(w))) return 20;
  }

  // Word prefix: any query word is a prefix of a name word or keyword
  const nameWords = nameLower.split(/\s+/);
  if (words.some(w => nameWords.some(nw => nw.startsWith(w)))) return 10;
  if (words.some(w => keywordsLower.some(k => k.startsWith(w)))) return 10;

  return 0;
}

/* ── Animation variants ─────────────────────────────────────────────── */
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const paletteVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { opacity: 0, scale: 0.96, y: -12, transition: { duration: 0.13 } },
};

/* ── SearchPalette ──────────────────────────────────────────────────── */
interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /* Debounce query 150ms */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  /* Reset on open */
  useEffect(() => {
    if (open) {
      setQuery("");
      setDebouncedQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  /* Compute results */
  const results = debouncedQuery.trim()
    ? SEARCH_INDEX
        .map(item => ({ item, score: scoreItem(item, debouncedQuery) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(r => r.item)
    : SEARCH_INDEX.slice(0, 6);

  /* Reset active when results change */
  useEffect(() => { setActiveIndex(0); }, [debouncedQuery]);

  /* Scroll active item into view */
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback((href: string) => {
    navigate(href);
    onClose();
  }, [navigate, onClose]);

  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[activeIndex]) handleSelect(results[activeIndex].href);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, results, activeIndex, handleSelect, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onMouseDown={onClose}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            variants={paletteVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed z-[201] top-[12vh] left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
            onMouseDown={e => e.stopPropagation()}
          >
            <div className="glass-panel rounded-2xl border border-border/60 shadow-2xl overflow-hidden">

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search tools… (e.g. CBC, fever, दवा)"
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground transition-colors text-xs">
                    Clear
                  </button>
                )}
              </div>

              {/* Results */}
              <ul ref={listRef} className="py-1.5 max-h-80 overflow-y-auto">
                {results.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No tools found for "{debouncedQuery}"
                  </li>
                ) : (
                  results.map((item, i) => {
                    const Icon = item.icon;
                    const isActive = i === activeIndex;
                    return (
                      <li key={item.id}>
                        <button
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group ${isActive ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => handleSelect(item.href)}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? "bg-primary/20 text-primary" : "bg-muted/50 text-muted-foreground group-hover:text-foreground"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-600 leading-tight ${isActive ? "text-foreground" : ""}`}>{item.name.en}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.desc.en}</p>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${isActive ? "opacity-100 text-primary" : "opacity-0"}`} />
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border/40 bg-muted/20">
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono">Esc</kbd>
                  close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── SearchController ───────────────────────────────────────────────── */
export function SearchController() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    const handleEvent = () => setOpen(true);

    window.addEventListener("keydown", handleKey);
    window.addEventListener("cc-open-search", handleEvent);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("cc-open-search", handleEvent);
    };
  }, []);

  return <SearchPalette open={open} onClose={() => setOpen(false)} />;
}
