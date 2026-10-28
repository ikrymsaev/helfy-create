import { Service } from "@helfy/helfy";
import type { Profile } from "../model/types";

/** Where the profile form is kept between sessions. */
export interface IProfileStorage {
  load(): Profile | null;
  save(profile: Profile): void;
}

/**
 * @Service — localStorage for the settings form.
 * Swap for a server-backed impl of IProfileStorage; the use case stays the same.
 */
@Service<IProfileStorage>()
export class LocalProfileStorage implements IProfileStorage {
  private readonly key = "helfy-starter:profile";

  load(): Profile | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as Profile) : null;
    } catch {
      return null;
    }
  }

  save(profile: Profile) {
    localStorage.setItem(this.key, JSON.stringify(profile));
  }
}
