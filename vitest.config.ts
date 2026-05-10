import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  esbuild: {
    // tsconfig has jsx: "preserve" for Next; tests use the automatic runtime so
    // we don't need to import React at the top of every .tsx test file.
    jsx: "automatic",
  },
  test: {
    // Default to node; tests that need jsdom add `// @vitest-environment jsdom`
    // at the top of the file.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "lib/**/*.test.ts",
      "lib/**/*.test.tsx",
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "contexts/**/*.test.ts",
      "contexts/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
      "tests/**/*.test.ts",
    ],
    // Playwright specs live in e2e/ and use a different runner.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["lib/**", "app/api/**", "contexts/**", "components/**"],
      exclude: [
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/__test-helpers__/**",
        "lib/firebase/index.ts",
        "lib/ai/types.ts",
        "lib/firebase/storage.ts",
        "lib/mock-data.ts",
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85,
        // Per-file overrides for security-critical modules
        "lib/auth/entitlements.ts": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        "lib/routes/redirects.ts": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        "lib/routes/appUrl.ts": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },
});
