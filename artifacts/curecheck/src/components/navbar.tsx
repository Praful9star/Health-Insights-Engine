import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Languages, ChevronDown, User, LogIn, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { CureCheckMark } from "@/components/logo";

const PRIMARY_LINKS = [
  { href: "/report-explainer",   label: { en: "Reports",   hi: "रिपोर्ट"  } },
  { href: "/medicine-explainer", label: { en: "Medicine",  hi: "दवा"      } },
  { href: "/fitness-hub",        label: { en: "Fitness",   hi: "फिटनेस"  } },
  { href: "/myth-buster",        label: { en: "Myths",     hi: "मिथक"    } },
  { href: "/news",               label: { en: "News",      hi: "समाचार"  } },
];

const MORE_LINKS = [
  { href: "/symptom-checker",   label: { en: "Symptom Checker",       hi: "लक्षण जांच"       } },
  { href: "/disease-journey",   label: { en: "Disease Journey",        hi: "रोग यात्रा"       } },
  { href: "/claim-checker",     label: { en: "Claim Checker",          hi: "दावा जांच"        } },
  { href: "/drug-interaction",  label: { en: "Drug Interactions",      hi: "दवा इंटरेक्शन"   } },
  { href: "/health-timeline",   label: { en: "Health Timeline",        hi: "स्वास्थ्य टाइमलाइन" } },
  { href: "/calculators",       label: { en: "Health Calculators",     hi: "स्वास्थ्य कैलकुलेटर" } },
  { href: "/hospitals",         label: { en: "Hospital Finder",        hi: "अस्पताल खोजें"    } },
  { href: "/emergency",         label: { en: "Emergency & First Aid",  hi: "आपातकाल"          } },
  { href: "/mental-health",     label: { en: "Mental Health",          hi: "मानसिक स्वास्थ्य" } },
  { href: "/vaccines",          label: { en: "Vaccine Schedule",       hi: "टीकाकरण"          } },
  { href: "/ayurveda",          label: { en: "Ayurveda Guide",         hi: "आयुर्वेद"         } },
  { href: "/insurance",         label: { en: "Insurance Guide",        hi: "बीमा गाइड"        } },
  { href: "/pregnancy",         label: { en: "Pregnancy Tracker",      hi: "गर्भावस्था"       } },
  { href: "/doctor-prep",       label: { en: "Doctor Visit Prep",      hi: "डॉक्टर तैयारी"    } },
  { href: "/weather",           label: { en: "Weather & Health Tips",  hi: "मौसम + स्वास्थ्य"  } },
  { href: "/feedback",          label: { en: "Feedback",               hi: "प्रतिक्रिया"       } },
  { href: "/about",             label: { en: "About",                  hi: "परिचय"            } },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <Link href="/">
          <motion.div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400 }}>
            <CureCheckMark size={32} id="navbar-logo" />
            <span className="font-serif font-800 text-foreground text-[1.05rem]">Cure<span className="text-primary">Check</span></span>
          </motion.div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_LINKS.map(link => (
            <Link key={link.href} href={link.href}>
              <span className={`px-3.5 py-1.5 rounded-full text-sm font-600 transition-all cursor-pointer ${isActive(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {language === "hi" ? link.label.hi : link.label.en}
              </span>
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button onClick={() => setMoreOpen(v => !v)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all">
              {t("More", "और")} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-60 glass-panel rounded-2xl border border-border/60 py-2 shadow-xl max-h-[80vh] overflow-y-auto">
                  {MORE_LINKS.map(link => (
                    <Link key={link.href} href={link.href}>
                      <span onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2 text-sm cursor-pointer transition-colors ${isActive(link.href) ? "text-primary font-600" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}>
                        {language === "hi" ? link.label.hi : link.label.en}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="group inline-flex items-center rounded-full border border-border/70 bg-muted/40 p-0.5 text-xs font-600 hover:border-primary/40 transition-colors"
            aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}>
            <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</span>
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>हिंदी</span>
          </button>

          <Link href="/premium">
            <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 text-xs font-700 text-primary transition-all">
              <Star className="w-3 h-3" /> Premium
            </button>
          </Link>

          <Link href="/login">
            <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-muted/30 hover:bg-muted/60 text-xs font-600 text-muted-foreground hover:text-foreground transition-all">
              {user ? <><User className="w-3.5 h-3.5" /> {user.email?.split("@")[0]}</> : <><LogIn className="w-3.5 h-3.5" /> {t("Login", "लॉगिन")}</>}
            </button>
          </Link>

          <Button variant="ghost" size="icon" className="lg:hidden rounded-full w-9 h-9" onClick={() => setOpen(v => !v)} aria-label="Menu">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden">
            <nav className="px-4 py-3 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
              {[...PRIMARY_LINKS, ...MORE_LINKS, { href: "/login", label: { en: user ? "My Account" : "Login / Sign up", hi: user ? "मेरा खाता" : "लॉगिन / साइनअप" } }].map(link => (
                <Link key={link.href} href={link.href}>
                  <span onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-600 cursor-pointer transition-colors ${isActive(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                    {language === "hi" ? link.label.hi : link.label.en}
                  </span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
