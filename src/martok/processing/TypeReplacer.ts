import { Martok } from "../Martok";
import {
  isTypeAliasDeclaration,
  isTypeReferenceNode,
  Node,
  Type,
  TypeNode,
} from "typescript";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import ts = require("typescript");
import { over } from "lodash";

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
