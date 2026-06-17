import cron from "node-cron";
import { logger } from "./logger";
import { TIPS, MYTHS, sendPush, isNotificationConfigured } from "./notifications";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendDailyHealthTip(): Promise<void> {
  const tip = pickRandom(TIPS);
  logger.info("Scheduler: sending daily health tip");
  const sent = await sendPush({
    filters: [{ field: "tag", key: "daily_tips", relation: "=", value: "true" }],
    headings: { en: "💊 CureCheck Daily Tip" },
    contents: { en: tip },
    url: "https://curecheck.in",
  });
  logger.info({ sent, tip }, "Scheduler: daily health tip result");
}

async function sendMythOfDay(): Promise<void> {
  const myth = pickRandom(MYTHS);
  logger.info("Scheduler: sending myth of the day");
  const sent = await sendPush({
    filters: [{ field: "tag", key: "myth_of_day", relation: "=", value: "true" }],
    headings: { en: "🔍 Myth of the Day — CureCheck" },
    contents: { en: myth },
    url: "https://curecheck.in/myth-buster",
  });
  logger.info({ sent, myth }, "Scheduler: myth of the day result");
}

async function sendMedicineReminder(): Promise<void> {
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
  logger.info({ sent, time: currentTime }, "Scheduler: medicine reminder result");
}

export function startScheduler(): void {
  if (!isNotificationConfigured()) {
    logger.warn(
      "ONESIGNAL_APP_ID or ONESIGNAL_REST_API_KEY not set — push notification scheduler will not run",
    );
    return;
  }

  const IST = "Asia/Kolkata";

  cron.schedule(
    "0 8 * * *",
    () => {
      sendDailyHealthTip().catch((err) =>
        logger.error({ err }, "Scheduler: daily health tip failed"),
      );
    },
    { timezone: IST },
  );

  cron.schedule(
    "0 19 * * *",
    () => {
      sendMythOfDay().catch((err) =>
        logger.error({ err }, "Scheduler: myth of the day failed"),
      );
    },
    { timezone: IST },
  );

  cron.schedule("* * * * *", () => {
    sendMedicineReminder().catch((err) =>
      logger.error({ err }, "Scheduler: medicine reminder failed"),
    );
  });

  logger.info(
    "Push notification scheduler started (health tip 08:00 IST, myth 19:00 IST, medicine reminders every minute)",
  );
}
