import test_group from "~/testing.ts";
import { type Node, resolve } from "~/index.ts";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should emit `selector` and `property` instructions for a simple rule node",
        () => {
          const node = [
            "div",
            { color: "red" }
          ] satisfies Node;

          const expected_result = [
            ["selector", "div", 1],
            ["property", "color", "red"]
          ];
          expect(resolve([node])).toEqual(expected_result);
        }
      ],
      [
        "should emit multiple `selector` instructions at root depth for grouped selectors",
        () => {
          const node = [
            ["div", "span"],
            { color: "red" }
          ] satisfies Node;

          const expected_result = [
            ["selector", "div", 1],
            ["selector", "span", 1],
            ["property", "color", "red"]
          ];
          expect(resolve([node])).toEqual(expected_result);
        }
      ],
      [
        "should emit incremented depth `selector` instructions for nested rules",
        () => {
          const node = [
            "div",
            { color: "red" },
            ["span", { color: "yellow" }]
          ] satisfies Node;

          const expected_result = [
            ["selector", "div", 1],
            ["property", "color", "red"],
            ["selector", "span", 2],
            ["property", "color", "yellow"]
          ];
          expect(resolve([node])).toEqual(expected_result);
        }
      ],
      [
        "should omit instructions for empty child nodes",
        () => {
          const node = [
            "div",
            ["span"],
            [".warning", { color: "orange" }]
          ] satisfies Node;

          const expected_result = [
            ["selector", "div", 1],
            ["selector", ".warning", 2],
            ["property", "color", "orange"]
          ];
          expect(resolve([node])).toEqual(expected_result);
        }
      ],
      [
        "should return an empty instruction list for empty nested trees",
        () => {
          const node = ["table", ["tr", ["td"]]] satisfies Node;
          expect(resolve([node])).toEqual([]);
        }
      ]
    ]
  })
);
