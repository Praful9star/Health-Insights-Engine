import { rateLimit } from "express-rate-limit";

const WINDOW_MS = 15 * 60 * 1000;

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
