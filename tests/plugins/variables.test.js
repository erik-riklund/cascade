import test_group from "../../testing.js";
import variables from "../../plugins/variables.js";
import { resolve } from "../../index.js";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should ...",
        () => {
          const node = ["div", { color: "$text-color" }];
          const instructions = resolve([node], [variables]);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["property", "color", "var(--text-color)"]
          ]);
        }
      ],
      [
        "should ...",
        () => {
          const node = [
            "div",
            { border: "2px solid $border-color" }
          ];
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
