import { View, params } from "@helfy/helfy";
import template from "./UserPage.hf";

/** Loaded lazily — a separate chunk on the first visit (see _routes.ts). */
@View({ template })
export class UserPage {
  @params() routeParams!: Record<string, string>;
}
