export interface Profile {
  displayName: string;
  email: string;
  digest: boolean;
}

export const EMPTY_PROFILE: Profile = {
  displayName: "",
  email: "",
  digest: true,
};
