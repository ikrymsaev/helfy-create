import { View, inject, state, computed, search, router } from "@helfy/helfy";
import type { ITaskStore, Task } from "../model/types";
import type {
  IAddTaskUseCase,
  ILoadTasksUseCase,
  IRemoveTaskUseCase,
  IToggleTaskUseCase,
} from "../use-cases/types";
import template from "./TaskBoard.hf";

export type TaskFilter = "all" | "active" | "done";

/**
 * View: reads the store, calls use cases, keeps only UI state (input text).
 * The filter lives in the URL via @search / @router — shareable and back-button friendly.
 * No business rules here — they live in the use cases.
 */
@View({ template })
export class TaskBoard {
  @inject<ITaskStore>() store!: ITaskStore;
  @inject<ILoadTasksUseCase>() loadTasks!: ILoadTasksUseCase;
  @inject<IAddTaskUseCase>() addTask!: IAddTaskUseCase;
  @inject<IToggleTaskUseCase>() toggleTask!: IToggleTaskUseCase;
  @inject<IRemoveTaskUseCase>() removeTask!: IRemoveTaskUseCase;

  @search() query!: Record<string, string>;
  @router() rtr!: { replace: (path: string) => void };

  @state title = "";
  @state error = "";

  readonly filters: TaskFilter[] = ["all", "active", "done"];

  /** Current filter from `?filter=` — defaults to all. */
  @computed
  get filter(): TaskFilter {
    const f = this.query?.filter;
    return f === "active" || f === "done" ? f : "all";
  }

  @computed
  get visible(): Task[] {
    if (this.filter === "all") return this.store.tasks;
    return this.store.tasks.filter((t) => t.done === (this.filter === "done"));
  }

  /** Share of done tasks, 0–100: the width of the progress bar in the styles */
  @computed
  get progress(): number {
    const total = this.store.tasks.length;
    return total ? Math.round(((total - this.store.left) / total) * 100) : 0;
  }

  onAttached() {
    this.loadTasks.execute();
  }

  setFilter = (f: TaskFilter) => {
    this.rtr.replace(f === "all" ? "/tasks" : `/tasks?filter=${f}`);
  };

  submit = (e: Event) => {
    e.preventDefault();
    const result = this.addTask.execute(this.title);
    this.error = result.error ?? "";
    if (result.ok) this.title = "";
  };

  toggle = (id: string) => this.toggleTask.execute(id);
  remove = (id: string) => this.removeTask.execute(id);
}
