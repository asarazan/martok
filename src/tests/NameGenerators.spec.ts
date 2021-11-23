import { pascalToSnake, title } from "../martok/NameGenerators";

describe("Naming Correctness Tests", () => {
  it("convert pascale to snake", () => {
    expect(pascalToSnake("oneTwo")).toBe("one_two");
    expect(pascalToSnake("one")).toBe("one");
  });
  it("title case", () => {
    expect(title("foobar")).toBe("Foobar");
  });
});
