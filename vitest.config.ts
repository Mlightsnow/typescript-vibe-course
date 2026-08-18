import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["examples/**/*.test.ts", "tests/**/*.test.ts"],
    passWithNoTests: false,
    restoreMocks: true,
  },
});
