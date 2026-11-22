import { beforeAll, describe, expect, it } from "vitest";
import { fetchHistoricalListings, type HistoricalListing } from "@/lib/historical-listings";
import { buildBuyerMarketSegments, initialMarketComparison, marketComparisonRows, marketSegmentListingFilters, updateMarketComparison } from "@/lib/buyer-market-comparison";
import { emptyProperty, propertyInsights } from "@/lib/property";
import { filterItems, initializeBuyerCatalog, sampleProperties } from "@/lib/buyer-liquidity";

let source: HistoricalListing[] = [];
beforeAll(async () => { source = await fetchHistoricalListings("http://localhost:8080"); initializeBuyerCatalog(source); }, 60000);

describe("Embedded Buyer market comparison", () => {
  it("only includes observed Ready residential configurations in modeled Dubai areas", () => {
    const segments = buildBuyerMarketSegments(source);
    expect(segments.length).toBeGreaterThan(3);
    for (const segment of segments) {
      const matches = source.filter(row => row.city === "Dubai" && row.area === segment.sourceArea && row.type === segment.type && row.bedrooms === segment.bedrooms && row.status === "Ready");
      expect(matches.length).toBe(segment.historicalListings);
      expect(matches.length).toBeGreaterThan(0);
    }
    expect(buildBuyerMarketSegments(source.filter(row => row.area === "Dubai Creek Harbour"))).toEqual([]);
  });

  it("compares areas with type and bedrooms held constant", () => {
    const rows = marketComparisonRows(buildBuyerMarketSegments(source), initialMarketComparison);
    expect(rows.length).toBeGreaterThan(1);
    expect(new Set(rows.map(row => row.communityId)).size).toBe(rows.length);
    for (const row of rows) { expect(row.type).toBe("Apartment"); expect(row.bedrooms).toBe(2); }
  });

  it("ranks comparison areas by liquidity highest first without changing their scores", () => {
    const segments = buildBuyerMarketSegments(source).filter(row => row.type === "Apartment" && row.bedrooms === 2).slice(0, 3);
    const scores = [30, 90, 60];
    const input = segments.map((row, index) => ({ ...row, liquidity: scores[index] ?? 0 }));
    expect(marketComparisonRows(input, initialMarketComparison).map(row => row.liquidity)).toEqual([90, 60, 30]);
    expect(input.map(row => row.liquidity)).toEqual([30, 90, 60]);
  });

  it("compares bedroom configurations within Dubai Marina apartments", () => {
    const rows = marketComparisonRows(buildBuyerMarketSegments(source), { area: "marina", type: "Apartment", bedrooms: "" });
    expect(rows.map(row => row.bedrooms)).toEqual(expect.arrayContaining([1, 2, 3]));
    for (const row of rows) { expect(row.communityId).toBe("marina"); expect(row.type).toBe("Apartment"); }
  });

  it("compares available property types within one area and bedroom configuration", () => {
    const rows = marketComparisonRows(buildBuyerMarketSegments(source), { area: "dhills", type: "", bedrooms: "3" });
    expect(rows.map(row => row.type)).toEqual(expect.arrayContaining(["Apartment", "Villa", "Townhouse"]));
    for (const row of rows) { expect(row.communityId).toBe("dhills"); expect(row.bedrooms).toBe(3); }
  });

  it("reuses existing market scores without mixing DLD transactions into simulated inputs", () => {
    const marina = buildBuyerMarketSegments(source).find(row => row.communityId === "marina" && row.type === "Apartment" && row.bedrooms === 2);
    expect(marina?.sales.length).toBeGreaterThan(0);
    for (const sale of marina?.sales ?? []) expect(sale.area).toBe("DUBAI MARINA");
    for (const row of buildBuyerMarketSegments(source)) {
      const expected = propertyInsights({ ...emptyProperty, communityId: row.communityId, propertyType: row.type, bedrooms: row.bedrooms, sizeSqft: 0 }).market;
      expect(row.liquidity).toBe(expected.liquidity);
      expect(row.demand).toBe(expected.demand);
      for (const sale of row.sales) { expect(sale.subtype).toBe(row.type === "Apartment" ? "Flat" : row.type); expect(sale.bedrooms).toBe(row.bedrooms); expect(sale.status).toBe("Ready"); }
    }
  });

  it("View Properties matches exactly the chosen historical segment", () => {
    for (const row of buildBuyerMarketSegments(source)) {
      const matches = filterItems(sampleProperties, marketSegmentListingFilters(row));
      expect(matches.length).toBe(row.historicalListings);
      for (const item of matches) { expect(item.listing?.area).toBe(row.sourceArea); expect(item.listing?.type).toBe(row.type); expect(item.listing?.bedrooms).toBe(row.bedrooms); }
    }
  });

  it("keeps only one dimension open instead of arbitrary cross-product comparisons", () => {
    expect(updateMarketComparison(initialMarketComparison, "bedrooms", "")).toEqual({ area: "marina", type: "Apartment", bedrooms: "" });
    expect(updateMarketComparison({ area: "dhills", type: "Apartment", bedrooms: "" }, "type", "")).toEqual({ area: "dhills", type: "", bedrooms: "2" });
  });
});