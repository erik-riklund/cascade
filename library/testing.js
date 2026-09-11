import { expect } from "@std/expect";
import { spy, stub } from "@std/testing/mock";

export default (name, factory) => {
  let definition = factory({ expect, spy, stub });
  if (Array.isArray(definition)) definition = { tests: definition };

  Deno.test({
    name,

    fn: async (runner) => {
      const lifecycle = definition.lifecycle || {};

      try {
        for (
          const [label, test] of definition.tests.filter(
            ([name]) => !name.startsWith("skip:")
          )
        ) {
          const fixture = typeof lifecycle.setup === "function"
            ? await lifecycle.setup()
            : undefined;

          await runner.step(label, () => test(fixture));

          if (typeof lifecycle.teardown === "function") {
            await lifecycle.teardown(fixture);
          }
        }
      }
      finally {
        if (typeof lifecycle.cleanup === "function") {
          await lifecycle.cleanup();
        }
      }
    }
  });
};
