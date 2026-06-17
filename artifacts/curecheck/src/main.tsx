import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare const __SENTRY_DSN__: string;

const sentryDsn = typeof __SENTRY_DSN__ !== "undefined" ? __SENTRY_DSN__ : "";

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: false }),
    ],
  });
}

createRoot(document.getElementById("root")!).render(<App />);
