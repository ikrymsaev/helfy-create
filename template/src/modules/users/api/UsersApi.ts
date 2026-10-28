import {
  ApiClient,
  queryConfig,
  infiniteQueryConfig,
  QueryBuilder,
  InfiniteQueryBuilder,
  MutationBuilder,
  getOrCreateQueryCache,
  type Query,
  type InfiniteQuery,
  type Mutation,
} from "@helfy/helfy";
import type { ActivityItem, AddNoteVars, Note, User } from "../model/types";
import type { IUsersBackend } from "./UsersBackend";

export const NOTES_KEY = ["notes"] as const;
export const ACTIVITY_PAGE_SIZE = 5;

/** Server data of the feature, as queries and mutations. */
export interface UsersApi {
  users(): Query<User[]>;
  user(id: string): Query<User>;
  notes(): Query<Note[]>;
  /** Optimistic add: the note shows up at once, rolled back if the mock fails. */
  addNote(): Mutation<Note, AddNoteVars>;
  activity(): InfiniteQuery<ActivityItem>;
}

/**
 * @ApiClient — queries, mutations and infinite queries over the mock backend.
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

  @queryConfig("notes")
  notes() {
    // New notes live in the mock until reload; keep the list fresh from the cache.
    return new QueryBuilder<Note[]>(NOTES_KEY)
      .fn(() => this.backend.listNotes())
      .staleTime(Infinity)
      .build();
  }

  addNote() {
    const cache = getOrCreateQueryCache();
    return new MutationBuilder<Note, AddNoteVars>()
      .fn(({ title, fail }) => this.backend.addNote(title, fail))
      .optimisticFn(({ clientId, title }) => ({
        updates: [
          {
            queryKey: NOTES_KEY,
            updater: (prev) => [
              ...((prev as Note[] | undefined) ?? []),
              { id: clientId, title, pending: true },
            ],
          },
        ],
      }))
      .onSuccess((saved, { clientId }) =>
        cache.setWithUpdater<Note[]>(NOTES_KEY, (prev) =>
          (prev ?? []).map((n) => (n.id === clientId ? saved : n)),
        ),
      )
      .build();
  }

  @infiniteQueryConfig("activity")
  activity() {
    return new InfiniteQueryBuilder<ActivityItem>()
      .queryKey(["activity"])
      .fn((page) => this.backend.listActivity(page as number, ACTIVITY_PAGE_SIZE))
      .initialPageParam(1)
      .getNextPageParam((lastPage, allPages) =>
        lastPage.length === ACTIVITY_PAGE_SIZE ? allPages.length + 1 : undefined,
      )
      .staleTime(30_000)
      .build();
  }
}
