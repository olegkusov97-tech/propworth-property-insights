import { describe, expect, it } from "vitest";
import { emptyProperty, propertyInsights } from "@/lib/property";
import { retainSnapshots } from "@/lib/owner-history";

const base = { ...emptyProperty, communityId: "marina", building: "Marina Gate" };
describe("Homeowner monthly records", () => {
  it("retains all closed months after changing today's property settings", () => {
    const first = propertyInsights(base);
    const edited = propertyInsights({ ...base, bedrooms: 3, condition: "Needs renovation" });
    const current = edited.snapshots.at(-1);
    if (!current) throw new Error("Current snapshot missing");
    const saved = retainSnapshots(first.snapshots, edited.snapshots, current);
    expect(saved.slice(0, -1)).toEqual(first.snapshots.slice(0, -1));
    expect(saved.at(-1)?.property).toBe(edited.property.liquidity);
    expect(saved.at(-1)?.searches).toBe(edited.market.searches);
  });
  it("keeps activity and liquidity in the latest snapshot consistent with the dashboard", () => {
    const r = propertyInsights(base), current = r.snapshots.at(-1);
    expect(current?.searches).toBe(4270);
    expect(current?.listings).toBe(182);
    expect(current?.property).toBe(r.property.liquidity);
    expect(current?.market).toBe(r.market.liquidity);
    expect(current?.sales90d).toBe(r.signals.sales90d);
  });
  it("includes rising, falling and stable historical liquidity", () => {
    const scores = propertyInsights(base).snapshots.map(r => r.market);
    const changes = scores.slice(1).map((v, i) => v - (scores[i] ?? v));
    expect(changes.some(d => d > 0)).toBe(true);
    expect(changes.some(d => d < 0)).toBe(true);
    expect(changes.some(d => d === 0)).toBe(true);
  });
  it("does not apply today's optional characteristics to seeded closed months", () => {
    const a = propertyInsights(base), b = propertyInsights({ ...base, condition: "Renovated", floor: 30 });
    expect(a.snapshots.slice(0, -1)).toEqual(b.snapshots.slice(0, -1));
    expect(a.property.liquidity).not.toBe(b.property.liquidity);
  });
});