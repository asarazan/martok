import _ from "lodash";
import { QualifiedName } from "./QualifiedName";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace kotlin {
  export type Visibility = "private" | "public" | "override";
  export type Mutability = "val" | "var";
  export type KlassType = "class" | "object";
  export type KlassModifier =
    | "abstract"
    | "data"
    | "enum"
    | "companion"
    | "sealed";

  export type GeneratorType =
    | "tagged"
    | "string-enum"
    | "ordinal-enum"
    | "enum"
    | "utility";

  export type EnumValue = {
    annotation?: string;
    name: string;
    args?: FunctionArgument[];
  };

  export type FunctionParameter = {
    name: string;
    type: string;
    nullable?: boolean;
    value?: string;
  };

  export type ConstructorParameter = FunctionParameter & {
    visibility?: Visibility;
    mutability?: Mutability;
    annotation?: string;
    abstract?: boolean;
    comment?: Komment;
    oldName?: string;
  };

  export type MemberDeclaration = ConstructorParameter;

  export type FunctionArgument = {
    name: string;
  };

  export type FunctionInvocation = {
    name: string;
    args?: FunctionArgument[];
  };

  export type KlassMetadata = {
    generators: GeneratorType[];
  };

  export type KotlinNumber = "Float" | "Double" | "Int" | "Long";

  export type Komment = {
    type: "block"; // no current support for line comments...
    value: string;
  };

  export class Klass {
    public name?: string;

    public annotation: string | undefined;
    public klassType: KlassType = "class";
    public modifiers: KlassModifier[] = [];

    public ctor: ConstructorParameter[] = [];
    public extends: FunctionInvocation | undefined;
    public implements: string[] = [];

    public enumValues: EnumValue[] = [];
    public members: MemberDeclaration[] = [];
    public innerClasses: Klass[] = [];
    public statements: string[] = [];
    public comment: Komment | undefined;

    // this is pretty hacky, and only gets bound as a very late pass.
    public qualifiedName?: QualifiedName;

    public meta: KlassMetadata = {
      generators: [],
    };

    public constructor(name?: string) {
      this.name = name;
    }

    public setKlassType(type: KlassType): this {
      this.klassType = type;
      return this;
    }

    public setAnnotation(annotation: string | undefined): this {
      this.annotation = annotation;
      return this;
    }

    public addModifier(modifier: KlassModifier): this {
      this.modifiers = _.compact([...this.modifiers, modifier]);
      return this;
    }

    public setModifiers(modifiers: KlassModifier[]): this {
      this.modifiers = modifiers;
      return this;
    }

    public addCtorArgs(...args: ConstructorParameter[]): this {
      this.ctor.push(...args);
      return this;
    }

    public setCtorArgs(...args: ConstructorParameter[]): this {
      this.ctor = [...args];
      return this;
    }

    public setExtends(ex: FunctionInvocation | undefined): this {
      this.extends = ex;
      return this;
    }

    public addImplements(...interfaces: string[]): this {
      this.implements.push(...interfaces);
      return this;
    }

    public setImplements(...interfaces: string[]): this {
      this.implements = interfaces;
      return this;
    }

    public addEnumValues(...values: EnumValue[]): this {
      this.enumValues.push(...values);
      return this;
    }

    public setEnumValues(...values: EnumValue[]): this {
      this.enumValues = values;
      return this;
    }

    public addMembers(...members: MemberDeclaration[]): this {
      this.members.push(...members);
      return this;
    }

    public setMembers(...members: MemberDeclaration[]): this {
      this.members = members;
      return this;
    }

    public addInnerClasses(...classes: Klass[]): this {
      this.innerClasses.push(...classes);
      return this;
    }

    public setInnerClasses(...classes: Klass[]): this {
      this.innerClasses = classes;
      return this;
    }

    public addStatements(...statements: string[]): this {
      this.statements.push(...statements);
      return this;
    }

    public setStatements(...statements: string[]): this {
      this.statements = statements;
      return this;
    }

    public addGeneratorTypes(...generators: GeneratorType[]): this {
      this.meta.generators.push(...generators);
      return this;
    }

    public setComment(comment: Komment | undefined): this {
      this.comment = comment;
      return this;
    }
  }
}
