# helfy-create

Create a new [Helfy](https://github.com/ikrymsaev/helfy/tree/main/packages/helfy) project with one command.

## Usage

```bash
npx helfy-create my-app
cd my-app
npm run dev
```

Or without a project name (creates `helfy-app`):

```bash
npx helfy-create
```

**Options:**
- `--skip-install` — create the project without running `npm install` (e.g. for a custom registry or offline)
- `--lint` / `--no-lint` — add or leave out ESLint and Prettier without asking (added by default)
- `--skip-extension` — do not offer to install the editor extension
- `--install-extension` — only install the editor extension, without creating a project

## Requirements

Node.js 20.19+, 22.13+ or >=24 and TypeScript 5.9.x. The starter uses Helfy ^0.8.0 and helfy-lint ^0.5.0.
TypeScript and `.hf` templates compile through the Helfy TypeScript loader with standard decorators.
Routing and logging are enabled with `withRouter` and `withLogger` app plugins.
The DevTools panel is enabled only in development. Vitest 4 and jsdom compile tests through
the public Helfy testing adapters.

## Linting and formatting

`helfy-create` asks whether to add ESLint and Prettier (yes by default):

- `npm run lint` — ESLint flat config: `@eslint/js` recommended, [`typescript-eslint`](https://typescript-eslint.io/)
  recommended, [`@helfy/helfy-lint`](https://www.npmjs.com/package/@helfy/helfy-lint) layer rules
  (`@Store` / `@Service` / `@UseCase` / `@View`, deep imports from `@helfy/helfy`), and Prettier as warnings via
  `eslint-plugin-prettier`
- `npm run format` / `npm run format:check` — Prettier for `.ts`, `.css`, `.html` and `.hf` (the `.hf` formatter is
  the same as in the editor extension)

The worst violations — `@effect` on a `@Store`, `@state` on a `@Service` and the like — fail the build with or without
the linters: the check is part of `@helfy/helfy/compiler/helfy-ts-loader`.

## Editor setup (VS Code / Cursor)

The Helfy extension adds `.hf` template support: highlighting, type checking of template expressions, hover,
go-to-definition, completion, diagnostics and formatting. It is not in the Marketplace.

`helfy-create` offers to install it after creating a project — into every editor whose command line tool is on
`PATH` (`code`, `cursor`, `codium`, `windsurf`). Use extension 0.3.0 or later for native Markdown support with Helfy 0.8.0. The installer downloads the latest release. To install or update it at any time:

```bash
npx helfy-create --install-extension
```

Or by hand: download
[helfy-vscode.vsix](https://github.com/ikrymsaev/helfy-syntax/releases/latest/download/helfy-vscode.vsix) and run
`code --install-extension helfy-vscode.vsix` (or `Extensions` → `...` → `Install from VSIX...`).

The old `helfy.helfy-syntax` extension (directives in `.tsx`) conflicts with it — uninstall it:
`code --uninstall-extension helfy.helfy-syntax`.

## What you get

A small app that shows how a Helfy project is structured — layers with one job each, wired by dependency injection:

- **Overview** — how the app is built: the layers, their rules, the path of one click through them
- Native Markdown for static page descriptions and overview content: external `.md` documents through
  `@markdown ... from`, inline `<md>` blocks, and a configured `md-loader` for direct `.md` imports
- **Tasks** — local state through all the layers: `@View` → `@UseCase` → `@Store` and `@Service` (localStorage);
  filter in the URL (`@search`), `@bind:value` input, named style `@bind`
- **Users** — server data over a mock backend: `@useQuery` with `@safe / @wait / @fail`, optimistic
  `@useMutation`, `@useInfiniteQuery`, lazy detail with `@params`, `@onFail` / `@logger`
- **Settings** — `@Form` / `@field` / `@useForm`, `$field` wrappers, `@ref` / `@expose` focus
- Helfy + TypeScript + Rspack 2, `.hf` templates with `@styles` (BEM nesting via `&__` / `&:hover`, state-driven
  values, classes from a shared stylesheet with `@add`) and `@fragment`, a theme context, a custom 404 page
- `ARCHITECTURE.md` — the structure and the rules of each layer
- `npm run dev` — development server (port 3000), `npm run build` — production build
- `npm run lint`, `npm run format` — ESLint (recommended + TypeScript + Helfy) and Prettier, if you keep them

```
src/
  App.ts / App.hf     the shell: layout, header, navigation, router
  context/            theme
  pages/              routes, router and layouts
    HomePage/         view, template and Markdown overview content
    TasksPage/        view, template and description.md
    UsersPage/        view, template and description.md
    UserPage/         lazy user detail view and template
    SettingsPage/     view, template and description.md
  widgets/            header, navigation, footer, 404
  shared/             UI without business logic, shared stylesheets
  modules/
    tasks/            model (@Store), services, use-cases, ui
    users/            api (@ApiClient + mock backend), ui
    settings/         @Form, use cases, profile storage, ui
```

## Development tools in generated projects

The starter includes `npm test`, `npm run test:watch`, `npm run typecheck`,
`npm run doctor` and `npm run doctor:json`.
Run `npm run mcp:config` to print MCP client JSON with absolute paths, or
`npm run mcp:config -- --file ./devtools-dump.json` to inspect a runtime snapshot.
The MCP client starts the server; browser runtime data currently requires a dump.
See the generated project's README for connection and snapshot instructions.

`src/index.ts` installs DevTools through `.use(withDevtools(), process.env.NODE_ENV !== "production")`.
The development panel loads separately; production builds disable the plugin and remove reactive probes.
`vitest.config.mts` uses `helfyHf()` and `helfyTs()` and shares the Rspack path aliases.
Tests run on a fresh project before its first application build.

The default project includes a lockfile and supports `npm ci`. With `--no-lint --skip-install`,
the full lockfile is omitted; run `npm install` first to generate the matching lockfile.
Testing and Doctor remain available without lint tooling.

## Release validation

```bash
npm test
npm run test:starter
npm pack
```

`test:starter` packs the generator, extracts it and creates projects with and without lint tooling.
It installs published dependencies, runs example tests before the first build, builds production output,
checks TypeScript and lint/format where available, and runs Doctor configuration checks. The check uses `tar`
(available on supported Windows versions, macOS and Linux).
Set `HELFY_KEEP_RELEASE_CHECK=1` to retain temporary projects for inspection.
Publication runs these checks through `prepublishOnly`; it never happens as part of the checks themselves.
