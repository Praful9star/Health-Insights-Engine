import { Router, type Request, type Response, type NextFunction } from "express";

const router = Router();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID ?? "";
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY ?? "";

const TIPS = [
  "Drink 8 glasses of water daily — dehydration causes fatigue and headaches.",
  "Eat a rainbow of vegetables. Different colours = different nutrients.",
  "Walk 30 minutes a day. It lowers blood pressure and lifts mood.",
  "Sleep 7–8 hours. Poor sleep raises diabetes and heart disease risk.",
  "Wash hands before meals. It prevents 80% of infections.",
  "Limit maida (refined flour) — it spikes blood sugar quickly.",
  "Add turmeric to your food daily. Curcumin has strong anti-inflammatory effects.",
  "Avoid smoking entirely. Even 1 cigarette a day raises heart attack risk.",
  "Check your blood pressure every 6 months if you're over 35.",
  "Eat amla (Indian gooseberry) daily — highest natural vitamin C source.",
];

const MYTHS = [
  "MYTH: Eating ghee causes heart disease. FACT: Pure desi ghee in moderation is healthy. Trans fats are the real culprit.",
  "MYTH: You should eat only 3 meals a day. FACT: Small frequent meals help stabilise blood sugar.",
  "MYTH: Cold water causes a cold. FACT: Viruses cause colds, not cold water.",
  "MYTH: Diabetics can't eat fruit. FACT: Most fruits are fine in moderate portions — focus on glycemic index.",
  "MYTH: More protein = more muscle. FACT: Excess protein the body can't use is stored as fat.",
  "MYTH: Antibiotics cure viral infections. FACT: Antibiotics only work on bacteria, not viruses like flu or COVID.",
  "MYTH: Sugar directly causes diabetes. FACT: Excess calories and insulin resistance are the main drivers.",
  "MYTH: Cracking knuckles causes arthritis. FACT: No evidence supports this. It's harmless.",
];

/**
 * Auth middleware: callers must supply the ONESIGNAL_REST_API_KEY as a Bearer
 * token. Only an authorised scheduler (cron job / admin) that holds the secret
 * can trigger push sends — prevents public abuse of broadcast endpoints.
 */
function requireCronAuth(req: Request, res: Response, next: NextFunction): void {
  if (!ONESIGNAL_REST_API_KEY) {
    res.status(503).json({ error: "Notification service not configured." });
    return;
  }
  const authHeader = req.headers["authorization"] ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token || token !== ONESIGNAL_REST_API_KEY) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  next();
}

async function sendPush(payload: Record<string, unknown>): Promise<boolean> {
  if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) return false;
  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({ app_id: ONESIGNAL_APP_ID, ...payload }),
  });
  return res.ok;
}

router.post("/notifications/send-health-tip", requireCronAuth, async (req, res) => {
  try {
    const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
    const sent = await sendPush({
      filters: [{ field: "tag", key: "daily_tips", relation: "=", value: "true" }],
      headings: { en: "💊 CureCheck Daily Tip" },
      contents: { en: tip },
      url: "https://curecheck.in",
    });
    res.json({ sent, tip });
  } catch (err) {
    res.status(500).json({ error: "Failed to send health tip notification." });
  }
});

router.post("/notifications/send-myth", requireCronAuth, async (req, res) => {
  try {
    const myth = MYTHS[Math.floor(Math.random() * MYTHS.length)];
    const sent = await sendPush({
      filters: [{ field: "tag", key: "myth_of_day", relation: "=", value: "true" }],
      headings: { en: "🔍 Myth of the Day — CureCheck" },
      contents: { en: myth },
      url: "https://curecheck.in/myth-buster",
    });
    res.json({ sent, myth });
  } catch (err) {
    res.status(500).json({ error: "Failed to send myth notification." });
  }
});

router.post("/notifications/send-medicine-reminder", requireCronAuth, async (req, res) => {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const sent = await sendPush({
      filters: [
        { field: "tag", key: "medicine_reminder", relation: "=", value: "true" },
        { operator: "AND" },
        { field: "tag", key: "medicine_time", relation: "=", value: currentTime },
      ],
      headings: { en: "💊 Medicine Reminder — CureCheck" },
      contents: { en: "Time to take your medicines. Stay consistent for best results!" },
      url: "https://curecheck.in/medicine-explainer",
    });
    res.json({ sent, time: currentTime });
  } catch (err) {
    res.status(500).json({ error: "Failed to send medicine reminder notification." });
  }
});

export default router;
