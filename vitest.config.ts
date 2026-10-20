import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom"],
  },
  esbuild: { jsx: "automatic" },
  test: {
    // Os testes de RuleTester usam o executor próprio: npm run test:eslint-rules.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
