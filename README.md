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

## Linting and formatting

`helfy-create` asks whether to add ESLint and Prettier (yes by default):

- `npm run lint` — ESLint flat config: `@eslint/js` recommended, [`typescript-eslint`](https://typescript-eslint.io/)
  recommended, [`@helfy/helfy-lint`](https://www.npmjs.com/package/@helfy/helfy-lint) layer rules
  (`@Store` / `@Service` / `@UseCase` / `@View`, deep imports from `@helfy/helfy`), and Prettier as warnings via
  `eslint-plugin-prettier`
- `npm run format` / `npm run format:check` — Prettier for `.ts`, `.css`, `.html` and `.hf` (the `.hf` formatter is
  the same as in the editor extension)

The worst violations — `@effect` on a `@Store`, `@state` on a `@Service` and the like — fail the build with or without
the linters: the check is part of `@helfy/helfy/babel-preset`.

## Editor setup (VS Code / Cursor)

The Helfy extension adds `.hf` template support: highlighting, type checking of template expressions, hover,
go-to-definition, completion, diagnostics and formatting. It is not in the Marketplace.

`helfy-create` offers to install it after creating a project — into every editor whose command line tool is on
`PATH` (`code`, `cursor`, `codium`, `windsurf`). The template uses `@styles` blocks, which need
extension 0.1.5 or later. To install or update it at any time:

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
- **Tasks** — local state through all the layers: `@View` → `@UseCase` → `@Store` and `@Service` (localStorage);
  filter in the URL (`@search`), `@bind:value` input, named style `@bind`
- **Users** — server data over a mock backend: `@useQuery` with `@safe / @wait / @fail`, optimistic
  `@useMutation`, `@useInfiniteQuery`, lazy detail with `@params`, `@onFail` / `@logger`
- **Settings** — `@Form` / `@field` / `@useForm`, `$field` wrappers, `@ref` / `@expose` focus
- Helfy + TypeScript + Rspack, `.hf` templates with `@styles` (BEM nesting via `&__` / `&:hover`, state-driven
  values, classes from a shared stylesheet with `@add`) and `@fragment`, a theme context, a custom 404 page
- `ARCHITECTURE.md` — the structure and the rules of each layer
- `npm run dev` — development server (port 3000), `npm run build` — production build
- `npm run lint`, `npm run format` — ESLint (recommended + TypeScript + Helfy) and Prettier, if you keep them

```
src/
  App.ts / App.hf     the shell: layout, header, navigation, router
  context/            theme
  pages/              one component per route; pages compose modules
  widgets/            header, navigation, footer, 404
  shared/             UI without business logic, shared stylesheets
  modules/
    tasks/            model (@Store), services, use-cases, ui
    users/            api (@ApiClient + mock backend), ui
    settings/         @Form, use cases, profile storage, ui
```
