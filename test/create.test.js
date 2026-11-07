"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const cli = path.resolve(__dirname, "../bin/create-helfy.js");
function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd, encoding: "utf8", timeout: 20_000,
  });
}
function sandbox(t) {
  const parent = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, "helfy-create-test-"));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), parent);
    assert.match(path.basename(resolved), /^helfy-create-test-/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  return root;
}

test("generates nested projects with a valid package name and public dependencies", (t) => {
  const cwd = sandbox(t);
  const result = run(["apps/my-app", "--skip-install", "--skip-extension", "--lint"], cwd);
  assert.equal(result.status, 0, result.stderr);
  const root = path.join(cwd, "apps/my-app");
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.name, "my-app");
  assert.equal(pkg.dependencies["@helfy/helfy"], "^0.7.1");
  assert.equal(pkg.devDependencies["@helfy/helfy-lint"], "^0.4.0");
  assert.ok(!JSON.stringify(pkg).includes("file:"));
  for (const file of [".gitignore", "README.md", "vitest.config.mts", "package-lock.json", "src/assets/logo.svg", "scripts/mcp-config.mjs"]) {
    assert.ok(fs.existsSync(path.join(root, file)), file);
  }
  const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
  assert.equal(lock.name, pkg.name);
  assert.deepEqual(lock.packages[""].dependencies, pkg.dependencies);
  assert.deepEqual(lock.packages[""].devDependencies, pkg.devDependencies);
  assert.equal(fs.existsSync(path.join(root, "node_modules")), false);
  assert.equal(fs.existsSync(path.join(root, ".helfy")), false);
  assert.equal(fs.existsSync(path.join(root, "dist")), false);
  assert.match(fs.readFileSync(path.join(root, "src/index.ts"), "utf8"), /withDevtools/);
});

test("--no-lint keeps tests and diagnostics, without stale lint config or lockfile", (t) => {
  const cwd = sandbox(t);
  const result = run(["my-app", "--skip-install", "--skip-extension", "--no-lint"], cwd);
  assert.equal(result.status, 0, result.stderr);
  const root = path.join(cwd, "my-app");
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(pkg.devDependencies["@helfy/helfy-lint"], undefined);
  assert.equal(pkg.scripts.lint, undefined);
  assert.equal(pkg.scripts.test, "vitest run");
  assert.ok(pkg.scripts.doctor);
  assert.equal(pkg.scripts["mcp:config"], "node scripts/mcp-config.mjs");
  for (const file of ["eslint.config.mjs", "prettier.config.cjs", ".prettierignore", "package-lock.json"]) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
});

test("help and version do not create a project", (t) => {
  const cwd = sandbox(t);
  assert.match(run(["--help"], cwd).stdout, /Usage:/);
  assert.equal(run(["--version"], cwd).stdout.trim(), require("../package.json").version);
  assert.deepEqual(fs.readdirSync(cwd), []);
});

test("rejects invalid options and names without creating files", (t) => {
  const cwd = sandbox(t);
  for (const args of [["--wat"], ["one", "two"], ["Bad Name"], ["app", "--lint", "--no-lint"]]) {
    assert.equal(run(args, cwd).status, 1, args.join(" "));
  }
  assert.deepEqual(fs.readdirSync(cwd), []);
});

test("refuses to overwrite an existing directory", (t) => {
  const cwd = sandbox(t);
  fs.mkdirSync(path.join(cwd, "my-app"));
  fs.writeFileSync(path.join(cwd, "my-app/keep.txt"), "keep");
  assert.equal(run(["my-app", "--skip-install", "--skip-extension"], cwd).status, 1);
  assert.equal(fs.readFileSync(path.join(cwd, "my-app/keep.txt"), "utf8"), "keep");
});
