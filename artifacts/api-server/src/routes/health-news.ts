import { Router } from "express";
import { newsLimiter } from "../middleware/rate-limit";
import { TTL } from "../lib/cache";

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
const CACHE_TTL = TTL.NEWS; // 1 hour — was 15 min
const MAX_CACHE_ENTRIES = 50;

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

const HEALTH_KEYWORDS = [
  "health", "medical", "medicine", "hospital", "doctor", "disease", "patient",
  "fitness", "diet", "nutrition", "yoga", "diabetes", "cancer", "heart",
  "vaccine", "virus", "treatment", "surgery", "drug", "therapy", "mental",
  "pregnancy", "pharma", "aiims", "icmr", "who ", "covid", "dengue", "malaria",
  "blood", "clinical", "wellness", "obesity", "hypertension", "infection",
  "epidemic", "pandemic", "healthcare", "ayurveda", "immunity", "hospital",
  "nutrition", "ortho", "neuro", "cardio", "oncol", "pediatric",
];

function isHealthRelated(title: string, description = ""): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return HEALTH_KEYWORDS.some((kw) => text.includes(kw));
}

const router = Router();

router.get("/health-news", newsLimiter, async (req, res) => {
  const rawQ = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const customQ = rawQ.slice(0, 100);
  const isDefaultTicker = !customQ;
  const cacheKey = (customQ || "ticker-default").toLowerCase().slice(0, 80);

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return res.json({ articles: hit.articles, source: "cache" });
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.json({ articles: FALLBACK, source: "fallback" });
  }

  try {
    let fetchUrl: URL;

    if (isDefaultTicker) {
      fetchUrl = new URL("https://newsapi.org/v2/top-headlines");
      fetchUrl.searchParams.set("country", "in");
      fetchUrl.searchParams.set("category", "health");
      fetchUrl.searchParams.set("pageSize", "20");
      fetchUrl.searchParams.set("apiKey", apiKey);
    } else {
      fetchUrl = new URL("https://newsapi.org/v2/everything");
      fetchUrl.searchParams.set("q", `${customQ} health medical`);
      fetchUrl.searchParams.set("language", "en");
      fetchUrl.searchParams.set("sortBy", "publishedAt");
      fetchUrl.searchParams.set("pageSize", "30");
      fetchUrl.searchParams.set("apiKey", apiKey);
    }

    const resp = await fetch(fetchUrl.toString());
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
      .filter((a) =>
        a.title &&
        a.title !== "[Removed]" &&
        a.url &&
        a.url !== "https://removed.com" &&
        isHealthRelated(a.title, a.description)
      )
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

    if (cache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) cache.delete(oldestKey);
    }
    cache.set(cacheKey, { articles: result, ts: Date.now() });
    return res.json({ articles: result, source: "api" });
  } catch (err) {
    req.log.warn({ err }, "NewsAPI fetch failed — using fallback");
    return res.json({ articles: FALLBACK, source: "fallback" });
  }
});

export default router;
