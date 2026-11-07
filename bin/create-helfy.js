#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { installExtension } = require("./extension");
const { wantLint, removeLint } = require("./lint");

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: helfy-create [directory] [options]

Options:
  --skip-install       Create files without installing dependencies
  --lint / --no-lint    Include or omit ESLint and Prettier (default: include)
  --skip-extension     Skip the editor extension offer
  --install-extension  Install only the editor extension
  --version, -v        Print the generator version
  --help, -h           Show this help
`);
  return;
}
if (args.includes("--version") || args.includes("-v")) {
  console.log(require("../package.json").version);
  return;
}
const flags = new Set([
  "--skip-install", "--skip-extension", "--lint", "--no-lint", "--install-extension",
]);
const unknown = args.find((arg) => arg.startsWith("-") && !flags.has(arg));
const directories = args.filter((arg) => !arg.startsWith("-"));
if (unknown || directories.length > 1 || (args.includes("--lint") && args.includes("--no-lint"))) {
  console.error(unknown ? `Unknown option: ${unknown}` : "Choose one directory and one lint option.");
  process.exit(1);
}
const skipInstall = args.includes("--skip-install");
const skipExtension = args.includes("--skip-extension");
const projectName = args.find((a) => !a.startsWith("--")) || "helfy-app";
const root = path.resolve(process.cwd(), projectName);
const packageName = path.basename(root);
const templateDir = path.join(__dirname, "..", "template");

// Only the editor extension, no project
if (args.includes("--install-extension")) {
  installExtension("yes").then(() => process.exit(0));
  return;
}

if (!/^[a-z0-9][a-z0-9._-]*$/.test(packageName) || packageName.length > 214 || packageName === "node_modules") {
  console.error("Error: Use a directory name suitable for an npm package (lowercase letters, digits, dots, hyphens).");
  process.exit(1);
}

if (fs.existsSync(root)) {
  console.error(`Error: Directory "${projectName}" already exists.`);
  process.exit(1);
}

// Present only when the template is installed locally (they are not in the published package).
const SKIP = new Set(["node_modules", "dist", ".helfy"]);
// Copied byte for byte; the rest is text with {{PROJECT_NAME}} placeholders.
const BINARY = /\.(ico|png|jpe?g|gif|webp|woff2?)$/i;

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    if (SKIP.has(name)) continue;
    const srcPath = path.join(src, name);
    const destName = name === "gitignore" ? ".gitignore" : name;
    const destPath = path.join(dest, destName);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (BINARY.test(name)) {
      fs.copyFileSync(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf-8");
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, packageName);
      fs.writeFileSync(destPath, content);
    }
  }
}

(async () => {
  const lint = await wantLint(args);

  console.log(`\nCreating Helfy project in ${projectName}...\n`);
  copyDir(templateDir, root);
  if (!lint) removeLint(root);

  if (!skipInstall) {
    console.log("Installing dependencies...\n");
    process.chdir(root);
    execSync("npm install", { stdio: "inherit" });
  }

  if (!skipExtension) {
    console.log("");
    await installExtension("ask");
  }

  console.log("\nDone! To get started:\n");
  console.log(`  cd ${projectName}`);
  if (skipInstall) {
    console.log("  npm install");
  }
  console.log("  npm run dev\n");
  console.log("Tests and diagnostics:\n");
  console.log("  npm test");
  console.log("  npm run doctor\n");
  if (lint) {
    console.log("Architecture rules and formatting:\n");
    console.log("  npm run lint");
    console.log("  npm run format\n");
  }
})().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
