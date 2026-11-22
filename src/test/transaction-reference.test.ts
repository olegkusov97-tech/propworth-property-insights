import { describe, expect, it } from "vitest";
import { referenceSales, matchingReferenceSales } from "@/lib/transaction-reference";
import { emptyProperty } from "@/lib/property";
describe("Uploaded sale references", () => {
  it("preserves the supplied sale price and area and converts square metres", () => {
    const sale = referenceSales.find(s => s.id === "11-35827-2026");
    expect(sale?.price).toBe(3100000);
    expect(sale?.areaSqm).toBe(172.97);
    expect(sale?.sizeSqft).toBeCloseTo(1861.834, 2);
  });
  it("matches Marina ready two-bedroom flats within 25% size", () => {
    const p = { ...emptyProperty, communityId: "marina", sizeSqft: 1325 };
    const sales = matchingReferenceSales(p);
    expect(sales.length).toBeGreaterThan(0);
    for (const s of sales) {
      expect(s.area).toBe("DUBAI MARINA"); expect(s.bedrooms).toBe(2);
      expect(s.status).toBe("Ready"); expect(s.subtype).toBe("Flat");
      expect(s.sizeSqft).toBeGreaterThanOrEqual(993.75); expect(s.sizeSqft).toBeLessThanOrEqual(1656.25);
    }
  });
  it("never relabels Springs villa records as townhouses", () => {
    expect(matchingReferenceSales({ ...emptyProperty, communityId: "springs", propertyType: "Townhouse", sizeSqft: 2456, bedrooms: 3 })).toEqual([]);
  });
  it("contains unique transaction identifiers within the reference period", () => {
    expect(new Set(referenceSales.map(s => s.id)).size).toBe(referenceSales.length);
    expect(referenceSales.every(s => s.date >= "2026-08-25" && s.date <= "2026-11-22")).toBe(true);
  });
});