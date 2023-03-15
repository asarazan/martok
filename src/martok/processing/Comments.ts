/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getJSDocTags,
  getTextOfJSDocComment,
  JSDoc,
  JSDocComment,
} from "typescript";
import ts = require("typescript");
import { kotlin } from "../../kotlin/Klass";
import Komment = kotlin.Komment;
import { convertCommentText } from "../../kotlin/Komments";
import _ from "lodash";
import { Martok } from "../Martok";
import { areNodesEqual } from "./NodeEquality";
import { getPropertyName } from "./PropertyName";

export function extractComment(node: ts.Node): Komment | undefined {
  const jsdoc = (node as any).jsDoc?.[0] as JSDoc | undefined;
  if (jsdoc) {
    let text = [getTextOfJSDocComment(jsdoc?.comment)];
    text.push(...getJSDocTags(node).map((value) => `${value.getText()}`));
    text = _.compact(text);
    if (!text.length) return undefined;
    const result = convertCommentText(text.join("\n")).trim();
    return {
      type: "block",
      value: result,
    };
  }
}

export type JsDocProperty = {
  name: string;
  jsdoc: JSDocComment[];
  node: ts.Node;
};

/**
 * This pull all the JsDocs included in this statement and any referenced statements.
 *
 * @param martok Martok
 * @param statement A typescript statement
 * @returns An object representing where this document should be placed
 */
export function extractJsDocs(
  martok: Martok,
  statement: ts.Statement
): JsDocProperty[] {
  const visited = new Set<ts.Node>();
  const docs: JsDocProperty[] = [];
  visit(statement);
  statement.forEachChild(visit);
  function visit(node: ts.Node) {
    if (visited.has(node)) return;
    visited.add(node);

    const count = node.getChildCount();

    if (count > 0) {
      ts.forEachChild(node, visit);
    }

    const ref = martok.checker.getSymbolAtLocation(node);
    if (ref) {
      const t = martok.checker.getDeclaredTypeOfSymbol(ref);
      t.symbol?.declarations?.forEach(visit);
    }

    const jsdoc = (node as any).jsDoc;
    if (jsdoc) {
      if (ts.isPropertySignature(node) || ts.isTypeAliasDeclaration(node)) {
        docs.push({
          name: getPropertyName(node.name) ?? "",
          jsdoc,
          node,
        });
      }
    }
  }
  return docs;
}

/**
 * This function takes in a statement and a list of JsDocs that should be inserted into the statement.
 * It chooses where to insert JsDocs by checking each property and compairing the node at the property is
 * equal to the node that the comment originally appeared on.
 *
 * If that's the case we can assume that these properties have the same meaning and can place the comment
 * in the same place.
 *
 * @param statement
 * @param docs
 */
export function insertJsDocs(
  martok: Martok,
  statement: ts.Statement,
  docs: JsDocProperty[]
) {
  visit(statement);
  statement.forEachChild(visit);
  function visit(node: ts.Node) {
    const count = node.getChildCount();

    if (count > 0) {
      ts.forEachChild(node, visit);
    }

    if (ts.isPropertySignature(node) || ts.isTypeAliasDeclaration(node)) {
      const doc = docs.find((value) => value.name === node.name.getText());
      if (!doc) return;

      // Make sure nodes are still equivalent before attaching our JsDoc
      if (!areNodesEqual(martok, doc.node, node)) return;

      (node as any).jsDoc = doc.jsdoc;
    }
  }
}
