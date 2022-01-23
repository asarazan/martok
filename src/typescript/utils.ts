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
