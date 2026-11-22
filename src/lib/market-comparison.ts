import configurations from "@/data/market-configurations.json";
import { communities, type PropertyType } from "./market";
import { emptyProperty, propertyInsights, type PropertyDetails } from "./property";
import { referenceSales } from "./transaction-reference";

export type ComparisonMode = "areas" | "bedrooms";
export const dubaiAreas = communities.filter(c => c.city === "Dubai");
const dldAreas: Record<string, string> = { marina: "DUBAI MARINA", jvc: "JUMEIRAH VILLAGE CIRCLE", dhills: "DUBAI HILLS", dsc: "DUBAI SPORTS CITY", springs: "EMIRATE LIVING" };
export const bedroomLabel = (n: number) => n === 0 ? "Studio" : `${n}BR`;
export interface MarketCohort { id: string; name: string; property: PropertyDetails; historicalListings: number }
// Only configurations observed in the uploaded catalog: no Cartesian product or price profiles.
export const marketCohorts: MarketCohort[] = configurations.flatMap(row => {
  const [area, type, bedrooms, status, count] = row;
  const community = dubaiAreas.find(c => c.id === area);
  if (!community || (type !== "Apartment" && type !== "Villa" && type !== "Townhouse") || typeof bedrooms !== "number" || (status !== "Ready" && status !== "Off-plan") || typeof count !== "number") return [];
  return [{ id: `market-${area}-${type.toLowerCase()}-${bedrooms}-${status.toLowerCase()}`, name: `${community.name} · ${bedroomLabel(bedrooms)} ${type}`,
    property: { ...emptyProperty, communityId: community.id, propertyType: type, bedrooms, status, sizeSqft: 0 }, historicalListings: count }];
});
export function comparisonRows(mode: ComparisonMode, type: PropertyType, area: string, bedrooms: number, status: string) {
  return marketCohorts.filter(c => c.property.propertyType === type && c.property.status === status
    && (mode === "areas" ? c.property.bedrooms === bedrooms : c.property.communityId === area));
}
export function marketReferenceSales(p: PropertyDetails) {
  const subtype = p.propertyType === "Apartment" ? "Flat" : p.propertyType;
  return referenceSales.filter(s => s.area === dldAreas[p.communityId] && s.subtype === subtype && s.status === p.status && s.bedrooms === p.bedrooms
    && (p.communityId !== "springs" || /springs/i.test(s.project)));
}
export function transactionActivity(p: PropertyDetails) {
  const sales = marketReferenceSales(p);
  const prices = sales.map(s => s.price).sort((a, b) => a - b);
  const middle = Math.floor(prices.length / 2);
  const median = prices.length ? ((prices[middle] ?? 0) + (prices[prices.length % 2 ? middle : middle - 1] ?? 0)) / 2 : null;
  return { count: sales.length, median, months: ["2026-08", "2026-09", "2026-10", "2026-11"].map(month => sales.filter(s => s.date.startsWith(month)).length) };
}
export function cohortDelta(p: PropertyDetails) {
  const r = propertyInsights(p);
  return r.market.liquidity - (r.snapshots.at(-2)?.market ?? r.market.liquidity);
}