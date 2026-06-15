import { motion } from "framer-motion";
import { Shield, Heart, Lock, Users, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-serif font-700 text-foreground mb-4">About CureCheck</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We built CureCheck because health misinformation in India is not just annoying — it is genuinely dangerous.
          Every day, millions of people receive WhatsApp forwards claiming turmeric cures cancer, or cow urine treats diabetes.
          Families trust these messages because they come from people they love.
        </p>
      </motion.div>

      <div className="space-y-10">
        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <h2 className="text-2xl font-serif font-700 text-foreground mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            CureCheck's mission is to help every Indian navigate health information with clarity and confidence.
            We believe that access to good health information should not require a medical degree or a premium subscription.
            Our tools are free, accessible, and built specifically around Indian health concerns — from common WhatsApp health
            claims to complex medical reports.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            We are not trying to replace doctors. We are trying to help people show up to their doctor's appointments
            better informed and with the right questions — so that every consultation counts.
          </p>
        </motion.section>

        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <h2 className="text-2xl font-serif font-700 text-foreground mb-4">What We Are Not</h2>
          <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30 p-5">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm text-amber-900 dark:text-amber-300 leading-relaxed">
                <p>CureCheck is <strong>not a diagnostic tool</strong>. We do not diagnose medical conditions.</p>
                <p>CureCheck is <strong>not a prescription service</strong>. We do not recommend treatments or medications.</p>
                <p>CureCheck is <strong>not a replacement for your doctor</strong>. Always consult a qualified healthcare professional for any health decision.</p>
                <p>Our AI can make mistakes. All outputs are for educational purposes only and should be discussed with a medical professional.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <h2 className="text-2xl font-serif font-700 text-foreground mb-4">Our Principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Lock, title: "Privacy first", desc: "We do not store any health information you share with us. Every session is independent and private." },
              { icon: Heart, title: "India-first", desc: "Built around Indian health concerns, medical reports, traditional medicine claims, and the Indian healthcare system." },
              { icon: Shield, title: "Evidence-based", desc: "Our AI is guided to rely on peer-reviewed medical science, not anecdote, tradition, or commercial interest." },
              { icon: Users, title: "Accessible to all", desc: "Free forever. No signup required. Designed to work on any phone, in any city, for any Indian family." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <h3 className="font-600 text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <h2 className="text-2xl font-serif font-700 text-foreground mb-4">Technology</h2>
          <p className="text-muted-foreground leading-relaxed">
            CureCheck uses Groq's large language models — among the fastest and most capable AI systems available — to
            analyze health claims, explain medical reports, and map disease journeys. The AI is guided by carefully
            designed prompts that prioritize medical accuracy, cultural sensitivity, and appropriate caution.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We are committed to continuously improving our AI's accuracy and expanding coverage of Indian-specific health
            topics, languages, and regional health concerns.
          </p>
        </motion.section>

        <motion.section variants={fadeUp} initial="hidden" animate="visible" custom={5} className="text-center pt-6">
          <h2 className="text-2xl font-serif font-700 text-foreground mb-4">Start using CureCheck</h2>
          <p className="text-muted-foreground mb-6">No signup needed. Completely free.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/claim-checker">
              <Button className="rounded-full gap-2" data-testid="button-about-claim-checker">
                Check a Health Claim <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/disease-journey">
              <Button variant="outline" className="rounded-full gap-2" data-testid="button-about-disease-journey">
                Explore Disease Journey
              </Button>
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
