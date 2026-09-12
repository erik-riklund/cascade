import { expect } from "@std/expect";
import { spy, stub } from "@std/testing/mock";

export default (factory) => {
  const definition = factory({ expect, spy, stub });

  const lifecycle = definition.lifecycle || {};
  const tests = definition.tests.filter(
    ([label]) => !/^(skip|todo):/.test(label)
  );

  for (const [label, test] of tests) {
    const runner = async () => {
      try {
        const fixture = typeof lifecycle.setup === "function"
          ? await lifecycle.setup()
          : undefined;

        await test(fixture);

        if (typeof lifecycle.teardown === "function") {
          await lifecycle.teardown(fixture);
        }
      }
      finally {
        if (typeof lifecycle.cleanup === "function") {
          await lifecycle.cleanup();
        }
      }
    };

    Deno.test(label, runner);
  }
};
