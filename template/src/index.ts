import { createApp, withRouter, withLogger, withDevtools } from "@helfy/helfy";
import { App } from "./App";
import { routes } from "./pages/_routes";
import "./styles.css";

createApp({ root: document.getElementById("root")! })
  .use(withDevtools(), process.env.NODE_ENV !== "production")
  .use(withRouter({ routes }))
  .use(withLogger())
  .mount(App);
