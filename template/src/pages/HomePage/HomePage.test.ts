import { expect, it } from "vitest";
import { withRouter } from "@helfy/helfy";
import { mount } from "@helfy/helfy/testing";
import { HomePage } from "./HomePage";

it("renders Markdown documents alongside the overview's navigation and code example", () => {
  const { host, unmount } = mount(HomePage, {
    plugins: [withRouter({ routes: [] })],
  });
  try {
    expect(host.querySelectorAll(".layers [data-hf-markdown] h3")).toHaveLength(7);
    expect(host.querySelector(".layers h3")?.textContent).toBe("@View");
    expect(host.querySelectorAll(".steps ol > li")).toHaveLength(4);
    expect(host.querySelector(".also table")?.textContent).toContain("Markdown");
    expect(host.querySelector('.features a[href="/settings"] code')?.textContent).toBe("@Form");
    expect(host.querySelector('.hero__actions a[href="/tasks"]')?.textContent).toBe(
      "See it in Tasks",
    );
    expect(host.querySelector(".code__body")?.textContent).toContain("execute(title: string)");
    expect(host.querySelector("p [data-hf-markdown]")).toBeNull();
  } finally {
    unmount();
  }
});
