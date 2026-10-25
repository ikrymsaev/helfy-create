import { View } from "@helfy/helfy";
import template from "./PageHeader.hf";

interface Props {
  eyebrow?: string;
  title: string;
}

/** Shared UI: no business logic, used by any page. The description goes in as children. */
@View({ template })
export class PageHeader {
  constructor(readonly props: Props) {}
}
