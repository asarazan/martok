import { Martok } from "../Martok";
import { Node, Type } from "typescript";
import { kotlin } from "../../kotlin/Klass";
import _ from "lodash";
import { MartokOutFile } from "../MartokOutFile";
import Klass = kotlin.Klass;
import { QualifiedName } from "../../kotlin/QualifiedName";
import FunctionParameter = kotlin.FunctionParameter;

export class TypeReplacer {
  private readonly map = new Map<Type, Klass>();
  private readonly replacements = new Map<Klass, Klass>();
  private readonly allKlasses: Klass[] = [];

  public get initialTypeMap(): Map<Type, Klass> {
    return new Map(this.map);
  }

  public get finalTypeMap(): Map<Type, Klass> {
    const result = new Map<Type, Klass>();
    for (const key of this.map.keys()) {
      const value = this.lookupType(key)!;
      result.set(key, value);
    }
    return result;
  }

  public constructor(private martok: Martok) {}

  public register(node: Node, klass: Klass) {
    this.allKlasses.push(klass);
    const type = this.martok.checker.getTypeAtLocation(node)!;
    const existing = this.lookupType(type);
    const overwrite = !!klass.meta.generators.length;
    if (existing) {
      if (overwrite) {
        this.replace(existing, klass);
      } else {
        this.replace(klass, existing);
        this.map.set(type, klass);
      }
    } else {
      this.map.set(type, klass);
    }
  }

  public replace(existing: Klass, klass: Klass) {
    if (existing === klass) return;
    this.replacements.set(existing, klass);
  }

  public processOutput(files: MartokOutFile[]) {
    this.attachQualifiedNames(files);
    for (const file of files) {
      file.text.declarations = _.compact(
        file.text.declarations.map((value) => {
          if (value instanceof Klass) {
            return this.processKlass(value, file);
          } else return value;
        })
      );
    }
    files.filter((value) => !!value.text.declarations.length);
  }

  private attachQualifiedNames(files: MartokOutFile[]) {
    for (const file of files) {
      for (const decl of file.text.declarations) {
        if (decl instanceof Klass) {
          this.attachQualifiedName(decl, file);
        }
      }
    }
  }

  private attachQualifiedName(
    klass: Klass,
    file: MartokOutFile,
    outer?: Klass
  ) {
    if (!klass.name) return;
    klass.qualifiedName = new QualifiedName(
      klass.name,
      file.package,
      outer?.qualifiedName
    );
    for (const inner of klass.innerClasses) {
      this.attachQualifiedName(inner, file, klass);
    }
  }

  private processKlass(
    klass: kotlin.Klass,
    file: MartokOutFile
  ): kotlin.Klass | undefined {
    this.processMemberTypes(klass, file);
    const replaced = this.replacements.get(klass);
    if (!replaced) return klass;
    // Cull any klasses that have a replacement set.
    return undefined;
  }

  private processMemberTypes(klass: Klass, file: MartokOutFile) {
    const members = [
      ...klass.ctor.filter((value) => !!value.mutability),
      ...klass.members,
    ];
    for (const member of members) {
      this.processMember(member, klass, file);
    }
    for (const inner of klass.innerClasses) {
      this.processMemberTypes(inner, file);
    }
  }

  private processMember(
    member: FunctionParameter,
    klass: Klass,
    file: MartokOutFile
  ) {
    let allKlasses = file.text.declarations.filter(
      (value) => value instanceof Klass
    ) as Klass[];
    allKlasses = [
      ...allKlasses,
      ...allKlasses.flatMap((value) => value.innerClasses),
    ];

    const typeStr = member.type;
  }

  private lookupType(type: Type): Klass | undefined {
    const lookup = this.map.get(type);
    if (!lookup) return undefined;
    return this.lookupKlass(lookup);
  }

  private lookupKlass(lookup: Klass): Klass | undefined {
    let _lookup: Klass | undefined = lookup;
    let result = lookup;
    while (_lookup) {
      _lookup = this.replacements.get(_lookup);
      if (_lookup) result = _lookup;
    }
    return result;
  }
}
