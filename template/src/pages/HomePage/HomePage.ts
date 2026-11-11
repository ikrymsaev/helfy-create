import { View } from "@helfy/helfy";
import template from "./HomePage.hf";

@View({ template })
export class HomePage {
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
