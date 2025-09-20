import { describe, it, expect } from "vitest";
import { greet } from "./index";

describe("greet", () => {
  it("returns greeting", () => {
    expect(greet("mizuki")).toBe("Hello, mizuki!");
  });
});
