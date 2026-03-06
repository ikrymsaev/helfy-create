import { ThemeToggle } from "@context/ThemeContext";
import { Link, View } from "@helfy/helfy";

@View
export class Header {
  render() {
    return (
      <div class="flex flex-1 items-center gap-4 justify-between w-full">
        <nav class="nav">
          <Link to="/" label="Home" />
          <Link to="/counter" label="Counter" />
          <Link to="/about" label="About" />
        </nav>
        <ThemeToggle />
      </div>
    );
  }
}