export function title(str: string) {
  return str.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}

export function pascalToSnake(str: string): string {
  return str
    .replace(/\.?_*([A-Z]+)/g, (letter, index) => {
      return "_" + index.toLowerCase();
    })
    .replace(/^_/, "");
}
