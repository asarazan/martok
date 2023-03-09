export type ImportableFoo = {
  foo: {
    bar: string;
  };
};

export type ImportableFooWithInternal = {
  foo: ImportableFoo;
};

export type InternalType = {
  foo: boolean;
};
