import { View } from "@helfy/helfy";
import template from "./HomePage.hf";

interface Layer {
  name: string;
  role: string;
  rule: string;
  file: string;
}

interface Step {
  where: string;
  what: string;
}

@View({ template })
export class HomePage {
  readonly layers: Layer[] = [
    {
      name: "@View",
      role: "Shows data and passes user actions on.",
      rule: "No business rules: reads stores, calls use cases, keeps only UI state.",
      file: "modules/tasks/ui/TaskBoard.ts",
    },
    {
      name: "@UseCase",
      role: "One business scenario: rules → state → side effects.",
      rule: "Gets stores and services through the constructor, by interface.",
      file: "modules/tasks/use-cases/AddTaskUseCase.ts",
    },
    {
      name: "@Store",
      role: "Reactive state of a feature: @state, @computed, mutations.",
      rule: "No dependencies, no I/O — only data and how it changes.",
      file: "modules/tasks/model/TaskStore.ts",
    },
    {
      name: "@Service",
      role: "Infrastructure: storage, HTTP, browser APIs.",
      rule: "Registered by interface — swap the implementation, keep the callers.",
      file: "modules/tasks/services/TaskStorage.ts",
    },
    {
      name: "@ApiClient",
      role: "Server data as queries: cache, loading, errors, refetch.",
      rule: "Components take queries with @useQuery; errors go to @safe … @fail.",
      file: "modules/users/api/UsersApi.ts",
    },
    {
      name: "@Context",
      role: "State of a subtree, shared without props.",
      rule: "Taken with @useCtx by any component below it.",
      file: "context/ThemeContext.ts",
    },
  ];

  readonly steps: Step[] = [
    { where: "TaskBoard · view", what: "On submit calls addTask.execute(title). Nothing else — no rules in the view." },
    {
      where: "AddTaskUseCase · use case",
      what: "Checks the rules: empty, too long, a duplicate. Returns an error the view shows — or goes on.",
    },
    { where: "TaskStore + ITaskStorage", what: "The task goes into the store; the list is saved by LocalTaskStorage." },
    {
      where: "Signals",
      what: "Only what reads TaskStore.tasks updates: the new row and the counter. No re-render of the page.",
    },
  ];

  /** The code in the hero window — AddTaskUseCase, shortened */
  readonly code: string[] = [
    "@UseCase<IAddTaskUseCase>()",
    "export class AddTaskUseCase {",
    "  constructor(",
    "    private store: ITaskStore,",
    "    private storage: ITaskStorage,",
    "  ) {}",
    "",
    "  execute(title: string) {",
    '    if (!title.trim()) return fail("Enter a task");',
    "    this.store.add(newTask(title));",
    "    this.storage.save(this.store.tasks);",
    "    return ok();",
    "  }",
    "}",
  ];

  /** `data-kind` of a line for highlighting; `null` — the attribute is not rendered */
  lineKind(line: string) {
    const t = line.trim();
    if (t.startsWith("@")) return "decorator";
    if (/^(export|constructor|private|return|if|execute)\b/.test(t)) return "keyword";
    return null;
  }
}
