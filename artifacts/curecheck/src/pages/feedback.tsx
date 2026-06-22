import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Star, Bug, Lightbulb, CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";
import PageHeader from "@/components/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

type FormType = "rating" | "bug" | "feature";

interface SubmitState { status: "idle" | "loading" | "success" | "error"; message?: string }

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} star`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${(hover || value) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <p className="text-sm text-emerald-400 font-600">{message}</p>
    </motion.div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}

function RatingForm({ userId }: { userId: string | null }) {
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [location] = useLocation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setState({ status: "error", message: "Please select a star rating." }); return; }
    if (!message.trim()) { setState({ status: "error", message: "Please write a short message." }); return; }
    if (!supabase) { setState({ status: "error", message: "Not configured. Please try again later." }); return; }
    setState({ status: "loading" });
    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      type: "rating",
      rating,
      message: message.trim(),
      email: email.trim() || null,
      page_url: location,
    });
    if (error) {
      setState({ status: "error", message: "Submission failed. Please try again." });
      return;
    }
    setState({ status: "success", message: "Thank you! Your rating has been saved." });
    setRating(0); setMessage(""); setEmail("");
  };

  if (state.status === "success") return <SuccessBanner message={state.message!} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-2 block">Your rating</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">What's working well or not?</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Share your experience with CureCheck…"
          rows={3}
          maxLength={2000}
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/30 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">Email (optional)</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      {state.status === "error" && <ErrorBanner message={state.message!} />}
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {state.status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Rating
      </button>
    </form>
  );
}

function FeatureForm({ userId }: { userId: string | null }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [location] = useLocation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) { setState({ status: "error", message: "Please describe the feature." }); return; }
    if (!supabase) { setState({ status: "error", message: "Not configured. Please try again later." }); return; }
    setState({ status: "loading" });
    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      type: "feature",
      message: message.trim(),
      email: email.trim() || null,
      page_url: location,
    });
    if (error) {
      setState({ status: "error", message: "Submission failed. Please try again." });
      return;
    }
    setState({ status: "success", message: "Feature idea received! We review all suggestions." });
    setMessage(""); setEmail("");
  };

  if (state.status === "success") return <SuccessBanner message={state.message!} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">Describe your idea</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="What would make CureCheck more useful for Indians?…"
          rows={4}
          maxLength={2000}
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/30 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">Email (optional — for follow-up)</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      {state.status === "error" && <ErrorBanner message={state.message!} />}
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {state.status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Submit Idea
      </button>
    </form>
  );
}

function BugForm({ userId }: { userId: string | null }) {
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { setState({ status: "error", message: "Please describe the bug." }); return; }
    if (!supabase) { setState({ status: "error", message: "Not configured. Please try again later." }); return; }
    setState({ status: "loading" });
    const { error } = await supabase.from("bug_reports").insert({
      user_id: userId,
      description: description.trim(),
      email: email.trim() || null,
      page_url: window.location.href,
      browser: navigator.userAgent,
      device: `${window.screen.width}x${window.screen.height} · ${navigator.platform}`,
    });
    if (error) {
      setState({ status: "error", message: "Submission failed. Please try again." });
      return;
    }
    setState({ status: "success", message: "Bug report sent! We'll investigate shortly." });
    setDescription(""); setEmail("");
  };

  if (state.status === "success") return <SuccessBanner message={state.message!} />;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">What went wrong?</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe what you did, what you expected, and what happened instead…"
          rows={4}
          maxLength={3000}
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 focus:bg-muted/30 transition-colors resize-none"
        />
      </div>
      <div className="bg-muted/20 rounded-xl px-3 py-2.5 text-xs text-muted-foreground space-y-0.5">
        <p className="font-600 text-foreground/70 mb-1">Auto-captured context</p>
        <p>Page: {window.location.pathname}</p>
        <p className="truncate">Browser: {navigator.userAgent.slice(0, 80)}…</p>
        <p>Screen: {window.screen.width}×{window.screen.height}</p>
      </div>
      <div>
        <label className="text-xs font-700 text-muted-foreground uppercase tracking-wider mb-1.5 block">Email (optional — so we can follow up)</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-muted/20 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      {state.status === "error" && <ErrorBanner message={state.message!} />}
      <button
        type="submit"
        disabled={state.status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-700 hover:bg-red-500/90 transition-colors disabled:opacity-60"
      >
        {state.status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
        Report Bug
      </button>
    </form>
  );
}

const TABS: { id: FormType; icon: typeof Star; color: string; bg: string; label: string }[] = [
  { id: "rating",  icon: Star,      color: "text-amber-400", bg: "bg-amber-500/10", label: "Rate Experience"  },
  { id: "bug",     icon: Bug,       color: "text-red-400",   bg: "bg-red-500/10",   label: "Report a Bug"    },
  { id: "feature", icon: Lightbulb, color: "text-primary",   bg: "bg-primary/10",   label: "Suggest Feature" },
];

export default function FeedbackPage() {
  const [active, setActive] = useState<FormType>("rating");
  const { user } = useAuth();

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <PageHeader
        icon={<MessageSquare className="w-6 h-6 text-primary" />}
        title="Feedback & Suggestions"
        subtitle="Help us build India's best health information platform. Your feedback shapes every update."
        badge="Always Listening"
      />

      <div className="grid grid-cols-3 gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all text-center ${
              active === tab.id
                ? `${tab.bg} border-current ${tab.color}`
                : "border-border/40 bg-muted/10 text-muted-foreground hover:bg-muted/20"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active === tab.id ? tab.bg : "bg-muted/30"}`}>
              <tab.icon className={`w-4 h-4 ${active === tab.id ? tab.color : "text-muted-foreground"}`} />
            </div>
            <span className="text-xs font-700 leading-tight">{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="glass-panel rounded-2xl p-5"
      >
        {active === "rating"  && <RatingForm  userId={user?.id ?? null} />}
        {active === "bug"     && <BugForm     userId={user?.id ?? null} />}
        {active === "feature" && <FeatureForm userId={user?.id ?? null} />}
      </motion.div>

      <p className="text-xs text-muted-foreground text-center mt-6 px-4">
        Responses go directly to the CureCheck team
      </p>
    </div>
  );
}
