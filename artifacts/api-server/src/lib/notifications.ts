const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID ?? "";
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY ?? "";

export const TIPS = [
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

export const MYTHS = [
  "MYTH: Eating ghee causes heart disease. FACT: Pure desi ghee in moderation is healthy. Trans fats are the real culprit.",
  "MYTH: You should eat only 3 meals a day. FACT: Small frequent meals help stabilise blood sugar.",
  "MYTH: Cold water causes a cold. FACT: Viruses cause colds, not cold water.",
  "MYTH: Diabetics can't eat fruit. FACT: Most fruits are fine in moderate portions — focus on glycemic index.",
  "MYTH: More protein = more muscle. FACT: Excess protein the body can't use is stored as fat.",
  "MYTH: Antibiotics cure viral infections. FACT: Antibiotics only work on bacteria, not viruses like flu or COVID.",
  "MYTH: Sugar directly causes diabetes. FACT: Excess calories and insulin resistance are the main drivers.",
  "MYTH: Cracking knuckles causes arthritis. FACT: No evidence supports this. It's harmless.",
];

export function isNotificationConfigured(): boolean {
  return Boolean(ONESIGNAL_APP_ID && ONESIGNAL_REST_API_KEY);
}

export async function sendPush(payload: Record<string, unknown>): Promise<boolean> {
  if (!isNotificationConfigured()) return false;
  try {
    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({ app_id: ONESIGNAL_APP_ID, ...payload }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
