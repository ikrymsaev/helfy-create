import { View, useQuery, type Query } from "@helfy/helfy";
import type { UsersApi } from "../api/UsersApi";
import { initials, type User } from "../model/types";
import template from "./UserProfile.hf";

interface Props {
  id: string;
}

@View({ template })
export class UserProfile {
  constructor(readonly props: Props) {}

  /** The key reads the prop: another id — another query. Visited profiles come from the cache. */
  @useQuery<UsersApi>((self: UserProfile) => ["user", self.props.id])
  user!: Query<User>;

  initials = initials;
}
