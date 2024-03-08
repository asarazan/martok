export interface Meta {
  foo: string;
}

export interface DataType {
  bar: number;
}

/**
 * @ignore
 */
export interface ListResponse<T> {
  data: T[];
  meta: Meta;
}

/**
 * @expand
 */
export type DataResponse = ListResponse<DataType>;
