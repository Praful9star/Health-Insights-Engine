import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig(async ({ isSsrBuild }) => {
  const devPlugins =
    !isSsrBuild &&
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then(
            (m) => m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : [];

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), ...devPlugins],
    resolve: {
      alias: {
        ...(isSsrBuild && {
          "@/components/page-meta": path.resolve(
            import.meta.dirname,
            "src/components/page-meta-ssr.tsx",
          ),
        }),
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(
          import.meta.dirname,
          "..",
          "..",
          "attached_assets",
        ),
      },
      dedupe: ["react", "react-dom"],
    },
    define: {
      __GA_ID__: JSON.stringify(process.env.GA_MEASUREMENT_ID ?? ""),
      __TAWK_ID__: JSON.stringify(process.env.TAWK_PROPERTY_ID ?? ""),
      __ONESIGNAL_ID__: JSON.stringify(process.env.ONESIGNAL_APP_ID ?? ""),
      __SUPABASE_URL__: JSON.stringify(process.env.SUPABASE_URL ?? ""),
      __SUPABASE_ANON_KEY__: JSON.stringify(
        process.env.SUPABASE_ANON_KEY ?? "",
      ),
      __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN ?? ""),
      __SANITY_PROJECT_ID__: JSON.stringify(
        process.env.SANITY_PROJECT_ID ?? "tqmjf1jn",
      ),
      __SANITY_DATASET__: JSON.stringify(
        process.env.SANITY_DATASET ?? "production",
      ),
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: isSsrBuild
        ? path.resolve(import.meta.dirname, "dist/server")
        : path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    ssr: {
      noExternal: ["next-themes", "framer-motion"],
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
