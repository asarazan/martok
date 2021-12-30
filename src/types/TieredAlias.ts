import {
  IntersectionTypeNode,
  TypeChecker,
  TypeElement,
  UnionTypeNode,
} from "typescript";
import _ from "lodash";

export type TieredAlias = {
  type: UnionTypeNode | IntersectionTypeNode;
  members: TypeElement[];
  parent: TieredAlias | undefined;
  children: TieredAlias[];
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TieredAlias {
  export function create(
    type: UnionTypeNode | IntersectionTypeNode,
    checker: TypeChecker
  ): TieredAlias {
    let result = naiveTieredAlias(type, checker);
    result = hoistTieredAlias(result);
    return result;
  }
}

function naiveTieredAlias(
  type: UnionTypeNode | IntersectionTypeNode,
  checker: TypeChecker
): TieredAlias {
  throw new Error();
}

function hoistChildren(children: TieredAlias[], hoistable: TypeElement[]) {
  for (const member of hoistable) {
    for (const child of children) {
      // remove from children
      _.remove(child.members, member);
    }
  }
}

function hoistableMembers(children: TieredAlias[]): TypeElement[] {
  const first = _.first(children);
  if (!first) return [];
  return first.members.filter((member) =>
    _.every(children, (value) => value.members.includes(member))
  );
}

function hoistTieredAlias(alias: TieredAlias): TieredAlias {
  const children = alias.children.map(hoistTieredAlias);
  const hoistable = hoistableMembers(children);
  hoistChildren(children, hoistable);
  return {
    type: alias.type,
    parent: alias.parent,
    members: [...alias.members, ...hoistable],
    children,
  };
}
