/** `error` — a message for the user when the task is not added. */
export type AddTaskResult = { ok: boolean; error?: string };

export interface IAddTaskUseCase {
  execute(title: string): AddTaskResult;
}

export interface IToggleTaskUseCase {
  execute(id: string): void;
}

export interface IRemoveTaskUseCase {
  execute(id: string): void;
}

export interface ILoadTasksUseCase {
  execute(): void;
}
