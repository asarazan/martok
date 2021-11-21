export function sanitizeComparison(contents: string): string {
  return contents.replace(/\n+/g, "\n").replace(/ +/g, " ").trim();
}
