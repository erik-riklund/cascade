import type { Plugin } from "~/index.ts";

export default {
  type: "property",
  test: (_key, value) => {
    return typeof value === "string" && value.includes("$");
  },
  transform: (key, value) => [
    key,
    (value as string).replace(/\$(\w+(-\w+)*)/g, "var(--$1)")
  ]
} satisfies Plugin;
