import { UseCase } from "@helfy/helfy";
import type { ITaskStore } from "../model/types";
import type { ITaskStorage } from "../services/TaskStorage";
import type { IRemoveTaskUseCase } from "./types";

@UseCase<IRemoveTaskUseCase>()
export class RemoveTaskUseCase implements IRemoveTaskUseCase {
  constructor(
    private store: ITaskStore,
    private storage: ITaskStorage,
  ) {}

  execute(id: string) {
    this.store.remove(id);
    this.storage.save(this.store.tasks);
  }
}
