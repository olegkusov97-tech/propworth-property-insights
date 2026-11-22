import { describe, expect, it } from "vitest";
import { emptyProperty, fromBuilding, buildings, normalizeProperty, propertyErrors, propertyInsights, saleability } from "@/lib/property";

const base = { ...emptyProperty, communityId: "marina", building: "Marina Gate" };
describe("Homeowner property intelligence", () => {
  it("building selection changes valuation and liquidity, not only the title", () => {
    const a = propertyInsights(base), b = propertyInsights({ ...base, building: "Princess Tower" });
    expect(a.value).toBeGreaterThan(b.value);
    expect(a.property.demand).toBeGreaterThan(b.property.demand);
    expect(a.property.liquidity).toBeGreaterThan(b.property.liquidity);
  });
  it.each([
    ["sizeSqft", 2500], ["bedrooms", 4], ["propertyType", "Villa"], ["status", "Off-plan"],
    ["view", "Sea / marina"], ["condition", "Renovated"], ["furnishing", "Furnished"],
    ["floor", 30], ["balcony", "Yes"], ["parking", 2],
  ] as const)("uses %s in the property valuation and demand", (key, value) => {
    const before = propertyInsights(base), after = propertyInsights({ ...base, [key]: value });
    expect(after.value).not.toBe(before.value);
    // Demand is rounded to whole index points; floor may only alter the underlying adjustment.
    if (key !== "floor") expect(after.property.demand).not.toBe(before.property.demand);
  });
  it("keeps market liquidity separate from property condition", () => {
    const a = propertyInsights(base), b = propertyInsights({ ...base, condition: "Needs renovation" });
    expect(a.market).toEqual(b.market);
    expect(a.property.liquidity).toBeGreaterThan(b.property.liquidity);
  });
  it("asking premiums reduce demand and liquidity and increase competitive pressure", () => {
    const low = propertyInsights({ ...base, askingPremium: -10 }), high = propertyInsights({ ...base, askingPremium: 15 });
    expect(low.property.demand).toBeGreaterThan(high.property.demand);
    expect(low.property.liquidity).toBeGreaterThan(high.property.liquidity);
    expect(low.property.competition).toBeLessThan(high.property.competition);
    expect(low.askingPrice).toBe(Math.round(low.value * .9));
    expect(high.askingPrice).toBe(Math.round(high.value * 1.15));
    expect(low.value).toBe(high.value);
    expect(low.market).toEqual(high.market);
    expect(low.saleability).not.toBe(high.saleability);
  });
  it("uses same community, type, bedrooms, status and sizes within 25% for comparisons", () => {
    const result = propertyInsights({ ...base, status: "Off-plan" });
    expect(result.comparables).toHaveLength(6);
    for (const c of result.comparables) {
      expect(c.communityId).toBe("marina"); expect(c.propertyType).toBe("Apartment");
      expect(c.bedrooms).toBe(2); expect(c.status).toBe("Off-plan");
      expect(c.sizeSqft).toBeGreaterThanOrEqual(1100 * .75);
      expect(c.sizeSqft).toBeLessThanOrEqual(1100 * 1.25);
    }
  });
  it("uses High, Moderate and Low saleability bands", () => {
    expect(saleability(70)).toBe("High"); expect(saleability(69)).toBe("Moderate");
    expect(saleability(50)).toBe("Moderate"); expect(saleability(49)).toBe("Low");
  });
  it("reports actual monthly demand, supply and liquidity differences", () => {
    const r = propertyInsights(base);
    expect(r.market.searches).toBe(61000);
    expect(r.previousMarket.searches).toBe(Math.round(61000 / 1.064));
    expect(r.market.listings).toBe(2600);
    expect(r.previousMarket.listings).toBe(Math.round(2600 / .965));
    expect(r.property.liquidity).not.toBe(r.previousProperty.liquidity);
    expect(r.liquidityHistory[10]).toBe(r.previousProperty.liquidity);
    expect(r.liquidityHistory[11]).toBe(r.property.liquidity);
  });
  it("prefills each directory property and allows full manual details", () => {
    const b = buildings.find(b => b.id === "sidra");
    expect(b).toBeDefined(); if (!b) return;
    const p = fromBuilding(b);
    expect(p.communityId).toBe("dhills"); expect(p.building).toBe("Sidra Villas");
    expect(p.propertyType).toBe("Villa"); expect(p.bedrooms).toBe(4);
    expect(p.sizeSqft).toBe(3523); expect(p.status).toBe("Ready");
    expect(propertyErrors(p)).toEqual([]);
  });
  it("retains buyer-created and legacy local property details", () => {
    const p = normalizeProperty({ communityId: "springs", sizeSqft: 1000, bedrooms: 2, askingPremium: 0 });
    expect(p.propertyType).toBe("Townhouse"); expect(p.sizeSqft).toBe(1000);
    expect(p.status).toBe("Ready"); expect(p.floor).toBeNull();
  });
  it("blocks invalid sizes and optional numeric details", () => {
    expect(propertyErrors({ ...base, sizeSqft: 0 })).toContain("Size must be between 200 and 30,000 sq ft.");
    expect(propertyErrors({ ...base, floor: -1 })).toContain("Floor must be between 0 and 200.");
    expect(propertyErrors({ ...base, parking: -1 })).toContain("Parking must be between 0 and 10 spaces.");
  });
  it("keeps all history values in the 0–100 liquidity range", () => {
    const r = propertyInsights({ ...base, communityId: "dsc", status: "Off-plan", askingPremium: 15 });
    for (const v of r.liquidityHistory) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});