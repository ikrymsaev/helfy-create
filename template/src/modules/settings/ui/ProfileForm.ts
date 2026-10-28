import { View, inject, useForm, ref, state } from "@helfy/helfy";
import { ProfileFormContext } from "../forms/ProfileFormContext";
import type { ILoadProfileUseCase } from "../use-cases/LoadProfileUseCase";
import type { ISaveProfileUseCase } from "../use-cases/types";
import type { TextField } from "./TextField";
import template from "./ProfileForm.hf";

/**
 * View: @useForm takes the @Form context; @ref to TextField calls its @expose focus().
 * Load/save go through use cases — no localStorage here.
 */
@View({ template })
export class ProfileForm {
  @inject<ILoadProfileUseCase>() loadProfile!: ILoadProfileUseCase;
  @inject<ISaveProfileUseCase>() saveProfile!: ISaveProfileUseCase;

  @useForm(ProfileFormContext) form!: ProfileFormContext;

  /** Parent ref → only @expose methods of TextField (focus). */
  @ref nameField!: Pick<TextField, "focus">;

  @state saved = false;
  @state error = "";

  onAttached() {
    this.form.apply(this.loadProfile.execute());
    this.nameField?.focus();
  }

  submit = (e: Event) => {
    e.preventDefault();
    this.saved = false;
    this.error = "";
    if (!this.form.validateAll()) return;

    const result = this.saveProfile.execute(this.form.getDto());
    if (!result.ok) {
      this.error = result.error;
      return;
    }
    this.saved = true;
  };
}
