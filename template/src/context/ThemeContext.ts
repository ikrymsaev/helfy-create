import { Context, state, effect } from "@helfy/helfy";

export type TThemeMode = "light" | "dark";

@Context
export class ThemeContext {
  @state mode: TThemeMode = "dark";

  toggle = () => {
    this.mode = this.mode === "dark" ? "light" : "dark";
  };

  /** Keeps class="dark" on <html> in sync with the mode. */
  @effect
  syncToDom() {
    document.documentElement.classList.toggle("dark", this.mode === "dark");
  }
}
