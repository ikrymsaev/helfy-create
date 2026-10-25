export interface Task {
  id: string;
  title: string;
  done: boolean;
}

/**
 * State of the tasks feature. Views read it; it is changed by use cases.
 * Components depend on this interface, not on the class — see TaskStore.
 */
export interface ITaskStore {
  readonly tasks: Task[];
  /** Number of tasks not done yet */
  readonly left: number;
  set(tasks: Task[]): void;
  add(task: Task): void;
  toggle(id: string): void;
  remove(id: string): void;
}
