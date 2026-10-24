import { View, path } from "@helfy/helfy";
import { NAV_LINKS } from "@widgets/navLinks";
import template from "./Navbar.hf";

@View({ template })
export class NavBar {
  @path()
  pathname?: string;

  links = NAV_LINKS;
}
