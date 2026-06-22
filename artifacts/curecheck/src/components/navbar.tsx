import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Languages, ChevronDown, LogIn, Star, LayoutDashboard, Sun, Moon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { CureCheckMark } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { TOOL_CATEGORIES, searchTools, type Tool } from "@/data/tool-catalog";

const PRIMARY_LINKS = [
  { href: "/report-explainer",   label: { en: "Reports",  hi: "रिपोर्ट" } },
  { href: "/medicine-explainer", label: { en: "Medicine", hi: "दवा"     } },
  { href: "/fitness-hub",        label: { en: "Fitness",  hi: "फिटनेस" } },
  { href: "/myth-buster",        label: { en: "Myths",    hi: "मिथक"   } },
  { href: "/news",               label: { en: "News",     hi: "समाचार" } },
];

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ ai: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const searchVersionRef = useRef(0);
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, isPremium } = useAuth();
  const { theme, setTheme } = useTheme();
  const moreRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) setSearchFocused(false);
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

  const isActive = (href: string) => location === href || location.startsWith(href + "/");
  const displayName = profile?.name || user?.email?.split("@")[0] || "";

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) { setSearchResults([]); return; }
    const version = ++searchVersionRef.current;
    const timer = setTimeout(() => {
      if (version === searchVersionRef.current) {
        setSearchResults(searchTools(q));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleCategory = (key: string) =>
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSearchSelect = (href: string) => {
    navigate(href);
    setSearchQuery("");
    setSearchFocused(false);
    setOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchSelect(searchResults[0].href);
    }
    // No results → do nothing (dropdown already shows "No results" state)
  };

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

          {/* More dropdown — categorized */}
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
                  className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-2xl border border-border/60 py-2 shadow-xl max-h-[80vh] overflow-y-auto"
                >
                  {TOOL_CATEGORIES.map(cat => (
                    <div key={cat.key}>
                      <p className={`px-4 pt-3 pb-1 text-[10px] font-700 uppercase tracking-wider ${cat.accent}`}>
                        {language === "hi" ? cat.label.hi : cat.label.en}
                      </p>
                      {cat.tools.map(tool => (
                        <Link key={tool.href} href={tool.href}>
                          <span
                            onClick={() => setMoreOpen(false)}
                            className={`flex items-center gap-2.5 px-4 py-2 text-sm cursor-pointer transition-colors ${isActive(tool.href) ? "text-primary font-600" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
                          >
                            <tool.icon className={`w-3.5 h-3.5 ${tool.accent} flex-shrink-0`} />
                            {language === "hi" ? tool.hi : tool.en}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop search — always visible */}
        <div className="hidden lg:block relative flex-shrink-0" ref={desktopSearchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder={t("Search tools, medicines, symptoms…", "टूल्स, दवाएं, लक्षण खोजें…")}
              className="w-52 h-8 pl-8 pr-3 text-xs rounded-full border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-background focus:w-64 transition-all"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </form>
          <AnimatePresence>
            {searchFocused && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-2 w-72 glass-panel rounded-2xl border border-border/60 py-1.5 shadow-xl z-50"
              >
                {searchResults.length > 0 ? (
                  searchResults.map(tool => (
                    <button
                      key={tool.href}
                      onMouseDown={() => handleSearchSelect(tool.href)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-muted/40 transition-colors"
                    >
                      <tool.icon className={`w-4 h-4 ${tool.accent} flex-shrink-0`} />
                      <div className="min-w-0">
                        <p className="font-600 text-foreground truncate">{language === "hi" ? tool.hi : tool.en}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{language === "hi" ? tool.desc.hi : tool.desc.en}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-muted-foreground">
                    {t("No tools found for", "कोई टूल नहीं मिला:")} &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 hover:border-primary/40 transition-colors"
            aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            {/* Mobile: Languages icon + short label — avoids raw Devanagari rendering as a broken glyph */}
            <span className="lg:hidden flex items-center gap-1 px-2.5 py-1 text-xs font-600 text-foreground">
              <Languages className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              {language === "en" ? "हिं" : "EN"}
            </span>
            <span className="hidden lg:flex items-center text-xs font-600">
              <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
              <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</span>
              <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>हिंदी</span>
            </span>
          </button>

          {/* Premium */}
          <Link href="/premium">
            {isPremium ? (
              <button
                className="flex items-center justify-center rounded-full bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-500 transition-all w-8 h-8 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 lg:gap-1.5"
                aria-label="Premium active"
              >
                <Star className="w-3.5 h-3.5 lg:w-3 lg:h-3 fill-amber-500" />
                <span className="hidden lg:inline text-xs font-700">Premium ✓</span>
              </button>
            ) : (
              <button
                className="flex items-center justify-center rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 text-primary transition-all w-8 h-8 lg:w-auto lg:h-auto lg:px-3 lg:py-1.5 lg:gap-1.5"
                aria-label="Upgrade to Premium"
              >
                <Star className="w-3.5 h-3.5 lg:w-3 lg:h-3" />
                <span className="hidden lg:inline text-xs font-700">Premium</span>
              </button>
            )}
          </Link>

          {/* Theme toggle */}
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

          {/* Hamburger — mobile only */}
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
            <div className="px-4 py-3 max-h-[80vh] overflow-y-auto">

              {/* Mobile search */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t("Search tools, medicines, symptoms…", "टूल्स, दवाएं, लक्षण खोजें…")}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-border bg-muted/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:bg-background transition-colors"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {searchQuery.trim() && (
                  <div className="mt-1.5 rounded-xl border border-border/40 overflow-hidden">
                    {searchResults.length > 0 ? (
                      searchResults.map(tool => (
                        <button
                          key={tool.href}
                          type="button"
                          onClick={() => handleSearchSelect(tool.href)}
                          className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left hover:bg-muted/40 transition-colors border-b border-border/20 last:border-0 min-h-[44px]"
                        >
                          <tool.icon className={`w-4 h-4 ${tool.accent} flex-shrink-0`} />
                          <span className="font-600 text-foreground">{language === "hi" ? tool.hi : tool.en}</span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-3 text-sm text-muted-foreground">
                        {t("No tools found for", "कोई टूल नहीं मिला:")} &ldquo;{searchQuery}&rdquo;
                      </p>
                    )}
                  </div>
                )}
              </form>

              {/* Category accordions */}
              {TOOL_CATEGORIES.map(cat => (
                <div key={cat.key} className="mb-1">
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted/40 transition-colors min-h-[44px]"
                  >
                    <span className={`text-sm font-700 ${cat.accent}`}>
                      {language === "hi" ? cat.label.hi : cat.label.en}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openCategories[cat.key] ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openCategories[cat.key] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-1 pl-2">
                          {cat.tools.map(tool => (
                            <Link key={tool.href} href={tool.href}>
                              <span
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm cursor-pointer transition-colors min-h-[44px] ${isActive(tool.href) ? "bg-primary/15 text-primary font-600" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
                              >
                                <tool.icon className={`w-4 h-4 ${tool.accent} flex-shrink-0`} />
                                {language === "hi" ? tool.hi : tool.en}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Utility links */}
              <div className="mt-2 pt-2 border-t border-border/30 flex flex-col gap-0.5">
                <Link href="/premium">
                  <span onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-600 text-primary cursor-pointer hover:bg-primary/10 transition-colors min-h-[44px]">
                    ⭐ {t("Premium", "प्रीमियम")}
                  </span>
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard">
                      <span onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-600 text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors min-h-[44px]">
                        <LayoutDashboard className="w-4 h-4" /> {t("My Dashboard", "मेरा डैशबोर्ड")}
                      </span>
                    </Link>
                    <Link href="/profile">
                      <span onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-600 text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors min-h-[44px]">
                        {t("Edit Profile", "प्रोफ़ाइल संपादित करें")}
                      </span>
                    </Link>
                  </>
                ) : (
                  <Link href="/login">
                    <span onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-600 text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60 transition-colors min-h-[44px]">
                      <LogIn className="w-4 h-4" /> {t("Login / Sign up", "लॉगिन / साइनअप")}
                    </span>
                  </Link>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
