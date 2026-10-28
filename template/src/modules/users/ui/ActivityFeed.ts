import { View, useInfiniteQuery, type InfiniteQueryResult } from "@helfy/helfy";
import type { UsersApi } from "../api/UsersApi";
import type { ActivityItem } from "../model/types";
import template from "./ActivityFeed.hf";

/**
 * @useInfiniteQuery — pages from the mock backend; "Load more" calls loadMore().
 */
@View({ template })
export class ActivityFeed {
  @useInfiniteQuery<UsersApi>("activity")
  activity!: InfiniteQueryResult<ActivityItem>;
}
