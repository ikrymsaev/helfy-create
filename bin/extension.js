"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

// The latest release of the Helfy extension (VS Code / Cursor), attached under a fixed name.
// HELFY_VSIX_URL overrides it: another URL or a local .vsix file.
const VSIX_URL =
  process.env.HELFY_VSIX_URL ||
  "https://github.com/ikrymsaev/helfy-syntax/releases/latest/download/helfy-vscode.vsix";
const EXTENSION_ID = "helfy.helfy-vscode";
// The extension for directives in .tsx used before .hf templates; it conflicts with the current one.
const OLD_EXTENSION_ID = "helfy.helfy-syntax";

const EDITORS = [
  { cli: "code", name: "VS Code" },
  { cli: "cursor", name: "Cursor" },
  { cli: "codium", name: "VSCodium" },
  { cli: "windsurf", name: "Windsurf" },
];

function run(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString();
}

/** Editors whose command line tool is on PATH. */
function findEditors() {
  return EDITORS.filter(({ cli }) => {
    try {
      run(`${cli} --version`);
      return true;
    } catch {
      return false;
    }
  });
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(!/^n/i.test(answer.trim()));
    })
  );
}

async function downloadVsix() {
  if (!/^https?:/.test(VSIX_URL)) return path.resolve(VSIX_URL);
  const res = await fetch(VSIX_URL);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} (${VSIX_URL})`);
  const file = path.join(os.tmpdir(), `helfy-vscode-${Date.now()}.vsix`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

function printManualSteps() {
  console.log("To install the Helfy extension later:\n");
  console.log("  npx helfy-create --install-extension\n");
  console.log(`or download ${VSIX_URL}`);
  console.log("and run `code --install-extension helfy-vscode.vsix` (or Extensions > ... > Install from VSIX).\n");
}

/**
 * Installs the Helfy extension into every editor found on PATH.
 * mode: "ask" — ask first (skipped when stdin is not a terminal), "yes" — install without asking.
 */
async function installExtension(mode) {
  const editors = findEditors();
  if (editors.length === 0) {
    console.log("No VS Code / Cursor command line tool found on PATH.");
    printManualSteps();
    return;
  }
  const names = editors.map((e) => e.name).join(", ");
  if (mode === "ask") {
    if (!process.stdin.isTTY) {
      printManualSteps();
      return;
    }
    const yes = await ask(`Install the Helfy extension for .hf templates into ${names}? (Y/n) `);
    if (!yes) {
      printManualSteps();
      return;
    }
  }

  let file;
  try {
    console.log("\nDownloading the Helfy extension...");
    file = await downloadVsix();
  } catch (e) {
    console.error(`Could not download the extension: ${e.message}`);
    printManualSteps();
    return;
  }

  for (const { cli, name } of editors) {
    try {
      run(`${cli} --install-extension "${file}" --force`);
      console.log(`Installed into ${name} (${EXTENSION_ID}).`);
      if (run(`${cli} --list-extensions`).split(/\r?\n/).includes(OLD_EXTENSION_ID)) {
        console.log(
          `  ${name} also has the old ${OLD_EXTENSION_ID} extension, which conflicts with it. Remove it:\n` +
            `  ${cli} --uninstall-extension ${OLD_EXTENSION_ID}`
        );
      }
    } catch (e) {
      console.error(`Could not install into ${name}: ${e.message.split("\n")[0]}`);
    }
  }
  if (file !== path.resolve(VSIX_URL)) fs.rmSync(file, { force: true });
  console.log("Reload the editor window to activate it.\n");
}

module.exports = { installExtension };
