export type MartokOptions = {
  dates?: {
    framework: "kotlinx.datetime";
    namePattern: RegExp;
  };
  dedupeTaggedUnions?: boolean;
  snakeToCamelCase?: boolean;
  annotationNewLines?: boolean;
};
