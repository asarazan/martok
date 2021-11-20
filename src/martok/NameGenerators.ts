export function innerClassName(memberName: string): string {
  return title(memberName);
}

export function title(str: string) {
  return str.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase();
  });
}
