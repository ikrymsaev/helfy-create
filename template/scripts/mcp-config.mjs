import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const usage = "Usage: npm run mcp:config -- [--file dump.json] [--project-root directory]";
let projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let file;

try {
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      console.log(usage);
      process.exit(0);
    }
    if (arg !== "--file" && arg !== "--project-root") throw new Error(`Unknown option: ${arg}`);
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
    if (arg === "--file") file = value;
    else projectRoot = resolve(value);
  }

  if (!existsSync(join(projectRoot, "package.json"))) throw new Error(`No package.json in ${projectRoot}`);
  const require = createRequire(join(projectRoot, "package.json"));
  let entry;
  try {
    const devtools = require.resolve("@helfy/helfy/devtools");
    entry = join(dirname(devtools), "mcp", "cli.js");
  } catch {
    throw new Error("Cannot resolve @helfy/helfy/devtools. Install project dependencies first (npm install).");
  }
  if (!existsSync(entry)) throw new Error("The installed @helfy/helfy has no helfy-mcp CLI. Use Helfy 0.7 or later.");

  const serverArgs = [entry, "--project-root", projectRoot];
  if (file !== undefined) {
    const dump = isAbsolute(file) ? file : resolve(projectRoot, file);
    if (!existsSync(dump)) throw new Error(`Dump file does not exist: ${dump}`);
    serverArgs.push("--file", dump);
  }

  // The client launches Node directly: npm banners must never enter MCP stdout.
  console.log(JSON.stringify({ mcpServers: { helfy: { command: process.execPath, args: serverArgs } } }, null, 2));
} catch (error) {
  console.error(`${error.message}\n${usage}`);
  process.exitCode = 1;
}
