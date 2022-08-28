import { Martok } from "../Martok";
import { Node, Type, TypeNode } from "typescript";
import { kotlin } from "../../kotlin/Klass";
import _ from "lodash";
import { MartokOutFile } from "../MartokOutFile";
import Klass = kotlin.Klass;

export class TypeReplacer {
  private readonly map = new Map<TypeNode, Klass>();
  private readonly replacements = new Map<Klass, Klass>();

  public get initialTypeMap(): Map<TypeNode, Klass> {
    return new Map(this.map);
  }

  public get finalTypeMap(): Map<TypeNode, Klass> {
    const result = new Map<TypeNode, Klass>();
    for (const key of this.map.keys()) {
      const value = this.lookup(key)!;
      result.set(key, value);
    }
    return result;
  }

  public constructor(private martok: Martok) {}

  public register(node: Node, klass: Klass) {
    const type = this.martok.checker.getTypeAtLocation(node)!;
    // literally cannot believe this works lmao.
    const tn = this.martok.checker.typeToTypeNode(type, node, undefined)!;
    const existing = this.lookup(tn);
    const overwrite = !!klass.meta.generators.length;
    if (existing) {
      if (overwrite) {
        this.replacements.set(existing, klass);
      } else {
        this.replacements.set(klass, existing);
        this.map.set(tn, klass);
      }
    } else {
      this.map.set(tn, klass);
    }
  }

  public processOutput(files: MartokOutFile[]) {
    const klassMap = this.buildKlassMap(files);
    for (const file of files) {
      file.text.declarations = _.compact(
        file.text.declarations.map((value) => {
          if (typeof value === "string") return value;
          return this.processKlass(value);
        })
      );
    }
    files.filter((value) => !!value.text.declarations.length);
  }

  private processKlass(klass: Klass): Klass | undefined {
    const final = this.replacements.get(klass);
    if (!final) return klass;
    // Cull any klasses that have a replacement set.
    return undefined;
  }

  private lookup(type: TypeNode): kotlin.Klass | undefined {
    let lookup = this.map.get(type);
    if (!lookup) return undefined;
    let result = lookup;
    while (lookup) {
      lookup = this.replacements.get(lookup);
      if (lookup) result = lookup;
    }
    return result;
  }

  private buildKlassMap(files: MartokOutFile[]): Record<string, Klass> {
    const result: Record<string, Klass> = {};
    for (const file of files) {
      this._buildKlassMap(file.text.declarations, file.package, result);
    }
    return result;
  }

  private _buildKlassMap(
    klasses: (Klass | string)[],
    pkg: string,
    result: Record<string, Klass>
  ) {
    for (const klass of klasses) {
      if (typeof klass === "string") continue;
      result[`${pkg}.${klass.name!}`] = klass;
      this._buildKlassMap(
        klass.internalClasses,
        `${pkg}.${klass.name}`,
        result
      );
    }
    return result;
  }
}
