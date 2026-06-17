import { useState } from "react";
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

  if (HIDE_ON.includes(location)) return null;

  return (
    <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-2">
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

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.93 }}
        className="relative w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all hover:shadow-primary/50 hover:scale-105"
        style={{ boxShadow: open ? undefined : "0 0 0 0 hsl(183 100% 50% / 0)" }}
      >
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-primary opacity-40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
          />
        )}
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="ai" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
