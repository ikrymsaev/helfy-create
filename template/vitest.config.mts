import { createRequire } from "node:module";
import { defineConfig } from "vitest/config";
import { helfyHf, helfyTs } from "@helfy/helfy/testing/vitest";

const require = createRequire(import.meta.url);
const { resolve } = require("./rspack.config.js");

export default defineConfig({
  plugins: [helfyHf(), helfyTs()],
  resolve: { alias: resolve.alias },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    clearMocks: true,
  },
});
