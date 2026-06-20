import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";

const WINDOW_MS = 15 * 60 * 1000;

// Progressive slow-down: free for first 20 req/window, then +150 ms per
// request above that (capped at 3 s). Applies globally before hard limits.
export const apiSlowDown = slowDown({
  windowMs: WINDOW_MS,
  delayAfter: 20,
  delayMs: (hits: number) => (hits - 20) * 150,
  maxDelayMs: 3000,
});

export const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

export const aiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please slow down and try again shortly." },
});

export const ocrLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many image analysis requests. Please try again later." },
});

export const newsLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many news requests. Please try again later." },
});
