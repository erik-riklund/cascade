import test_group from "~/testing.ts";
import { type Node, resolve } from "~/index.ts";
import variables from "~/plugins/variables.ts";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should emit a `property` instruction with variable transformed to `var()`",
        () => {
          const node = [
            "div",
            { color: "$text-color" }
          ] satisfies Node;

          const instructions = resolve([node], [variables]);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["property", "color", "var(--text-color)"]
          ]);
        }
      ],
      [
        "should emit a `property` instruction transforming inline " +
        "variables within compound values",
        () => {
          const node = [
            "div",
            { border: "2px solid $border-color" }
          ] satisfies Node;

          const instructions = resolve([node], [variables]);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["property", "border", "2px solid var(--border-color)"]
          ]);
        }
      ]
    ]
  })
);
