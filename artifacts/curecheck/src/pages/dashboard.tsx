import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Activity, FileText, Flame, User, LogOut, ChevronRight,
  Droplets, Moon, Footprints, Target, Heart, Zap, Newspaper, BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useHealthStorage } from "@/hooks/use-health-storage";
import { useLanguage } from "@/contexts/language-context";
import type { SavedArticle } from "@/pages/news";

const ARTICLES_KEY = "cc_saved_articles";

function readSavedArticles(): SavedArticle[] {
  try { return JSON.parse(localStorage.getItem(ARTICLES_KEY) ?? "[]") as SavedArticle[]; } catch { return []; }
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
        <circle
          cx="64" cy="64" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-3xl font-800 font-serif text-foreground">{score}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function StatChip({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-muted/20 rounded-2xl px-4 py-3">
      <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-700 text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const { todayEntry, streaks, timeline } = useHealthStorage();
  const { tKey } = useLanguage();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);

  const QUICK_LINKS = [
    { href: "/report-explainer",   icon: FileText,  label: tKey("dashboard.explainReport"),  color: "text-blue-400"    },
    { href: "/symptom-checker",    icon: Activity,  label: tKey("dashboard.symptomChecker"), color: "text-emerald-400" },
    { href: "/fitness-hub",        icon: Flame,     label: tKey("dashboard.fitnessHub"),      color: "text-orange-400"  },
    { href: "/health-timeline",    icon: Heart,     label: tKey("dashboard.healthTimeline"),  color: "text-rose-400"    },
    { href: "/medicine-explainer", icon: Zap,       label: tKey("dashboard.medicineInfo"),    color: "text-purple-400"  },
    { href: "/claim-checker",      icon: Target,    label: tKey("dashboard.claimChecker"),    color: "text-yellow-400"  },
  ];

  useEffect(() => {
    setSavedArticles(readSavedArticles().slice(0, 3));
  }, []);

  const displayName = profile?.name || user?.email?.split("@")[0] || "User";
  const recentReports = timeline.slice(0, 3);

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground mb-0.5">{tKey("dashboard.welcomeBack")}</p>
            <h1 className="text-2xl font-serif font-800 text-foreground">{displayName}</h1>
            {user?.email && <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/profile">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                <User className="w-3.5 h-3.5" /> {tKey("dashboard.editProfile")}
              </Button>
            </Link>
            <Button
              variant="ghost" size="sm" className="rounded-xl gap-1.5 text-muted-foreground"
              onClick={async () => { await signOut(); }}
            >
              <LogOut className="w-3.5 h-3.5" /> {tKey("dashboard.signOut")}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
        className="glass-panel rounded-3xl p-6 border border-border/40"
      >
        <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide mb-5">{tKey("dashboard.todayHealth")}</h2>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <ScoreRing score={todayEntry.score} label={tKey("dashboard.healthScore")} />
          <div className="grid grid-cols-2 gap-3 flex-1 w-full">
            <StatChip icon={Moon}      label={tKey("dashboard.sleep")}   value={`${todayEntry.sleep}h`}                                            color="text-indigo-400"  />
            <StatChip icon={Droplets}  label={tKey("dashboard.water")}   value={`${todayEntry.water} glasses`}                                       color="text-sky-400"     />
            <StatChip icon={Footprints} label={tKey("dashboard.steps")}  value={todayEntry.steps.toLocaleString("en-IN")}                             color="text-emerald-400" />
            <StatChip icon={Flame}     label={tKey("dashboard.workout")} value={todayEntry.workout ? tKey("dashboard.workoutDone") : tKey("dashboard.workoutNot")} color="text-orange-400"  />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}
        className="glass-panel rounded-3xl p-6 border border-border/40"
      >
        <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide mb-4">{tKey("dashboard.currentStreaks")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: tKey("dashboard.exerciseDays"), days: streaks.exercise, icon: Flame,     color: "text-orange-400" },
            { label: tKey("dashboard.waterDays"),    days: streaks.water,    icon: Droplets,  color: "text-sky-400"    },
            { label: tKey("dashboard.sleepDays"),    days: streaks.sleep,    icon: Moon,      color: "text-indigo-400" },
          ].map(({ label, days, icon: Icon, color }) => (
            <div key={label} className="bg-muted/20 rounded-2xl p-4 text-center">
              <Icon className={`w-6 h-6 ${color} mx-auto mb-1`} />
              <p className="text-2xl font-800 font-serif text-foreground">{days}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {recentReports.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel rounded-3xl p-6 border border-border/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide">{tKey("dashboard.recentReports")}</h2>
            <Link href="/health-timeline">
              <span className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-0.5">
                {tKey("dashboard.viewAll")} <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {recentReports.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 bg-muted/20 rounded-2xl p-3.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">{entry.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.simpleSummary}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {savedArticles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.26 }}
          className="glass-panel rounded-3xl p-6 border border-border/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide">{tKey("dashboard.savedArticles")}</h2>
            <Link href="/news">
              <span className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-0.5">
                {tKey("dashboard.browseNews")} <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {savedArticles.map((a) => (
              <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-3 bg-muted/20 hover:bg-muted/30 rounded-2xl p-3.5 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Newspaper className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-600 text-foreground group-hover:text-primary line-clamp-2 transition-colors">{a.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{a.source}</p>
                </div>
                <BookmarkCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {profile && (profile.age || profile.blood_group || profile.city) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }}
          className="glass-panel rounded-3xl p-6 border border-border/40"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide">{tKey("dashboard.healthProfile")}</h2>
            <Link href="/profile">
              <span className="text-xs text-primary hover:text-primary/80 cursor-pointer flex items-center gap-0.5">
                {tKey("dashboard.edit")} <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.age       && <div className="bg-muted/20 rounded-2xl px-4 py-3"><p className="text-xs text-muted-foreground">{tKey("dashboard.age")}</p><p className="text-sm font-600 text-foreground">{profile.age} {tKey("dashboard.years")}</p></div>}
            {profile.gender    && <div className="bg-muted/20 rounded-2xl px-4 py-3"><p className="text-xs text-muted-foreground">{tKey("dashboard.gender")}</p><p className="text-sm font-600 text-foreground capitalize">{profile.gender}</p></div>}
            {profile.blood_group && <div className="bg-muted/20 rounded-2xl px-4 py-3"><p className="text-xs text-muted-foreground">{tKey("dashboard.bloodGroup")}</p><p className="text-sm font-600 text-foreground">{profile.blood_group}</p></div>}
            {profile.city      && <div className="bg-muted/20 rounded-2xl px-4 py-3"><p className="text-xs text-muted-foreground">{tKey("dashboard.city")}</p><p className="text-sm font-600 text-foreground">{profile.city}</p></div>}
            {profile.allergies && <div className="bg-muted/20 rounded-2xl px-4 py-3 col-span-2"><p className="text-xs text-muted-foreground">{tKey("dashboard.allergies")}</p><p className="text-sm font-600 text-foreground">{profile.allergies}</p></div>}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.38 }}
        className="glass-panel rounded-3xl p-6 border border-border/40"
      >
        <h2 className="text-sm font-700 text-muted-foreground uppercase tracking-wide mb-4">{tKey("dashboard.quickAccess")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-2.5 bg-muted/20 hover:bg-muted/40 rounded-2xl px-4 py-3 cursor-pointer transition-colors">
                <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                <span className="text-sm font-500 text-foreground">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
