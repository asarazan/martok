export function title(str: string) {
  return str.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}

// Adapted from https://stackoverflow.com/a/30521308
export function pascalToSnake(str: string): string {
  return str
    .replace(/\.?_*([A-Z]+)/g, (letter, index) => {
      return "_" + index.toLowerCase();
    })
    .replace(/^_/, "");
}

export function snakeToCamel(str: string): string {
  return str
    .toLowerCase()
    .replace(/([-_]+[a-z])/g, (group) =>
      group.toUpperCase().replace(/-+/, "").replace(/_+/, "")
    );
}
