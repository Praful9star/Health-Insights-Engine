import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Home, ArrowLeft, Stethoscope, Search } from "lucide-react";

const QUICK_LINKS = [
  { href: "/symptom-checker", label: "Symptom Checker", icon: "🩺" },
  { href: "/report-explainer", label: "Report Explainer", icon: "📋" },
  { href: "/hospitals", label: "Find Hospitals", icon: "🏥" },
  { href: "/emergency", label: "Emergency", icon: "🚑" },
];

export default function NotFound() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const prev = existing?.getAttribute("content") ?? null;
    if (existing) {
      existing.setAttribute("content", "noindex, nofollow");
    } else {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
    }
    return () => {
      const tag = document.querySelector('meta[name="robots"]');
      if (tag) {
        if (prev !== null) {
          tag.setAttribute("content", prev);
        } else {
          tag.remove();
        }
      }
    };
  }, []);

  return (
    <div className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="relative mb-8 flex justify-center">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Stethoscope className="w-12 h-12 text-primary/60" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Search className="w-4 h-4 text-red-400" />
            </motion.div>
          </div>
        </div>

        <p className="mono-label text-primary/70 mb-2">404 — Page Not Found</p>
        <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-3">
          This page doesn't exist
        </h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          Looks like the page you're looking for has moved or never existed.
          Try one of the tools below.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              <button className="glass-panel rounded-2xl px-4 py-3.5 w-full text-left hover:border-primary/30 border border-transparent transition-all group glow-card">
                <span className="text-xl mb-1.5 block">{l.icon}</span>
                <span className="text-sm font-600 text-foreground group-hover:text-primary transition-colors">{l.label}</span>
              </button>
            </Link>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-700 hover:bg-primary/90 transition-colors">
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-muted/30 text-sm font-600 text-foreground hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
