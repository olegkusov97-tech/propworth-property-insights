import { buildings, emptyProperty, fromBuilding, propertyInsights, scoreMarket, type PropertyDetails } from "./property";
import { getCommunity } from "./market";
import { segmentName } from "./owner-history";
import { initializeHistoricalListings, type HistoricalListing } from "./historical-listings";
import { referenceSales } from "./transaction-reference";

export type ExploreKind = "properties";
export interface ExploreItem {
  id: string; property: PropertyDetails; name: string; segmentId: string; photo: string;
  listing?: HistoricalListing; priceBand?: { min: number; max: number; label: string };
}
const areaIds: Record<string, string> = { "Jumeirah Village Circle (JVC)": "jvc", "Dubai Marina": "marina", "Dubai Hills Estate": "dhills", "The Springs": "springs", "Dubai Sports City": "dsc", "Al Reem Island": "reem", "Yas Island": "yas", "Aljada": "aljada" };
export const supportedTypes = ["Apartment", "Villa", "Townhouse"] as const;
export const sampleProperties: ExploreItem[] = [];
function listingItem(row: HistoricalListing): ExploreItem {
  const type = supportedTypes.find(t => t === row.type) ?? "Apartment";
  return { id: row.id, name: row.address, segmentId: "", photo: "", listing: row,
    property: { ...emptyProperty, communityId: areaIds[row.area] ?? "jvc", building: row.building === "Unknown" ? "" : row.building,
      propertyType: type, bedrooms: row.bedrooms, sizeSqft: 0, status: row.status === "Off-Plan" ? "Off-plan" : "Ready",
      furnishing: row.furnishing || "Not specified", sourceAddress: row.address, sourceArea: row.area, sourceCity: row.city, sourceType: row.type,
      genericBenchmark: !areaIds[row.area] || !supportedTypes.some(t => t === row.type) } };
}
const legacyProperties: ExploreItem[] = buildings.map(b => ({ id: b.id, name: b.name, segmentId: "", photo: "", property: fromBuilding(b) }));
const propertyById = new Map([...legacyProperties, ...sampleProperties].map(i => [i.id, i]));
export function initializeBuyerCatalog(rows: HistoricalListing[]) {
  if (sampleProperties.length) return;
  initializeHistoricalListings(rows);
  for (const row of rows) { const item = listingItem(row); sampleProperties.push(item); propertyById.set(item.id, item); }
}
export const itemsFor = (kind: ExploreKind) => sampleProperties;
export const findItem = (kind: ExploreKind, id: string) => propertyById.get(id);
const insightCache = new WeakMap<ExploreItem, ReturnType<typeof propertyInsights>>();
const profileCache = new Map<string, ReturnType<typeof propertyInsights>>();
// Stable demo seeds are identifiers, not market evidence or price predictions.
function demoSeed(value: string) {
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return seed >>> 0;
}
function illustrativeInsights(item: ExploreItem, base: ReturnType<typeof propertyInsights>) {
  const p = item.property;
  const segment = itemSegment(item);
  const seed = demoSeed(segment);
  const propertySeed = demoSeed(`${segment}|${item.name}|${p.building}|${p.furnishing}`);
  const interest = .65 + (seed % 91) / 100;
  const supply = .7 + (Math.floor(seed / 97) % 81) / 100;
  const gap = (propertySeed % 17) - 8;
  const snapshots = base.snapshots.map((row, i) => {
    const seasonal = 1 + ((demoSeed(`${segment}|${row.month}`) % 15) - 7) / 100;
    const activity = scoreMarket({
      searches: Math.max(1, Math.round(row.searches * interest * seasonal)),
      saves: Math.max(1, Math.round(row.saves * interest * seasonal)),
      enquiries: Math.max(1, Math.round(row.enquiries * interest * seasonal)),
      listings: Math.max(8, Math.round(row.listings * supply / seasonal)),
      sales90d: Math.max(3, Math.round(row.sales90d * interest)),
      days: Math.max(14, row.days + (seed % 29) - 14),
    });
    const historicalGap = i === base.snapshots.length - 1 ? gap : gap + ((demoSeed(`${item.name}|${row.month}`) % 5) - 2);
    return { ...activity, month: row.month, segment, market: activity.liquidity,
      property: Math.max(0, Math.min(100, activity.liquidity + historicalGap)) };
  });
  const latest = snapshots.at(-1), previous = snapshots.at(-2);
  if (!latest || !previous) return base;
  const history = snapshots.map(({ month, market, property }) => ({ month, market, property }));
  return { ...base, market: { ...latest, liquidity: latest.market }, previousMarket: { ...previous, liquidity: previous.market },
    property: { demand: latest.demand, competition: latest.competition, liquidity: latest.property },
    previousProperty: { liquidity: previous.property }, snapshots, history, liquidityHistory: history.map(row => row.property),
    signals: { searches: latest.searches, saves: latest.saves, enquiries: latest.enquiries, listings: latest.listings, sales90d: latest.sales90d } };
}
export function itemInsights(item: ExploreItem) {
  const existing = insightCache.get(item); if (existing) return existing;
  const p = item.property;
  const recognizedBuilding = buildings.some(b => b.communityId === p.communityId && b.type === p.propertyType && b.name.toLowerCase() === p.building.toLowerCase()) ? p.building.toLowerCase() : "";
  const matched = hasLiquidityBenchmark(item);
  const key = matched && item.listing ? [p.communityId, p.propertyType, p.bedrooms, p.status, p.furnishing, recognizedBuilding].join("|") : `${item.id}|${itemSegment(item)}|${item.name}`;
  const base = profileCache.get(key) ?? propertyInsights(p);
  const r = profileCache.has(key) || matched ? base : illustrativeInsights(item, base);
  profileCache.set(key, r); insightCache.set(item, r); return r;
}
export function hasLiquidityBenchmark(item: ExploreItem) {
  const p = item.property;
  return !p.genericBenchmark && buildings.some(b => b.communityId === p.communityId && b.type === p.propertyType && b.bedrooms === p.bedrooms);
}
export function itemScore(item: ExploreItem, kind: ExploreKind): number {
  return itemInsights(item).property.liquidity;
}
export function buyerReferenceSales(item: ExploreItem) {
  if (item.property.genericBenchmark) return [];
  const areas: Record<string, string> = { marina: "DUBAI MARINA", jvc: "JUMEIRAH VILLAGE CIRCLE", dhills: "DUBAI HILLS", dsc: "DUBAI SPORTS CITY", springs: "EMIRATE LIVING" };
  const p = item.property;
  return referenceSales.filter(s => s.area === areas[p.communityId] && s.subtype === (p.propertyType === "Apartment" ? "Flat" : p.propertyType) && s.bedrooms === p.bedrooms && s.status === p.status && (p.communityId !== "springs" || /springs/i.test(s.project)));
}
export function itemPrice(item: ExploreItem) { return item.listing?.price ?? itemInsights(item).value; }
export function itemArea(item: ExploreItem) { return item.listing?.area ?? getCommunity(item.property.communityId).name; }
export function itemSegment(item: ExploreItem) {
  return item.listing ? `${item.listing.area} · ${item.listing.bedrooms === 0 ? "Studio" : `${item.listing.bedrooms}BR`} ${item.listing.type} · ${item.listing.status}` : segmentName(item.property, getCommunity(item.property.communityId).name);
}
export interface BuyerFilters { city: string; community: string; type: string; bedrooms: string; status: string; minSize: string; maxSize: string; minPrice: string; maxPrice: string; search: string }
export const emptyBuyerFilters: BuyerFilters = { city: "", community: "", type: "", bedrooms: "", status: "", minSize: "", maxSize: "", minPrice: "", maxPrice: "", search: "" };
export const defaultBuyerFilters: BuyerFilters = { ...emptyBuyerFilters, city: "Dubai", type: "Residential", status: "Ready" };
export function parseBuyerFilters(s: Record<string, unknown>): Partial<BuyerFilters> {
  return Object.fromEntries(Object.keys(emptyBuyerFilters).filter(key => typeof s[key] === "string").map(key => [key, s[key]])) as Partial<BuyerFilters>;
}
export function filterItems(items: ExploreItem[], f: BuyerFilters) {
  return items.filter(item => {
    const p = item.property, row = item.listing;
    const price = row?.price ?? itemPrice(item), area = itemArea(item);
    return (!f.city || row?.city === f.city) && (!f.community || (row ? areaIds[row.area] === f.community : p.communityId === f.community) || area === f.community)
      && (!f.type || (f.type === "Residential" ? supportedTypes.some(t => t === (row?.type ?? p.propertyType)) : (row?.type ?? p.propertyType) === f.type))
      && (!f.bedrooms || p.bedrooms === Number(f.bedrooms))
      && (!f.status || (row?.status?.toLowerCase() ?? p.status.toLowerCase()) === f.status.toLowerCase())
      && (!f.minSize || (!row && p.sizeSqft >= Number(f.minSize))) && (!f.maxSize || (!row && p.sizeSqft <= Number(f.maxSize)))
      && (!f.minPrice || (item.priceBand ? item.priceBand.max >= Number(f.minPrice) : price >= Number(f.minPrice)))
      && (!f.maxPrice || (item.priceBand ? item.priceBand.min <= Number(f.maxPrice) : price <= Number(f.maxPrice)))
      && `${item.name} ${area} ${row?.building ?? ""} ${row?.city ?? ""}`.toLowerCase().includes(f.search.trim().toLowerCase());
  });
}
export function sortItems(items: ExploreItem[], sort: string, kind: ExploreKind) {
  return [...items].sort((a, b) => sort === "price" ? itemPrice(a) - itemPrice(b) : sort === "price-desc" ? itemPrice(b) - itemPrice(a) : sort === "newest" ? (b.listing?.date ?? "").localeCompare(a.listing?.date ?? "") : (itemScore(b, kind) ?? -1) - (itemScore(a, kind) ?? -1));
}
export interface SavedLiquidity { id: string; kind: ExploreKind; score: number | null; savedAt: string }
export function propertyWatchlist(saved: { id: string; kind: string; score: number | null; savedAt: string }[]): SavedLiquidity[] {
  return saved.filter((s): s is SavedLiquidity => s.kind === "properties");
}
export function toggleSaved(saved: SavedLiquidity[], item: ExploreItem, kind: ExploreKind): SavedLiquidity[] {
  return saved.some(s => s.id === item.id && s.kind === kind) ? saved.filter(s => s.id !== item.id || s.kind !== kind) : [...saved, { id: item.id, kind, score: itemScore(item, kind), savedAt: new Date().toISOString() }];
}
