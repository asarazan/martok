import { pascalToSnake, snakeToCamel, title } from "../martok/NameGenerators";
import { sanitizeName } from "../martok/processing/SanitizeNames";

describe("Naming Correctness Tests", () => {
  it("convert snake to camel", () => {
    expect(snakeToCamel("utcDate1")).toBe("utcDate1");
    expect(snakeToCamel("utc_date_1")).toBe("utcDate1");
    expect(snakeToCamel("foo_bar")).toBe("fooBar");
  });
  it("convert pascal to snake", () => {
    expect(pascalToSnake("oneTwo")).toBe("one_two");
    expect(pascalToSnake("OneTwo")).toBe("one_two");
    expect(pascalToSnake("one")).toBe("one");
  });
  it("title case", () => {
    expect(title("foobar")).toBe("Foobar");
    expect(title("utcDate1")).toBe("UtcDate1");
    expect(title("foo_bar")).toBe("FooBar");
    expect(title("foo__bar")).toBe("FooBar");
  });
  it("Sanitize dashes", () => {
    expect(sanitizeName("foo-bar")).toBe("foo_bar");
  });
});
