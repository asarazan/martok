export type Complex = {
  foo:
    | ({
        foo: string;
      } & {
        bar: string;
      })
    | ({
        baz: string;
      } & {
        baf: string;
      });
  bar: number;
};

export type Complex2 =
  | ({
      foo: string;
    } & {
      bar: string;
    })
  | ({
      baz: string;
    } & {
      baf: string;
    });

export type Complex3 = {
  foo: Complex2;
  bar: number;
};

export type Complex4 =
  | {
      foo: Complex2;
    }
  | {
      bar: number;
    };
