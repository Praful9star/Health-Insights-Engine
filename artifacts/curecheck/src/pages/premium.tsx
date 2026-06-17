import { Link } from "wouter";
import { ChevronLeft, Check, Zap, Shield, Brain, FileText, Pill, Activity, Star } from "lucide-react";

const MONTHLY_LINK = "https://rzp.io/rzp/jywNeGo";
const ANNUAL_LINK = "https://rzp.io/rzp/y4J1B3a";

const FREE_FEATURES = [
  "3 AI report analyses per month",
  "Basic symptom checker",
  "Health calculators (BMI, BMR, Water)",
  "Vaccine schedule & emergency info",
  "Ayurveda guide & home remedies",
  "Health news feed",
];

const PREMIUM_FEATURES = [
  { icon: Brain, label: "Unlimited AI report analysis (CBC, thyroid, liver, lipid)" },
  { icon: Activity, label: "Unlimited symptom checker with full AI analysis" },
  { icon: Pill, label: "Unlimited drug interaction checker" },
  { icon: FileText, label: "AI doctor visit prep — unlimited" },
  { icon: Shield, label: "Priority Claude AI — faster, more detailed responses" },
  { icon: Zap, label: "Report PDF export & WhatsApp share" },
  { icon: Star, label: "Save unlimited reports to your personal dashboard" },
  { icon: Activity, label: "Disease journey maps — all conditions" },
];

const FAQS = [
  {
    q: "How is payment processed?",
    a: "Via Razorpay — India's most trusted payment gateway. Accepts UPI, all cards, net banking, and wallets.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Reports are processed in real-time and never stored on our servers. We use Cloudinary with encryption for any uploaded files.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Email us at support@curecheck.in — no questions asked. Monthly plans end after the current billing period.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, within 7 days of purchase if you face any technical issues.",
  },
  {
    q: "Is this a subscription?",
    a: "The monthly plan auto-renews. The annual plan is a one-time charge for the full year.",
  },
];

export default function Premium() {
  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="text-center mb-10">
        <span className="mono-label text-primary/80 mb-2 block">Upgrade</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-800 text-foreground mb-3">CureCheck Premium</h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">Unlimited AI health analysis powered by Claude. Built for India. No subscription lock-in.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="glass-panel rounded-2xl p-6 border border-border/40 flex flex-col">
          <div className="mb-4">
            <p className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1">Free</p>
            <p className="text-3xl font-800 text-foreground">₹0</p>
            <p className="text-sm text-muted-foreground">Forever free</p>
          </div>
          <ul className="space-y-2.5 flex-1 mb-6">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
          <div className="w-full py-2.5 rounded-xl text-center text-sm font-600 text-muted-foreground bg-muted/30 border border-border/40">Current Plan</div>
        </div>

        <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-800 uppercase tracking-wide">Popular</div>
          <div className="mb-4">
            <p className="text-xs font-700 text-primary/80 uppercase tracking-wider mb-1">Premium</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-800 text-foreground">₹99</p>
              <p className="text-sm text-muted-foreground mb-1">/month</p>
            </div>
            <p className="text-xs text-emerald-400 font-600">or ₹499/year — save 58%</p>
          </div>
          <ul className="space-y-2.5 flex-1 mb-6">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm text-foreground">
                <f.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {f.label}
              </li>
            ))}
          </ul>
          <div className="space-y-2.5">
            <a
              href={MONTHLY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 rounded-xl text-center text-sm font-700 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Premium — ₹99/month
            </a>
            <a
              href={ANNUAL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 rounded-xl text-center text-xs font-600 bg-muted/30 text-foreground hover:bg-muted/50 transition-colors border border-border/40"
            >
              Annual Plan — ₹499/year (save 58%)
            </a>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5 mb-8 border border-emerald-500/20">
        <p className="text-xs font-700 text-emerald-400 uppercase tracking-wider mb-3">Secure payments via Razorpay</p>
        <div className="flex flex-wrap gap-2">
          {["UPI", "GPay", "PhonePe", "Paytm", "Credit Card", "Debit Card", "Net Banking", "Wallets"].map((m) => (
            <span key={m} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[11px] font-600">{m}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-base font-700 text-foreground">Frequently asked questions</h2>
        {FAQS.map((faq, i) => (
          <div key={i} className="glass-panel rounded-xl px-4 py-4">
            <p className="text-sm font-700 text-foreground mb-1.5">{faq.q}</p>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Questions? Email{" "}
        <a href="mailto:support@curecheck.in" className="text-primary hover:underline">support@curecheck.in</a>
        {" "}— we respond within 24 hours.
      </p>
    </div>
  );
}
