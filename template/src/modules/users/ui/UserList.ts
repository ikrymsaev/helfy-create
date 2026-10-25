import { View, useQuery, type Query } from "@helfy/helfy";
import type { UsersApi } from "../api/UsersApi";
import { initials, type User } from "../model/types";
import template from "./UserList.hf";

/**
 * Takes the query from UsersApi. Loading and errors are not handled here: the page wraps
 * the component in @safe … @wait … @fail.
 */
@View({ template })
export class UserList {
  @useQuery<UsersApi>("users") users!: Query<User[]>;

  initials = initials;
}
