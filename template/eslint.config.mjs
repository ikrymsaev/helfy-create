import helfy from "@helfy/helfy-lint";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

/** Helfy layer rules (@Store / @Service / @UseCase / @View). Formatting is left to Prettier. */
export default [
  { ignores: ["dist/**", ".helfy/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser },
    ...helfy.configs.recommended,
  },
  prettier,
];
