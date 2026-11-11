import { lazy, type RouteConfig } from "@helfy/helfy";
import { HomePage } from "./HomePage/HomePage";
import { TasksPage } from "./TasksPage/TasksPage";
import { UsersPage } from "./UsersPage/UsersPage";
import { SettingsPage } from "./SettingsPage/SettingsPage";

export const routes: RouteConfig[] = [
  { path: "/", component: HomePage },
  { path: "/tasks", component: TasksPage },
  { path: "/users", component: UsersPage },
  // A separate chunk, loaded on the first visit.
  {
    path: "/users/:id",
    component: lazy(() => import("./UserPage/UserPage").then((m) => m.UserPage)),
  },
  { path: "/settings", component: SettingsPage },
];
