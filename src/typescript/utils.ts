export function all<T>(
  arr: ReadonlyArray<T>,
  fn: (value: T) => boolean
): boolean {
  for (const value of arr) {
    if (!fn(value)) return false;
  }
  return true;
}
