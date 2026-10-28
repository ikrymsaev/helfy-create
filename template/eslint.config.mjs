import js from "@eslint/js";
import tseslint from "typescript-eslint";
import helfy from "@helfy/helfy-lint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

/**
 * Standard ESLint + TypeScript recommended, Helfy layer rules, Prettier as warnings.
 * Formatting of `.hf` is via `npm run format` (Helfy Prettier plugin).
 */
export default tseslint.config(
  { ignores: ["dist/**", ".helfy/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      helfy,
      prettier: prettierPlugin,
    },
    rules: {
      ...helfy.configs.recommended.rules,
      "prettier/prettier": "warn",
    },
  },
  eslintConfigPrettier,
);
