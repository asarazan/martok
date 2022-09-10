export class QualifiedName {
  public readonly string: string;

  public constructor(
    public readonly name: string,
    public readonly pkg: string,
    public readonly outer?: QualifiedName
  ) {
    const prefix = this.outer ? this.outer.string : this.pkg;
    this.string = `${prefix}.${this.name}`;
  }
}
