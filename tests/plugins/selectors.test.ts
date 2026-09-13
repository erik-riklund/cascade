import test_group from "~/testing.ts";
import { type Node, resolve } from "~/index.ts";
import selectors from "~/plugins/selectors.ts";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should emit a `@media (max-width:...)` `selector` " +
        "instruction for upper-bounded screen width",
        () => {
          const node = [
            "div",
            ["screen width ..380px", { color: "red" }]
          ] satisfies Node;

          const instructions = resolve([node], selectors);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["selector", "@media (max-width:380px)", 2],
            ["property", "color", "red"]
          ]);
        }
      ],
      [
        "should emit a `@media (min-width:...)` `selector` " +
        "instruction for lower-bounded screen width",
        () => {
          const node = [
            "div",
            ["screen width 380px..", { color: "red" }]
          ] satisfies Node;

          const instructions = resolve([node], selectors);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["selector", "@media (min-width:380px)", 2],
            ["property", "color", "red"]
          ]);
        }
      ],
      [
        "should emit a range (min-max) `selector` instruction " +
        "for bounded screen width ranges",
        () => {
          const node = [
            "div",
            ["screen width 380px..1024px", { color: "red" }]
          ] satisfies Node;

          const instructions = resolve([node], selectors);
          expect(instructions).toEqual([
            ["selector", "div", 1],
            ["selector", "@media (min-width:380px)and(max-width:1024px)", 2],
            ["property", "color", "red"]
          ]);
        }
      ]
    ]
  })
);
