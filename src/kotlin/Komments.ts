export function convertCommentText(comment: string): string {
  const linkRe = /\{\s*@link (\w*)\s*\}/g;
  comment = comment.replaceAll(linkRe, (substring: string, args: string) => {
    return `[${args}]`;
  });
  return comment;
}
