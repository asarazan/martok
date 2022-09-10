export class QualifiedName {
  public readonly string: string;
  public readonly packageRelativeString: string;
  public readonly outermost: QualifiedName;

  public constructor(
    public readonly name: string,
    public readonly pkg: string,
    public readonly outer?: QualifiedName
  ) {
    const prefix = this.outer ? this.outer.string : this.pkg;
    this.string = `${prefix}.${this.name}`;
    this.packageRelativeString = this.string.substr(this.pkg.length + 1);
    let outermost = this as QualifiedName;
    while (outermost.outer) {
      outermost = outermost.outer;
    }
    this.outermost = outermost;
  }
}
