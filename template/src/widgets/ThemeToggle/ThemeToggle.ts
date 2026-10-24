import { View, useCtx } from "@helfy/helfy";
import { ThemeContext } from "@context/ThemeContext";
import template from "./ThemeToggle.hf";

@View({ template })
export class ThemeToggle {
  @useCtx(ThemeContext, "toggle")
  toggle!: ThemeContext["toggle"];

  @useCtx(ThemeContext, "mode")
  mode!: ThemeContext["mode"];
}
