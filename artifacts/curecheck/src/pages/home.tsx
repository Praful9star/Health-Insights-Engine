import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle, ArrowRight, Star, ChevronDown,
  FileSearch, MapPin, Microscope, Users, TrendingUp, Award,
  Zap, Lock, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const features = [
  {
    icon: Shield,
    title: "Health Claim Checker",
    description:
      "Paste any WhatsApp forward, YouTube claim, or supplement ad. Get a credibility score, red flags, and safer interpretation — powered by AI.",
    href: "/claim-checker",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: MapPin,
    title: "Disease Journey Map",
    description:
      "Diagnosed with something new? Understand what typically happens — phase by phase — so you and your family know what to expect.",
    href: "/disease-journey",
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/40",
  },
  {
    icon: FileSearch,
    title: "Report Explainer",
    description:
      "Paste your CBC, thyroid, lipid, or any other report. Get a plain-language breakdown with key findings and questions to ask your doctor.",
    href: "/report-explainer",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
  },
];

const stats = [
  { value: "50,000+", label: "Users helped across India" },
  { value: "1,20,000+", label: "Claims analyzed" },
  { value: "95%", label: "Users felt more informed" },
  { value: "Free", label: "Always free to use" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Bengaluru",
    text: "My mother-in-law was convinced that giloy cures thyroid problems — a relative shared a video. CureCheck gave us a clear breakdown that helped us have a calm, informed conversation with her doctor.",
    role: "Software Engineer",
  },
  {
    name: "Ramesh Gupta",
    location: "Lucknow",
    text: "My father was newly diagnosed with Type 2 diabetes and we had no idea what to expect. The Disease Journey map gave our entire family a roadmap — what tests to expect, warning signs, everything.",
    role: "Teacher",
  },
  {
    name: "Dr. Anjali Mehta",
    location: "Mumbai",
    text: "I recommend CureCheck to patients who come in confused by social media health claims. It does not replace me — it helps patients come prepared with the right questions. That is invaluable.",
    role: "General Physician, MBBS",
  },
];

const faqs = [
  {
    q: "Is CureCheck a replacement for a doctor?",
    a: "Absolutely not. CureCheck provides educational information to help you understand health claims, medical reports, and disease journeys. It never diagnoses, prescribes treatment, or gives personalized medical advice. Always consult a qualified doctor for your health decisions.",
  },
  {
    q: "How does the AI analyze health claims?",
    a: "CureCheck uses Groq's large language model trained on vast amounts of medical literature. It evaluates claims against known scientific evidence, identifies red flags, and provides context — but it is not infallible and should not be treated as a medical opinion.",
  },
  {
    q: "Is my data private?",
    a: "We do not store your health queries, reports, or any personal data. Each session is independent. We do not sell or share your information. Your health information stays yours.",
  },
  {
    q: "Why do so many WhatsApp health forwards turn out to be misleading?",
    a: "Health misinformation spreads because it often contains a kernel of truth, uses emotional language, and comes from trusted sources like family members. CureCheck helps you examine the evidence behind a claim calmly and objectively.",
  },
  {
    q: "Is this service free?",
    a: "Yes, CureCheck is completely free. Our mission is to help everyday Indians navigate health information — we believe that should never be behind a paywall.",
  },
  {
    q: "Does it work for Ayurvedic and home remedy claims?",
    a: "Yes. CureCheck is built with the Indian context in mind and regularly evaluates Ayurvedic claims, home remedies, and traditional medicine claims. It aims to be balanced — acknowledging traditional wisdom while being honest about scientific evidence.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative hero-gradient overflow-hidden pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Badge className="mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 text-sm font-medium">
              Built for India. Trusted by thousands.
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-4xl sm:text-5xl lg:text-6xl font-serif font-800 text-foreground leading-tight tracking-tight"
          >
            Healthcare Information
            <br />
            <span className="gradient-text">You Can Actually Trust</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Verify health claims from WhatsApp forwards, understand your medical reports,
            and navigate diagnosis with AI-powered educational guidance.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="mt-10 flex flex-wrap gap-3 justify-center"
          >
            <Link href="/claim-checker">
              <Button size="lg" className="gap-2 rounded-full px-8 shadow-md hover:shadow-lg transition-shadow" data-testid="button-try-claim-checker">
                Check a Health Claim
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/disease-journey">
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-8" data-testid="button-try-disease-journey">
                Understand a Diagnosis
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="mt-5 text-sm text-muted-foreground"
          >
            Free to use. No signup required. Not a substitute for medical advice.
          </motion.p>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="text-center"
              >
                <p className="text-3xl font-serif font-700 gradient-text">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">Three tools. One mission.</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Cut through health misinformation with evidence-based, easy-to-understand guidance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
              >
                <Link href={f.href}>
                  <div className="group h-full rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h3 className="text-xl font-serif font-600 text-foreground mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
                    <div className="mt-5 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Try it now <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">How CureCheck works</h2>
            <p className="mt-4 text-muted-foreground text-lg">Simple. Fast. Trustworthy.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Zap, title: "Paste your content", desc: "A health claim, your medical report text, or a disease name. No account needed." },
              { step: "02", icon: Microscope, title: "AI analyzes the evidence", desc: "Our AI cross-references medical literature to evaluate accuracy, red flags, and context." },
              { step: "03", icon: CheckCircle, title: "Get clear guidance", desc: "Receive plain-language results with questions to ask your doctor — not a diagnosis." },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="text-xs font-700 text-primary tracking-widest uppercase mb-2">{item.step}</p>
                <h3 className="text-lg font-serif font-600 text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">Built with trust at the core</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Lock, title: "No data stored", desc: "Your queries are never saved or sold." },
              { icon: Heart, title: "India-first design", desc: "Built around Indian health concerns, reports, and context." },
              { icon: Award, title: "Evidence-based", desc: "AI grounded in peer-reviewed medical literature." },
              { icon: Users, title: "Doctor-friendly", desc: "Designed to complement — never replace — your physician." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="rounded-xl border border-border bg-card p-5"
              >
                <item.icon className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-600 text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">What people are saying</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="mt-auto">
                  <p className="font-600 text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground">Frequently asked questions</h2>
          </motion.div>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i * 0.5}
              >
                <AccordionItem value={`faq-${i}`} className="border border-border rounded-xl px-5 bg-card">
                  <AccordionTrigger className="text-left font-500 text-foreground hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent border border-primary/20 p-12">
              <h2 className="text-3xl sm:text-4xl font-serif font-700 text-foreground mb-4">
                Start with a health claim
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Paste that WhatsApp forward. Get the truth in seconds.
              </p>
              <Link href="/claim-checker">
                <Button size="lg" className="rounded-full px-10 gap-2 shadow-lg hover:shadow-xl transition-shadow" data-testid="button-cta-claim">
                  Check a Claim Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-600 text-foreground">CureCheck</span>
            <span>— Educational information only. Not medical advice.</span>
          </div>
          <div className="flex gap-5">
            <Link href="/about"><span className="hover:text-foreground transition-colors cursor-pointer">About</span></Link>
            <Link href="/claim-checker"><span className="hover:text-foreground transition-colors cursor-pointer">Claim Checker</span></Link>
            <Link href="/disease-journey"><span className="hover:text-foreground transition-colors cursor-pointer">Disease Journey</span></Link>
            <Link href="/report-explainer"><span className="hover:text-foreground transition-colors cursor-pointer">Report Explainer</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
