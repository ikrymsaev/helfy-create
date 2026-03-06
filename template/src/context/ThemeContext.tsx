import { View, Context, provide, ctx } from "@helfy/helfy";

export type TThemeMode = "light" | "dark";

@Context
export class ThemeContext {
  @provide({ reactive: true })
  mode: TThemeMode = "dark";

  @provide()
  toggle = () => {
    this.mode = this.mode === "dark" ? "light" : "dark";
    this._syncToDom();
  };

  private _syncToDom() {
    document.documentElement.classList.toggle("dark", this.mode === "dark");
  }
}

@View
export class ThemeSync {
  @ctx(ThemeContext)
  private theme!: ThemeContext;

  onMount() {
    document.documentElement.classList.toggle("dark", this.theme.mode === "dark");
  }

  render() {
    document.documentElement.classList.toggle("dark", this.theme.mode === "dark");
    return <span class="hidden" aria-hidden="true" />;
  }
}

@View
export class ThemeToggle {
  @ctx(ThemeContext, 'toggle')
  private toggle!: ThemeContext['toggle'];

  @ctx(ThemeContext, "mode")
  private mode!: ThemeContext['mode'];

  render() {
    const isDark = this.mode === "dark";
    return (
      <button
        type="button"
        class="flex items-center justify-center h-9 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors px-4"
        onclick={this.toggle}
        title={isDark ? "Светлая тема" : "Тёмная тема"}
        aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      >
        {isDark ? (
          <span>Светлая</span>
        ) : (
          <span>Тёмная</span>
        )}
      </button>
    );
  }
}
