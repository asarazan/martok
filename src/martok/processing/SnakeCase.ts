import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { snakeToCamel } from "../NameGenerators";

export function processSnakeCase(klass: Klass) {
  for (const member of [...klass.members, ...klass.ctor]) {
    const name = snakeToCamel(member.name);
    if (name !== member.name) {
      member.annotation = `@SerializedName("${member.name}")`;
    }
    member.name = name;
  }
  console.log(`Hey`);
}
