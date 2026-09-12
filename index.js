const objectify = (instruction) => {
  switch (instruction[0]) {
    case "selector": {
      return {
        type: "selector",
        selector: instruction[1],
        depth: instruction[2]
      };
    }
    case "property": {
      return {
        type: "property",
        key: instruction[1],
        value: instruction[2]
      };
    }
  }
};

export const generate = (instructions, data = {}) => {
  const result = [];
  let current_depth = 1;

  for (let i = 0; i < instructions.length; i++) {
    const instruction = objectify(instructions[i]);
    switch (instruction.type) {
      case "selector": {
        result.push(instruction.selector);
        if (instruction.depth !== current_depth) {
          current_depth += instruction.depth - current_depth;
        }
        break;
      }
      case "property": {
        const value = typeof instruction.value === "function"
          ? instruction.value(data)
          : instruction.value;
        result.push(`${instruction.key}:${value}`);
        break;
      }
    }

    if (instructions[i + 1]) {
      const next = objectify(instructions[i + 1]);

      switch (instruction.type) {
        case "selector": {
          if (next.type === "selector") {
            result.push(next.depth === instruction.depth ? "," : "{");
          }
          else if (next.type === "property") {
            result.push("{");
          }
          break;
        }
        case "property": {
          if (next.type === "selector") {
            if (next.depth < current_depth) {
              result.push("}" + "}".repeat(current_depth - next.depth));
            }
            else if (next.depth === current_depth) {
              result.push("}");
            }
            else result.push(";");
          }
          else if (next.type === "property") {
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

export const resolve = (
  tree,
  plugins = [],
  current_depth = 1
) => {
  plugins = !Array.isArray(plugins) ? plugins : {
    property: plugins.filter((plugin) => plugin.type === "property"),
    selector: plugins.filter((plugin) => plugin.type === "selector")
  };

  const instructions = [];
  for (const node of tree) {
    let selectors = Array.isArray(node[0]) ? node[0] : [node[0]];
    const properties = node[1] && !Array.isArray(node[1])
      ? { ...node[1] }
      : null;
    const children = node.slice(properties ? 2 : 1).flatMap(
      (child) => [...resolve([child], plugins, current_depth + 1)]
    );

    selectors = selectors.map(
      (selector) => {
        return plugins.selector.filter(
          (plugin) => plugin.test(selector)
        ).reduce(
          (selector, plugin) => plugin.transform(selector),
          selector
        );
      }
    );
    if (properties) {
      Object.entries(properties).forEach(
        ([key]) => {
          plugins.property.forEach((plugin) => {
            const current_value = properties[key];
            if (plugin.test(current_value)) {
              properties[key] = plugin.transform(current_value);
            }
          });
        }
      );
    }

    if (properties || children.length) {
      selectors.forEach((selector) => {
        instructions.push(["selector", selector, current_depth]);
      });
      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          instructions.push(["property", key, value]);
        });
      }
      if (children.length) {
        instructions.push(...children);
      }
    }
  }

  return instructions;
};
