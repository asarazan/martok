import { StandardFileHeader } from "../kotlin/StandardFileHeader";

export function sanitizeComparison(contents: string): string {
  return contents
    .replace(StandardFileHeader, "")
    .replace(/\n+/g, "\n")
    .replace(/ +/g, " ")
    .trim();
}
