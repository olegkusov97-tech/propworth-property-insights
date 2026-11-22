import { fetchHistoricalListings } from "@/lib/historical-listings";
import { initializeBuyerCatalog } from "@/lib/buyer-liquidity";
import { beforeAll, describe, expect, it } from "vitest";
import { sampleProperties, marketSegments, filterItems, emptyBuyerFilters, itemScore, itemPrice, sortItems, segmentFilters, toggleComparison, comparisonIds, toggleSaved } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";
import { historicalListings } from "@/lib/historical-listings";

beforeAll(async () => { initializeBuyerCatalog(await fetchHistoricalListings("http://localhost:8080")); }, 60000);

describe("Historical buyer catalog and segment research", () => {
  it("imports all 41,381 original CSV records rather than a replacement sample", () => {
    expect(sampleProperties).toHaveLength(41381);
    expect(historicalListings).toHaveLength(41381);
    expect(new Set(sampleProperties.map(p => p.id)).size).toBe(41381);
  });
  it("preserves actual LIV Lux price, building and bedrooms without inferring unit size", () => {
    const item = sampleProperties.find(p => p.listing?.address === "LIV Lux, Dubai Marina, Dubai" && p.listing.date === "2023-11-15" && p.listing.price === 2475000);
    if (!item) throw new Error("Source record missing");
    expect(itemPrice(item)).toBe(2475000); expect(item.property.bedrooms).toBe(1);
    expect(item.listing?.building).toBe("LIV LUX");
    expect(item.listing?.buildingArea).toBe(696);
    expect(item.property.sizeSqft).toBe(0); expect(item.property.parking).toBeNull();
    expect(item.property.floor).toBeNull();
    expect(item.property.status).toBe("Off-plan");
  });
  it("retains all Dubai Marina records and filters raw types, status and bedrooms", () => {
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, community: "Dubai Marina" })).toHaveLength(2112);
    const rows = filterItems(sampleProperties, { ...emptyBuyerFilters, community: "Dubai Marina", type: "Apartment", bedrooms: "2", status: "Off-plan" });
    expect(rows.length).toBeGreaterThan(13);
    for (const row of rows) { expect(row.listing?.area).toBe("Dubai Marina"); expect(row.listing?.type).toBe("Apartment"); expect(row.listing?.bedrooms).toBe(2); expect(row.listing?.status).toBe("Off-Plan"); }
  });
  it("filters and sorts original asking prices, not generated valuations", () => {
    const rows = filterItems(sampleProperties, { ...emptyBuyerFilters, minPrice: "2475000", maxPrice: "2475000", search: "LIV Lux" });
    expect(rows.length).toBeGreaterThan(0); expect(rows.every(p => p.listing?.price === 2475000)).toBe(true);
    const sorted = sortItems(rows.slice(0, 3).concat(sampleProperties.slice(0, 5)), "price-desc", "properties");
    expect(sorted.map(itemPrice)).toEqual(sorted.map(itemPrice).sort((a,b) => b-a));
  });
  it("does not use a building-area field for unit-size filters", () => {
    expect(filterItems(sampleProperties, { ...emptyBuyerFilters, minSize: "200" })).toEqual([]);
  });
  it("models markets as neutral segments with multiple areas, types, bedrooms and bands", () => {
    const rows = marketSegments.filter(s => s.property.communityId === "marina" && s.property.propertyType === "Apartment" && s.property.status === "Ready");
    expect(new Set(rows.map(s => s.property.bedrooms))).toEqual(new Set([1,2,3,4]));
    expect(new Set(rows.map(s => s.priceBand?.min))).toEqual(new Set([0,1000000,2000000,4000000]));
    for (const item of rows) { expect(item.property.building).toBe(""); expect(item.listing).toBeUndefined(); expect(itemScore(item, "markets")).toBe(propertyInsights(item.property).market.liquidity); }
  });
  it("passes a segment's area, type, bedrooms, status and price range to real property search", () => {
    const segment = marketSegments.find(s => s.property.communityId === "marina" && s.property.propertyType === "Apartment" && s.property.bedrooms === 2 && s.property.status === "Ready" && s.priceBand?.min === 1000000);
    if (!segment) throw new Error("Segment missing");
    const rows = filterItems(sampleProperties, segmentFilters(segment));
    expect(rows.length).toBeGreaterThan(0);
    for (const item of rows) { expect(item.listing?.area).toBe("Dubai Marina"); expect(item.listing?.type).toBe("Apartment"); expect(item.property.bedrooms).toBe(2); expect(item.listing?.price).toBeGreaterThanOrEqual(1000000); expect(item.listing?.price).toBeLessThanOrEqual(2000000); }
  });
  it("reuses the homeowner score and saves the score at save time", () => {
    const item = sampleProperties[0]; if (!item) throw new Error("Missing source");
    expect(itemScore(item,"properties")).toBe(propertyInsights(item.property).property.liquidity);
    const saved = toggleSaved([],item,"properties"); expect(saved[0]?.score).toBe(itemScore(item,"properties"));
    expect(toggleSaved(saved,item,"properties")).toEqual([]);
  });
  it("allows 2–3 comparisons and rejects unknown and duplicate identifiers", () => {
    expect(toggleComparison(["a","b"],"c")).toEqual(["a","b","c"]);
    expect(toggleComparison(["a","b","c"],"d")).toEqual(["a","b","c"]);
    expect(comparisonIds("properties", "bayut-1,bayut-1,invalid,bayut-2,bayut-3,bayut-4")).toEqual(["bayut-1","bayut-2","bayut-3"]);
  });
});
