import { View, ref, expose, type FieldState } from "@helfy/helfy";
import template from "./TextField.hf";

interface Props {
  label: string;
  /** Writable field prop: parent passes a FieldState; the input binds with @field. */
  $field: FieldState<string>;
  type?: string;
  placeholder?: string;
  autocomplete?: string;
}

/**
 * Reusable field wrapper. Parent focuses it through @ref + @expose focus() —
 * only exposed methods are visible on the ref.
 */
@View({ template })
export class TextField {
  constructor(readonly props: Props) {}

  @ref input!: HTMLInputElement;

  @expose
  focus() {
    this.input?.focus();
  }
}
