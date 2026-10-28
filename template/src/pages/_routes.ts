import { lazy, type RouteConfig } from "@helfy/helfy";
import { HomePage } from "./HomePage";
import { TasksPage } from "./TasksPage";
import { UsersPage } from "./UsersPage";
import { SettingsPage } from "./SettingsPage";

export const routes: RouteConfig[] = [
  { path: "/", component: HomePage },
  { path: "/tasks", component: TasksPage },
  { path: "/users", component: UsersPage },
  // A separate chunk, loaded on the first visit.
  { path: "/users/:id", component: lazy(() => import("./UserPage").then((m) => m.UserPage)) },
  { path: "/settings", component: SettingsPage },
];
