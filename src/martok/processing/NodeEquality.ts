import ts from "typescript";
import { Martok } from "../Martok";

const mem = new Map<ts.Node, string>();

/**
 * Checks node equality by compairing normalized versions of the node text.
 * A potentially better solution would be to recursively parse the AST and check types,
 * but this solution does the trick for now.
 */
export function areNodesEqual(martok: Martok, a: ts.Node, b: ts.Node): boolean {
  const getTypeString = (node: ts.Node) => {
    if (mem.has(node)) return mem.get(node)!;
    const res = martok.checker
      .typeToString(
        martok.checker.getTypeAtLocation(node),
        node,
        ts.TypeFormatFlags.InTypeAlias |
          ts.TypeFormatFlags.NoTypeReduction |
          ts.TypeFormatFlags.NoTruncation |
          ts.TypeFormatFlags.UseFullyQualifiedType
      )
      .replace(/[\s \n]/g, "")
      .trim();
    mem.set(node, res);
    return res;
  };
  return getTypeString(a) === getTypeString(b);
}
