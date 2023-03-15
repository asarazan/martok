/* eslint-disable @typescript-eslint/ban-ts-comment */
import ts, { Statement, Node } from "typescript";
import { Martok } from "../Martok";
import { areNodesEqual } from "./NodeEquality";

export function MapTransformer(
  martok: Martok
): ts.TransformerFactory<ts.SourceFile> {
  const allStatements: Statement[] = [];
  martok.config.files.forEach((file) => {
    const source = martok.program.getSourceFile(file);
    if (!source) return;
    allStatements.push(...source.statements);
  });
  return (context) => {
    const importStatements: ts.ImportDeclaration[] = [];
    const visit: ts.Visitor = (node) => {
      if (!ts.isSourceFile(node)) {
        for (const originalStatement of allStatements) {
          if (
            !ts.isTypeAliasDeclaration(originalStatement) ||
            node === originalStatement
          )
            continue;
          if (
            ts.isPropertySignature(node) &&
            areNodesEqual(martok, node, originalStatement)
          ) {
            const ret = getNode(context, node, originalStatement);
            if (ret.importStatement) {
              importStatements.push(ret.importStatement);
            }
            return ret.newNode;
          }
        }
      } else {
        const sourceFile = ts.visitEachChild(
          node,
          (child) => visit(child),
          context
        );
        return context.factory.updateSourceFile(sourceFile, [
          ...importStatements,
          ...sourceFile.statements,
        ]);
      }
      return ts.visitEachChild(node, (child) => visit(child), context);
    };

    return (node) => ts.visitNode(node, visit);
  };
}

type NodeReplacement = {
  newNode: Node;
  importStatement?: ts.ImportDeclaration;
};

function getNode(
  context: ts.TransformationContext,
  node: ts.PropertySignature,
  nodeReference: ts.TypeAliasDeclaration
): NodeReplacement {
  const externalFile = nodeReference.getSourceFile();
  const file = node.getSourceFile();
  let importStatement = undefined;
  if (externalFile.fileName !== file.fileName) {
    importStatement = context.factory.createImportDeclaration(
      undefined,
      undefined,
      context.factory.createImportClause(
        false,
        undefined,
        context.factory.createNamedImports([
          context.factory.createImportSpecifier(undefined, nodeReference.name),
        ])
      ),
      context.factory.createStringLiteral(externalFile.fileName)
    );
  }
  const newNode = context.factory.updatePropertySignature(
    node,
    node.modifiers,
    node.name,
    node.questionToken,
    nodeReference.type
  );

  return {
    newNode,
    importStatement,
  };
}
