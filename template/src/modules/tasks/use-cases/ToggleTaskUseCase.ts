import { UseCase } from "@helfy/helfy";
import type { ITaskStore } from "../model/types";
import type { ITaskStorage } from "../services/TaskStorage";
import type { IToggleTaskUseCase } from "./types";

@UseCase<IToggleTaskUseCase>()
export class ToggleTaskUseCase implements IToggleTaskUseCase {
  constructor(private store: ITaskStore, private storage: ITaskStorage) {}

  execute(id: string) {
    this.store.toggle(id);
    this.storage.save(this.store.tasks);
  }
}
