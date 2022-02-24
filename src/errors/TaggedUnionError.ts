export class TaggedUnionError extends Error {
  constructor(file: string, typeName: string) {
    super(`Error processing tagged union in ${file}:\n${typeName}`);
  }
}
