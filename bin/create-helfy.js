#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { installExtension } = require("./extension");
const { wantLint, removeLint } = require("./lint");

const args = process.argv.slice(2);
const skipInstall = args.includes("--skip-install");
const skipExtension = args.includes("--skip-extension");
const projectName = args.find((a) => !a.startsWith("--")) || "helfy-app";
const root = path.resolve(process.cwd(), projectName);
const templateDir = path.join(__dirname, "..", "template");

// Only the editor extension, no project
if (args.includes("--install-extension")) {
  installExtension("yes").then(() => process.exit(0));
  return;
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
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
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
  if (lint) {
    console.log("Architecture rules and formatting:\n");
    console.log("  npm run lint");
    console.log("  npm run format\n");
  }
})();
