# Changelog

## 0.8.0 — 2026-11-07

- Add `npm run mcp:config` to print MCP client JSON, with optional `--file` runtime snapshots.
- Use published `@helfy/helfy ^0.7.0` and `@helfy/helfy-lint ^0.3.0` with a refreshed lockfile.
- Remove the accidental local `helfy-create: file:..` dependency from generated applications.
- Enable the optional DevTools plugin during development; production builds disable it.
- Add Vitest 4, jsdom, the Helfy template/DI adapters and tests for a store, use case and `.hf` component.
- Add test/watch and Doctor commands, explicit bundler modes and a project README.
- Add a TypeScript check with bundler module resolution for the framework's public subpaths.
- Support nested destination paths without putting the path into the npm package name.
- Add help/version output and argument validation without creating unwanted project folders.
- Remove the full lockfile when generating without lint tools; the initial install creates a matching one.
- Validate the packed generator with and without lint tools before publication.
