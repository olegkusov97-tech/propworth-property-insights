import { describe, expect, it } from "vitest";
import { listingReferences, matchingListingReferences } from "@/lib/listing-reference";
import { emptyProperty, propertyInsights } from "@/lib/property";

describe("Uploaded listing references", () => {
  it("preserves the LIV Lux asking price and advertised status", () => {
    const row = listingReferences.find(r => r.address === "LIV Lux, Dubai Marina, Dubai" && r.date === "2023-11-15" && r.price === 2475000);
    expect(row?.price).toBe(2475000);
    expect(row?.bedrooms).toBe(1);
    expect(row?.status).toBe("Off-Plan");
  });
  it("matches ready Marina two-bedroom apartments without inventing size", () => {
    const rows = matchingListingReferences({ ...emptyProperty, communityId: "marina", bedrooms: 2, propertyType: "Apartment", status: "Ready" });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.city).toBe("Dubai"); expect(row.area).toBe("Dubai Marina");
      expect(row.bedrooms).toBe(2); expect(row.type).toBe("Apartment"); expect(row.status).toBe("Ready");
      expect(row).not.toHaveProperty("sizeSqft");
    }
  });
  it("does not use building area or alter simulated indicators", () => {
    const p = { ...emptyProperty, communityId: "marina" };
    const before = propertyInsights(p);
    expect(matchingListingReferences({ ...p, sizeSqft: 1 })).toEqual(matchingListingReferences({ ...p, sizeSqft: 10000 }));
    expect(propertyInsights(p)).toEqual(before);
  });
  it("retains historical dates and removes exact repeats", () => {
    expect(listingReferences.every(r => r.date >= "2021-12-15" && r.date <= "2024-04-25")).toBe(true);
    expect(new Set(listingReferences.map(r => JSON.stringify(r))).size).toBe(listingReferences.length);
    expect(matchingListingReferences({ ...emptyProperty, communityId: "unsupported" })).toEqual([]);
  });
});