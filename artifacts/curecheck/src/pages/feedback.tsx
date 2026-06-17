import { motion } from "framer-motion";
import { MessageSquare, Star, Bug, Lightbulb } from "lucide-react";
import PageHeader from "@/components/page-header";

const FORMS = [
  {
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    title: "Rate Your Experience",
    desc: "Tell us how CureCheck is helping you understand your health.",
    tallyId: "wgNvvP",
  },
  {
    icon: Bug,
    color: "text-red-400",
    bg: "bg-red-500/10",
    title: "Report a Bug",
    desc: "Found something that isn't working? Let us know and we'll fix it.",
    tallyId: "mJzJXQ",
  },
  {
    icon: Lightbulb,
    color: "text-primary",
    bg: "bg-primary/10",
    title: "Suggest a Feature",
    desc: "Have an idea to make CureCheck better for Indians? We'd love to hear it.",
    tallyId: "nGLeQz",
  },
];

export default function FeedbackPage() {
  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <PageHeader
        icon={<MessageSquare className="w-6 h-6 text-primary" />}
        title="Feedback & Suggestions"
        subtitle="Help us build India's best health information platform. Your feedback shapes every update."
        badge="Always Listening"
      />

      <div className="space-y-5">
        {FORMS.map((form, i) => (
          <motion.div
            key={form.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel rounded-2xl overflow-hidden"
          >
            <div className="p-5 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl ${form.bg} flex items-center justify-center flex-shrink-0`}>
                  <form.icon className={`w-4.5 h-4.5 ${form.color}`} />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm">{form.title}</h2>
                  <p className="text-xs text-muted-foreground">{form.desc}</p>
                </div>
              </div>
            </div>
            <div className="w-full" style={{ height: 400 }}>
              <iframe
                src={`https://tally.so/embed/${form.tallyId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
                width="100%"
                height="400"
                frameBorder={0}
                title={form.title}
                className="block"
                loading="lazy"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6 px-4">
        Forms powered by Tally.so — free, no login required. Your responses go directly to the CureCheck team.
      </p>
    </div>
  );
}
