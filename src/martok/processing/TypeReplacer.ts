import { Martok } from "../Martok";
import { isTypeReferenceNode, Node, TypeNode } from "typescript";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import ts = require("typescript");

export class TypeReplacer {
  private readonly map = new Map<ts.Symbol, Klass>();
  private readonly replacements = new Map<Klass, Klass>();

  public get initialTypeMap(): Map<ts.Symbol, Klass> {
    return new Map(this.map);
  }

  public get finalTypeMap(): Map<ts.Symbol, Klass> {
    const result = new Map<ts.Symbol, Klass>();
    for (const key of this.map.keys()) {
      const value = this.lookup(key)!;
      result.set(key, value);
    }
    return result;
  }

  public constructor(private martok: Martok) {}

  // TODO figure out how to resolve TypeReferences :-( :-( :-(
  public register(type: Node, klass: Klass) {
    let symbol = this.martok.checker.symbol(type);
    if (!symbol) return;
    symbol = this.martok.checker.getAliasedSymbol(symbol) ?? symbol;
    const existing = this.lookup(symbol);
    if (existing) {
      this.replacements.set(existing, klass);
    } else {
      this.map.set(symbol, klass);
    }
  }

  private lookup(type: ts.Symbol): kotlin.Klass | undefined {
    let lookup = type instanceof Klass ? type : this.map.get(type);
    if (!lookup) return undefined;
    let result = lookup;
    while (lookup) {
      lookup = this.replacements.get(lookup);
      if (lookup) result = lookup;
    }
    return result;
  }
}
