# create-helfy

Create a new Helfy project with one command.

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
- `--skip-install` — create project without running `npm install` (e.g. for custom registry or offline)

## Editor setup (VS Code)

**Syntax highlighting.** The helfy-syntax extension is not in the Marketplace. Install manually from [GitHub](https://github.com/ikrymsaev/helfy-syntax/tree/main/dist):

- Download the **archive** and extract to the extensions folder, or
- Download the **.vsix** file and install: `Extensions` → `...` → `Install from VSIX...`

**TypeScript.** Use **workspace TypeScript**: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) → `TypeScript: Select TypeScript Version` → `Use Workspace Version`. Required because the project includes `@helfy/helfy-ts-plugin`.

## What you get

- Helfy + TypeScript + Webpack setup
- Babel preset with helfy compiler
- Router with example pages (Home, Counter, About)
- Basic styling
- `npm run dev` — development server (port 3000)
- `npm run build` — production build
