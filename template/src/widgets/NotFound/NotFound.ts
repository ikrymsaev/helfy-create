import { View } from "@helfy/helfy";
import template from "./NotFound.hf";

export interface Props {
  pathname?: string;
}

/** Custom 404 page — overrides the RouterView fallback. */
@View({ template })
export class NotFound {
  constructor(readonly props: Props = {}) {}
}
