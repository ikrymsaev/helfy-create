import { ApiClient, queryConfig, QueryBuilder, type Query } from "@helfy/helfy";
import type { User } from "../model/types";
import type { IUsersBackend } from "./UsersBackend";

/** Server data of the feature, as queries: cached, shared between components, refetched when stale. */
export interface UsersApi {
  users(): Query<User[]>;
  user(id: string): Query<User>;
}

/**
 * @ApiClient — describes queries; components take them with @useQuery.
 * .throwOnError() hands errors to the nearest @safe … @fail in the template.
 */
@ApiClient<UsersApi>()
export class UsersApiImpl implements UsersApi {
  constructor(private backend: IUsersBackend) {}

  @queryConfig("users")
  users() {
    return new QueryBuilder<User[]>(["users"])
      .fn(() => this.backend.list())
      .staleTime(60_000)
      .throwOnError()
      .build();
  }

  @queryConfig("user/:id")
  user(id: string) {
    return new QueryBuilder<User>(["user", id])
      .fn(() => this.backend.get(id))
      .staleTime(60_000)
      .throwOnError()
      .build();
  }
}
