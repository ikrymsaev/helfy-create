import type { Profile } from "../model/types";

export type SaveProfileResult = { ok: true } | { ok: false; error: string };

export interface ISaveProfileUseCase {
  execute(profile: Profile): SaveProfileResult;
}
