import { describe, expect, it, vi } from "vitest";
import { TaskStore } from "../model/TaskStore";
import type { ITaskStorage } from "../services/TaskStorage";
import { AddTaskUseCase } from "./AddTaskUseCase";

function setup() {
  const store = new TaskStore();
  const storage = { load: () => [], save: vi.fn<ITaskStorage["save"]>() };
  return { store, storage, addTask: new AddTaskUseCase(store, storage) };
}

describe("AddTaskUseCase", () => {
  it("trims the title, adds a task and persists the new state", () => {
    const { store, storage, addTask } = setup();
    expect(addTask.execute("  Learn Helfy  ")).toEqual({ ok: true });
    expect(store.tasks).toEqual([{ id: expect.any(String), title: "Learn Helfy", done: false }]);
    expect(storage.save).toHaveBeenCalledExactlyOnceWith(store.tasks);
  });

  it.each(["", "   ", "x".repeat(81)])("rejects invalid input: %j", (title) => {
    const { store, storage, addTask } = setup();
    expect(addTask.execute(title).ok).toBe(false);
    expect(store.tasks).toEqual([]);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it("rejects duplicates without writing storage again", () => {
    const { store, storage, addTask } = setup();
    addTask.execute("Learn Helfy");
    expect(addTask.execute(" learn HELFY ").ok).toBe(false);
    expect(store.tasks).toHaveLength(1);
    expect(storage.save).toHaveBeenCalledTimes(1);
  });
});
