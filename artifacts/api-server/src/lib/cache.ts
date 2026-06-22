/**
 * Lightweight in-memory TTL cache with LFU eviction.
 *
 * Interface is intentionally Redis-compatible (get/set key + ttlMs) so the
 * implementation can be swapped for ioredis/Upstash without changing callers.
 *
 * Redis upgrade path:
 *   1. npm install ioredis
 *   2. Replace InMemoryCache.get/set with redis.get/setEx
 *   3. Export a single shared Redis client instead of per-cache instances
 *
 * Why not Redis now: single-process Replit deployment — in-memory is enough
 * and avoids an external dependency.  Cache is intentionally lost on restart
 * (all cached values are reproducible on miss).
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
  hits: number;
}

export class InMemoryCache<T = unknown> {
  private readonly store = new Map<string, Entry<T>>();

  constructor(private readonly maxEntries = 100) {}

  get(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    e.hits++;
    return e.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.store.size >= this.maxEntries) this.evict();
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs, hits: 0 });
  }

  /** Stats for healthz / monitoring endpoints. */
  stats(): { size: number; maxEntries: number } {
    return { size: this.store.size, maxEntries: this.maxEntries };
  }

  private evict(): void {
    const now = Date.now();
    // First pass: remove expired entries (free, correct)
    for (const [k, e] of this.store) {
      if (now > e.expiresAt) this.store.delete(k);
    }
    // Second pass: LFU eviction if still at capacity
    if (this.store.size >= this.maxEntries) {
      let leastKey = "";
      let leastHits = Infinity;
      for (const [k, e] of this.store) {
        if (e.hits < leastHits) {
          leastHits = e.hits;
          leastKey = k;
        }
      }
      if (leastKey) this.store.delete(leastKey);
    }
  }
}

/** Canonical TTL constants.  Change here, all callers update automatically. */
export const TTL = {
  MEDICINE:         6 * 60 * 60 * 1000, // 6 h  — drug info rarely changes
  CLAIM:            2 * 60 * 60 * 1000, // 2 h  — evidence can update
  DRUG_INTERACTION: 6 * 60 * 60 * 1000, // 6 h  — pharmacology is stable
  DISEASE_JOURNEY:  6 * 60 * 60 * 1000, // 6 h  — educational content
  NEWS:            60 * 60 * 1000,       // 1 h  — was 15 min, increased
} as const;

// One named cache per route — isolated so a full medicine cache never
// evicts disease journey entries.
export const medicineCache    = new InMemoryCache<unknown>(200);
export const claimCache       = new InMemoryCache<unknown>(150);
export const drugCache        = new InMemoryCache<unknown>(100);
export const diseaseCache     = new InMemoryCache<unknown>(100);
