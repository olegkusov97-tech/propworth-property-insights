import { describe, expect, it } from "vitest";
import { comparisonRows, marketCohorts, transactionActivity, marketReferenceSales } from "@/lib/market-comparison";
import { propertyInsights } from "@/lib/property";

describe("Focused market comparisons", () => {
  it("compares areas holding 2BR apartment and ready status fixed", () => {
    const rows = comparisonRows("areas", "Apartment", "marina", 2, "Ready");
    expect(rows.map(r => r.property.communityId).sort()).toEqual(["dhills", "dsc", "jvc", "marina"]);
    for (const row of rows) { expect(row.property.propertyType).toBe("Apartment"); expect(row.property.bedrooms).toBe(2); expect(row.property.status).toBe("Ready"); }
  });
  it("compares all observed bedroom configurations in Dubai Marina including 1BR, 2BR and 3BR", () => {
    const rows = comparisonRows("bedrooms", "Apartment", "marina", 2, "Ready");
    expect(rows.map(r => r.property.bedrooms).sort((a,b) => a-b)).toEqual([0,1,2,3,4,5]);
    expect(rows.every(r => r.property.communityId === "marina" && r.property.status === "Ready")).toBe(true);
  });
  it("never manufactures an unobserved apartment configuration in The Springs", () => {
    expect(comparisonRows("bedrooms", "Apartment", "springs", 2, "Ready")).toEqual([]);
    expect(marketCohorts.every(c => c.historicalListings > 0 && c.property.sizeSqft === 0)).toBe(true);
  });
  it("counts 127 exact Marina 2BR ready Sale references without imposing a fictitious unit size", () => {
    const row = comparisonRows("bedrooms", "Apartment", "marina", 2, "Ready").find(r => r.property.bedrooms === 2);
    if (!row) throw new Error("Missing cohort");
    const activity = transactionActivity(row.property);
    expect(activity.count).toBe(127); expect(activity.months).toEqual([16,41,42,28]);
    expect(transactionActivity({ ...row.property, sizeSqft: 9999 })).toEqual(activity);
    expect(marketReferenceSales(row.property).every(s => s.subtype === "Flat" && s.status === "Ready" && s.bedrooms === 2)).toBe(true);
  });
  it("does not substitute simulated sales when off-plan DLD coverage is missing", () => {
    const row = comparisonRows("bedrooms", "Apartment", "marina", 2, "Off-plan").find(r => r.property.bedrooms === 2);
    if (!row) throw new Error("Missing cohort");
    expect(transactionActivity(row.property)).toEqual({ count: 0, median: null, months: [0,0,0,0] });
    expect(propertyInsights(row.property).market.sales90d).toBeGreaterThan(0);
  });
  it("never relabels Villa registrations as Townhouse references", () => {
    const row = marketCohorts.find(r => r.property.communityId === "springs" && r.property.propertyType === "Townhouse");
    if (!row) throw new Error("Missing cohort");
    expect(marketReferenceSales(row.property)).toEqual([]);
  });
});