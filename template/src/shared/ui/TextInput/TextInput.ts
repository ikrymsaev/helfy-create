import { View, binded, type HelfyBindableProps } from "@helfy/helfy";
import template from "./TextInput.hf";

interface Props extends HelfyBindableProps {
  placeholder?: string;
  class?: string;
}

/**
 * Named two-way bind: parent uses `<TextInput @bind:value(this.title) />`;
 * `@binded("value")` reads and writes the parent's field.
 */
@View({ template })
export class TextInput {
  constructor(readonly props: Props) {}

  @binded("value") value!: string;
}
