import { ErrorDiscriminate } from "../typescript/UnionHelpers";

export class TaggedUnionError extends Error {
  constructor() {
    super(ErrorDiscriminate);
  }
}
