import type { Request, Response, NextFunction } from "express";

// 45 s covers the slowest AI + OCR calls.
// If a response hasn't started within this window, send 408 and release
// the connection rather than hanging forever (protects against Groq stalls).
const TIMEOUT_MS = 45_000;

export function apiTimeout(_req: Request, res: Response, next: NextFunction) {
  res.setTimeout(TIMEOUT_MS, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: "Request timed out. Please try again." });
    }
  });
  next();
}
