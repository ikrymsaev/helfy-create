import { UseCase } from "@helfy/helfy";
import type { Profile } from "../model/types";
import type { IProfileStorage } from "../services/ProfileStorage";
import type { ISaveProfileUseCase, SaveProfileResult } from "./types";

/**
 * @UseCase — persist a validated profile.
 * Validation of fields lives on the @Form; this use case only saves.
 */
@UseCase<ISaveProfileUseCase>()
export class SaveProfileUseCase implements ISaveProfileUseCase {
  constructor(private storage: IProfileStorage) {}

  execute(profile: Profile): SaveProfileResult {
    const displayName = profile.displayName.trim();
    const email = profile.email.trim();
    if (!displayName) return { ok: false, error: "Enter a display name" };
    if (!email.includes("@")) return { ok: false, error: "Enter a valid email" };

    this.storage.save({ displayName, email, digest: profile.digest });
    return { ok: true };
  }
}
