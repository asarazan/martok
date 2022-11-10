import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { snakeToCamel } from "../NameGenerators";
import { MartokOutFile } from "../MartokOutFile";

export function processSnakeCase(files: MartokOutFile[]) {
  for (const file of files) {
    for (const klass of file.text.declarations) {
      if (!(klass instanceof Klass)) continue;
      processKlass(klass);
    }
  }
}

function processKlass(klass: Klass) {
  for (const member of [...klass.members, ...klass.ctor]) {
    const name = snakeToCamel(member.name);
    if (name !== member.name) {
      member.annotation = `@SerialName("${member.name}")`;
    }
    member.name = name;
  }
  for (const sub of klass.innerClasses) {
    processKlass(sub);
  }
}
