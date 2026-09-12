import test_group from "../../testing.js";
import variables from "../../plugins/variables.js";

test_group(
  ({ expect }) => ({
    tests: [
      [
        "should identify values prefixed with `$`",
        () => {
          expect(variables.test("$foo")).toBe(true);
          expect(variables.test("foo")).toBe(false);
        }
      ],
      [
        "should transform prefixed identifiers into `var()` declarations",
        () => {
          expect(variables.transform("foo")).toBe("foo");
          expect(variables.transform("$foo")).toBe("var(--foo)");
        }
      ]
    ]
  })
);
