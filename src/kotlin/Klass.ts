import _ from "lodash";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace kotlin {
  export type Visibility = "private" | "public" | "override";
  export type Mutability = "val" | "var";
  export type KlassModifier = "abstract" | "data";

  export type FunctionParameter = {
    name: string;
    type: string;
    nullable?: boolean;
  };

  export type ConstructorParameter = FunctionParameter & {
    visibility?: Visibility;
    mutability?: Mutability;
  };

  export type MemberDeclaration = ConstructorParameter;

  export type FunctionArgument = {
    name: string;
  };

  export type FunctionInvocation = {
    name: string;
    args?: FunctionArgument[];
  };

  export class Klass {
    public pkg: string;
    public name: string;

    public annotation: string | undefined;
    public modifiers: KlassModifier[] = [];

    public ctor: ConstructorParameter[] = [];
    public extends: FunctionInvocation | undefined;

    public members: MemberDeclaration[] = [];
    public internalClasses: Klass[] = [];
    public statements: string[] = [];

    public constructor(pkg: string, name: string) {
      this.pkg = pkg;
      this.name = name;
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

    public addMembers(...members: MemberDeclaration[]): this {
      this.members.push(...members);
      return this;
    }

    public setMembers(...members: MemberDeclaration[]): this {
      this.members = members;
      return this;
    }

    public addInternalClasses(...classes: Klass[]): this {
      this.internalClasses.push(...classes);
      return this;
    }

    public setInternalClasses(...classes: Klass[]): this {
      this.internalClasses = classes;
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
  }
}
