import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, FileSearch, Stethoscope, Dumbbell, Grid3X3 } from "lucide-react";
import { useState } from "react";

const TABS = [
  { href: "/",                  icon: Home,         label: "Home"     },
  { href: "/report-explainer",  icon: FileSearch,   label: "Reports"  },
  { href: "/symptom-checker",   icon: Stethoscope,  label: "Symptoms" },
  { href: "/fitness-hub",       icon: Dumbbell,     label: "Fitness"  },
  { href: "/news",              icon: Grid3X3,      label: "More"     },
];

export default function MobileBottomNav() {
  const [location] = useLocation();
  const [pressed, setPressed] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location === href || location.startsWith(href + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-2 mb-2 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center">
          {TABS.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link key={tab.href} href={tab.href}>
                <motion.button
                  onTapStart={() => setPressed(tab.href)}
                  onTap={() => setPressed(null)}
                  onTapCancel={() => setPressed(null)}
                  whileTap={{ scale: 0.88 }}
                  className="flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative cursor-pointer"
                  aria-label={tab.label}
                >
                  {active && (
                    <motion.div
                      layoutId="bottom-tab-indicator"
                      className="absolute inset-x-1 inset-y-1 rounded-xl bg-primary/12"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <tab.icon
                    className={`w-5 h-5 transition-colors relative z-10 ${active ? "text-primary" : "text-muted-foreground"}`}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span className={`text-[10px] font-600 tracking-wide relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
