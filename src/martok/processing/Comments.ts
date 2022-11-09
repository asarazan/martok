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
