import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Stethoscope, FileText, Pill, ShieldCheck, X, Sparkles } from "lucide-react";

const ACTIONS = [
  { icon: Stethoscope, label: "Check Symptoms", href: "/symptom-checker", color: "text-emerald-400", bg: "bg-emerald-500/15 hover:bg-emerald-500/25" },
  { icon: FileText,    label: "Analyze Report", href: "/report-explainer", color: "text-sky-400",     bg: "bg-sky-500/15 hover:bg-sky-500/25"     },
  { icon: Pill,        label: "Medicine Guide",  href: "/medicine-explainer", color: "text-violet-400", bg: "bg-violet-500/15 hover:bg-violet-500/25" },
  { icon: ShieldCheck, label: "Check a Claim",   href: "/claim-checker",      color: "text-amber-400",  bg: "bg-amber-500/15 hover:bg-amber-500/25"  },
];

const HIDE_ON = ["/symptom-checker", "/report-explainer", "/medicine-explainer", "/claim-checker"];

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const [scrolling, setScrolling] = useState(false);

  /* Auto-hide while the user is scrolling so the button never covers text. */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (open) setOpen(false); // close menu on scroll
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, [open]);

  if (HIDE_ON.includes(location)) return null;

  return (
    /*
     * Positioning:
     *   Mobile: bottom-[5.5rem] keeps the button above the rounded bottom-nav
     *           (which sits at ~80px from bottom). right-3 gives 12px clearance.
     *   Desktop: bottom-20 / right-6 unchanged.
     *
     * scroll-hide: opacity-0 + pointer-events-none while user is scrolling
     * so the FAB never visually covers text mid-scroll.
     */
    <div
      className={`fixed bottom-[5.5rem] right-3 lg:bottom-20 lg:right-6 z-50 flex flex-col items-end gap-2 transition-all duration-300 ${
        scrolling ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
      }`}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.18, type: "spring", stiffness: 400, damping: 28 }}
            className="flex flex-col gap-1.5 mb-1"
          >
            {ACTIONS.map((a, i) => (
              <motion.div
                key={a.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={a.href}>
                  <button
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xl bg-black/60 ${a.bg} transition-all shadow-lg shadow-black/30 w-max group`}
                  >
                    <a.icon className={`w-4 h-4 ${a.color} flex-shrink-0`} />
                    <span className="text-sm font-600 text-white whitespace-nowrap">{a.label}</span>
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button is slightly smaller on mobile (w-11 h-11 = 44px) to reduce
          visual footprint; full size (w-14 h-14) on desktop. */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.93 }}
        className="relative w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all hover:shadow-primary/50 hover:scale-105"
        aria-label={open ? "Close AI assistant menu" : "Open AI assistant"}
      >
        {/* Pulse ring is pointer-events-none so it never intercepts taps on
            underlying content when the animation briefly extends outward. */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary opacity-40 pointer-events-none"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
