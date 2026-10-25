import { View, path } from "@helfy/helfy";
import { NAV_LINKS } from "@widgets/navLinks";
import template from "./Header.hf";

@View({ template })
export class Header {
  @path()
  pathname?: string;

  links = NAV_LINKS;

  isActive(to: string) {
    const p = this.pathname ?? "/";
    return to === "/" ? p === "/" : p === to || p.startsWith(to + "/");
  }
}
