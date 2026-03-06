import { View } from "@helfy/helfy";

@View
export class MainLayout {
  render() {
    return (
      <div class="flex flex-col min-h-screen">
        <header
          class="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700"
        >
          @slot:header()
        </header>
        <div class="flex flex-1 min-h-0">
            <aside class="w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm px-4 py-6 flex flex-col gap-4">
              @slot:sidebar()
            </aside>
            <main class="flex flex-1 flex-col w-full">
              @slot:content()
            </main>
        </div>
        <footer
          class="px-4 py-2 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700"
        >
          @slot:footer() fallback {
            <span>© 2025</span>
          }
        </footer>
      </div>
    );
  }
}
