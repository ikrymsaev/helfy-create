# {{PROJECT_NAME}}

A Helfy 0.10 application with helfy-lint 0.7, TypeScript, Rspack 2, `.hf` templates, native Markdown and standard decorators.
See [ARCHITECTURE.md](ARCHITECTURE.md) for the layers and dependency injection.

```bash
npm install
npm run dev
```

Open http://localhost:3000. The mock Users backend and local Tasks storage work without a server.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with DevTools and HMR |
| `npm run build` | Production output in `dist/`, with reactive DevTools probes removed |
| `npm test` | Run the example tests once |
| `npm run test:watch` | Run tests while editing |
| `npm run typecheck` | Check application and test TypeScript after generating registries |
| `npm run doctor` | Inspect versions, configuration, build registries and available tools |
| `npm run doctor:json` | Doctor report as JSON |
| `npm run mcp:config` | Print the MCP client connection JSON |

When ESLint and Prettier were included, `npm run lint`, `npm run format` and
`npm run format:check` are also available. A generator run with `--no-lint --skip-install`
omits the default lockfile; the first `npm install` creates one for that variant.
Use `npm ci` for subsequent clean installations with the project's committed lockfile.

Run `npm run build` before Doctor on a fresh project: the build generates the `.helfy`
DI and view registries. Doctor skips checks whose optional tools or live browser runtime
are unavailable. It complements the build and tests.

## Pages and Markdown

Each route has its own folder in `src/pages/`: `HomePage`, `TasksPage`, `UsersPage`,
`UserPage` and `SettingsPage`. Keep the view, `.hf` template and page content together;
the route list and router remain at the root of `pages/`, with shared layouts in `layouts/`.

Static explanations live in `.md` documents next to the page. The overview keeps its
longer content in `HomePage/content/`; feature pages use `description.md`:

```hf
@markdown page-description from "./description.md";

@template<MyPage>() {
  <page-description />
}
```

Use `<md class="muted">Short text with **emphasis** and `code`.</md>` for a short
explanation inside a template. Markdown bodies are literal text: expressions such as
`{this.value}` and directives inside them are not evaluated. Keep dynamic values,
components and controls in `.hf` markup.

Rspack also configures `@helfy/helfy/compiler/md-loader`: a direct `.md` import returns
a template usable with `@View({ template })`. The existing `@helfy/helfy/helfy-hf` type
reference declares both `.hf` and `.md` modules. Markdown compiles during the build;
the browser does not load a Markdown parser.

Prettier formats standalone `.md` files normally; the Helfy formatter handles `.hf`.
The compiler validates Markdown during builds, while ESLint checks TypeScript layer
rules. Install Helfy editor extension 0.5.0 or later for the matching template
type checks, import resolution, Markdown and navigation (`npx helfy-create --install-extension`).

## Import aliases

Declare aliases in `compilerOptions.paths` in `tsconfig.json`, with targets relative
to that file (for example `"@shared/*": ["./src/shared/*"]`). Helfy does not support
`baseUrl`. Rspack uses `helfyRspack({ projectDir: __dirname })` from
`@helfy/helfy/bundler`, and Vitest reuses the resulting aliases. The compiler and
editor read the same paths; add new aliases in the tsconfig only.

`@effect` and `@watch` methods run automatically. Do not call them or pass them as
event handlers; change the source state or extract shared logic into an ordinary method.

## DevTools

`src/index.ts` installs `.use(withDevtools(), process.env.NODE_ENV !== "production")`.
Open the floating panel while running the development server, then add or toggle a task
to inspect views, signals and events. The UI loads separately and does not inspect itself.
The production application disables the plugin and removes reactive probes.
The default docked panel remains enabled. A detached panel is optional and requires
a dedicated HTML/JavaScript entry; see the installed framework's
[DevTools documentation](https://github.com/ikrymsaev/helfy/blob/main/packages/helfy/README.md#devtools-panel).

## MCP connection

```bash
npm run mcp:config
```

Copy the printed `mcpServers.helfy` entry into your MCP client's configuration.
The client starts the installed server directly through Node; absolute paths keep
it independent of the client's working directory. Use `npm run --silent mcp:config`
when consuming stdout as JSON. The helper does not change client settings.

Build the project first so MCP can read the generated DI graph and component contracts.
This connection can inspect project metadata and diagnostics. For an offline runtime
snapshot, capture `dumpDevtools()` from `@helfy/helfy/devtools` inside the development
application. Save that JSON in the project, then run:

```bash
npm run mcp:config -- --file ./devtools-dump.json
```

The dump is read once at MCP startup. Capture a new dump and restart the server to
inspect updated state.
Clients with a different configuration schema can reuse the printed `command` and `args`.

For a live browser connection, run the MCP client on the same machine as the development
server. Generate a token and print the configuration (PowerShell):

```powershell
$env:HELFY_MCP_BRIDGE_TOKEN = node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"
npm run --silent mcp:config -- --bridge-port 47831 --bridge-token $env:HELFY_MCP_BRIDGE_TOKEN --bridge-origin http://localhost:3000
```

Copy that configuration into the MCP client and restart its server. In `src/index.ts`,
configure the development plugin with the same token and bridge URL:

```ts
.use(withDevtools({
  bridge: { url: "http://127.0.0.1:47831", token: devBridgeToken },
}), process.env.NODE_ENV !== "production")
```

Supply `devBridgeToken` through your local development bundler configuration; do not
commit the token. The origin must exactly match the development page's origin.
All three bridge options are required and cannot be combined with `--file`.
Call `list_runtime_sessions`, then `select_runtime_session` if several tabs are open.
Runtime tools and `get_history` then read the current browser state. The panel uses
a Worker relay by default, with direct transport as a fallback.

## Testing examples

Vitest uses `helfyHf()` and `helfyTs()` from `@helfy/helfy/testing/vitest`. Templates
and DI decorators compile with the same Helfy loaders as the application; aliases come
from `rspack.config.js`. Tests work before the first application build.

- `src/modules/tasks/model/TaskStore.test.ts`: state mutations and computed counters.
- `src/modules/tasks/use-cases/AddTaskUseCase.test.ts`: business validation and fake storage.
- `src/modules/tasks/ui/TaskItem.test.ts`: mount the real `.hf` component, trigger events,
  flush reactive work with `tick()` and dispose it with `unmount()`.

UI tests use `mount` and `tick` from `@helfy/helfy/testing` in jsdom. Always dispose
mounted components after a test. Keep test files next to the code they exercise.

Vitest is pinned to 4.1.12, including transitive peer resolution, to keep npm 10
from selecting Vitest 5 through optional tooling. This preserves Node 20 support.
