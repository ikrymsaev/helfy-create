| Feature                 | Example                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `DevTools`              | Inspect views, signals and events from the development panel — src/index.ts   |
| `Testing`               | Store, use-case and .hf component tests — modules/tasks/*.test.ts, npm test   |
| `Markdown`              | Static content in .md files and inline `<md>` blocks — pages/HomePage/content |
| `@search / @router`     | Task filter in the query string — TaskBoard.ts                                |
| `@bind:value / @binded` | Named two-way bind on TextInput — shared/ui/TextInput                         |
| `style @bind`           | Named CSS expression for the progress bar — TaskBoard.hf                      |
| `BEM & nesting`         | &__item / &:hover under @styles — ProfileForm, NotesBoard, TaskBoard          |
| `@ref / @expose`        | Focus the name field on open — settings/ui/TextField.ts                       |
| `@onFail / @logger`     | Log a missing user before @fail — UserPage.ts                                 |
| `optimistic mutate`     | Note appears before the mock answers — users/ui/NotesBoard.ts                 |
| `@useInfiniteQuery`     | Paginated activity feed — users/ui/ActivityFeed.ts                            |
