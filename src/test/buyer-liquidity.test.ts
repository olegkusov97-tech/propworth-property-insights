import { fetchHistoricalListings } from "@/lib/historical-listings";
import { initializeBuyerCatalog } from "@/lib/buyer-liquidity";
import { beforeAll, describe, expect, it } from "vitest";
import { sampleProperties, filterItems, emptyBuyerFilters, itemScore, itemPrice, sortItems, toggleSaved, propertyWatchlist } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";
import { historicalListings } from "@/lib/historical-listings";

beforeAll(async () => { initializeBuyerCatalog(await fetchHistoricalListings("http://localhost:8080")); }, 60000);

describe("Historical buyer property catalog", () => {
  it("removes saved market segments while retaining exact saved property scores and dates", () => {
    const property = { id: "bayut-1", kind: "properties", score: 58, savedAt: "2026-11-22T11:00:00Z" };
    expect(propertyWatchlist([{ id: "market-marina", kind: "markets", score: 52, savedAt: property.savedAt }, property])).toEqual([property]);
  });
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
  it("reuses the homeowner score and saves the score at save time", () => {
    const item = sampleProperties[0]; if (!item) throw new Error("Missing source");
    expect(itemScore(item,"properties")).toBe(propertyInsights(item.property).property.liquidity);
    const saved = toggleSaved([],item,"properties"); expect(saved[0]?.score).toBe(itemScore(item,"properties"));
    expect(toggleSaved(saved,item,"properties")).toEqual([]);
  });
});
