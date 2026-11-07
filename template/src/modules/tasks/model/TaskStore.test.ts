import { describe, expect, it } from "vitest";
import { TaskStore } from "./TaskStore";

describe("TaskStore", () => {
  it("keeps the unfinished count in sync with mutations", () => {
    const store = new TaskStore();
    store.add({ id: "first", title: "Write a test", done: false });
    store.add({ id: "second", title: "Run the test", done: false });
    expect(store.left).toBe(2);

    store.toggle("first");
    expect(store.left).toBe(1);
    expect(store.tasks[0].done).toBe(true);

    store.remove("second");
    expect(store.left).toBe(0);
    expect(store.tasks.map((task) => task.id)).toEqual(["first"]);
  });
});
