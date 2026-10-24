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

## Editor setup (VS Code / Cursor)

The Helfy extension adds `.hf` template support: highlighting, type checking of template expressions, hover,
go-to-definition, completion, diagnostics and formatting. It is not in the Marketplace — install the `.vsix` from
[GitHub](https://github.com/ikrymsaev/helfy/tree/main/packages/vscode-extension):

```bash
code --install-extension helfy-vscode-0.1.1.vsix
```

or `Extensions` → `...` → `Install from VSIX...`.

## What you get

- Helfy + TypeScript + Rspack
- Components as `.ts` classes with `.hf` templates next to them
- Router with example pages (Home, Counter, lazily loaded About) and a custom 404 page
- Layout with slots, a theme context, `@safe / @wait / @fail` around the router
- `npm run dev` — development server (port 3000)
- `npm run build` — production build

```
src/
  App.ts / App.hf              root component
  context/ThemeContext.ts      light / dark theme
  pages/                       pages, routes, layout
  widgets/                     header, sidebar, footer, 404, theme toggle
```
