import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, FileText, Activity, TrendingUp, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMIN_PASS = "curecheck@admin2025";

interface Stats {
  reportsAnalyzed: number;
  claimsChecked: number;
  symptomsChecked: number;
  medicinesSearched: number;
  mythsBusted: number;
  timelineEntries: number;
  remindersSaved: number;
}

function readStats(): Stats {
  try {
    const timeline = JSON.parse(localStorage.getItem("curecheck-timeline") ?? "[]");
    const reminders = JSON.parse(localStorage.getItem("curecheck-reminders") ?? "[]");
    return {
      reportsAnalyzed: Number(localStorage.getItem("cc_stat_reports") ?? 0),
      claimsChecked: Number(localStorage.getItem("cc_stat_claims") ?? 0),
      symptomsChecked: Number(localStorage.getItem("cc_stat_symptoms") ?? 0),
      medicinesSearched: Number(localStorage.getItem("cc_stat_medicines") ?? 0),
      mythsBusted: Number(localStorage.getItem("cc_stat_myths") ?? 0),
      timelineEntries: timeline.length,
      remindersSaved: reminders.length,
    };
  } catch {
    return { reportsAnalyzed: 0, claimsChecked: 0, symptomsChecked: 0, medicinesSearched: 0, mythsBusted: 0, timelineEntries: 0, remindersSaved: 0 };
  }
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("cc_admin") === "1") {
      setAuthed(true);
      setStats(readStats());
    }
  }, []);

  const login = () => {
    if (pass === ADMIN_PASS) {
      sessionStorage.setItem("cc_admin", "1");
      setAuthed(true);
      setStats(readStats());
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  };

  if (!authed) {
    return (
      <div className="relative z-10 min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-8 w-full max-w-sm"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">CureCheck dashboard</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={e => { setPass(e.target.value); setErr(false); }}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="Admin password"
                className={`w-full h-11 px-4 pr-10 rounded-xl bg-muted/40 border ${err ? "border-red-500/60" : "border-border/60"} text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors text-sm`}
              />
              <button onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {err && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" /> Incorrect password
              </div>
            )}

            <Button onClick={login} className="w-full rounded-xl gap-2">
              <Lock className="w-4 h-4" /> Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const statCards = stats ? [
    { icon: FileText, label: "Reports Analyzed", value: stats.reportsAnalyzed, color: "text-primary", bg: "bg-primary/10" },
    { icon: Shield, label: "Claims Checked", value: stats.claimsChecked, color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Activity, label: "Symptoms Checked", value: stats.symptomsChecked, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Users, label: "Medicines Searched", value: stats.medicinesSearched, color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: TrendingUp, label: "Myths Busted", value: stats.mythsBusted, color: "text-rose-400", bg: "bg-rose-500/10" },
    { icon: FileText, label: "Timeline Entries", value: stats.timelineEntries, color: "text-sky-400", bg: "bg-sky-500/10" },
  ] : [];

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            CureCheck Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Platform usage overview — data from this device's localStorage</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => { sessionStorage.removeItem("cc_admin"); setAuthed(false); }}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-2xl p-4"
          >
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">{card.value.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Platform Info</h2>
          <div className="space-y-3">
            {[
              { label: "Version", value: "2.0.0" },
              { label: "AI Model", value: "Claude claude-sonnet-4-6" },
              { label: "Stack", value: "React + Vite + Express" },
              { label: "Auth", value: "Supabase" },
              { label: "Payments", value: "Razorpay" },
              { label: "CMS", value: "Sanity (tqmjf1jn)" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-sm text-foreground font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Active Features</h2>
          <div className="space-y-2">
            {[
              "Health Claim Checker",
              "Report Explainer (OCR + PDF)",
              "Symptom Checker",
              "Medicine Guide + Drug Interactions",
              "Fitness Hub + Calculators",
              "Myth Buster (PubMed)",
              "Hospital Finder (Leaflet)",
              "Weather + Health Tips",
              "Disease Journey Map",
              "Mental Health + Emergency",
              "Health News (NewsAPI)",
              "Medicine Reminders",
              "Health Timeline",
              "Ayurveda + Pregnancy + Vaccines",
              "Doctor Visit Prep",
              "Razorpay Premium Plans",
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Admin password: stored in source only. Change it in admin.tsx before deploying.
      </p>
    </div>
  );
}
