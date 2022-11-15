import { sanitizeName } from "./processing/SanitizeNames";

export function title(str: string) {
  const camel = snakeToCamel(sanitizeName(str));
  return camel.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}

export function snakeToPascal(str: string): string {
  return title(str);
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
  return str.replace(/(?!^)_+(.)/g, (_, char) => char.toUpperCase());
}
