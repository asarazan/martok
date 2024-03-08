export type Meta = {
  foo: string;
};

export type DataType = {
  bar: number;
};

/**
 * @ignore
 */
export type ListResponse<T> = {
  data: T[];
  meta: Meta;
};

/**
 * @expand
 */
export type DataResponse = ListResponse<DataType>;
