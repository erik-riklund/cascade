const compiled_patterns = {};

const parse = (selector, { pattern, labels }) => {
  const expression = compile_pattern(pattern);
  const matches = expression.exec(selector);
  return !matches ? null : Object.fromEntries(
    labels.map((label, index) => [label, matches[index + 1]])
  );
};

const compile_pattern = (pattern) => {
  if (pattern in compiled_patterns) {
    return compiled_patterns[pattern];
  }

  const compiled_pattern = pattern
    .replace(/\+/g, "\\+")
    .replace(/\((.*?)\)/g, "(?:$1)?")
    .replace(/\{([^}]+)}/g, (_, groups) => {
      return `(${groups.replace(/,/g, "|")})`;
    })
    .replace(/\s\[([^\]]+)]/g, (_, groups) => {
      return `(?:\\s(${groups.replace(/,/g, "|")}))?`;
    })
    .replace(/\*\*/g, '"([\\w\\s-]+)"')
    .replace(/\s\*\?/g, "(?:\\s([\\w\\s-]+))?")
    .replace(/\*/g, "((?:#|\.)?[\\w\\s-]+)");

  compiled_patterns[pattern] = new RegExp(`^${compiled_pattern}$`);
  return compiled_patterns[pattern];
};

export default [
  {
    type: "selector",
    test: (selector) => {
      return /^screen\s+(width|height)\s/.test(selector);
    },
    transform: (selector) => {
      const { axis, lower, upper } = parse(selector, {
        pattern: "screen {width,height} (*)..(*)",
        labels: ["axis", "lower", "upper"]
      });

      if (axis && (lower || upper)) {
        const chunks = [
          lower ? `(min-${axis}:${lower})` : null,
          upper ? `(max-${axis}:${upper})` : null
        ];
        return "@media " + chunks.filter(Boolean).join("and");
      }

      return selector;
    }
  }
];
