import { View } from "@helfy/helfy";
import type { Task } from "../model/types";
import template from "./TaskItem.hf";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Presentational component: data in props, actions out through callbacks. */
@View({ template })
export class TaskItem {
  constructor(readonly props: Props) {}
}
