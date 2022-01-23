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
  TypeReferenceNode,
} from "typescript";
import { MemberOptions } from "./MemberBasedGenerator";
import { kotlin } from "../../kotlin/Klass";
import Klass = kotlin.Klass;
import { getMembers, getMemberType } from "../../typescript/MemberHelpers";
import { title } from "../NameGenerators";
import ConstructorParameter = kotlin.ConstructorParameter;
import { EnumGenerator } from "./EnumGenerator";

export type SupportedDeclaration =
  | TypeAliasDeclaration
  | InterfaceDeclaration
  | EnumDeclaration;

export class KlassGenerator {
  public readonly enums = new EnumGenerator(this.martok);

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
      let name: string;
      if (KlassGenerator.isSupportedDeclaration(node)) {
        name = node.name.escapedText.toString();
      } else {
        name = options!.forceName!;
      }
      this.martok.pushNameScope(name);

      const alias = this.generateTypeAlias(node);
      if (alias) return alias;

      if (this.enums.canGenerate(node)) {
        return this.enums.generateKlass(name, node);
      }

      const members = getMembers(node, this.checker);
      return new Klass("", name)
        .setAnnotation("@Serializable")
        .addModifier("data")
        .addCtorArgs(
          ...members.map((value) => {
            return this.generateCtorArg(value, options);
          })
        )
        .addInternalClasses(...this.generateInnerKlasses(members));
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

  private generateCtorArg(
    node: TypeElement,
    options?: MemberOptions
  ): ConstructorParameter {
    const name = node.name!.getText();
    let type = getMemberType(this.checker, node);
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
    return {
      name,
      type,
      annotation,
      mutability: "val",
      nullable,
      abstract: options?.abstract,
      value: nullable ? "null" : undefined,
    };
  }

  private generateInnerKlasses(members: ReadonlyArray<TypeElement>): Klass[] {
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
      if (!members.length) {
        return `typealias ${name} = ${getMemberType(
          this.checker,
          node.type
        )}\n`;
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
