import { resolve } from "../index.js";
import test_group from "../testing.js";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should emit `selector` and `property` instructions for a simple rule node",
        () => {
          const node = ["div", { color: "red" }];
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
          ];
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
          ];
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
          ];
          const expected_result = [
            ["selector", "div", 1],
            ["selector", ".warning", 2],
            ["property", "color", "orange"]
          ];
          expect(resolve([node])).toEqual(expected_result);
        }
      ]
    ]
  })
);
