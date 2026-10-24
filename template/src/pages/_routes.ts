import { lazy, type RouteConfig } from "@helfy/helfy";
import { HomePage } from "./HomePage";
import { CounterPage } from "./CounterPage";

export const routes: RouteConfig[] = [
  { path: "/", component: HomePage },
  { path: "/counter", component: CounterPage },
  // A separate chunk, loaded on the first visit.
  { path: "/about", component: lazy(() => import("./AboutPage").then((m) => m.AboutPage)) },
];
