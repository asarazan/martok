import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { KlassPrinter } from "../../kotlin/KlassPrinter";

describe("Basic Kotlin Formatting", () => {
  it("Utilizes all formatting correctly.", () => {
    const k = new Klass("net.sarazan.martok", "Foob")
      .setAnnotation("@Serializable")
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
      .addInternalClasses(
        new Klass("net.sarazan.martok", "Barb")
          .setAnnotation("@Serializable")
          .addCtorArgs({
            name: "whatever",
            type: "Hi",
          })
      )
      .addStatements(`// statement goes here`);
    const print = new KlassPrinter().print(k);
    console.log(print);
  });
});
