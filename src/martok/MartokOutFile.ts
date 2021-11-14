export type MartokOutFile = {
  name: string;
  package: string;
  text: {
    package: string;
    imports: (string | null)[];
    declarations: string[];
  };
};
