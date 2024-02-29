import ts from "typescript";
import util from "util";
import { glob } from "glob";
import fs from "fs";
import path from "path";

export function all<T>(
  arr: ReadonlyArray<T>,
  fn: (value: T) => boolean
): boolean {
  for (const value of arr) {
    if (!fn(value)) return false;
  }
  return true;
}

export function joinArray<T>(arr: T[], join: T): T[] {
  const result = [] as T[];
  arr.forEach((value, index) => {
    result.push(value);
    if (index < arr.length - 1) {
      result.push(join);
    }
  });
  return result;
}

export function hasTypeArguments(
  node: any
): node is ts.ExpressionWithTypeArguments {
  return node && node.typeArguments && node.typeArguments.length > 0;
}

export async function resolveFiles(args: {
  path: string;
}): Promise<{ files: string[]; rootDir: string }> {
  const getFiles = util.promisify(glob);
  let isDir = false;
  try {
    isDir = (await fs.promises.lstat(args.path)).isDirectory();
  } catch (e: unknown) {
    console.log(`Using pattern lookup for ${args.path}...`);
  }
  const pattern = isDir ? `${args.path}/**/*.{ts,d.ts}` : args.path;
  const files = await getFiles(pattern);
  const rootDir = path
    .resolve(isDir ? args.path : path.dirname(args.path))
    .replace("/**", "");
  return {
    files: files.map((file) => path.resolve(file)),
    rootDir,
  };
}
