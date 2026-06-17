import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, Shield, CheckCircle2, ExternalLink } from "lucide-react";
import PageMeta from "@/components/page-meta";

type Tab = "govt" | "tips" | "claims";

const GOVT_SCHEMES = [
  {
    name: "Ayushman Bharat – PM-JAY",
    tag: "Central Govt.",
    coverage: "₹5 lakh/family/year",
    who: "Bottom 40% of India's population (~55 crore people). BPL + some above-BPL.",
    includes: ["3 days pre-hospitalization + 15 days post-discharge", "All pre-existing conditions covered from Day 1", "2,000+ treatments including cancer, bypass, dialysis", "Cashless at 25,000+ empanelled hospitals across India", "No cap on family size or age"],
    link: "https://pmjay.gov.in",
    color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20",
  },
  {
    name: "CGHS (Central Govt. Health Scheme)",
    tag: "Govt. Employees",
    coverage: "Unlimited (OPD + IPD)",
    who: "Central government employees, pensioners and their dependents.",
    includes: ["Cashless treatment at CGHS empanelled hospitals", "OPD consultations at wellness centres", "Medicines at subsidized rates", "Specialist consultations + diagnostic tests", "Dental and ophthalmic care"],
    link: "https://cghs.gov.in",
    color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20",
  },
  {
    name: "ESI (Employees' State Insurance)",
    tag: "Private Sector Workers",
    coverage: "Unlimited medical care",
    who: "Private sector employees earning ≤₹21,000/month. Contribution: 0.75% of salary (employee) + 3.25% (employer).",
    includes: ["Full medical care for insured + dependents", "Sickness benefit: 70% of wages during illness leave", "Maternity benefit: 26 weeks paid leave", "Disablement benefit for workplace injuries", "Funeral expenses"],
    link: "https://esic.in",
    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
  },
  {
    name: "State Government Schemes",
    tag: "State-Level",
    coverage: "Varies by state (₹2–25 lakh)",
    who: "State residents — criteria vary. Examples: Mahatma Jyotiba Phule Jan Arogya (Maharashtra), Chief Minister's Comprehensive Insurance (Tamil Nadu), Bhamashah (Rajasthan).",
    includes: ["Often extends PM-JAY coverage further", "Some states cover OPD costs too", "Check your state health department website", "May require Aadhaar + income certificate", "Apply at nearest government hospital or CSC"],
    link: "https://nhp.gov.in/state-schemes",
    color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20",
  },
];

const TIPS = [
  { tip: "Buy health insurance when young & healthy — premiums are lowest and pre-existing conditions won't be an issue after waiting period (usually 2–4 years).", icon: "📅" },
  { tip: "Opt for ₹5–10 lakh sum insured for a family of 4. ₹3 lakh is too low for tier-1 city hospital costs.", icon: "💰" },
  { tip: "Always choose a plan with No Claim Bonus (NCB) — your coverage grows each claim-free year.", icon: "📈" },
  { tip: "Check the hospital network. Ensure your preferred hospitals are in the insurer's network for cashless claims.", icon: "🏥" },
  { tip: "Room rent sub-limits can kill you — a plan capping room rent at ₹3,000/day forces proportional deductions even if your surgery costs ₹5 lakh. Avoid room rent caps.", icon: "🛏️" },
  { tip: "Super Top-up plans are cost-efficient — buy a base plan of ₹3–5 lakh + Super Top-up of ₹15–20 lakh for much lower premium.", icon: "⬆️" },
  { tip: "Family Floater vs Individual: individual plans are better if any member is 50+. Otherwise family floater is cheaper.", icon: "👨‍👩‍👧‍👦" },
  { tip: "Claim Settlement Ratio matters more than premium. Check IRDAI annual report for insurer-wise CSR (aim for >95%).", icon: "📊" },
];

const CLAIM_STEPS = {
  cashless: [
    "At hospital admission, inform the insurance desk. Show health card + Aadhaar + policy number.",
    "Hospital sends pre-authorization request to insurer (TPA). Usually approved within 2–4 hours.",
    "Get treatment. The insurer pays hospital directly — you pay only non-covered items.",
    "At discharge, review the final bill carefully. Sign the discharge summary.",
    "Keep all documents: discharge summary, reports, bills, prescriptions.",
  ],
  reimbursement: [
    "Pay the hospital bills yourself. Collect ALL original documents.",
    "Fill the reimbursement claim form (from insurer website).",
    "Submit: filled form + original bills + discharge summary + lab reports + doctor prescriptions.",
    "Insurer verifies documents. Timeline: 15–30 days for settlement.",
    "Amount is transferred to your registered bank account.",
    "If rejected, request a written reason. File a grievance with IRDAI if insurer is unfair.",
  ],
};

export default function Insurance() {
  const [tab, setTab] = useState<Tab>("govt");
  const [openScheme, setOpenScheme] = useState<string | null>(null);
  const [claimType, setClaimType] = useState<"cashless" | "reimbursement">("cashless");

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <PageMeta
        title="Health Insurance Guide — Understand Your Policy in India"
        description="Understand your Indian health insurance policy, claim process, and coverage limits in plain language. Includes free government schemes."
        path="/insurance"
      />
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-blue-400" /></div>
        <div>
          <span className="mono-label text-blue-400/80 mb-1 block">Financial Protection</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Health Insurance Guide</h1>
          <p className="text-sm text-muted-foreground mt-1">Free government schemes, buying tips, and how to file a claim — in plain language.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {([["govt", "🏛️ Govt Schemes"], ["tips", "💡 Buying Tips"], ["claims", "📋 How to Claim"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 py-2 rounded-full text-xs font-700 border transition-all ${tab === id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/40"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "govt" && (
        <div className="space-y-3">
          {GOVT_SCHEMES.map(s => (
            <div key={s.name} className={`glass-panel rounded-2xl overflow-hidden border ${s.border}`}>
              <button onClick={() => setOpenScheme(openScheme === s.name ? null : s.name)} className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-700 text-foreground">{s.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-700 ${s.bg} ${s.color}`}>{s.tag}</span>
                  </div>
                  <p className={`text-base font-800 ${s.color} mt-0.5`}>{s.coverage}</p>
                  <p className="text-xs text-muted-foreground">{s.who}</p>
                </div>
                <span className={`text-muted-foreground mt-1 transition-transform text-xl flex-shrink-0 ${openScheme === s.name ? "rotate-180" : ""}`}>›</span>
              </button>
              {openScheme === s.name && (
                <div className="px-5 pb-5 space-y-2">
                  {s.includes.map((item, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${s.color} flex-shrink-0 mt-0.5`} />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 mt-3 text-xs font-700 ${s.color} hover:underline`}>
                    <ExternalLink className="w-3 h-3" /> Official website →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "tips" && (
        <div className="space-y-3">
          {TIPS.map((t, i) => (
            <div key={i} className="glass-panel rounded-xl px-4 py-3.5 flex gap-3 items-start">
              <span className="text-xl flex-shrink-0">{t.icon}</span>
              <p className="text-sm text-muted-foreground">{t.tip}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "claims" && (
        <div className="space-y-5">
          <div className="flex gap-2">
            {(["cashless", "reimbursement"] as const).map(t => (
              <button key={t} onClick={() => setClaimType(t)}
                className={`flex-1 py-2 rounded-full text-xs font-700 border capitalize transition-all ${claimType === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"}`}>
                {t === "cashless" ? "💳 Cashless" : "💰 Reimbursement"}
              </button>
            ))}
          </div>
          <div className="glass-panel rounded-2xl p-5">
            <p className="text-xs text-muted-foreground mb-4">
              {claimType === "cashless" ? "Cashless works only at network hospitals. No upfront payment needed." : "Reimbursement: pay first, claim later. Works at any hospital."}
            </p>
            <ol className="space-y-3">
              {CLAIM_STEPS[claimType].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-800 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass-panel rounded-xl p-4 border border-amber-500/20">
            <p className="text-xs font-700 text-amber-400 mb-1">📌 Grievance Redressal</p>
            <p className="text-xs text-muted-foreground">If insurer rejects your claim unfairly — file a complaint at <strong>IRDAI Bima Bharosa</strong> portal (bimabharosa.irdai.gov.in) or call <strong>155255</strong>.</p>
          </div>
        </div>
      )}
    </div>
  );
}
