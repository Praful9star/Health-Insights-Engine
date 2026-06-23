import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, FileSearch, AlertTriangle, Info, CheckCircle2, LogIn, ChevronRight, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useHealthStorage } from "@/hooks/use-health-storage";
import { useLanguage } from "@/contexts/language-context";
import PageMeta from "@/components/page-meta";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function History() {
  const { user, loading } = useAuth();
  const { timeline, deleteTimelineEntry } = useHealthStorage();
  const { tKey } = useLanguage();

  // Assessment config uses tKey so labels switch with language
  const ASSESSMENT_CONFIG = {
    requires_urgent_attention: { label: tKey("history.urgent"),  color: "text-red-400",    bg: "bg-red-500/10",    icon: AlertTriangle  },
    needs_follow_up:           { label: tKey("history.followUp"), color: "text-amber-400",  bg: "bg-amber-500/10",  icon: Info           },
    routine_monitoring:        { label: tKey("history.routine"), color: "text-sky-400",    bg: "bg-sky-500/10",    icon: Info           },
    all_clear:                 { label: tKey("history.allClear"),color: "text-emerald-400",bg: "bg-emerald-500/10",icon: CheckCircle2   },
  } as const;

  if (loading) {
    return (
      <div className="relative z-10 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative z-10 max-w-md mx-auto px-4 py-16 text-center">
        <PageMeta title="History — CureCheck" description="Your health analysis history." path="/history" />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-serif font-800 text-foreground mb-2">{tKey("history.signInTitle")}</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{tKey("history.signInDesc")}</p>
        <Link href="/login">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors">
            <LogIn className="w-4 h-4" />
            {tKey("history.signInBtn")}
          </button>
        </Link>
        <p className="text-xs text-muted-foreground mt-4">{tKey("history.noAccountNeeded")}</p>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="relative z-10 max-w-md mx-auto px-4 py-16 text-center">
        <PageMeta title="History — CureCheck" description="Your health analysis history." path="/history" />
        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-5">
          <FileSearch className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-700 text-foreground mb-2">{tKey("history.emptyTitle")}</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{tKey("history.emptyDesc")}</p>
        <Link href="/report-explainer">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-700 hover:bg-primary/90 transition-colors">
            <FileSearch className="w-4 h-4" />
            {tKey("history.analyzeBtn")}
          </button>
        </Link>
      </div>
    );
  }

  const count = timeline.length;
  const countLabel = count === 1
    ? tKey("history.reportsAnalyzed_one").replace("{{count}}", String(count))
    : tKey("history.reportsAnalyzed_other").replace("{{count}}", String(count));

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
      <PageMeta title="History — CureCheck" description="Your health analysis history." path="/history" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-700 text-foreground">{tKey("history.title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{countLabel}</p>
        </div>
        <Link href="/report-explainer">
          <button className="text-xs font-600 text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors">
            {tKey("history.newReport")}
          </button>
        </Link>
      </div>

      <div className="space-y-3">
        {[...timeline].reverse().map((entry, i) => {
          const cfg = ASSESSMENT_CONFIG[entry.overallAssessment as keyof typeof ASSESSMENT_CONFIG]
            ?? ASSESSMENT_CONFIG.routine_monitoring;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-700 text-foreground truncate">{entry.label}</p>
                      <span className={`text-[10px] font-700 uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</p>
                    {entry.simpleSummary && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {entry.simpleSummary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link href="/health-timeline">
                      <button className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteTimelineEntry(entry.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {entry.importantFindings?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {entry.importantFindings.slice(0, 3).map((f, j) => (
                      <span
                        key={j}
                        className={`text-[10px] font-600 px-2 py-0.5 rounded-full border ${
                          f.importance === "critical" ? "border-red-500/30 text-red-400 bg-red-500/5" :
                          f.importance === "important" ? "border-amber-500/30 text-amber-400 bg-amber-500/5" :
                          "border-border/40 text-muted-foreground bg-muted/10"
                        }`}
                      >
                        {f.finding}
                      </span>
                    ))}
                    {entry.importantFindings.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">+{entry.importantFindings.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        {tKey("history.dataStored")}
        <Link href="/health-timeline"><span className="text-primary hover:underline cursor-pointer">{tKey("history.viewTimeline")}</span></Link>
      </p>
    </div>
  );
}
