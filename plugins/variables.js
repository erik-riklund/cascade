export default {
  type: "property",
  test: (value) => {
    return value.includes("$");
  },
  transform: (value) => {
    return value.replace(/\$(\w+(-\w+)*)/g, "var(--$1)");
  }
};
