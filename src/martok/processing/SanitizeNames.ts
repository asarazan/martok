import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { MartokOutFile } from "../MartokOutFile";
import _ from "lodash";

export function sanitizeName(name: string): string {
  return name.replace(/:/g, "_").replace(/"/g, "");
}

export function processOldNames(files: MartokOutFile[]) {
  for (const file of files) {
    for (const klass of file.text.declarations) {
      if (!(klass instanceof Klass)) continue;
      processKlass(klass);
    }
  }
}

function processKlass(klass: Klass) {
  for (const member of [...klass.members, ...klass.ctor]) {
    if (member.oldName && member.name !== member.oldName) {
      const name = member.oldName.replace(/"/g, "");
      member.annotations = [
        `@SerialName("${name}")`,
        ...(member.annotations ?? []),
      ];
    }
  }
  for (const sub of klass.innerClasses) {
    processKlass(sub);
  }
}
