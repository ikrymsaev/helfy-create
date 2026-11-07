import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, tick } from "@helfy/helfy/testing";
import { TaskItem } from "./TaskItem";

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("TaskItem (.hf template)", () => {
  it("renders a task and passes user actions to its callbacks", async () => {
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    const { host, unmount } = mount(TaskItem, {
      props: {
        task: { id: "first", title: "Test a component", done: false },
        onToggle,
        onRemove,
      },
    });
    cleanup = unmount;
    expect(host.textContent).toContain("Test a component");

    host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click();
    await tick();
    expect(onToggle).toHaveBeenCalledExactlyOnceWith("first");

    host.querySelector<HTMLButtonElement>('button[aria-label="Remove"]')!.click();
    expect(onRemove).toHaveBeenCalledExactlyOnceWith("first");

    unmount();
    cleanup = undefined;
    expect(host.isConnected).toBe(false);
  });
});
