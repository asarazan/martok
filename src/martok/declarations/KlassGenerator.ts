import { Martok } from "../Martok";
import {
  EnumDeclaration,
  InterfaceDeclaration,
  InternalSymbolName,
  isEnumDeclaration,
  isInterfaceDeclaration,
  isPropertySignature,
  isTypeAliasDeclaration,
  isTypeReferenceNode,
  Node,
  PropertySignature,
  TypeAliasDeclaration,
  TypeElement,
  TypeNode,
} from "typescript";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { getMembers, getMemberType } from "../../typescript/MemberHelpers";
import { title } from "../NameGenerators";
import ConstructorParameter = kotlin.ConstructorParameter;
import { EnumGenerator } from "./EnumGenerator";
import { TaggedUnionGenerator } from "./TaggedUnionGenerator";

export type SupportedDeclaration =
  | TypeAliasDeclaration
  | InterfaceDeclaration
  | EnumDeclaration;

export type MemberOptions = {
  optional?: boolean;
  abstract?: boolean;
  forceName?: string;
  extendSealed?: Klass;
};

export class KlassGenerator {
  public readonly enums = new EnumGenerator(this.martok);
  public readonly tagged = new TaggedUnionGenerator(this.martok);

  private readonly checker = this.martok.program.getTypeChecker();
  public constructor(private readonly martok: Martok) {}

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

      if (this.enums.canGenerate(node)) {
        return this.enums.generate(name, node);
      }

      const alias = this.generateTypeAlias(node);
      if (alias) return alias;

      const members = getMembers(node, this.checker);
      const ctor = members.map((value) => {
        return this.generateMemberOrCtorArg(value, options);
      });
      const result = new Klass(name)
        .setAnnotation("@Serializable")
        .addModifier("data")
        .addInternalClasses(...this.generateInnerKlasses(members));
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
    let type = getMemberType(this.checker, node, { resolveLiterals: false });
    if (type === InternalSymbolName.Type) {
      type = title(name);
    }
    let annotation: string | undefined;
    if (this.martok.config.options?.dates?.namePattern?.exec(name)?.length) {
      type = "kotlinx.datetime.Instant";
      annotation =
        "@Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)";
    }
    const nullable = options?.optional || !!node.questionToken;
    const override =
      options?.extendSealed &&
      options.extendSealed.members.find((value) => value.name === name);
    return {
      name,
      type,
      annotation,
      mutability: "val",
      nullable,
      abstract: options?.abstract,
      value: nullable && !options?.abstract ? "null" : undefined,
      visibility: override ? "override" : undefined,
    };
  }

  public generateInnerKlasses(members: ReadonlyArray<TypeElement>): Klass[] {
    const anonymousTypes = members.filter(
      (value) => getMemberType(this.checker, value) === InternalSymbolName.Type
    );
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
      const members = getMembers(node, this.checker);
      const type = getMemberType(this.checker, node.type);
      if (type === InternalSymbolName.Type) return undefined; // TODO improve this.
      if (!members.length) {
        return `typealias ${name} = ${type}\n`;
      }
      if (isTypeReferenceNode(node.type)) {
        const ref = this.checker.getTypeFromTypeNode(node.type);
        const symbol = ref.aliasSymbol ?? ref.getSymbol();
        return `typealias ${name} = ${symbol?.name}`;
      }
    }
    return undefined;
  }
}
