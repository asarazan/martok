import { kotlin } from "../kotlin/Klass";
import Klass = kotlin.Klass;

export type MartokOutFile = {
  name: string;
  package: string;
  text: {
    package: string;
    imports: (string | null)[];
    declarations: (Klass | string)[];
  };
};
