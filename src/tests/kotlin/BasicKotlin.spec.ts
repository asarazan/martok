import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { KlassPrinter } from "../../kotlin/KlassPrinter";

const compare = `@Serializable
class Foob(
  private val foo: Foo?
) : Hateful() {

  override val Hallo: Double

  @Serializable
  class Barb(
    whatever: Hi
  )
  // statement goes here
}
`;

describe("Basic Kotlin Formatting", () => {
  it("Utilizes all formatting correctly.", () => {
    const k = new Klass("Foob")
      .addAnnotation("@Serializable")
      .addCtorArgs({
        name: "foo",
        type: "Foo",
        mutability: "val",
        nullable: true,
        visibility: "private",
      })
      .setExtends({
        name: "Hateful",
      })
      .addMembers({
        visibility: "override",
        name: "Hallo",
        type: "Double",
      })
      .addInnerClasses(
        new Klass("Barb").addAnnotation("@Serializable").addCtorArgs({
          name: "whatever",
          type: "Hi",
        })
      )
      .addStatements(`// statement goes here`);
    const print = KlassPrinter.instance.print(k);
    expect(print).toEqual(compare);
  });
});
