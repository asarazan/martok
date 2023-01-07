import { Martok } from "../Martok";
import {
  Declaration,
  EnumDeclaration,
  getCommentRange,
  getJSDocTags,
  InterfaceDeclaration,
  InternalSymbolName,
  isArrayTypeNode,
  isEnumDeclaration,
  isInterfaceDeclaration,
  isJSDoc,
  isParenthesizedTypeNode,
  isPropertySignature,
  isTypeAliasDeclaration,
  isTypeReferenceNode,
  JSDoc,
  Node,
  PropertySignature,
  TypeAliasDeclaration,
  TypeElement,
  TypeNode,
} from "typescript";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import {
  getMembers,
  getMemberType,
  MemberTypeOptions,
} from "../../typescript/MemberHelpers";
import { title } from "../NameGenerators";
import ConstructorParameter = kotlin.ConstructorParameter;
import { EnumGenerator } from "./EnumGenerator";
import { TaggedUnionGenerator } from "./TaggedUnionGenerator";
import { UtilityGenerator } from "./UtilityGenerator";
import { extractComment } from "../processing/Comments";
import { sanitizeName } from "../processing/SanitizeNames";

export type SupportedDeclaration =
  | TypeAliasDeclaration
  | InterfaceDeclaration
  | EnumDeclaration;

export type MemberOptions = {
  optional?: boolean;
  abstract?: boolean;
  forceName?: string;
  extendSealed?: Klass;
  excludeAnonymousTypes?: string[];
} & MemberTypeOptions;

export class KlassGenerator {
  public readonly enums = new EnumGenerator(this.martok);
  public readonly tagged = new TaggedUnionGenerator(this.martok);
  public readonly utility = new UtilityGenerator(this.martok);

  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) { }

  public static isSupportedDeclaration(
    node: Node
  ): node is SupportedDeclaration {
    return (
      isTypeAliasDeclaration(node) ||
      isInterfaceDeclaration(node) ||
      isEnumDeclaration(node)
    );
  }

  public generate(
    node: SupportedDeclaration | TypeNode,
    options?: MemberOptions
  ): Klass | string {
    const result = this._generate(node, options);
    if (result instanceof Klass) {
      if (options?.performTypeReplacement !== false) {
        this.martok.typeReplacer.register(node, result);
      }
      result.setComment(extractComment(node));
    }
    return result;
  }

  private _generate(
    node: SupportedDeclaration | TypeNode,
    options?: MemberOptions
  ): Klass | string {
    if (isParenthesizedTypeNode(node)) {
      node = node.type!;
    }
    if (isArrayTypeNode(node)) {
      let result = this.generate(node.elementType, options);
      if (typeof result === "string") {
        result = `${result}Item`;
      } else {
        result.name = `${result.name}Item`;
      }
      return result;
    }
    try {
      let name = options?.forceName;
      if (!name && KlassGenerator.isSupportedDeclaration(node)) {
        name = node.name.escapedText.toString()!;
      }
      if (!name) {
        throw new Error("Can't determine name");
      }
      this.martok.pushNameScope(name);

      const asTagged = this.tagged.generateKlass(name, node);
      if (asTagged) return asTagged;

      const asEnum = this.enums.generate(name, node);
      if (asEnum) return asEnum;

      if (isTypeAliasDeclaration(node)) {
        if (isArrayTypeNode(node.type)) {
          const result = this.generate(node.type, {
            forceName: name,
            ...options,
          });
          this.martok.additionalDeclarations.push(
            `typealias ${name} = List<${(result as Klass).name}>`
          );
          return result;
        }
        const typeAsEnum = this.enums.generate(name, node.type);
        if (typeAsEnum) return typeAsEnum;

        const asUtility = this.utility.generate(name, node.type);
        if (asUtility) return asUtility;

        const alias = this.generateTypeAlias(node);
        if (alias) return alias;
      }

      const members = getMembers(node, this.martok);
      const ctor = members.map((value) => {
        return this.generateMemberOrCtorArg(value, options);
      });
      const result = new Klass(name)
        .addAnnotation("@Serializable")
        .addInnerClasses(
          ...this.generateInnerKlasses(members, options?.excludeAnonymousTypes)
        );
      if (members.length) {
        result.addModifier("data");
      }
      if (options?.extendSealed) {
        result.setExtends({
          name: options.extendSealed.name!,
        });
        result.addCtorArgs(
          ...options.extendSealed.members
            .filter(
              (value) => !ctor.find((value1) => value1.name === value.name)
            )
            .map((value) => {
              return {
                ...value,
                visibility: "override",
                abstract: false,
              } as ConstructorParameter;
            })
        );
      }
      result.addCtorArgs(...ctor);
      return result;
    } finally {
      this.martok.popNameScope();
    }
  }

  public generateProperty(
    property: PropertySignature,
    options?: MemberOptions
  ): Klass {
    const name = title(property.name!.getText());
    const type = property.type!;
    return this.generate(type, {
      ...options,
      forceName: name,
    }) as Klass;
  }

  public generateMemberOrCtorArg(
    node: TypeElement,
    options?: MemberOptions
  ): ConstructorParameter {
    const name = node.name!.getText();
    const annotations: string[] = [];
    let type = getMemberType(this.martok, node, {
      followReferences: options?.followReferences ?? false,
    });
    if (type === InternalSymbolName.Type) {
      type = title(name);
    } else if (type === `List<${InternalSymbolName.Type}>`) {
      type = `List<${title(name)}Item>`;
    }
    const doc = getJSDocTags(node);
    if (type === "String") {
      const forceDateTime = doc.find(
        (value) => value.tagName.text.toLowerCase() === "datetime"
      );
      const forceDate = doc.find(
        (value) => value.tagName.text.toLowerCase() === "date"
      );
      if (forceDateTime) {
        type = "kotlinx.datetime.Instant";
        annotations.push(
          "@Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)"
        );
      } else if (forceDate) {
        type = "kotlinx.datetime.LocalDate";
        annotations.push(
          "@Serializable(with = kotlinx.datetime.serializers.LocalDateIso8601Serializer::class)"
        );
      }
    }
    const nullable = options?.optional || !!node.questionToken;
    const override =
      options?.extendSealed &&
      options.extendSealed.members.find((value) => value.name === name);
    const comment = extractComment(node);
    const sanitizedName = sanitizeName(name);
    return {
      name: sanitizedName,
      oldName: name,
      type,
      annotations,
      mutability: "val",
      nullable,
      abstract: options?.abstract,
      value: nullable && !options?.abstract ? "null" : undefined,
      visibility: override ? "override" : undefined,
      comment,
    };
  }

  public generateInnerKlasses(
    members: ReadonlyArray<TypeElement>,
    excludeAnonymousTypes?: string[]
  ): Klass[] {
    const anonymousTypes = members.filter((value) => {
      const type = getMemberType(this.martok, value);
      const name = value.name?.getText() ?? "";
      if (excludeAnonymousTypes?.includes(name)) return false;
      return (
        type === InternalSymbolName.Type ||
        type === `List<${InternalSymbolName.Type}>`
      );
    });
    if (!anonymousTypes?.length) return [];
    return anonymousTypes.flatMap((value) => {
      if (isPropertySignature(value)) {
        return this.generateProperty(value);
      }
      if (KlassGenerator.isSupportedDeclaration(value)) {
        return this.generate(value) as Klass;
      }
      throw new Error(`Can't handle inner type ${value.kind}`);
    });
  }

  private generateTypeAlias(
    node: SupportedDeclaration | TypeNode
  ): string | undefined {
    if (isTypeAliasDeclaration(node)) {
      const name = node.name.escapedText.toString();
      const members = getMembers(node, this.martok);
      const type = getMemberType(this.martok, node.type);
      const ref = this.checker.getTypeFromTypeNode(node.type);
      if (
        type === InternalSymbolName.Type ||
        type === `List<${InternalSymbolName.Type}>`
      ) {
        return undefined; // TODO improve this.
      }
      // TODO fix dirty hack for empty types that turn into self-aliases.
      if (!members.length && name !== type) {
        return `typealias ${name} = ${type}\n`;
      }
      if (isTypeReferenceNode(node.type)) {
        const symbol = ref.aliasSymbol ?? ref.getSymbol();
        return `typealias ${name} = ${symbol?.name}`;
      }
    }
    return undefined;
  }
}
