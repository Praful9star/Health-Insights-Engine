import { Link, useLocation } from "wouter";
import { Activity, Menu, X, Languages } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", labelEn: "Home", labelHi: "होम" },
  { href: "/symptom-checker", labelEn: "Symptoms", labelHi: "लक्षण" },
  { href: "/claim-checker", labelEn: "Claim Check", labelHi: "दावा जांच" },
  { href: "/medicine-explainer", labelEn: "Medicine", labelHi: "दवा" },
  { href: "/report-explainer", labelEn: "Reports", labelHi: "रिपोर्ट" },
  { href: "/disease-journey", labelEn: "Journey", labelHi: "रोग यात्रा" },
  { href: "/fitness-hub", labelEn: "Fitness Hub", labelHi: "फिटनेस हब" },
  { href: "/about", labelEn: "About", labelHi: "परिचय" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform glow-cyan">
              <Activity className="w-5 h-5 text-primary-foreground" strokeWidth={2.6} />
            </div>
            <span className="font-serif font-800 text-xl tracking-tight text-foreground">
              Cure<span className="text-primary text-glow">Check</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => {
              const active = location === link.href;
              const isFitness = link.href === "/fitness-hub";
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-500 transition-all cursor-pointer whitespace-nowrap ${
                      active
                        ? "bg-primary/15 text-primary"
                        : isFitness
                          ? "text-primary/90 hover:bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {language === "hi" ? link.labelHi : link.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language pill */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="group inline-flex items-center rounded-full border border-border/70 bg-muted/40 p-0.5 text-xs font-600 hover:border-primary/40 transition-colors"
              data-testid="button-language-toggle"
              aria-label={language === "en" ? "Switch to Hindi" : "Switch to English"}
              title={language === "en" ? "Switch to Hindi" : "Switch to English"}
            >
              <Languages className="w-3.5 h-3.5 ml-2 mr-1 text-muted-foreground" />
              <span
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                EN
              </span>
              <span
                className={`px-2.5 py-1 rounded-full transition-colors ${
                  language === "hi" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                हिंदी
              </span>
            </button>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden rounded-full w-9 h-9"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              data-testid="button-menu-toggle"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="xl:hidden pb-4 space-y-0.5 border-t border-border/50 pt-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-500 transition-colors cursor-pointer ${
                    location === link.href
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {language === "hi" ? link.labelHi : link.labelEn}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
