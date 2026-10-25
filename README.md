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
- `--skip-extension` — do not offer to install the editor extension
- `--install-extension` — only install the editor extension, without creating a project

## Editor setup (VS Code / Cursor)

The Helfy extension adds `.hf` template support: highlighting, type checking of template expressions, hover,
go-to-definition, completion, diagnostics and formatting. It is not in the Marketplace.

`helfy-create` offers to install it after creating a project — into every editor whose command line tool is on
`PATH` (`code`, `cursor`, `codium`, `windsurf`). To install or update it at any time:

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
- **Tasks** — local state through all the layers: `@View` → `@UseCase` → `@Store` and `@Service` (localStorage)
- **Users** — server data: `@ApiClient` queries over a mock backend, loading and errors with `@safe / @wait / @fail`,
  a lazily loaded page with route params
- Helfy + TypeScript + Rspack, `.hf` templates with scoped styles, a theme context, a custom 404 page
- `ARCHITECTURE.md` — the structure and the rules of each layer
- `npm run dev` — development server (port 3000), `npm run build` — production build

```
src/
  App.ts / App.hf     the shell: layout, header, navigation, router
  context/            theme
  pages/              one component per route; pages compose modules
  widgets/            header, navigation, footer, 404
  modules/
    tasks/            model (@Store), services, use-cases, ui
    users/            api (@ApiClient + mock backend), ui
```
