import { UseCase } from "@helfy/helfy";
import { EMPTY_PROFILE, type Profile } from "../model/types";
import type { IProfileStorage } from "../services/ProfileStorage";

export interface ILoadProfileUseCase {
  execute(): Profile;
}

@UseCase<ILoadProfileUseCase>()
export class LoadProfileUseCase implements ILoadProfileUseCase {
  constructor(private storage: IProfileStorage) {}

  execute(): Profile {
    return this.storage.load() ?? EMPTY_PROFILE;
  }
}
