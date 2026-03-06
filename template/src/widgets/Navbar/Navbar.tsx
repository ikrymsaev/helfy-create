import { Link, path, View } from "@helfy/helfy";

@View
export class NavBar {
  @path()
  private pathname?: string;

  render() {
    return (
      <nav class="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-200">
        <Link
          to="/"
          label="Home"
          class={
            this.pathname === "/"
              ? "px-2 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 font-semibold"
              : "px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        />
        <Link
          to="/counter"
          label="Counter"
          class={
            this.pathname === "/counter"
              ? "px-2 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 font-semibold"
              : "px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        >
        </Link>
        <Link
          to="/about"
          label="About"
          class={
            this.pathname === "/about"
              ? "px-2 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 font-semibold"
              : "px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        />
      </nav>
    );
  }
}
