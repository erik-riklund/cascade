type Value = string | number;
type Producer<R> = (data: Record<string, unknown>) => R;

export type Node =
  | [
    selectors: string | string[],
    ...Node[] // children
  ]
  | [
    selectors: string | string[],
    properties: Record<string, Value | Producer<Value>>,
    ...Node[] // children
  ];

export type Instruction =
  | [type: "selector", selector: string, depth: number]
  | [type: "property", key: string, value: Value | Producer<Value>];

export type Plugin = {
  type: "selector";
  test: (selector: string) => boolean;
  transform: (selector: string) => string;
} | {
  type: "property";
  test: (key: string, value: unknown) => boolean;
  transform: (
    key: string,
    value: Value | Producer<Value>
  ) => [key: string, value: Value | Producer<Value>];
};

// ------------------------------------------------------------------

export const generate = (
  instructions: Instruction[],
  data: Record<string, unknown> = {}
): string => {
  const result = [];
  let current_depth = 1;

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    switch (instruction[0]) {
      case "selector": {
        result.push(instruction[1]);
        if (instruction[2] !== current_depth) {
          current_depth += instruction[2] - current_depth;
        }
        break;
      }
      case "property": {
        const value = typeof instruction[2] === "function"
          ? instruction[2].call(null, data)
          : instruction[2];
        result.push(`${instruction[1]}:${value}`);
        break;
      }
    }

    if (instructions[i + 1]) {
      const next = instructions[i + 1];
      switch (instruction[0]) {
        case "selector": {
          if (next[0] === "selector") {
            result.push(next[2] === instruction[2] ? "," : "{");
          }
          else if (next[0] === "property") {
            result.push("{");
          }
          break;
        }
        case "property": {
          if (next[0] === "selector") {
            if (next[2] < current_depth) {
              result.push("}" + "}".repeat(current_depth - next[2]));
            }
            else if (next[2] === current_depth) {
              result.push("}");
            }
            else result.push(";");
          }
          else if (next[0] === "property") {
            result.push(";");
          }
          break;
        }
      }
    }
  }

  result.push("}".repeat(current_depth));
  return result.join("");
};

// ------------------------------------------------------------------

export const resolve = (
  tree: Node[],
  plugins: Plugin[] = []
) => {
  const grouped_plugins = {
    property: plugins.filter((plugin) => plugin.type === "property"),
    selector: plugins.filter((plugin) => plugin.type === "selector")
  };

  const resolve_tree = (
    tree: Node[],
    current_depth = 1
  ) => {
    const instructions: Instruction[] = [];

    for (const node of tree) {
      let selectors = Array.isArray(node[0]) ? [...node[0]] : [node[0]];

      const properties = !node[1] || Array.isArray(node[1])
        ? null
        : Object.entries(node[1]);

      const children = node.slice(properties ? 2 : 1)?.flatMap(
        (child) => [...resolve_tree([child as Node], current_depth + 1)]
      );

      selectors = selectors.map(
        (selector) => {
          return grouped_plugins.selector.filter(
            (plugin) => plugin.test(selector)
          ).reduce(
            (selector, plugin) => plugin.transform(selector),
            selector
          );
        }
      );
      if (properties) {
        for (let n = 0; n < properties.length; n++) {
          let property = properties[n];
          for (const plugin of grouped_plugins.property) {
            const [key, value] = property;
            if (plugin.test(key, value)) {
              property = plugin.transform(key, value);
            }
          }
          properties[n] = property;
        }
      }

      if (properties || children?.length) {
        selectors.forEach((selector) => {
          instructions.push(["selector", selector, current_depth]);
        });
        if (properties) {
          instructions.push(
            ...properties.map(([key, value]) =>
              ["property", key, value] satisfies Instruction
            )
          );
        }
        if (children?.length) {
          instructions.push(...children);
        }
      }
    }
    return instructions;
  };

  return resolve_tree(tree);
};
