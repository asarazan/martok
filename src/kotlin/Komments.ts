import _ from "lodash";

export function convertCommentText(comment: string): string {
  const linkRe = /\{\s*@link (\w*)\s*\}/g;
  comment = _.replace(comment, linkRe, (substring: string, args: string) => {
    return `[${args}]`;
  });
  return comment;
}
