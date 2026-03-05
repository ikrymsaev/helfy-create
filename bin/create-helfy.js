#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
const skipInstall = args.includes("--skip-install");
const projectName = args.find((a) => !a.startsWith("--")) || "helfy-app";
const root = path.resolve(process.cwd(), projectName);
const templateDir = path.join(__dirname, "..", "template");

if (fs.existsSync(root)) {
  console.error(`Error: Directory "${projectName}" already exists.`);
  process.exit(1);
}

console.log(`Creating Helfy project in ${projectName}...\n`);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      let content = fs.readFileSync(srcPath, "utf-8");
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
      fs.writeFileSync(destPath, content);
    }
  }
}

copyDir(templateDir, root);

if (!skipInstall) {
  console.log("Installing dependencies...\n");
  process.chdir(root);
  execSync("npm install", { stdio: "inherit" });
}

console.log("\nDone! To get started:\n");
console.log(`  cd ${projectName}`);
if (skipInstall) {
  console.log("  npm install");
}
console.log("  npm run dev\n");
