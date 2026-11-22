import { describe, expect, it } from "vitest";
import { emptyProperty, fromBuilding, buildings, normalizeProperty, propertyErrors, propertyInsights, saleability, scoreMarket, monthlyMeaning } from "@/lib/property";

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
    expect(r.market.searches).toBe(4270);
    expect(r.previousMarket.searches).toBe(Math.round(Math.round(61000 / 1.064) * .07));
    expect(r.market.listings).toBe(182);
    expect(r.previousMarket.listings).toBe(Math.round(Math.round(2600 / .965) * .07));
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
  it("matches JVC ready 2-bedroom apartments instead of the whole community", () => {
    const r = propertyInsights({ ...base, communityId: "jvc", building: "Belgravia" });
    expect(r.market.searches).toBe(Math.round(48200 * .07));
    expect(r.market.listings).toBe(Math.round(3100 * .07));
    expect(r.communityMarket.searches).toBe(48200);
    expect(r.market).not.toEqual(r.communityMarket);
    expect(r.market).toEqual(scoreMarket({ ...r.signals, days: r.market.days }));
  });
  it.each([ ["bedrooms", 3], ["propertyType", "Villa"], ["status", "Off-plan"], ["sizeSqft", 4000] ] as const)("updates matching market activity and comparisons for %s", (key, value) => {
    const a = propertyInsights(base), b = propertyInsights({ ...base, [key]: value });
    expect(b.market).not.toEqual(a.market);
    expect(b.comparables).not.toEqual(a.comparables);
    expect(b.value).not.toBe(a.value);
    expect(b.property.liquidity).not.toBe(a.property.liquidity);
  });
  it("keeps recorded sales and all market snapshots independent of asking price and condition", () => {
    const a = propertyInsights(base), b = propertyInsights({ ...base, askingPremium: 15, condition: "Needs renovation" });
    expect(b.market).toEqual(a.market); expect(b.previousMarket).toEqual(a.previousMarket);
    expect(b.communityMarket).toEqual(a.communityMarket); expect(b.signals).toEqual(a.signals);
    expect(b.comparables).toEqual(a.comparables);
    expect(b.history.map(h => h.market)).toEqual(a.history.map(h => h.market));
    expect(b.history.map(h => h.property)).not.toEqual(a.history.map(h => h.property));
  });
  it("reconciles characteristics and pricing contributions to the exact property-market gap", () => {
    const r = propertyInsights({ ...base, condition: "Renovated", askingPremium: 5 });
    expect(r.scoreReasons.characteristics).toBeGreaterThan(0);
    expect(r.scoreReasons.pricing).toBeLessThan(0);
    expect(r.scoreReasons.characteristics + r.scoreReasons.pricing).toBe(r.property.liquidity - r.market.liquidity);
  });
  it("uses named buildings, concrete transaction dates and consistent price per sqft", () => {
    const r = propertyInsights(base);
    for (const c of r.comparables) {
      expect(["Marina Gate", "Princess Tower", "Silverene Tower"]).toContain(c.building);
      expect(c.transactionDate).toMatch(/^2026-(09|10|11)-\d{2}$/);
      expect(c.pricePerSqft).toBe(Math.round(c.price / c.sizeSqft));
    }
  });
  it("scores each history month consistently and ends at the current indicators", () => {
    const r = propertyInsights(base);
    expect(r.history).toHaveLength(12);
    expect(r.history[0]?.month).toBe("Dec 2025");
    expect(r.history[11]).toEqual({ month: "Nov 2026", market: r.market.liquidity, property: r.property.liquidity });
    expect(r.history[10]).toEqual({ month: "Oct 2026", market: r.previousMarket.liquidity, property: r.previousProperty.liquidity });
  });
  it("balances 4% more searches against 6% more supply without falsely claiming a liquidity improvement", () => {
    const prev = scoreMarket({ searches: 10000, saves: 1000, enquiries: 500, listings: 500, sales90d: 300, days: 50 });
    const now = scoreMarket({ searches: 10400, saves: 1040, enquiries: 520, listings: 530, sales90d: 318, days: 50 });
    expect(now.liquidity - prev.liquidity).toBe(0);
    expect(monthlyMeaning(now, prev).delta).toBe(0);
  });
});