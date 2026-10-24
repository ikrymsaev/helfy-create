import { View, state, computed } from "@helfy/helfy";
import template from "./CounterPage.hf";

@View({ template })
export class CounterPage {
  @state count = 0;

  @computed
  get parity() {
    return this.count % 2 === 0 ? "even" : "odd";
  }

  increment = () => this.count++;
  decrement = () => this.count--;
}
