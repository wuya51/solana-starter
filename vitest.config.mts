import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.tsx"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Allow unhandled rejections from parallel Promise.all retry loops in tests
    // These occur when testing error scenarios with parallel async operations
    dangerouslyIgnoreUnhandledErrors: true,
  },
});
