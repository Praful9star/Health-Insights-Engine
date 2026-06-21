import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Languages, ChevronDown, LogIn, Star, LayoutDashboard, Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { CureCheckMark } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";

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
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { language, setLanguage, t } = useLanguage();
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const moreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const openH = () => setOpen(true);
    const closeH = () => setOpen(false);
    window.addEventListener("cc-open-menu", openH);
    window.addEventListener("cc-close-menu", closeH);
    return () => {
      window.removeEventListener("cc-open-menu", openH);
      window.removeEventListener("cc-close-menu", closeH);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("cc-menu-changed", { detail: { open } }));
  }, [open]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  const displayName = profile?.name || user?.email?.split("@")[0] || "";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/claim-checker?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
      setOpen(false);
    }
  };

  const mobileLinks = [
    { href: "/premium", label: { en: "⭐ Premium", hi: "⭐ प्रीमियम" } },
    ...PRIMARY_LINKS,
    ...MORE_LINKS,
    ...(user
      ? [
          { href: "/dashboard", label: { en: "My Dashboard", hi: "मेरा डैशबोर्ड" } },
          { href: "/profile",   label: { en: "Edit Profile",  hi: "प्रोफ़ाइल संपादित करें" } },
        ]
      : [{ href: "/login", label: { en: "Login / Sign up", hi: "लॉगिन / साइनअप" } }]),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 h-14 flex items-center justify-between gap-2 min-w-0">

        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <CureCheckMark size={28} id="navbar-logo" />
            <span className="font-serif font-800 text-foreground text-[0.95rem] whitespace-nowrap">
              Cure<span className="text-primary">Check</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {PRIMARY_LINKS.map(link => (
            <Link key={link.href} href={link.href}>
              <span className={`px-3.5 py-1.5 rounded-full text-sm font-600 transition-all cursor-pointer ${isActive(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}>
                {language === "hi" ? link.label.hi : link.label.en}
              </span>
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(v => !v)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
            >
              {t("More", "और")} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-60 glass-panel rounded-2xl border border-border/60 py-2 shadow-xl max-h-[80vh] overflow-y-auto"
                >
                  {MORE_LINKS.map(link => (
                    <Link key={link.href} href={link.href}>
                      <span
                        onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2 text-sm cursor-pointer transition-colors ${isActive(link.href) ? "text-primary font-600" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                      >
                        {language === "hi" ? link.label.hi : link.label.en}
                      </span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Mobile search overlay */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={handleSearch}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden flex items-center gap-1 overflow-hidden"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t("Search...", "खोजें...")}
                  className="w-36 h-8 px-3 text-sm rounded-full border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-background transition-colors"
                />
                <button
                  type="submit"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0"
                  aria-label="Submit search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Search icon button (mobile only, hidden when search open) */}
          {!searchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full w-8 h-8"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>
          )}

          {/* Close search (mobile, when open) */}
          {searchOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full w-8 h-8 flex-shrink-0"
              onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {/* Language toggle — compact on mobile, full pill on desktop */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 hover:border-primary/40 transition-colors"
            aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            {/* Mobile: single label */}
            <span className="lg:hidden px-2.5 py-1 text-xs font-600 text-foreground">
              {language === "en" ? "हि" : "EN"}
            </span>
            {/* Desktop: full EN / हिंदी pill */}
            <span className="hidden lg:flex items-center text-xs font-600">
              <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
              <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</span>
              <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>हिंदी</span>
            </span>
          </button>

          {/* Premium — star icon only on mobile, full button on desktop */}
          <Link href="/premium">
            <button
              className="flex items-center justify-center rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all w-8 h-8 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 lg:gap-1.5"
              aria-label="Premium"
            >
              <Star className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
              <span className="hidden lg:inline text-xs font-700">Premium</span>
            </button>
          </Link>

          {/* Theme toggle — both mobile and desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Dashboard / Login — desktop only */}
          {user ? (
            <Link href="/dashboard">
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 hover:bg-primary/20 text-xs font-600 text-primary transition-all">
                <LayoutDashboard className="w-3.5 h-3.5" />
                {displayName || "Dashboard"}
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-muted/30 hover:bg-muted/60 text-xs font-600 text-muted-foreground hover:text-foreground transition-all">
                <LogIn className="w-3.5 h-3.5" /> {t("Login", "लॉगिन")}
              </button>
            </Link>
          )}

          {/* Hamburger — mobile only, shows X when menu open */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-full w-8 h-8"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="px-4 py-3 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
              {mobileLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-600 cursor-pointer transition-colors ${isActive(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                  >
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
