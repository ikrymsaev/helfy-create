import { createApp, withRouter, withLogger } from "@helfy/helfy";
import { App } from "./App";
import { routes } from "./pages/_routes";
import "./styles.css";

createApp({ root: document.getElementById("root")! })
  .use(withRouter({ routes }))
  .use(withLogger())
  .mount(App);
