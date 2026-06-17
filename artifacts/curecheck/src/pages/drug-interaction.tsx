import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, Pill, Plus, X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Interaction {
  medicine1: string;
  medicine2: string;
  severity: "major" | "moderate" | "minor" | "none";
  effect: string;
  mechanism: string;
  recommendation: string;
}

interface Result {
  interactions: Interaction[];
  overallRisk: "high" | "moderate" | "low" | "safe";
  overallSummary: string;
  generalAdvice: string[];
  disclaimer: string;
}

const SEVERITY_CONFIG = {
  major:    { label: "Major",    color: "text-red-400",     bg: "bg-red-500/10",    border: "border-red-500/30",    icon: "🚨" },
  moderate: { label: "Moderate", color: "text-amber-400",   bg: "bg-amber-500/10",  border: "border-amber-500/30",  icon: "⚠️" },
  minor:    { label: "Minor",    color: "text-blue-400",    bg: "bg-blue-500/10",   border: "border-blue-500/30",   icon: "ℹ️" },
  none:     { label: "None",     color: "text-emerald-400", bg: "bg-emerald-500/10",border: "border-emerald-500/30",icon: "✅" },
};
const RISK_CONFIG = {
  high:     { label: "High Risk",      color: "text-red-400",     bg: "bg-red-500/10" },
  moderate: { label: "Moderate Risk",  color: "text-amber-400",   bg: "bg-amber-500/10" },
  low:      { label: "Low Risk",       color: "text-blue-400",    bg: "bg-blue-500/10" },
  safe:     { label: "No Significant Risk", color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function DrugInteraction() {
  const [medicines, setMedicines] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const addMedicine = () => { if (medicines.length < 5) setMedicines(m => [...m, ""]); };
  const removeMedicine = (i: number) => { if (medicines.length > 2) setMedicines(m => m.filter((_, j) => j !== i)); };
  const setMed = (i: number, v: string) => setMedicines(m => { const n = [...m]; n[i] = v; return n; });

  const check = async () => {
    const filled = medicines.filter(m => m.trim().length > 1);
    if (filled.length < 2) { setError("Enter at least 2 medicine names."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/drug-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines: filled }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? "Failed to check interactions");
      setResult(d);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 flex items-center justify-center flex-shrink-0"><Pill className="w-6 h-6 text-rose-400" /></div>
        <div>
          <span className="mono-label text-rose-400/80 mb-1 block">Drug Safety</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Drug Interaction Checker</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter 2–5 medicines to check for interactions. AI-powered, India-specific.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 mb-5">
        <p className="text-xs font-700 text-muted-foreground mb-3">MEDICINES (enter brand or generic names)</p>
        <div className="space-y-2.5">
          {medicines.map((med, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-800 flex items-center justify-center flex-shrink-0">{i + 1}</div>
              <Input placeholder={`Medicine ${i + 1} — e.g. Metformin, Aspirin`} value={med} onChange={e => setMed(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && i === medicines.length - 1) addMedicine(); }}
                className="rounded-xl flex-1" />
              {medicines.length > 2 && (
                <button onClick={() => removeMedicine(i)} className="w-7 h-7 rounded-full bg-muted/50 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}
        </div>
        {medicines.length < 5 && (
          <button onClick={addMedicine} className="mt-3 flex items-center gap-1.5 text-xs font-700 text-primary hover:text-primary/80 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add another medicine
          </button>
        )}
        {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-xl px-3 py-2 mt-3">{error}</p>}
        <Button onClick={check} disabled={loading} className="w-full rounded-xl mt-4">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking interactions…</> : <><Pill className="w-4 h-4 mr-2" /> Check Interactions</>}
        </Button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Overall risk */}
            <div className={`rounded-2xl p-5 ${RISK_CONFIG[result.overallRisk].bg} border border-border/30`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className={`w-5 h-5 ${RISK_CONFIG[result.overallRisk].color}`} />
                <span className={`text-base font-800 ${RISK_CONFIG[result.overallRisk].color}`}>{RISK_CONFIG[result.overallRisk].label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{result.overallSummary}</p>
            </div>

            {/* Individual interactions */}
            {result.interactions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-700 text-foreground">Interaction Details</h2>
                {result.interactions.map((ix, i) => {
                  const cfg = SEVERITY_CONFIG[ix.severity];
                  return (
                    <div key={i} className={`glass-panel rounded-xl p-4 border ${cfg.border}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{cfg.icon}</span>
                        <div>
                          <p className="text-sm font-700 text-foreground">{ix.medicine1} + {ix.medicine2}</p>
                          <span className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label} Interaction</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div><p className="text-[11px] font-700 text-muted-foreground mb-0.5">EFFECT</p><p className="text-sm text-muted-foreground">{ix.effect}</p></div>
                        <div><p className="text-[11px] font-700 text-muted-foreground mb-0.5">HOW IT HAPPENS</p><p className="text-sm text-muted-foreground">{ix.mechanism}</p></div>
                        <div className={`${cfg.bg} rounded-xl p-3`}><p className="text-[11px] font-700 ${cfg.color} mb-0.5">WHAT TO DO</p><p className="text-sm text-muted-foreground">{ix.recommendation}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* General advice */}
            {result.generalAdvice?.length > 0 && (
              <div className="glass-panel rounded-xl p-4">
                <h2 className="text-sm font-700 text-foreground mb-3">General Advice</h2>
                <div className="space-y-2">
                  {result.generalAdvice.map((a, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center px-4">{result.disclaimer}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <div className="glass-panel rounded-xl p-4 border border-amber-500/20">
          <p className="text-xs text-amber-400 font-700 mb-1">⚠️ Important</p>
          <p className="text-xs text-muted-foreground">This tool provides educational information only. Always consult your doctor or pharmacist before combining medicines.</p>
        </div>
      )}
    </div>
  );
}
