import { useEffect, useState } from "react";
import { Activity, Newspaper } from "lucide-react";

interface NewsItem {
  title: string;
  source: string | { name: string };
  url: string;
}

const FALLBACK: NewsItem[] = [
  { title: "WHO: India's TB elimination program sets global benchmark", source: "Health Ministry", url: "#" },
  { title: "ICMR: Early diabetes detection can save ₹2 lakh per patient", source: "ICMR", url: "#" },
  { title: "Monsoon alert: Dengue cases rise 30% across Maharashtra & UP", source: "NVBDCP", url: "#" },
  { title: "Ayushman Bharat covers 12 crore families — are you enrolled?", source: "MoHFW", url: "#" },
  { title: "New study: Yoga reduces hypertension by 15% in just 3 months", source: "AIIMS Delhi", url: "#" },
  { title: "India approves indigenous HPV vaccine Cervavac for girls aged 9–26", source: "CDSCO", url: "#" },
  { title: "Punjab launches free cardiac screening for 40+ age group", source: "Punjab Health Dept", url: "#" },
  { title: "FSSAI: 60% of packaged foods exceed recommended sugar limits", source: "FSSAI", url: "#" },
  { title: "Heatwave advisory: Stay hydrated, avoid outdoor work 11AM–4PM", source: "IMD India", url: "#" },
  { title: "Air pollution linked to 1.7 million deaths per year in India", source: "Lancet", url: "#" },
];

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK);

  useEffect(() => {
    const doFetch = () => {
      fetch("/api/health-news")
        .then((r) => r.json())
        .then((d: { articles?: NewsItem[] }) => {
          if (d.articles && d.articles.length > 0) setNews(d.articles);
        })
        .catch(() => {});
    };

    // Defer the live-news fetch until the browser is idle so it doesn't
    // compete with LCP-critical resources during initial page load.
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(doFetch, { timeout: 5000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(doFetch, 3000);
    return () => clearTimeout(t);
  }, []);

  const items = [...news, ...news];

  return (
    <div className="flex items-center border-b border-border/30 bg-background/60 backdrop-blur-sm overflow-hidden" aria-label="Health news ticker">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-primary text-background font-700 text-[11px] mono-label z-10 self-stretch">
        <Activity className="w-3 h-3" />
        LIVE
      </div>
      <div className="flex-shrink-0 items-center gap-1.5 px-3 py-2 border-r border-border/30 text-primary font-600 text-[11px] mono-label hidden sm:flex">
        <Newspaper className="w-3 h-3" />
        HEALTH NEWS
      </div>
      <div className="ticker-wrap flex-1">
        <div className="ticker-track">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-5 py-2 text-[11px] whitespace-nowrap">
              <span className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
              {item.url !== "#" ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="font-500 text-foreground/70 hover:text-foreground transition-colors">
                  {item.title}
                </a>
              ) : (
                <span className="font-500 text-foreground/70">{item.title}</span>
              )}
              <span className="text-primary/50 font-400">— {typeof item.source === "object" ? item.source.name : item.source}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
                }
