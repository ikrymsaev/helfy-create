import { View } from "@helfy/helfy";
import { RouterContext, RouterView, Link } from "@helfy/helfy";
import { routes } from "./pages/routes";

@View
export class App {
  render() {
    return (
      <RouterContext routes={routes}>
        <div class="app">
          <nav class="nav">
            <Link to="/" label="Home" />
            <Link to="/counter" label="Counter" />
            <Link to="/about" label="About" />
          </nav>
          <main class="main">
            <RouterView />
          </main>
        </div>
      </RouterContext>
    );
  }
}
