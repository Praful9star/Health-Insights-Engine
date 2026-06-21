import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  serializers: {
    // In production omit stack traces to avoid leaking file paths and internals.
    // In development keep the full stack for debugging.
    err: isProduction
      ? (err: unknown) => {
          if (err instanceof Error) {
            return { type: err.constructor?.name ?? "Error", message: err.message };
          }
          return { type: "UnknownError", message: String(err) };
        }
      : pino.stdSerializers.err,
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
