import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import PageMeta from "@/components/page-meta";
import { ChevronLeft, Calculator, Activity, Flame, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "bmi" | "tdee" | "water" | "ibw";

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-600 text-muted-foreground mb-1.5">{children}</p>;
}
function Field({ label, value, onChange, unit, min, max, step = 1 }: { label: string; value: string; onChange: (v: string) => void; unit?: string; min?: number; max?: number; step?: number }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Input type="number" value={value} onChange={e => onChange(e.target.value)} min={min} max={max} step={step} className="rounded-xl pr-14" />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-600">{unit}</span>}
      </div>
    </div>
  );
}
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-4 py-2.5 rounded-xl ${highlight ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-700 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}

/* ─── BMI ─────────────────────────────────────────────────────────── */
function BMICalc() {
  const [wt, setWt] = useState("70"); const [ht, setHt] = useState("170"); const [sex, setSex] = useState<"M" | "F">("M");
  const h = Number(ht) / 100; const w = Number(wt);
  const bmi = h > 0 ? +(w / (h * h)).toFixed(1) : 0;
  const cat = bmi < 18.5 ? { label: "Underweight", color: "text-blue-400" } : bmi < 25 ? { label: "Normal weight ✓", color: "text-emerald-400" } : bmi < 30 ? { label: "Overweight", color: "text-amber-400" } : { label: "Obese", color: "text-red-400" };
  const ibw = sex === "M" ? 50 + 0.91 * (Number(ht) - 152.4) : 45.5 + 0.91 * (Number(ht) - 152.4);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight" value={wt} onChange={setWt} unit="kg" min={20} max={300} />
        <Field label="Height" value={ht} onChange={setHt} unit="cm" min={100} max={250} />
      </div>
      <div>
        <Label>Sex</Label>
        <div className="flex gap-2">
          {(["M", "F"] as const).map(s => <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-xl text-sm font-700 border transition-all ${sex === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>{s === "M" ? "Male" : "Female"}</button>)}
        </div>
      </div>
      {bmi > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-center py-4">
            <p className="text-5xl font-800 text-foreground tabular-nums">{bmi}</p>
            <p className={`text-sm font-700 mt-1 ${cat.color}`}>{cat.label}</p>
          </div>
          <Row label="BMI" value={String(bmi)} highlight />
          <Row label="Ideal body weight" value={`${ibw.toFixed(1)} kg`} />
          <Row label="Weight to gain/lose" value={`${(w - ibw).toFixed(1) > "0" ? "−" : "+"}${Math.abs(w - ibw).toFixed(1)} kg`} />
          <p className="text-[11px] text-muted-foreground text-center pt-1">BMI is a screening tool, not a diagnosis. Consult a doctor.</p>
        </div>
      )}
    </div>
  );
}

/* ─── TDEE ────────────────────────────────────────────────────────── */
const ACTIVITY = [
  { label: "Sedentary (desk job, no exercise)", mult: 1.2 },
  { label: "Light (1–3 days/week exercise)", mult: 1.375 },
  { label: "Moderate (3–5 days/week)", mult: 1.55 },
  { label: "Very Active (6–7 days/week)", mult: 1.725 },
  { label: "Extra Active (physical job + gym)", mult: 1.9 },
];
function TDEECalc() {
  const [wt, setWt] = useState("70"); const [ht, setHt] = useState("170"); const [age, setAge] = useState("30");
  const [sex, setSex] = useState<"M" | "F">("M"); const [act, setAct] = useState(1);
  const bmr = sex === "M"
    ? 10 * Number(wt) + 6.25 * Number(ht) - 5 * Number(age) + 5
    : 10 * Number(wt) + 6.25 * Number(ht) - 5 * Number(age) - 161;
  const tdee = Math.round(bmr * ACTIVITY[act].mult);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Field label="Weight" value={wt} onChange={setWt} unit="kg" min={20} max={300} />
        <Field label="Height" value={ht} onChange={setHt} unit="cm" min={100} max={250} />
        <Field label="Age" value={age} onChange={setAge} unit="yrs" min={10} max={100} />
      </div>
      <div>
        <Label>Sex</Label>
        <div className="flex gap-2">
          {(["M", "F"] as const).map(s => <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-xl text-sm font-700 border transition-all ${sex === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>{s === "M" ? "Male" : "Female"}</button>)}
        </div>
      </div>
      <div>
        <Label>Activity Level</Label>
        <div className="space-y-1.5">
          {ACTIVITY.map((a, i) => <button key={i} onClick={() => setAct(i)} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs border transition-all ${act === i ? "bg-primary/10 border-primary/40 text-primary" : "bg-muted/20 border-border/40 text-muted-foreground hover:border-primary/30"}`}>{a.label}</button>)}
        </div>
      </div>
      {tdee > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-center py-3">
            <p className="text-4xl font-800 text-foreground tabular-nums">{tdee}</p>
            <p className="text-sm text-muted-foreground mt-1">Calories/day to maintain weight</p>
          </div>
          <Row label="To lose weight (−500 kcal)" value={`${tdee - 500} kcal/day`} />
          <Row label="Maintenance" value={`${tdee} kcal/day`} highlight />
          <Row label="To gain weight (+300 kcal)" value={`${tdee + 300} kcal/day`} />
          <Row label="Protein need (1.6 g/kg)" value={`${Math.round(Number(wt) * 1.6)} g/day`} />
        </div>
      )}
    </div>
  );
}

/* ─── Water ───────────────────────────────────────────────────────── */
function WaterCalc() {
  const [wt, setWt] = useState("70"); const [act, setAct] = useState<"low" | "med" | "high">("med"); const [climate, setClimate] = useState<"normal" | "hot">("normal");
  const base = Number(wt) * 35;
  const extra = act === "med" ? 350 : act === "high" ? 700 : 0;
  const climateExtra = climate === "hot" ? 250 : 0;
  const total = Math.round((base + extra + climateExtra) / 100) * 100;
  const glasses = Math.round(total / 250);
  return (
    <div className="space-y-4">
      <Field label="Body weight" value={wt} onChange={setWt} unit="kg" min={20} max={200} />
      <div>
        <Label>Exercise / Activity</Label>
        <div className="flex gap-2">
          {([["low", "None"], ["med", "Moderate"], ["high", "Intense"]] as const).map(([k, l]) =>
            <button key={k} onClick={() => setAct(k)} className={`flex-1 py-2 rounded-xl text-xs font-700 border transition-all ${act === k ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>{l}</button>)}
        </div>
      </div>
      <div>
        <Label>Climate</Label>
        <div className="flex gap-2">
          {([["normal", "Normal"], ["hot", "Hot / Humid"]] as const).map(([k, l]) =>
            <button key={k} onClick={() => setClimate(k)} className={`flex-1 py-2 rounded-xl text-xs font-700 border transition-all ${climate === k ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>{l}</button>)}
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="text-center py-3">
          <p className="text-4xl font-800 text-foreground tabular-nums">{(total / 1000).toFixed(1)} L</p>
          <p className="text-sm text-muted-foreground mt-1">Daily water intake goal</p>
        </div>
        <Row label="In millilitres" value={`${total} ml/day`} highlight />
        <Row label="In glasses (250 ml)" value={`${glasses} glasses/day`} />
        <Row label="Base (35 ml/kg)" value={`${Math.round(base)} ml`} />
      </div>
    </div>
  );
}

/* ─── Waist–Hip ───────────────────────────────────────────────────── */
function WaistHip() {
  const [waist, setWaist] = useState("80"); const [hip, setHip] = useState("95"); const [sex, setSex] = useState<"M" | "F">("M");
  const ratio = hip && waist ? +(Number(waist) / Number(hip)).toFixed(2) : 0;
  const risk = sex === "M" ? ratio > 0.95 : ratio > 0.85;
  const low = sex === "M" ? ratio < 0.9 : ratio < 0.8;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Waist circumference" value={waist} onChange={setWaist} unit="cm" min={40} max={200} />
        <Field label="Hip circumference" value={hip} onChange={setHip} unit="cm" min={40} max={200} />
      </div>
      <div>
        <Label>Sex</Label>
        <div className="flex gap-2">
          {(["M", "F"] as const).map(s => <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-xl text-sm font-700 border transition-all ${sex === s ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>{s === "M" ? "Male" : "Female"}</button>)}
        </div>
      </div>
      {ratio > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-center py-3">
            <p className="text-4xl font-800 text-foreground tabular-nums">{ratio}</p>
            <p className={`text-sm font-700 mt-1 ${risk ? "text-red-400" : low ? "text-emerald-400" : "text-amber-400"}`}>{risk ? "High cardiovascular risk" : low ? "Low risk ✓" : "Moderate risk"}</p>
          </div>
          <Row label="WHR" value={String(ratio)} highlight />
          <Row label="Healthy range (Male)" value="< 0.90" />
          <Row label="Healthy range (Female)" value="< 0.85" />
        </div>
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "bmi",   label: "BMI",        icon: <Activity className="w-4 h-4" /> },
  { id: "tdee",  label: "Calories",   icon: <Flame className="w-4 h-4" /> },
  { id: "water", label: "Water",      icon: <Droplets className="w-4 h-4" /> },
  { id: "ibw",   label: "Waist–Hip",  icon: <Calculator className="w-4 h-4" /> },
];

export default function Calculators() {
  const [tab, setTab] = useState<Tab>("bmi");
  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
      <PageMeta
        title="Health Calculators — BMI, Calories &amp; More for India"
        description="Free health calculators for BMI, daily calorie needs, ideal weight, water intake, and more — calibrated for Indian body types."
        path="/calculators"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>
      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center flex-shrink-0"><Calculator className="w-6 h-6 text-amber-400" /></div>
        <div>
          <span className="mono-label text-amber-400/80 mb-1 block">Health Tools</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Health Calculators</h1>
          <p className="text-sm text-muted-foreground mt-1">BMI, calorie needs, water intake, and more — built for Indian body types.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-700 border whitespace-nowrap transition-all flex-shrink-0 ${tab === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/40"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass-panel rounded-2xl p-6">
        {tab === "bmi"   && <BMICalc />}
        {tab === "tdee"  && <TDEECalc />}
        {tab === "water" && <WaterCalc />}
        {tab === "ibw"   && <WaistHip />}
      </motion.div>
      <p className="text-xs text-muted-foreground text-center mt-4">These calculators are for informational purposes only. Always consult a healthcare professional.</p>
    </div>
  );
}
