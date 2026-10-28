import { Form, field, computed, type FieldState } from "@helfy/helfy";
import type { Profile } from "../model/types";

/**
 * @Form — a context of FieldState values. The view takes it with @useForm;
 * inputs bind with @field / $field wrappers.
 */
@Form
export class ProfileFormContext {
  @field({ defaultValue: "" })
  displayName!: FieldState<string>;

  @field({ defaultValue: "" })
  email!: FieldState<string>;

  @field({ defaultValue: true })
  digest!: FieldState<boolean>;

  apply(profile: Profile) {
    this.displayName.value = profile.displayName;
    this.email.value = profile.email;
    this.digest.value = profile.digest;
  }

  getDto(): Profile {
    return {
      displayName: this.displayName.value.trim(),
      email: this.email.value.trim(),
      digest: this.digest.value,
    };
  }

  validateAll(): boolean {
    this.displayName.error = this.displayName.value.trim() ? undefined : "Required";
    this.email.error = this.email.value.includes("@") ? undefined : "Needs an @";
    return !this.displayName.error && !this.email.error;
  }

  @computed
  get canSubmit(): boolean {
    return !!this.displayName.value.trim() && this.email.value.includes("@");
  }
}
