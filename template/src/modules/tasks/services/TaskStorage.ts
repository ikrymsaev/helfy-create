import { Service } from "@helfy/helfy";
import type { Task } from "../model/types";

/** Where tasks are kept between sessions. */
export interface ITaskStorage {
  load(): Task[];
  save(tasks: Task[]): void;
}

/**
 * @Service — infrastructure: talks to the outside world (here — localStorage).
 * Registered by the interface: replace it with another implementation of ITaskStorage
 * (a server, IndexedDB) and nothing that uses it changes.
 */
@Service<ITaskStorage>()
export class LocalTaskStorage implements ITaskStorage {
  private readonly key = "helfy-starter:tasks";

  load(): Task[] {
    try {
      return JSON.parse(localStorage.getItem(this.key) ?? "[]");
    } catch {
      return [];
    }
  }

  save(tasks: Task[]) {
    localStorage.setItem(this.key, JSON.stringify(tasks));
  }
}
