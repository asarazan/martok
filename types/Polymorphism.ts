export type SimplePoly =
  | {
      foo: string;
      bar: number;
    }
  | {
      foo: string;
      baz: boolean;
    };

// export type Poly = {
//   foo: string;
// } & (
//   | {
//       somethingOrElse: "something";
//       numberOrBoolean: number;
//       reference: Reference1;
//       stringOrReference: string;
//     }
//   | {
//       somethingOrElse: "else";
//       numberOrBoolean: boolean;
//       reference: Reference2;
//       stringOrReference: Reference1;
//     }
// );
//
// export type Reference1 = {
//   stringOrNumber: string;
// };
//
// export type Reference2 = {
//   stringOrNumber: number;
// };
