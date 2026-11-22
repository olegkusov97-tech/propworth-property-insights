import { describe, expect, it } from "vitest";
import { sampleProperties, marketSegments, filterItems, emptyBuyerFilters, itemScore, toggleComparison, comparisonIds, toggleSaved } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";

describe("Buyer liquidity exploration", () => {
  it("uses the homeowner model for property and market scores", () => {
    for (const item of sampleProperties) {
      const r = propertyInsights(item.property);
      expect(itemScore(item, "properties")).toBe(r.property.liquidity);
      const segment = marketSegments.find(s => s.id === item.segmentId);
      if (!segment) throw new Error("Missing segment");
      expect(itemScore(segment, "markets")).toBe(r.market.liquidity);
      expect(propertyInsights(segment.property).market).toEqual(r.market);
    }
  });
  it("filters area, property type, bedrooms and ready/off-plan independently", () => {
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, community: "marina" }).map(p => p.id)).toEqual(["marina-gate", "princess", "silverene"]);
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, type: "Townhouse" }).map(p => p.id)).toEqual(["maple", "springs-7", "springs-3"]);
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, bedrooms: "4" }).map(p => p.id)).toEqual(["sidra", "victory"]);
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, status: "Off-plan" }).map(p => p.id)).toEqual(["binghatti"]);
  });
  it("honors size boundaries inclusively", () => {
    const rows = filterItems(sampleProperties, { ...emptyBuyerFilters, minSize: "1200", maxSize: "1325" });
    expect(rows.map(p => p.id)).toEqual(["marina-gate", "princess", "belgravia"]);
  });
  it("honors the selected AED price range", () => {
    const item = sampleProperties.find(p => p.id === "binghatti");
    if (!item) throw new Error("Sample missing");
    const price = propertyInsights(item.property).value;
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, status: "Off-plan", minPrice: String(price), maxPrice: String(price) })).toEqual([item]);
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, status: "Off-plan", maxPrice: String(price - 1) })).toEqual([]);
  });
  it("allows two or three comparisons, never a fourth", () => {
    expect(toggleComparison(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleComparison(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(toggleComparison(["a", "b", "c"], "d")).toEqual(["a", "b", "c"]);
    expect(toggleComparison(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });
  it("normalizes direct comparison links to unique known items", () => {
    expect(comparisonIds("properties", "marina-gate,marina-gate,invalid,princess,silverene,bloom")).toEqual(["marina-gate", "princess", "silverene"]);
  });
  it("captures the score when saving and removes only that saved item", () => {
    const property = sampleProperties[0], segment = marketSegments[0];
    if (!property || !segment) throw new Error("Samples missing");
    const saved = toggleSaved([], property, "properties");
    expect(saved[0]?.score).toBe(propertyInsights(property.property).property.liquidity);
    const both = toggleSaved(saved, segment, "markets");
    expect(toggleSaved(both, property, "properties")).toEqual([both[1]]);
  });
});