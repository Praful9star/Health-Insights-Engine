import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter, apiSlowDown } from "./middleware/rate-limit";
import { apiTimeout } from "./middleware/timeout";

const app: Express = express();

// Replit terminates TLS at its reverse proxy — trust one hop so req.ip
// reflects the real client IP (needed for rate-limiting to work per user).
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Security headers (CSP disabled — frontend SPA manages its own)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

const allowedOrigins: string[] = (() => {
  const domains = process.env.REPLIT_DOMAINS;
  if (domains) {
    return domains.split(",").map((d) => `https://${d.trim()}`);
  }
  return [];
})();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/api/ocr-report", express.json({ limit: "4mb" }));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Progressive backpressure → hard cap → 45 s timeout (in that order)
app.use("/api", apiSlowDown);
app.use("/api", globalLimiter);
app.use("/api", apiTimeout);
app.use("/api", router);

export default app;
