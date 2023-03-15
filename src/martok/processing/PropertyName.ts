import ts, { PropertyName } from "typescript";

export function getPropertyName(prop?: PropertyName): string | undefined {
  if (!prop) return undefined;
  if (
    prop.kind === ts.SyntaxKind.Identifier ||
    prop.kind === ts.SyntaxKind.PrivateIdentifier
  ) {
    if (typeof prop.escapedText === "string") return prop.escapedText;
    return undefined;
  } else if (
    prop.kind === ts.SyntaxKind.StringLiteral ||
    prop.kind === ts.SyntaxKind.NumericLiteral
  ) {
    return prop.text;
  } else {
    return undefined;
  }
}

export function getEntityName(name: ts.EntityName): string {
  if (ts.isIdentifier(name)) {
    return name.text;
  } else {
    return `${getEntityName(name.left)}.${name.right.text}`;
  }
}
