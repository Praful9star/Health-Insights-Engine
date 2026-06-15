import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Menu, X, Languages, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

const PRIMARY_LINKS = [
  { href: "/report-explainer", label: { en: "Reports", hi: "रिपोर्ट" } },
  { href: "/medicine-explainer", label: { en: "Medicine", hi: "दवा" } },
  { href: "/health-timeline", label: { en: "Timeline", hi: "टाइमलाइन" } },
  { href: "/fitness-hub", label: { en: "Fitness", hi: "फिटनेस" } },
  { href: "/myth-buster", label: { en: "Myths", hi: "मिथक" } },
];

const MORE_LINKS = [
  { href: "/symptom-checker", label: { en: "Symptom Checker", hi: "लक्षण जांच" } },
  { href: "/disease-journey", label: { en: "Disease Journey", hi: "रोग यात्रा" } },
  { href: "/claim-checker", label: { en: "Claim Checker", hi: "दावा जांच" } },
  { href: "/about", label: { en: "About", hi: "परिचय" } },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/">
          <motion.div
            className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="font-serif font-800 text-foreground text-[1.05rem]">
              Cure<span className="text-primary">Check</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop Primary Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-sm font-600 transition-all cursor-pointer ${
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {language === "hi" ? link.label.hi : link.label.en}
                </span>
              </Link>
            );
          })}

          {/* More dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
              aria-expanded={moreOpen}
              aria-label="More tools"
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
                  className="absolute right-0 top-full mt-2 w-48 glass-panel rounded-2xl border border-border/60 py-2 shadow-xl"
                >
                  {MORE_LINKS.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <span
                        onClick={() => setMoreOpen(false)}
                        className={`block px-4 py-2 text-sm cursor-pointer transition-colors ${
                          isActive(link.href)
                            ? "text-primary font-600"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
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

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language pill */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="group inline-flex items-center rounded-full border border-border/70 bg-muted/40 p-0.5 text-xs font-600 hover:border-primary/40 transition-colors"
            data-testid="button-language-toggle"
            aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
          >
            <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</span>
            <span className={`px-2.5 py-1 rounded-full transition-colors ${language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>हिंदी</span>
          </button>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost" size="icon"
            className="lg:hidden rounded-full w-9 h-9"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            data-testid="button-menu-toggle"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => (
                <Link key={link.href} href={link.href}>
                  <span
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-600 cursor-pointer transition-colors ${
                      isActive(link.href) ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
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
