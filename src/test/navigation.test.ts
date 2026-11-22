import { describe, expect, it } from "vitest";
import { buyerBackTarget } from "@/lib/navigation";

describe("Buyer Back navigation", () => {
  it("returns property search to the homepage", () => {
    expect(buyerBackTarget("/buyer/properties")).toBe("/");
  });
  it("returns property analysis to property search", () => {
    expect(buyerBackTarget("/buyer/properties/bayut-39824")).toBe("/buyer/properties");
  });
  it("returns saved properties to property search", () => {
    expect(buyerBackTarget("/buyer/plan")).toBe("/buyer/properties");
  });
});