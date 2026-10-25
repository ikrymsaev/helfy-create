import { UseCase } from "@helfy/helfy";
import type { ITaskStore } from "../model/types";
import type { ITaskStorage } from "../services/TaskStorage";
import type { AddTaskResult, IAddTaskUseCase } from "./types";

/**
 * @UseCase — one business scenario: rules → state → side effects.
 * Dependencies come through the constructor by interface; the DI container finds them.
 */
@UseCase<IAddTaskUseCase>()
export class AddTaskUseCase implements IAddTaskUseCase {
  constructor(private store: ITaskStore, private storage: ITaskStorage) {}

  execute(title: string): AddTaskResult {
    const text = title.trim();
    if (!text) return { ok: false, error: "Enter a task" };
    if (text.length > 80) return { ok: false, error: "Keep it under 80 characters" };
    if (this.store.tasks.some((t) => t.title.toLowerCase() === text.toLowerCase())) {
      return { ok: false, error: "This task is already on the list" };
    }

    this.store.add({ id: crypto.randomUUID(), title: text, done: false });
    this.storage.save(this.store.tasks);
    return { ok: true };
  }
}
