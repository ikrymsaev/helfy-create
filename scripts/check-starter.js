"use strict";

// Validate the archive that users will download, rather than the source checkout.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const tempRoot = fs.realpathSync(process.env.HELFY_RELEASE_TMPDIR || os.tmpdir());
const temp = fs.mkdtempSync(path.join(tempRoot, "helfy-create-release-"));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run this check through npm run test:starter.");

function run(command, args, cwd, capture = false, input) {
  console.log(`> ${path.basename(command)} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    input,
    timeout: 300_000,
    env: { ...process.env, NODE_ENV: "development" },
  });
  if (result.error || result.status !== 0) {
    if (capture) console.error(result.stdout, result.stderr);
    throw new Error(result.error?.message || `Command exited with ${result.status}`);
  }
  return result.stdout;
}
const npm = (args, cwd, capture) => run(process.execPath, [npmCli, ...args], cwd, capture);

try {
  const [pack] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", temp], root, true));
  const paths = pack.files.map((file) => file.path);
  for (const file of ["bin/create-helfy.js", "template/package-lock.json", "template/vitest.config.mts", "template/README.md", "template/scripts/mcp-config.mjs", "template/src/modules/tasks/ui/TaskItem.test.ts"]) {
    assert.ok(paths.includes(file), `Missing from archive: ${file}`);
  }
  assert.ok(!paths.some((file) => /(?:^|\/)(?:node_modules|dist|\.helfy)(?:\/|$)/.test(file)));
  // GNU tar treats a Windows drive prefix in the archive path as a remote host.
  run("tar", ["-xf", pack.filename], temp);
  const cli = path.join(temp, "package/bin/create-helfy.js");
  for (const lint of [true, false]) {
    const name = lint ? "with-lint" : "without-lint";
    run(process.execPath, [cli, name, "--skip-install", "--skip-extension", lint ? "--lint" : "--no-lint"], temp);
    const project = path.join(temp, name);
    const pkg = JSON.parse(fs.readFileSync(path.join(project, "package.json"), "utf8"));
    assert.ok(!JSON.stringify(pkg).includes("file:"));
    npm([lint ? "ci" : "install", "--no-fund", "--no-audit"], project);
    // Tests run before the application build, including generation of .helfy registries.
    npm(["test"], project);
    npm(["run", "build"], project);
    npm(["run", "typecheck"], project);
    const config = JSON.parse(npm(["run", "--silent", "mcp:config"], project, true)).mcpServers.helfy;
    assert.equal(config.command, process.execPath);
    assert.ok(path.isAbsolute(config.args[0]));
    assert.deepEqual(config.args.slice(1), ["--project-root", project]);
    const requests = [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05" } },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_project_graph" } },
    ].map(JSON.stringify).join("\n") + "\n";
    const responses = run(config.command, config.args, temp, true, requests).trim().split(/\r?\n/).map(JSON.parse);
    assert.equal(responses.length, 3);
    assert.equal(responses[0].result.serverInfo.name, "helfy-mcp");
    assert.ok(responses[1].result.tools.some(tool => tool.name === "get_project_graph"));
    assert.ok(responses[2].result.structuredContent.generated);
    assert.ok(responses[2].result.structuredContent.tokens.length > 0);
    if (lint) {
      npm(["run", "lint"], project);
      npm(["run", "format:check"], project);
    }
    npm(["run", "doctor", "--", "--checks", "versions,tsconfig,build-setup"], project);
  }
  console.log("Packed starter passed with and without lint tooling.");
} finally {
  // temp is the exact fresh mkdtemp directory allocated by this process.
  if (process.env.HELFY_KEEP_RELEASE_CHECK === "1") console.log(`Kept validation projects: ${temp}`);
  else {
    const resolved = fs.realpathSync(temp);
    assert.equal(path.dirname(resolved), tempRoot);
    assert.match(path.basename(resolved), /^helfy-create-release-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  }
}
