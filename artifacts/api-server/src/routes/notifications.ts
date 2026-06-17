import { Router, type Request, type Response, type NextFunction } from "express";
import { TIPS, MYTHS, sendPush, isNotificationConfigured } from "../lib/notifications";

const router = Router();

const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY ?? "";

/**
 * Auth middleware: callers must supply the ONESIGNAL_REST_API_KEY as a Bearer
 * token. Only an authorised scheduler (cron job / admin) that holds the secret
 * can trigger push sends — prevents public abuse of broadcast endpoints.
 */
function requireCronAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isNotificationConfigured()) {
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
