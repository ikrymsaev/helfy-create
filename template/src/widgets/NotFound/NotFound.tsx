import { Link, View } from "@helfy/helfy";

export interface Props {
  pathname?: string;
}

@View
/** Кастомная страница 404 приложения — переопределяет fallback RouterView. */
export class NotFound {
  constructor(private readonly props: Props = {}) {}

  render() {
    return (
      <section class="flex flex-col flex-1 h-full flex-grow items-center justify-center px-8 py-16 text-center bg-slate-950">
        <div class="text-8xl font-bold tracking-tighter text-indigo-200 dark:text-indigo-900/50 select-none">
          404
        </div>
        <h1 class="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Упс! Страница не найдена
        </h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-md">
          Запрошенный адрес не существует или был перемещён.
        </p>
        {(this.props.pathname ?? "") && (
          <p class="mt-2 text-xs text-gray-500 dark:text-gray-500 font-mono break-all max-w-full">
            {this.props.pathname}
          </p>
        )}
        <Link
          to="/"
          label="Вернуться на главную"
          class="mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-colors shadow-sm"
        />
      </section>
    );
  }
}
