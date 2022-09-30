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

  public constructor(private martok: Martok) {}

  public register(node: Node, klass: Klass) {
    this.allKlasses.push(klass);
    for (const inner of klass.innerClasses) {
      this.allKlasses.push(inner);
    }
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
      const imports = _.uniq(file.text.imports);
      file.text.imports = imports;
    }
    _.remove(files, (value) => !value.text.declarations.length);
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
      file.pkg,
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
      this.processMember(member, file);
    }
    for (const inner of klass.innerClasses) {
      this.processMemberTypes(inner, file);
    }
    this.cleanUpReplacementImports(file);
  }

  private cleanUpReplacementImports(file: MartokOutFile) {
    for (const imp of file.text.imports) {
      if (!imp) continue;
      const ref = /import (.*)/.exec(imp)![1];
      const klass = this.allKlasses.find(
        (value) => value.qualifiedName?.string === ref
      );
      if (!klass) continue;
      const replace = this.lookupKlass(klass);
      if (replace && replace !== klass) {
        _.pull(file.text.imports, imp);
      }
    }
  }

  private processMember(member: FunctionParameter, file: MartokOutFile) {
    let type = member.type;
    type = /List<(.*)>/.exec(type)?.[1] ?? type;
    if (type !== member.type) {
      console.log(`Found a list...`);
    }

    // First we look for any properties that reference a klass we've seen.
    // Unfortunately we're hacking shit together to also identify lists.
    const matches = this.allKlasses.filter((value) => value.name === type);
    let match = matches.find(
      (value) => value.qualifiedName!.string === `${file.pkg}.${type}`
    );

    // Now let's process it through our package name, and through any imported package names.
    // We will cross-reference with the matches' qualified names to find a match.
    if (!match) {
      const imports = file.text.imports.filter((value) =>
        value?.endsWith(`.${type}`)
      );
      if (imports.length) {
        match = matches.find((value) => {
          return value.name === type;
        });
      }
    }
    if (!match) {
      return;
    }

    // We will then do a replacement-map lookup to see if we need to replace.
    // If so, we will need to change the member type name, as well as the relevant import, if necessary.
    const replacement = this.lookupKlass(match);
    if (!replacement?.name) return;

    const isInnerKlass = !!replacement.qualifiedName?.outer;
    let replacementName = replacement.name;
    if (isInnerKlass) {
      replacementName = replacement.qualifiedName!.packageRelativeString;
    }
    member.type = member.type.replace(match.name!, replacementName);

    const isSamePackage = replacement.qualifiedName?.pkg === file.pkg;
    if (!isSamePackage) {
      const addImport = `import ${replacement.qualifiedName!.outermost.string}`;
      file.text.imports.push(addImport);
    }

    // We don't remove the old import until the end,
    // since we (unwisely) use it in subsequent calls to this function.
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
