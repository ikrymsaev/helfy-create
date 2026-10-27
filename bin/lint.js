"use strict";

const fs = require("fs");
const path = require("path");
const { ask } = require("./ask");

// What the template adds for ESLint (@helfy/helfy-lint rules) and Prettier (.hf formatting included).
const FILES = ["eslint.config.mjs", "prettier.config.cjs", ".prettierignore"];
const DEV_DEPENDENCIES = [
  "@helfy/helfy-lint",
  "@typescript-eslint/parser",
  "eslint",
  "eslint-config-prettier",
  "prettier",
];
const SCRIPTS = ["lint", "format", "format:check"];

/**
 * Whether to keep the linters: --lint / --no-lint, otherwise ask (yes when stdin is not a terminal).
 */
async function wantLint(args) {
  if (args.includes("--no-lint")) return false;
  if (args.includes("--lint") || !process.stdin.isTTY) return true;
  return ask("Add ESLint with Helfy architecture rules and Prettier (with .hf formatting)? (Y/n) ");
}

/** Removes the linters from a created project. */
function removeLint(root) {
  for (const name of FILES) fs.rmSync(path.join(root, name), { force: true });
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  for (const name of DEV_DEPENDENCIES) delete pkg.devDependencies[name];
  for (const name of SCRIPTS) delete pkg.scripts[name];
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

module.exports = { wantLint, removeLint };
