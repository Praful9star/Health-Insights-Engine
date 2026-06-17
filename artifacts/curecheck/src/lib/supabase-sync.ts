import { supabase } from "./supabase";

const FITNESS_KEY     = "cc_fitness_v2";
const TIMELINE_KEY    = "cc_timeline_v2";
const CHALLENGES_KEY  = "cc_challenges_v2";
const REMINDERS_KEY   = "curecheck-reminders";
const ARTICLES_KEY    = "cc_saved_articles";

function readJSON<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return fallback; }
}

function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export async function pushLocalToSupabase(userId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("user_health_data").upsert(
      {
        user_id:       userId,
        fitness:       readJSON(FITNESS_KEY, []),
        timeline:      readJSON(TIMELINE_KEY, []),
        challenges:    readJSON(CHALLENGES_KEY, []),
        reminders:     readJSON(REMINDERS_KEY, []),
        saved_articles: readJSON(ARTICLES_KEY, []),
        updated_at:    new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
  }
}

export async function pullSupabaseToLocal(userId: string): Promise<void> {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from("user_health_data")
      .select("fitness,timeline,challenges,reminders,saved_articles")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return;

    if (Array.isArray(data.fitness) && (data.fitness as unknown[]).length > 0) {
      writeJSON(FITNESS_KEY, mergeByDate([...(data.fitness as unknown[]), ...readJSON<unknown[]>(FITNESS_KEY, [])]));
    }
    if (Array.isArray(data.timeline) && (data.timeline as unknown[]).length > 0) {
      writeJSON(TIMELINE_KEY, mergeById([...(data.timeline as unknown[]), ...readJSON<unknown[]>(TIMELINE_KEY, [])]));
    }
    if (Array.isArray(data.challenges) && (data.challenges as unknown[]).length > 0) {
      writeJSON(CHALLENGES_KEY, mergeById([...(data.challenges as unknown[]), ...readJSON<unknown[]>(CHALLENGES_KEY, [])]));
    }
    if (Array.isArray(data.reminders) && (data.reminders as unknown[]).length > 0) {
      writeJSON(REMINDERS_KEY, mergeById([...(data.reminders as unknown[]), ...readJSON<unknown[]>(REMINDERS_KEY, [])]));
    }
    if (Array.isArray(data.saved_articles) && (data.saved_articles as unknown[]).length > 0) {
      writeJSON(ARTICLES_KEY, mergeByUrl([...(data.saved_articles as unknown[]), ...readJSON<unknown[]>(ARTICLES_KEY, [])]));
    }
  } catch {
  }
}

function mergeByDate(arr: unknown[]): unknown[] {
  const map = new Map<string, unknown>();
  for (const item of arr) {
    const d = (item as { date?: string }).date;
    if (d && !map.has(d)) map.set(d, item);
  }
  return Array.from(map.values()).sort((a, b) =>
    ((b as { date?: string }).date ?? "").localeCompare((a as { date?: string }).date ?? ""),
  );
}

function mergeById(arr: unknown[]): unknown[] {
  const map = new Map<string, unknown>();
  for (const item of arr) {
    const id = (item as { id?: string }).id;
    if (id && !map.has(id)) map.set(id, item);
  }
  return Array.from(map.values());
}

function mergeByUrl(arr: unknown[]): unknown[] {
  const map = new Map<string, unknown>();
  for (const item of arr) {
    const url = (item as { url?: string }).url;
    if (url && !map.has(url)) map.set(url, item);
  }
  return Array.from(map.values());
}
