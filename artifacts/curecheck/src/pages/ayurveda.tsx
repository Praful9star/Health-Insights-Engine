import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Leaf } from "lucide-react";
import PageMeta from "@/components/page-meta";

type Cat = "herbs" | "remedies" | "dosha";

const HERBS = [
  { name: "Ashwagandha", hindi: "अश्वगंधा", uses: "Stress reduction, energy, testosterone, thyroid support", caution: "Avoid in pregnancy. May interact with thyroid meds.", emoji: "🌿" },
  { name: "Turmeric (Haldi)", hindi: "हल्दी", uses: "Anti-inflammatory, joint pain, immunity, wound healing", caution: "High doses may thin blood. Take with black pepper (piperine) for absorption.", emoji: "🟡" },
  { name: "Triphala", hindi: "त्रिफला", uses: "Constipation, digestion, detox, eye health", caution: "May cause loose stools initially. Not for diarrhea.", emoji: "🍃" },
  { name: "Brahmi", hindi: "ब्राह्मी", uses: "Memory, concentration, anxiety, ADHD (children)", caution: "Avoid with sedatives. Can cause nausea on empty stomach.", emoji: "🧠" },
  { name: "Neem", hindi: "नीम", uses: "Skin conditions, blood sugar, antibacterial, dental health", caution: "Not for pregnant women. May lower blood sugar — monitor if diabetic.", emoji: "🌱" },
  { name: "Shatavari", hindi: "शतावरी", uses: "Women's health, hormonal balance, lactation, menopause", caution: "Avoid if estrogen-sensitive conditions. Consult doctor.", emoji: "🌸" },
  { name: "Giloy (Guduchi)", hindi: "गिलोय", uses: "Immunity, fever (dengue/chikungunya), diabetes, arthritis", caution: "Avoid with autoimmune conditions. Not for kids under 5.", emoji: "🍀" },
  { name: "Amla (Amalaki)", hindi: "आँवला", uses: "Vitamin C, hair growth, digestion, liver health, aging", caution: "May increase bleeding. Avoid before surgery.", emoji: "🫐" },
  { name: "Methi (Fenugreek)", hindi: "मेथी", uses: "Blood sugar, cholesterol, lactation, digestion", caution: "Avoid high doses in pregnancy. May lower blood sugar.", emoji: "🟤" },
  { name: "Tulsi (Holy Basil)", hindi: "तुलसी", uses: "Immunity, stress, respiratory infections, cough & cold", caution: "May lower blood sugar and thin blood. Don't take with anticoagulants.", emoji: "🌿" },
];

const REMEDIES = [
  { ailment: "Common Cold & Cough", emoji: "🤧", ingredients: "Tulsi leaves + Ginger + Honey + Black pepper", method: "Boil 5 tulsi leaves + 1 tsp grated ginger in 1.5 cups water for 10 min. Strain, add 1 tsp honey + pinch of black pepper. Drink warm 2x daily.", works: "Tulsi has antimicrobial properties; ginger reduces inflammation; honey soothes throat." },
  { ailment: "Indigestion / Gas", emoji: "🫃", ingredients: "Jeera (cumin) + Saunf (fennel) + Ajwain (carom seeds)", method: "Mix equal parts jeera + saunf + ajwain. Dry roast lightly. Chew 1 tsp after meals, or boil in water and drink as tea.", works: "All three are carminatives — they relax gut muscles and reduce gas." },
  { ailment: "Joint Pain", emoji: "🦵", ingredients: "Turmeric + Ginger + Coconut oil", method: "Warm 2 tbsp coconut oil, add 1/2 tsp turmeric + 1/2 tsp ginger powder. Massage into affected joints for 10 min. Or drink turmeric milk (haldi doodh) at night.", works: "Curcumin in turmeric inhibits inflammatory enzymes. Ginger has salicylates (aspirin-like)." },
  { ailment: "Acidity / Heartburn", emoji: "🔥", ingredients: "Amla juice + Saunf + Cold milk", method: "Drink 10 ml fresh amla juice in water morning. After meals: chew 1 tsp saunf seeds. For quick relief: 1 glass cold milk.", works: "Amla reduces gastric acid naturally. Saunf alkalizes stomach. Cold milk neutralizes acid." },
  { ailment: "Headache / Migraine", emoji: "🤕", ingredients: "Peppermint oil + Ginger + Lavender", method: "Dilute 2 drops peppermint oil in coconut oil, apply to temples + back of neck. Or drink strong ginger tea. Avoid bright light and lie in a dark room.", works: "Menthol in peppermint relaxes muscles and dilates blood vessels. Ginger blocks prostaglandins." },
  { ailment: "Skin Issues / Pimples", emoji: "😤", ingredients: "Neem leaves + Turmeric + Multani mitti", method: "Make paste of neem leaf powder + pinch of turmeric + rose water. Apply to face 20 min, wash off. For body: neem leaves in bathwater.", works: "Neem is antibacterial (azadirachtin). Turmeric is anti-inflammatory. Multani mitti absorbs excess oil." },
  { ailment: "Diabetes Support", emoji: "🩸", ingredients: "Methi seeds + Karela (bitter gourd) + Jamun seeds", method: "Soak 1 tsp methi seeds overnight in water. Drink water + seeds on empty stomach. Add karela juice (50ml) before meals. Use jamun seed powder with water.", works: "Methi slows carb absorption. Karela contains plant insulin (charantin). These are supplements — do NOT replace medication." },
  { ailment: "Hair Loss", emoji: "💆", ingredients: "Amla + Bhringraj + Coconut oil", method: "Mix amla powder + bhringraj powder 1:1. Add warm coconut oil to make a paste. Massage scalp 30 min before washing. 2x/week.", works: "Amla strengthens hair follicles; bhringraj stimulates hair growth; coconut oil penetrates hair shaft." },
];

const DOSHAS = [
  {
    name: "Vata", emoji: "💨", color: "text-blue-400", bg: "bg-blue-500/10",
    traits: "Thin build, dry skin, irregular sleep, creative, anxious, cold hands/feet",
    balance: "Warm cooked foods, sesame oil massage, regular routine, Ashwagandha, warm milk",
    avoid: "Raw foods, cold drinks, fasting, irregular schedule, caffeine excess",
  },
  {
    name: "Pitta", emoji: "🔥", color: "text-amber-400", bg: "bg-amber-500/10",
    traits: "Medium build, oily skin, strong digestion, ambitious, irritable, heat sensitive",
    balance: "Cooling foods (cucumber, coconut), Amla, Shatavari, avoid spicy food, meditation",
    avoid: "Spicy/oily/fried food, alcohol, excessive sun, competitive pressure",
  },
  {
    name: "Kapha", emoji: "🌊", color: "text-emerald-400", bg: "bg-emerald-500/10",
    traits: "Heavy build, oily/smooth skin, deep sleeper, steady, slow metabolism, prone to weight gain",
    balance: "Light spicy foods, Triphala, Trikatu, regular vigorous exercise, dry massage",
    avoid: "Heavy dairy, fried food, daytime sleep, sedentary lifestyle, excess sweet/salty",
  },
];

export default function Ayurveda() {
  const [cat, setCat] = useState<Cat>("herbs");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Ayurveda Guide — Evidence-Based Traditional Medicine"
        description="Learn which Ayurvedic herbs and home remedies have scientific backing and which are myths. Safe, honest guidance for Indian traditional medicine."
        path="/ayurveda"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0"><Leaf className="w-6 h-6 text-emerald-400" /></div>
        <div>
          <span className="mono-label text-emerald-400/80 mb-1 block">Traditional Medicine</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Ayurveda Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">Science-backed herbs, home remedies & Dosha guide for everyday health.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([["herbs", "🌿 Herbs"], ["remedies", "🏠 Home Remedies"], ["dosha", "☯️ Dosha Types"]] as [Cat, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setCat(id)}
            className={`flex-1 py-2 rounded-full text-xs font-700 border transition-all ${cat === id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/40"}`}>
            {label}
          </button>
        ))}
      </div>

      {cat === "herbs" && (
        <div className="grid sm:grid-cols-2 gap-3">
          {HERBS.map(h => (
            <div key={h.name} className="glass-panel rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{h.emoji}</span>
                <div>
                  <p className="text-sm font-700 text-foreground">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.hindi}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{h.uses}</p>
              <p className="text-[11px] text-amber-400/80 bg-amber-500/10 rounded-lg px-2.5 py-1.5">⚠️ {h.caution}</p>
            </div>
          ))}
        </div>
      )}

      {cat === "remedies" && (
        <div className="space-y-3">
          {REMEDIES.map(r => (
            <div key={r.ailment} className="glass-panel rounded-2xl overflow-hidden border border-border/40">
              <button onClick={() => setOpen(open === r.ailment ? null : r.ailment)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
                <span className="text-xl">{r.emoji}</span>
                <span className="font-700 text-foreground text-sm flex-1">{r.ailment}</span>
                <span className={`text-muted-foreground transition-transform text-xl ${open === r.ailment ? "rotate-90" : ""}`}>›</span>
              </button>
              {open === r.ailment && (
                <div className="px-5 pb-5 space-y-3">
                  <div className="bg-muted/30 rounded-xl p-3">
                    <p className="text-[11px] font-700 text-muted-foreground mb-1">INGREDIENTS</p>
                    <p className="text-sm text-foreground">{r.ingredients}</p>
                  </div>
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                    <p className="text-[11px] font-700 text-primary/70 mb-1">METHOD</p>
                    <p className="text-sm text-muted-foreground">{r.method}</p>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-3">
                    <p className="text-[11px] font-700 text-muted-foreground mb-1">WHY IT WORKS</p>
                    <p className="text-xs text-muted-foreground">{r.works}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {cat === "dosha" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground glass-panel rounded-xl px-4 py-3">Ayurveda describes three fundamental energies (Doshas) that govern our physical and mental makeup. Most people are a mix, with one dominant.</p>
          {DOSHAS.map(d => (
            <div key={d.name} className={`${d.bg} rounded-2xl p-5 border border-border/30`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{d.emoji}</span>
                <h3 className={`text-xl font-serif font-800 ${d.color}`}>{d.name}</h3>
              </div>
              <div className="space-y-3">
                <div><p className="text-[11px] font-700 text-muted-foreground mb-1">TRAITS</p><p className="text-sm text-muted-foreground">{d.traits}</p></div>
                <div><p className="text-[11px] font-700 text-muted-foreground mb-1">TO BALANCE</p><p className="text-sm text-muted-foreground">{d.balance}</p></div>
                <div><p className="text-[11px] font-700 text-muted-foreground mb-1">AVOID</p><p className="text-sm text-muted-foreground">{d.avoid}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-6">Ayurvedic remedies support wellness but do not replace medical treatment. Consult a qualified Ayurvedic practitioner.</p>
    </div>
  );
}
