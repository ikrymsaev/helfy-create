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

## What you get

- Helfy + TypeScript + Webpack setup
- Babel preset with helfy compiler
- Router with example pages (Home, Counter, About)
- Basic styling
- `npm run dev` — development server (port 3000)
- `npm run build` — production build
