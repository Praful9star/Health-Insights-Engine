import { Router } from "express";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  author?: string;
}

interface CacheEntry { articles: NewsArticle[]; ts: number }
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000;

const FALLBACK: NewsArticle[] = [
  { title: "WHO: India's TB elimination program sets global benchmark", description: "India's TB elimination initiative praised by WHO as a model for developing nations.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "Health Ministry" } },
  { title: "ICMR: Early diabetes detection can save ₹2 lakh per patient", description: "Early screening and intervention for diabetes significantly reduces lifetime treatment costs.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "ICMR" } },
  { title: "Monsoon alert: Dengue cases rise 30% across Maharashtra & UP", description: "Health authorities urge people to eliminate stagnant water and use mosquito nets.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "NVBDCP" } },
  { title: "Ayushman Bharat covers 12 crore families — are you enrolled?", description: "The flagship health scheme provides ₹5 lakh coverage per year per family.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "MoHFW" } },
  { title: "New study: Yoga reduces hypertension by 15% in just 3 months", description: "AIIMS Delhi researchers found structured yoga significantly lowered blood pressure in adults.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "AIIMS Delhi" } },
  { title: "India approves indigenous HPV vaccine Cervavac for girls aged 9–26", description: "Serum Institute's Cervavac offers cervical cancer protection at a fraction of import costs.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "CDSCO" } },
  { title: "Mental health helpline iCall receives 10,000 calls per month", description: "India's growing mental health crisis is evident as TISS's iCall sees record volumes.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "TISS" } },
  { title: "Punjab launches free cardiac screening for adults 40+", description: "Initiative aims to catch heart disease early in rural and semi-urban populations.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "Punjab Health Dept" } },
  { title: "FSSAI: 60% of packaged foods exceed recommended sugar limits", description: "Most popular snack brands contain 2-3x the recommended daily sugar intake.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "FSSAI" } },
  { title: "Heatwave advisory: Stay hydrated, avoid outdoor work 11AM–4PM", description: "IMD has issued a red alert for several states. Heat stroke cases rose 40%.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "IMD India" } },
  { title: "Air pollution linked to 1.7 million deaths per year in India: Lancet", description: "Study calls for urgent action on vehicular emissions, crop burning and industrial pollutants.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "Lancet" } },
  { title: "NIMHANS launches 24x7 free mental health helpline: 080-46110007", description: "Connects callers with trained counsellors for anxiety, depression and crisis support.", url: "#", urlToImage: null, publishedAt: new Date().toISOString(), source: { name: "NIMHANS" } },
];

const router = Router();

router.get("/api/health-news", async (req, res) => {
  const q = typeof req.query.q === "string" && req.query.q.trim() ? req.query.q.trim() : "India health";
  const cacheKey = q.toLowerCase().slice(0, 80);

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return res.json({ articles: hit.articles, source: "cache" });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.json({ articles: FALLBACK, source: "fallback" });
  }

  try {
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", q);
    url.searchParams.set("language", "en");
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("pageSize", "20");
    url.searchParams.set("apiKey", apiKey);

    const resp = await fetch(url.toString());
    if (!resp.ok) throw new Error(`NewsAPI ${resp.status}`);

    const data = (await resp.json()) as {
      articles: Array<{
        title: string;
        description?: string;
        url: string;
        urlToImage?: string;
        publishedAt: string;
        source: { name: string };
        author?: string;
      }>;
    };

    const articles: NewsArticle[] = (data.articles ?? [])
      .filter((a) => a.title && a.title !== "[Removed]" && a.url && a.url !== "https://removed.com")
      .slice(0, 18)
      .map((a) => ({
        title: a.title,
        description: a.description ?? "",
        url: a.url,
        urlToImage: a.urlToImage ?? null,
        publishedAt: a.publishedAt,
        source: { name: a.source?.name ?? "News" },
        author: a.author,
      }));

    const result = articles.length > 0 ? articles : FALLBACK;
    cache.set(cacheKey, { articles: result, ts: Date.now() });
    return res.json({ articles: result, source: "api" });
  } catch (err) {
    req.log.warn({ err }, "NewsAPI fetch failed — using fallback");
    return res.json({ articles: FALLBACK, source: "fallback" });
  }
});

export default router;
