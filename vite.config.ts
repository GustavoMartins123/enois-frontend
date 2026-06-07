// @lovable.dev/vite-tanstack-config already includes the following - do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const BACKEND_TARGET = process.env.BACKEND_TARGET ?? "https://66.241.125.184:8081";

export default defineConfig({
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      allowedHosts: true,
      proxy: {
        "/api": {
          target: BACKEND_TARGET,
          changeOrigin: true,
        },
      },
    },
  },
});
