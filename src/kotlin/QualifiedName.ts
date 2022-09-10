export class QualifiedName {
  public readonly toString: string;

  public constructor(
    public readonly name: string,
    public readonly pkg: string,
    public readonly outer?: QualifiedName
  ) {
    const prefix = this.outer ? this.outer.toString : this.pkg;
    this.toString = `${prefix}.${this.name}`;
  }
}
