import { useState, useEffect } from "react";
import { HEALTH_QUOTES, type HealthQuote } from "@/data/quotes";

const LS_KEY = "cc_quote_idx_v1";
const ROTATE_MS = 30 * 60 * 1000;

function currentQuoteIdx(): number {
  return Math.floor(Date.now() / ROTATE_MS) % HEALTH_QUOTES.length;
}

export function useQuoteOfDay(): HealthQuote {
  const [idx, setIdx] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const { index, at } = JSON.parse(stored) as { index: number; at: number };
        if (Date.now() - at < ROTATE_MS) return index;
      }
    } catch {}
    const next = currentQuoteIdx();
    try { localStorage.setItem(LS_KEY, JSON.stringify({ index: next, at: Date.now() })); } catch {}
    return next;
  });

  useEffect(() => {
    const check = () => {
      const next = currentQuoteIdx();
      setIdx((prev) => {
        if (next !== prev) {
          try { localStorage.setItem(LS_KEY, JSON.stringify({ index: next, at: Date.now() })); } catch {}
          return next;
        }
        return prev;
      });
    };

    const msUntilNext = ROTATE_MS - (Date.now() % ROTATE_MS);
    const tid = setTimeout(() => {
      check();
      const interval = setInterval(check, ROTATE_MS);
      return () => clearInterval(interval);
    }, msUntilNext);

    return () => clearTimeout(tid);
  }, []);

  return HEALTH_QUOTES[idx];
}
