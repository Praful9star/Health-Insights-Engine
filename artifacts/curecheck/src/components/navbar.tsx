import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Languages, ChevronDown, LogIn, Star, LayoutDashboard,
  FileSearch, Stethoscope, Pill, AlertCircle, Activity, Calculator,
  Dumbbell, Brain, Baby, Syringe, Wind, ShieldCheck, Lightbulb,
  Leaf, MapPin, AlertTriangle, Shield, Map, ClipboardList, Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { CureCheckMark } from "@/components/logo";

/* ── Types ─────────────────────────────────────────────────────────── */
type BiLabel = { en: string; hi: string };
type NavLink = {
  href: string;
  icon: React.ElementType;
  label: BiLabel;
  desc: BiLabel;
};
type DropdownId = "understand" | "daily" | "reference";
type DropdownGroup = {
  id: DropdownId;
  label: BiLabel;
  accentText: string;
  accentBg: string;
  links: NavLink[];
};

/* ── Static data ───────────────────────────────────────────────────── */
const PRIMARY_PILLS: Array<{ href: string; icon: React.ElementType; label: BiLabel }> = [
  { href: "/report-explainer", icon: FileSearch,  label: { en: "Reports",  hi: "रिपोर्ट"   } },
  { href: "/symptom-checker",  icon: Stethoscope, label: { en: "Symptoms", hi: "लक्षण जांच" } },
];

const DROPDOWN_GROUPS: DropdownGroup[] = [
  {
    id: "understand",
    label: { en: "Understand", hi: "समझें" },
    accentText: "text-primary",
    accentBg:   "bg-primary/10 border-primary/25 hover:bg-primary/20",
    links: [
      { href: "/medicine-explainer", icon: Pill,          label: { en: "Medicine Guide",      hi: "दवा गाइड"           }, desc: { en: "Uses, side effects & timing",     hi: "उपयोग, दुष्प्रभाव और समय"   } },
      { href: "/drug-interaction",   icon: AlertCircle,   label: { en: "Drug Interactions",   hi: "दवा इंटरेक्शन"      }, desc: { en: "Check combinations safely",       hi: "संयोजन सुरक्षित जांचें"     } },
      { href: "/health-timeline",    icon: Activity,      label: { en: "Health Timeline",     hi: "स्वास्थ्य टाइमलाइन" }, desc: { en: "Track report trends",             hi: "रिपोर्ट ट्रेंड ट्रैक करें"  } },
      { href: "/calculators",        icon: Calculator,    label: { en: "Health Calculators",  hi: "स्वास्थ्य कैलकुलेटर"}, desc: { en: "BMI, calories & more",            hi: "BMI, कैलोरी और अधिक"        } },
    ],
  },
  {
    id: "daily",
    label: { en: "Daily Health", hi: "दैनिक स्वास्थ्य" },
    accentText: "text-emerald-400",
    accentBg:   "bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20",
    links: [
      { href: "/fitness-hub",   icon: Dumbbell,       label: { en: "Fitness Hub",         hi: "फिटनेस हब"           }, desc: { en: "Scores, streaks & plans",         hi: "स्कोर, स्ट्रीक और योजनाएं"  } },
      { href: "/mental-health", icon: Brain,          label: { en: "Mental Health",        hi: "मानसिक स्वास्थ्य"    }, desc: { en: "Mood & stress tools",             hi: "मूड और तनाव उपकरण"          } },
      { href: "/pregnancy",     icon: Baby,           label: { en: "Pregnancy Tracker",    hi: "गर्भावस्था ट्रैकर"   }, desc: { en: "Week-by-week guidance",           hi: "सप्ताह-दर-सप्ताह मार्गदर्शन"} },
      { href: "/vaccines",      icon: Syringe,        label: { en: "Vaccine Schedule",     hi: "टीकाकरण अनुसूची"     }, desc: { en: "India immunisation chart",        hi: "भारत टीकाकरण चार्ट"         } },
      { href: "/weather",       icon: Wind,           label: { en: "Weather & Health",     hi: "मौसम और स्वास्थ्य"   }, desc: { en: "Air quality & tips",              hi: "वायु गुणवत्ता और सुझाव"      } },
    ],
  },
  {
    id: "reference",
    label: { en: "Reference", hi: "संदर्भ" },
    accentText: "text-violet-400",
    accentBg:   "bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20",
    links: [
      { href: "/claim-checker",  icon: ShieldCheck,    label: { en: "Claim Checker",       hi: "दावा जांच"            }, desc: { en: "Verify WhatsApp forwards",        hi: "WhatsApp फॉरवर्ड सत्यापित करें"} },
      { href: "/myth-buster",    icon: Lightbulb,      label: { en: "Myth Buster",          hi: "मिथक बस्टर"           }, desc: { en: "Science vs. hearsay",             hi: "विज्ञान बनाम अफवाह"           } },
      { href: "/ayurveda",       icon: Leaf,           label: { en: "Ayurveda Guide",       hi: "आयुर्वेद गाइड"        }, desc: { en: "Traditional remedies",            hi: "पारंपरिक उपचार"               } },
      { href: "/hospitals",      icon: MapPin,         label: { en: "Hospital Finder",      hi: "अस्पताल खोजें"        }, desc: { en: "Nearby hospitals & clinics",      hi: "पास के अस्पताल और क्लीनिक"   } },
      { href: "/emergency",      icon: AlertTriangle,  label: { en: "Emergency & Aid",      hi: "आपातकाल और सहायता"    }, desc: { en: "First aid & helplines",           hi: "प्राथमिक चिकित्सा और हेल्पलाइन"} },
      { href: "/insurance",      icon: Shield,         label: { en: "Insurance Guide",      hi: "बीमा गाइड"            }, desc: { en: "Understand your policy",          hi: "अपनी पॉलिसी समझें"            } },
      { href: "/disease-journey",icon: Map,            label: { en: "Disease Journey",      hi: "रोग यात्रा"            }, desc: { en: "Condition explainers",            hi: "स्थिति व्याख्याकार"           } },
      { href: "/doctor-prep",    icon: ClipboardList,  label: { en: "Doctor Visit Prep",    hi: "डॉक्टर तैयारी"        }, desc: { en: "Questions to ask",               hi: "पूछने के सवाल"               } },
      { href: "/news",           icon: Newspaper,      label: { en: "Health News",          hi: "स्वास्थ्य समाचार"     }, desc: { en: "Latest health updates",           hi: "नवीनतम स्वास्थ्य अपडेट"      } },
    ],
  },
];

/* ── Animation variants ────────────────────────────────────────────── */
const dropdownVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, y: -6, scale: 0.97, transition: { duration: 0.1 } },
};

const mobileMenuVariants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:    { opacity: 0, height: 0, transition: { duration: 0.16 } },
};

/* ── Component ─────────────────────────────────────────────────────── */
export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownId | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const { user, profile } = useAuth();
  const navRef = useRef<HTMLElement>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* Listen for mobile-menu open event from bottom nav */
  useEffect(() => {
    const h = () => setMobileOpen(true);
    window.addEventListener("cc-open-menu", h);
    return () => window.removeEventListener("cc-open-menu", h);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");
  const toggleDropdown = (id: DropdownId) => setActiveDropdown(v => v === id ? null : id);
  const closeAll = () => { setActiveDropdown(null); setMobileOpen(false); };

  const displayName = profile?.name || user?.email?.split("@")[0] || "";
  const L = (bi: BiLabel) => language === "hi" ? bi.hi : bi.en;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <CureCheckMark size={32} id="navbar-logo" />
            <span className="font-serif font-800 text-foreground text-[1.05rem]">
              Cure<span className="text-primary">Check</span>
            </span>
          </motion.div>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────── */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-1 flex-1 mx-4">

          {/* Primary pills */}
          {PRIMARY_PILLS.map(pill => {
            const Icon = pill.icon;
            const active = isActive(pill.href);
            return (
              <Link key={pill.href} href={pill.href}>
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-600 transition-all cursor-pointer ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {L(pill.label)}
                </span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-border/60 mx-1" />

          {/* Dropdown groups */}
          {DROPDOWN_GROUPS.map(group => (
            <div key={group.id} className="relative">
              <button
                onClick={() => toggleDropdown(group.id)}
                className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-600 transition-all border ${
                  activeDropdown === group.id
                    ? `${group.accentBg} ${group.accentText} border-transparent`
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {L(group.label)}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === group.id ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === group.id && (
                  <motion.div
                    key={group.id}
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute left-0 top-full mt-2 glass-panel rounded-2xl border border-border/60 shadow-xl overflow-hidden"
                    style={{ minWidth: group.id === "reference" ? "22rem" : "18rem" }}
                  >
                    <div className={`px-4 py-2.5 border-b border-border/40 ${group.accentText}`}>
                      <span className="text-xs font-700 mono-label">{L(group.label)}</span>
                    </div>
                    <div className={`p-2 ${group.id === "reference" ? "grid grid-cols-2 gap-0.5" : "flex flex-col gap-0.5"}`}>
                      {group.links.map(link => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                          <Link key={link.href} href={link.href}>
                            <span
                              onClick={closeAll}
                              className={`flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors group ${
                                active ? "bg-primary/10" : "hover:bg-muted/50"
                              }`}
                            >
                              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-colors ${active ? group.accentText : "text-muted-foreground group-hover:text-foreground"}`} />
                              <div className="min-w-0">
                                <p className={`text-sm font-600 leading-tight ${active ? group.accentText : "text-foreground"}`}>{L(link.label)}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{L(link.desc)}</p>
                              </div>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* ── Right side controls ───────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="group inline-flex items-center rounded-full border border-border/70 bg-muted/40 p-0.5 text-xs font-600 hover:border-primary/40 transition-colors"
            aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</span>
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>हिंदी</span>
          </button>

          {/* Premium */}
          <Link href="/premium">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 text-xs font-700 text-primary transition-all">
              <Star className="w-3 h-3" /> Premium
            </button>
          </Link>

          {/* Login / Dashboard */}
          {user ? (
            <Link href="/dashboard">
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs font-600 text-primary transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" />
                {displayName || t("Dashboard", "डैशबोर्ड")}
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-muted/30 hover:bg-muted/60 text-xs font-600 text-muted-foreground hover:text-foreground transition-all">
                <LogIn className="w-3.5 h-3.5" /> {t("Login", "लॉगिन")}
              </button>
            </Link>
          )}

          {/* Hamburger */}
          <Button
            variant="ghost" size="icon"
            className="lg:hidden rounded-full w-9 h-9"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-5 max-h-[82vh] overflow-y-auto">

              {/* Primary tools */}
              <div>
                <p className="mono-label text-primary/80 mb-2.5">{t("Primary Tools", "प्राथमिक उपकरण")}</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRIMARY_PILLS.map(pill => {
                    const Icon = pill.icon;
                    const active = isActive(pill.href);
                    return (
                      <Link key={pill.href} href={pill.href}>
                        <span
                          onClick={closeAll}
                          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border cursor-pointer transition-all ${
                            active
                              ? "bg-primary/15 border-primary/40 text-primary"
                              : "bg-primary/5 border-primary/20 text-foreground hover:bg-primary/10"
                          }`}
                        >
                          <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-600">{L(pill.label)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Dropdown groups as sections */}
              {DROPDOWN_GROUPS.map(group => (
                <div key={group.id}>
                  <p className={`mono-label mb-2.5 ${group.accentText}`}>{L(group.label)}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {group.links.map(link => {
                      const Icon = link.icon;
                      const active = isActive(link.href);
                      return (
                        <Link key={link.href} href={link.href}>
                          <span
                            onClick={closeAll}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                              active
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-600 leading-tight">{L(link.label)}</span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Account & utility links */}
              <div className="border-t border-border/40 pt-4">
                <p className="mono-label text-muted-foreground/60 mb-2.5">{t("Account", "अकाउंट")}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {user ? (
                    <>
                      <Link href="/dashboard">
                        <span onClick={closeAll} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isActive("/dashboard") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-600">{t("Dashboard", "डैशबोर्ड")}</span>
                        </span>
                      </Link>
                      <Link href="/profile">
                        <span onClick={closeAll} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isActive("/profile") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-600">{t("Profile", "प्रोफ़ाइल")}</span>
                        </span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login">
                        <span onClick={closeAll} className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60">
                          <LogIn className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-600">{t("Login", "लॉगिन")}</span>
                        </span>
                      </Link>
                      <Link href="/login">
                        <span onClick={closeAll} className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/60">
                          <LogIn className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm font-600">{t("Sign up", "साइनअप")}</span>
                        </span>
                      </Link>
                    </>
                  )}
                  <Link href="/feedback">
                    <span onClick={closeAll} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isActive("/feedback") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                      <Star className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-600">{t("Feedback", "प्रतिक्रिया")}</span>
                    </span>
                  </Link>
                  <Link href="/about">
                    <span onClick={closeAll} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isActive("/about") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                      <Lightbulb className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-600">{t("About", "परिचय")}</span>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
