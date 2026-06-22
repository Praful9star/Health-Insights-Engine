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
  message: {
    error: "Too many requests from your connection. Please wait a moment and try again.",
    code: "RATE_LIMITED",
  },
});

export const aiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "You've sent too many requests. Please wait a moment before trying again — our AI needs a short break!",
    code: "AI_RATE_LIMITED",
    retryAfterMinutes: 15,
  },
});

export const ocrLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many image uploads in a short time. Please wait a few minutes and try again.",
    code: "OCR_RATE_LIMITED",
    retryAfterMinutes: 15,
  },
});

export const newsLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many news requests. Please wait a moment and try again.",
    code: "NEWS_RATE_LIMITED",
  },
});
