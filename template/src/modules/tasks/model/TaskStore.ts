import { Store, state, computed } from "@helfy/helfy";
import type { ITaskStore, Task } from "./types";

/**
 * @Store — pure reactive state: @state fields, @computed getters and synchronous mutations.
 * No dependencies, no HTTP or storage: that is the job of services.
 */
@Store<ITaskStore>()
export class TaskStore implements ITaskStore {
  @state tasks: Task[] = [];

  @computed
  get left() {
    return this.tasks.filter((t) => !t.done).length;
  }

  set(tasks: Task[]) {
    this.tasks = tasks;
  }

  add(task: Task) {
    this.tasks = [...this.tasks, task];
  }

  toggle(id: string) {
    this.tasks = this.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  remove(id: string) {
    this.tasks = this.tasks.filter((t) => t.id !== id);
  }
}
