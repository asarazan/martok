export function title(str: string) {
  return str.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}

export function pascalToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter, index) => {
    return index == 0 ? letter.toLowerCase() : "_" + letter.toLowerCase();
  });
}
