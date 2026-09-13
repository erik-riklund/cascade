import { expect } from "@std/expect";
import { spy, stub } from "@std/testing/mock";

type Factory<F> = (
  params: {
    expect: typeof expect;
    spy: typeof spy;
    stub: typeof stub;
  }
) => Definition<F>;

type Definition<F> = {
  tests: [
    label: string,
    test: (fixture: F) => void | Promise<void>
  ][];

  lifecycle?: Partial<
    {
      setup: () => F | Promise<F>;
      teardown: (fixture: F) => void | Promise<void>;
      cleanup: () => void | Promise<void>;
    }
  >;
};

export default <TFixture = undefined>(
  factory: Factory<TFixture>
): void => {
  const definition = factory({ expect, spy, stub });

  const lifecycle = definition.lifecycle || {};
  const tests = definition.tests.filter(
    ([label]) => !/^(skip|todo):/.test(label)
  );

  for (const [label, test] of tests) {
    const runner = async () => {
      try {
        const fixture = (
          typeof lifecycle.setup === "function"
            ? await lifecycle.setup()
            : undefined
        ) as TFixture;

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
