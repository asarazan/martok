import { all } from "../typescript/utils";

describe("Utils Tests", () => {
  it("Branch validation for [all]", () => {
    const allFalse = all([0, "string"], (value) => {
      return typeof value === "string";
    });
    expect(allFalse).toBe(false);
    const allTrue = all(["foo", "bar"], (value) => {
      return typeof value === "string";
    });
    expect(allTrue).toBe(true);
  });
});
