# Architecture

A Helfy app is split into layers with one job each. Components only show things; business rules, state and the
outside world live in plain classes wired together by dependency injection. The **Overview** page of the running app
shows the same with links to the files.

## Structure

```
src/
  index.ts            createApp: router, mount
  App.ts / App.hf     the shell: layout, header, navigation, router
  context/            @Context — state of a subtree (theme)
  pages/              one component per route; pages compose modules
  widgets/            parts of the shell: header, navigation, 404
  shared/
    ui/               components without business logic, used anywhere
    styles/           shared stylesheets: .hf files with only @styles.global
  modules/            features — each with all its layers
    tasks/
      model/          types and interfaces, @Store
      services/       @Service — storage, HTTP, browser APIs
      use-cases/      @UseCase — business scenarios
      ui/             @View components of the feature
      index.ts        the public API of the module
    users/
      api/            @ApiClient — queries, mutations, infinite lists; mock backend
      ui/
    settings/
      forms/          @Form context with @field
      services/       profile localStorage
      use-cases/      load / save profile
      ui/             ProfileForm, TextField ($field, @ref / @expose)
```

Code outside a module imports only from its `index.ts` (`import { TaskBoard } from "@modules/tasks"`). What is not
exported there is an implementation detail and can change freely.

## Layers

| Layer | Its job | Rules |
|---|---|---|
| `@View` | Show data, pass user actions on | Reads stores and queries, calls use cases. Keeps only UI state (input text, open/closed). No business rules. |
| `@UseCase` | One business scenario: rules → state → side effects | Dependencies through the constructor, by interface. One public method, `execute`. No `@state`. |
| `@Store` | Reactive state of a feature | `@state` fields, `@computed` getters, synchronous mutations. Empty constructor: no dependencies, no I/O. |
| `@Service` | Infrastructure: storage, HTTP, browser APIs | Dependencies through the constructor. No `@state`. May update a store. |
| `@ApiClient` | Server data as queries, mutations and infinite lists | Describes them with builders; components take them with `@useQuery` / `@useMutation` / `@useInfiniteQuery`. |
| `@Form` | Field state of a form | `@field` → `FieldState`. Provided by wrapping the subtree; taken with `@useForm`. |
| `@Context` | State of a subtree | Provided by wrapping the subtree in it; taken with `@useCtx`. |

Dependencies go one way:

```
@View ──→ @UseCase ──→ @Store
  │           └──────→ @Service ──→ (outside world)
  ├─────────────────→ @Store  (read)
  ├─(@useQuery / @useMutation / @useInfiniteQuery)──→ @ApiClient ──→ @Service
  └─(@useForm)───────→ @Form
```

A store never knows who uses it; a view never talks to the outside world directly.

## Dependency injection

Classes are registered by the interface in their decorator and taken by the interface:

```ts
@Service<ITaskStorage>()
export class LocalTaskStorage implements ITaskStorage { ... }

@UseCase<IAddTaskUseCase>()
export class AddTaskUseCase implements IAddTaskUseCase {
  constructor(private store: ITaskStore, private storage: ITaskStorage) {}
}

@View({ template })
export class TaskBoard {
  @inject<IAddTaskUseCase>() addTask!: IAddTaskUseCase;
}
```

There is no manual registration: the compiler finds the decorated classes and wires them by interface. To change an
implementation — keep tasks on a server instead of localStorage, use a real API instead of `MockUsersBackend` — write
another class for the same interface and register it instead; nothing that depends on the interface changes. Use
cases and stores are plain classes: in a test, create them with `new` and pass fakes.

## Forms

A `@Form` class holds `@field` state (`value`, `error`, `isTouched`, …). The page wraps the form view in that
context; the view takes it with `@useForm`. Inputs bind with `@field(…)` or a wrapper that takes `$field={…}`.
See `modules/settings` — display name / email / digest, focused on open via `@ref` / `@expose`.

## Queries, mutations, infinite lists

`UsersApi` talks to `MockUsersBackend` (in-memory + delay). The same ApiClient shape works with a real `HttpClient`
if you swap the backend:

- `@useQuery` — user list and profile (`@safe / @wait / @fail` on the page)
- `@useMutation` — team notes with an optimistic cache update (`NotesBoard`)
- `@useInfiniteQuery` — activity feed with `loadMore()` (`ActivityFeed`)
- `@onFail` + `@logger` on the user detail page — log before the `@fail` branch

## Routing extras

- `@params` — `/users/:id`
- `@search` + `@router().replace` — task filter `?filter=active`
- `lazy()` — user detail is a separate chunk

## Styles

- `src/styles.css` — design tokens (colors, radii, fonts; the dark theme), the reset and a few global classes:
  `.card`, `.btn`, `.input`, `.page`, `.skeleton`.
- Everything else lives next to the markup, in the `@styles { }` block of the component's `.hf`. These styles are
  scoped: they apply only inside the component.
- **BEM / nesting with `&`** (Helfy 0.5+): nested rules are flattened SCSS-style —
  `.notes { &__item { &[data-pending="true"] { } } }` → `.notes__item`, `.notes__item[data-pending="true"]`.
  A nested selector without `&` is a descendant (`.check { input { } }` → `.check input`). See
  `ProfileForm.hf`, `NotesBoard.hf`, `TaskBoard.hf`.
- State of the component goes into the styles, not into class strings in the markup: `{expr}` or a named
  `@bind name = expr` used as `bind(name)` (`TaskBoard.hf`), and `@if` inside a rule (`TaskItem.hf`,
  `ProfileForm.hf`). Prefer one semantic class on the element (`class="submit-btn"`) and compose with
  `@add "btn btn--primary"` / `@add btn--disabled` under `@if` in `@styles`.
- State of an item in `@for` is an attribute of its element (`aria-pressed={…}`, `data-pending={…}`); styles
  react with nested `&[attr]` or `&[attr] { @add … }`.
- Styles used by several components go into a shared stylesheet in `src/shared/styles/` (`@styles.global` only).
  A component takes its classes with `@add brand-badge from "…/brand.hf";` and the stylesheet is added to the page
  once. The path is relative: `@`-aliases do not work there.
- Markup repeated inside one template is a `@fragment` (`<window-dot />` in `HomePage.hf`).

## Adding a feature

1. `src/modules/<feature>/model/types.ts` — data types and the interfaces of the store, services and use cases.
2. The store, services and use cases, each implementing its interface.
3. Components in `ui/`, exported from `index.ts`.
4. A page in `src/pages/` that uses them, and a route in `src/pages/_routes.ts`.
