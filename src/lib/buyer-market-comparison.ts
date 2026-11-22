import type { HistoricalListing } from "./historical-listings";
import type { PropertyType } from "./market";
import { emptyProperty, propertyInsights } from "./property";
import { emptyBuyerFilters, type BuyerFilters } from "./buyer-liquidity";
import { referenceSales, type ReferenceSale } from "./transaction-reference";

const areas = [
  { id: "marina", name: "Dubai Marina", source: "Dubai Marina", dld: "DUBAI MARINA" },
  { id: "jvc", name: "Jumeirah Village Circle", source: "Jumeirah Village Circle (JVC)", dld: "JUMEIRAH VILLAGE CIRCLE" },
  { id: "dhills", name: "Dubai Hills Estate", source: "Dubai Hills Estate", dld: "DUBAI HILLS" },
  { id: "springs", name: "The Springs", source: "The Springs", dld: "EMIRATE LIVING" },
  { id: "dsc", name: "Dubai Sports City", source: "Dubai Sports City", dld: "DUBAI SPORTS CITY" },
] as const;

export interface BuyerMarketSegment {
  id: string; communityId: string; area: string; sourceArea: string;
  type: PropertyType; bedrooms: number; historicalListings: number;
  liquidity: number; demand: number; competition: number; sales: ReferenceSale[];
}
export interface MarketComparisonFilters { area: string; type: string; bedrooms: string }
export const initialMarketComparison: MarketComparisonFilters = { area: "", type: "Apartment", bedrooms: "2" };
export const bedroomLabel = (bedrooms: number) => bedrooms === 0 ? "Studio" : `${bedrooms}BR`;

export function buildBuyerMarketSegments(listings: HistoricalListing[]): BuyerMarketSegment[] {
  const segments = new Map<string, BuyerMarketSegment>();
  for (const row of listings) {
    const area = areas.find(a => a.source === row.area);
    const type: PropertyType | undefined = row.type === "Apartment" || row.type === "Villa" || row.type === "Townhouse" ? row.type : undefined;
    if (!area || !type || row.city !== "Dubai" || row.status !== "Ready" || !Number.isInteger(row.bedrooms) || row.bedrooms < 0 || row.bedrooms > 10) continue;
    const id = `${area.id}|${type}|${row.bedrooms}`;
    const existing = segments.get(id);
    if (existing) { existing.historicalListings += 1; continue; }
    // Neutral segment profile: no listing price, building quality or invented unit size.
    const profile = { ...emptyProperty, communityId: area.id, propertyType: type, bedrooms: row.bedrooms, sizeSqft: 0 };
    const market = propertyInsights(profile).market;
    const sales = referenceSales.filter(sale => sale.area === area.dld && sale.subtype === (type === "Apartment" ? "Flat" : type)
      && sale.bedrooms === row.bedrooms && sale.status === "Ready" && (area.id !== "springs" || /springs/i.test(sale.project)));
    segments.set(id, { id, communityId: area.id, area: area.name, sourceArea: area.source, type, bedrooms: row.bedrooms,
      historicalListings: 1, liquidity: market.liquidity, demand: market.demand, competition: market.competition, sales });
  }
  return [...segments.values()].sort((a, b) => a.area.localeCompare(b.area) || a.type.localeCompare(b.type) || a.bedrooms - b.bedrooms);
}

export function marketComparisonRows(segments: BuyerMarketSegment[], filters: MarketComparisonFilters) {
  return segments.filter(segment => (!filters.area || segment.communityId === filters.area)
    && (!filters.type || segment.type === filters.type) && (!filters.bedrooms || segment.bedrooms === Number(filters.bedrooms)))
    .sort((a, b) => b.liquidity - a.liquidity || a.area.localeCompare(b.area));
}

export function updateMarketComparison(current: MarketComparisonFilters, key: keyof MarketComparisonFilters, value: string): MarketComparisonFilters {
  const next = { ...current, [key]: value };
  // Only one dimension may be open, preventing a cross-product of combinations.
  if (!value) {
    if (key !== "area" && !next.area) next.area = "marina";
    if (key !== "type" && !next.type) next.type = "Apartment";
    if (key !== "bedrooms" && !next.bedrooms) next.bedrooms = "2";
  }
  return next;
}

export function marketSegmentListingFilters(segment: BuyerMarketSegment): BuyerFilters {
  return { ...emptyBuyerFilters, city: "Dubai", community: segment.sourceArea, type: segment.type, bedrooms: String(segment.bedrooms), status: "Ready" };
}