import { generate } from "../index.js";
import test_group from "../testing.js";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should emit a rule for a single selector and property",
        () => {
          const instructions = [
            ["selector", "div", 1],
            ["property", "color", "red"]
          ];
          const expected_result = "div{color:red}";
          expect(generate(instructions)).toEqual(expected_result);
        }
      ],
      [
        "should emit comma-separated selectors for consecutive " +
        "`selector` instructions at the same depth",
        () => {
          const instructions = [
            ["selector", "div", 1],
            ["selector", "span", 1],
            ["property", "color", "red"]
          ];
          const expected_result = "div,span{color:red}";
          expect(generate(instructions)).toEqual(expected_result);
        }
      ],
      [
        "should emit separated declarations for multiple `property` instructions",
        () => {
          const instructions = [
            ["selector", "div", 1],
            ["property", "color", "red"],
            ["property", "font-size", "100%"]
          ];
          const expected_result = "div{color:red;font-size:100%}";
          expect(generate(instructions)).toEqual(expected_result);
        }
      ],
      [
        "should emit separate rule blocks for consecutive sibling `selector` instructions",
        () => {
          const instructions = [
            ["selector", "div", 1],
            ["property", "color", "red"],
            ["property", "font-size", "100%"],
            ["selector", "span", 1],
            ["property", "color", "yellow"]
          ];
          const expected_chunks = [
            "div{color:red;font-size:100%}",
            "span{color:yellow}"
          ];
          expect(generate(instructions)).toEqual(expected_chunks.join(""));
        }
      ],
      [
        "should emit nested rules when the selector depth increases",
        () => {
          const instructions = [
            ["selector", "h1", 1],
            ["property", "color", "green"],
            ["selector", "div", 1],
            ["property", "color", "red"],
            ["property", "font-size", "100%"],
            ["selector", "span", 2],
            ["property", "color", "yellow"]
          ];
          const expected_chunks = [
            "h1{color:green}",
            "div{color:red;font-size:100%;",
            "span{color:yellow}}"
          ];
          expect(generate(instructions)).toEqual(expected_chunks.join(""));
        }
      ],
      [
        "should close nested rules and return to root level " +
        "when the selector depth decreases",
        () => {
          const instructions = [
            ["selector", "h1", 1],
            ["property", "color", "green"],
            ["selector", "div", 1],
            ["property", "color", "red"],
            ["selector", "span", 2],
            ["property", "color", "yellow"],
            ["selector", "button", 1],
            ["property", "color", "pink"]
          ];
          const expected_chunks = [
            "h1{color:green}",
            "div{color:red;span{color:yellow}}",
            "button{color:pink}"
          ];
          expect(generate(instructions)).toEqual(expected_chunks.join(""));
        }
      ]
    ]
  })
);
