import { View, state } from "@helfy/helfy";

@View
export class CounterPage {
  @state private count = 0;

  render() {
    return (
      <div class="page">
        <h1>Counter</h1>
        <p>Count: {this.count}</p>
        <button onclick={() => this.count++}>Increment</button>
        <button onclick={() => this.count--}>Decrement</button>
      </div>
    );
  }
}
