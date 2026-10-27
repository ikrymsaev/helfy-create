import { UseCase } from "@helfy/helfy";
import type { ITaskStore } from "../model/types";
import type { ITaskStorage } from "../services/TaskStorage";
import type { ILoadTasksUseCase } from "./types";

@UseCase<ILoadTasksUseCase>()
export class LoadTasksUseCase implements ILoadTasksUseCase {
  constructor(
    private store: ITaskStore,
    private storage: ITaskStorage,
  ) {}

  execute() {
    this.store.set(this.storage.load());
  }
}
