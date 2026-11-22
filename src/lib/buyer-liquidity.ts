import apartment from "@/assets/sample-apartment.jpg.asset.json";
import villa from "@/assets/sample-villa.jpg.asset.json";
import townhouse from "@/assets/sample-townhouse.jpg.asset.json";
import { buildings, emptyProperty, fromBuilding, propertyInsights, type PropertyDetails } from "./property";
import { getCommunity } from "./market";
import { segmentName } from "./owner-history";

export type ExploreKind = "markets" | "properties";
export interface ExploreItem { id: string; property: PropertyDetails; name: string; segmentId: string; photo: string }
const photos = { Apartment: apartment.url, Villa: villa.url, Townhouse: townhouse.url };
export const sampleProperties: ExploreItem[] = buildings.map((b, i) => ({
  id: b.id, name: b.name, segmentId: `${b.id}-segment`, photo: photos[b.type],
  property: { ...fromBuilding(b), condition: i % 3 === 0 ? "Renovated" : "Good", view: b.type === "Apartment" ? "Open / community" : "Garden", balcony: "Yes", parking: b.type === "Apartment" ? 1 : 2 },
}));
export const marketSegments: ExploreItem[] = sampleProperties.map(item => {
  const property = { ...emptyProperty, communityId: item.property.communityId, propertyType: item.property.propertyType, bedrooms: item.property.bedrooms, sizeSqft: item.property.sizeSqft, status: item.property.status };
  return { ...item, id: item.segmentId, property,
    name: `${getCommunity(property.communityId).name} · ${property.bedrooms}BR ${property.propertyType}` };
});
export const itemsFor = (kind: ExploreKind) => kind === "markets" ? marketSegments : sampleProperties;
export const findItem = (kind: ExploreKind, id: string) => itemsFor(kind).find(item => item.id === id);
export function itemScore(item: ExploreItem, kind: ExploreKind) {
  const r = propertyInsights(item.property);
  return kind === "markets" ? r.market.liquidity : r.property.liquidity;
}
export function itemSegment(item: ExploreItem) { return segmentName(item.property, getCommunity(item.property.communityId).name); }
export interface BuyerFilters { community: string; type: string; bedrooms: string; status: string; minSize: string; maxSize: string; minPrice: string; maxPrice: string; search: string }
export const emptyBuyerFilters: BuyerFilters = { community: "", type: "", bedrooms: "", status: "", minSize: "", maxSize: "", minPrice: "", maxPrice: "", search: "" };
export function filterItems(items: ExploreItem[], f: BuyerFilters) {
  return items.filter(item => {
    const p = item.property, price = propertyInsights(p).value;
    return (!f.community || p.communityId === f.community) && (!f.type || p.propertyType === f.type)
      && (!f.bedrooms || p.bedrooms === Number(f.bedrooms)) && (!f.status || p.status === f.status)
      && (!f.minSize || p.sizeSqft >= Number(f.minSize)) && (!f.maxSize || p.sizeSqft <= Number(f.maxSize))
      && (!f.minPrice || price >= Number(f.minPrice)) && (!f.maxPrice || price <= Number(f.maxPrice))
      && `${item.name} ${getCommunity(p.communityId).name}`.toLowerCase().includes(f.search.trim().toLowerCase());
  });
}
export function toggleComparison(ids: string[], id: string) {
  return ids.includes(id) ? ids.filter(value => value !== id) : ids.length < 3 ? [...ids, id] : ids;
}
export interface SavedLiquidity { id: string; kind: ExploreKind; score: number; savedAt: string }
export function toggleSaved(saved: SavedLiquidity[], item: ExploreItem, kind: ExploreKind): SavedLiquidity[] {
  return saved.some(s => s.id === item.id && s.kind === kind)
    ? saved.filter(s => s.id !== item.id || s.kind !== kind)
    : [...saved, { id: item.id, kind, score: itemScore(item, kind), savedAt: new Date().toISOString() }];
}
export function comparisonIds(kind: ExploreKind, raw: string) {
  return [...new Set(raw.split(","))].filter(id => findItem(kind, id)).slice(0, 3);
}