import { Router } from "express";

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
}

let cache: { articles: NewsArticle[]; ts: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000;

const FALLBACK: NewsArticle[] = [
  { title: "WHO: India's TB elimination program sets global benchmark", source: "Health Ministry", url: "#", publishedAt: new Date().toISOString() },
  { title: "ICMR: Early diabetes detection can save ₹2 lakh per patient", source: "ICMR", url: "#", publishedAt: new Date().toISOString() },
  { title: "Monsoon alert: Dengue cases rise 30% across Maharashtra & UP", source: "NVBDCP", url: "#", publishedAt: new Date().toISOString() },
  { title: "Ayushman Bharat covers 12 crore families — are you enrolled?", source: "MoHFW", url: "#", publishedAt: new Date().toISOString() },
  { title: "New study: Yoga reduces hypertension by 15% in just 3 months", source: "AIIMS Delhi", url: "#", publishedAt: new Date().toISOString() },
  { title: "India approves indigenous HPV vaccine Cervavac for girls aged 9–26", source: "CDSCO", url: "#", publishedAt: new Date().toISOString() },
  { title: "Mental health helpline iCall receives 10,000 calls per month", source: "TISS", url: "#", publishedAt: new Date().toISOString() },
  { title: "Punjab launches free cardiac screening for 40+ age group", source: "Punjab Health Dept", url: "#", publishedAt: new Date().toISOString() },
  { title: "FSSAI: 60% of packaged foods exceed recommended sugar limits", source: "FSSAI", url: "#", publishedAt: new Date().toISOString() },
  { title: "Heatwave advisory: Stay hydrated, avoid outdoor work 11AM–4PM", source: "IMD India", url: "#", publishedAt: new Date().toISOString() },
  { title: "Air pollution linked to 1.7 million deaths per year in India: Lancet", source: "Lancet", url: "#", publishedAt: new Date().toISOString() },
  { title: "Centre launches free mental health helpline NIMHANS 24x7 helpline", source: "NIMHANS", url: "#", publishedAt: new Date().toISOString() },
];

const router = Router();

router.get("/health-news", async (req, res) => {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return res.json({ articles: cache.articles, source: "cache" });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.json({ articles: FALLBACK, source: "fallback" });
  }

  try {
    const url = `https://newsapi.org/v2/top-headlines?country=in&category=health&pageSize=15&apiKey=${apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`NewsAPI ${resp.status}`);
    const data = (await resp.json()) as {
      articles: Array<{
        title: string;
        source: { name: string };
        url: string;
        publishedAt: string;
      }>;
    };
    const articles: NewsArticle[] = (data.articles || [])
      .filter((a) => a.title && a.title !== "[Removed]")
      .map((a) => ({
        title: a.title,
        source: a.source?.name || "News",
        url: a.url,
        publishedAt: a.publishedAt,
      }));
    cache = { articles: articles.length > 0 ? articles : FALLBACK, ts: Date.now() };
    return res.json({ articles: cache.articles, source: "api" });
  } catch (err) {
    req.log.warn({ err }, "NewsAPI fetch failed, using fallback");
    return res.json({ articles: FALLBACK, source: "fallback" });
  }
});

export default router;
