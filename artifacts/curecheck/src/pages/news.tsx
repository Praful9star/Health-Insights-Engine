import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, Newspaper, RefreshCw, ExternalLink, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SavedArticle {
  url: string;
  title: string;
  description: string;
  source: string;
  publishedAt: string;
  savedAt: string;
}

const ARTICLES_KEY = "cc_saved_articles";

function readSaved(): SavedArticle[] {
  try { return JSON.parse(localStorage.getItem(ARTICLES_KEY) ?? "[]") as SavedArticle[]; } catch { return []; }
}
function writeSaved(articles: SavedArticle[]): void {
  try { localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles)); } catch {}
}

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: { name: string };
  author?: string;
}

const CATEGORIES = ["All", "Ayurveda", "Cancer", "Diabetes", "Nutrition", "Mental Health", "Heart", "COVID-19"];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function BookmarkButton({ article }: { article: Article }) {
  const [saved, setSaved] = useState(() => readSaved().some((a) => a.url === article.url));

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readSaved();
    if (saved) {
      writeSaved(current.filter((a) => a.url !== article.url));
      setSaved(false);
    } else {
      writeSaved([
        {
          url: article.url,
          title: article.title,
          description: article.description,
          source: article.source.name,
          publishedAt: article.publishedAt,
          savedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, 50));
      setSaved(true);
    }
  }, [saved, article]);

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-full transition-all hover:scale-110 ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
      title={saved ? "Remove bookmark" : "Save article"}
    >
      {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
    </button>
  );
}

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");

  const load = async (cat = "All") => {
    setLoading(true); setError("");
    try {
      const q = cat === "All" ? "India health" : `India health ${cat}`;
      const r = await fetch(`/api/health-news?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.message ?? "Failed to load");
      setArticles(d.articles ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load news");
    }
    setLoading(false);
  };

  useEffect(() => { load(category); }, [category]);

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0"><Newspaper className="w-6 h-6 text-primary" /></div>
          <div>
            <span className="mono-label text-primary/80 mb-1 block">Live Updates</span>
            <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Health News India</h1>
            <p className="text-sm text-muted-foreground mt-1">Latest health news for Indians — bookmark articles to read later.</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0" onClick={() => load(category)} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-700 border whitespace-nowrap flex-shrink-0 transition-all ${category === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/40"}`}>
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-muted/50" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted/50 rounded w-3/4" />
                <div className="h-3 bg-muted/40 rounded" />
                <div className="h-3 bg-muted/40 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="glass-panel rounded-2xl p-8 text-center border border-red-500/20">
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => load(category)} className="rounded-xl">Try again</Button>
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {featured && (
            <a href={featured.url} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="glass-panel rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 transition-colors">
                {featured.urlToImage && (
                  <div className="h-56 overflow-hidden">
                    <img src={featured.urlToImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-primary/15 text-primary text-[10px] font-700 rounded-full">Featured</span>
                      <span className="text-[11px] text-muted-foreground">{featured.source.name}</span>
                    </div>
                    <BookmarkButton article={featured} />
                  </div>
                  <h2 className="text-lg font-serif font-700 text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">{featured.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{featured.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {timeAgo(featured.publishedAt)}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </div>
                </div>
              </div>
            </a>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((a, i) => (
              <motion.a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass-panel rounded-2xl overflow-hidden border border-border/40 hover:border-primary/30 transition-all group flex flex-col">
                {a.urlToImage && (
                  <div className="h-36 overflow-hidden flex-shrink-0">
                    <img src={a.urlToImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5">{a.source.name} · {timeAgo(a.publishedAt)}</p>
                  <h3 className="text-sm font-700 text-foreground group-hover:text-primary transition-colors line-clamp-3 flex-1 mb-2">{a.title}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <ExternalLink className="w-3 h-3 ml-auto" />
                    <BookmarkButton article={a} />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm text-muted-foreground">No articles found. Try another category.</p>
        </div>
      )}
    </div>
  );
}
