import { View, params, onFail, logger, type ILogger } from "@helfy/helfy";
import template from "./UserPage.hf";

/** Loaded lazily — a separate chunk on the first visit (see _routes.ts). */
@View({ template })
export class UserPage {
  @params() routeParams!: Record<string, string>;

  @logger("UserPage") log!: ILogger;

  /**
   * Runs for every error caught by @safe … @fail before the @fail branch.
   * Return true to swallow the UI @fail (e.g. after a redirect). Here we only log
   * and let @fail show the "Not found" card.
   */
  @onFail
  handleFail(error: unknown) {
    this.log.error(error instanceof Error ? error : new Error(String(error)));
  }
}
