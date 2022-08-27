import { Martok } from "../Martok";
import { Node, Type } from "typescript";
import { kotlin } from "../../kotlin/Klass";
import _ from "lodash";
import { MartokOutFile } from "../MartokOutFile";
import Klass = kotlin.Klass;

export class TypeReplacer {
  private readonly map = new Map<Type, Klass>();
  private readonly replacements = new Map<Klass, Klass>();

  public get initialTypeMap(): Map<Type, Klass> {
    return new Map(this.map);
  }

  public get finalTypeMap(): Map<Type, Klass> {
    const result = new Map<Type, Klass>();
    for (const key of this.map.keys()) {
      const value = this.lookup(key)!;
      result.set(key, value);
    }
    return result;
  }

  public constructor(private martok: Martok) {}

  public register(node: Node, klass: Klass) {
    const type = this.martok.checker.getTypeAtLocation(node);
    const existing = this.lookup(type);
    const overwrite = !!klass.meta.generators.length;
    if (existing) {
      if (overwrite) {
        this.replacements.set(existing, klass);
      } else {
        this.replacements.set(klass, existing);
        this.map.set(type, klass);
      }
    } else {
      this.map.set(type, klass);
    }
  }

  public processOutput(files: MartokOutFile[]) {
    // TODO process the imports... likely by fuzzy string matching or something.
    for (const file of files) {
      file.text.declarations = _.compact(
        file.text.declarations.map((value) => {
          if (typeof value === "string") return value;
          const final = this.replacements.get(value);
          // Cull any klasses that have a replacement set.
          return final ? undefined : value;
        })
      );
    }
    files.filter((value) => !!value.text.declarations.length);
  }

  private lookup(type: Type): kotlin.Klass | undefined {
    let lookup = this.map.get(type);
    if (!lookup) return undefined;
    let result = lookup;
    while (lookup) {
      lookup = this.replacements.get(lookup);
      if (lookup) result = lookup;
    }
    return result;
  }
}
