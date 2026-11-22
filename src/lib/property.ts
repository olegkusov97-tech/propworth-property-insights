import { communities, getCommunity, type Community, type PropertyType } from "./market";
import type { OwnedProperty } from "./store";
import { segmentName, type OwnerSnapshot } from "./owner-history";

export interface PropertyDetails extends OwnedProperty {
  building: string; propertyType: PropertyType; status: "Ready" | "Off-plan";
  floor: number | null; view: string; condition: string; furnishing: string;
  balcony: string; parking: number | null;
}
export const emptyProperty: PropertyDetails = {
  communityId: "", building: "", propertyType: "Apartment", bedrooms: 2,
  sizeSqft: 1100, askingPremium: 0, status: "Ready", floor: null,
  view: "Not specified", condition: "Not specified", furnishing: "Not specified",
  balcony: "Not specified", parking: null,
};
export function normalizeProperty(p: OwnedProperty): PropertyDetails {
  return { ...emptyProperty, ...p, propertyType: p.propertyType ?? getCommunity(p.communityId).type };
}
export const dubaiCommunities = communities.filter(c => c.city === "Dubai");
export interface Building {
  id: string; name: string; communityId: string; type: PropertyType;
  priceFactor: number; bedrooms: number; sizeSqft: number; status: "Ready" | "Off-plan";
}
export const buildings: Building[] = [
  { id: "marina-gate", name: "Marina Gate", communityId: "marina", type: "Apartment", priceFactor: 1.23, bedrooms: 2, sizeSqft: 1325, status: "Ready" },
  { id: "princess", name: "Princess Tower", communityId: "marina", type: "Apartment", priceFactor: .93, bedrooms: 2, sizeSqft: 1200, status: "Ready" },
  { id: "silverene", name: "Silverene Tower", communityId: "marina", type: "Apartment", priceFactor: 1.08, bedrooms: 1, sizeSqft: 830, status: "Ready" },
  { id: "bloom", name: "Bloom Towers", communityId: "jvc", type: "Apartment", priceFactor: 1.06, bedrooms: 1, sizeSqft: 750, status: "Ready" },
  { id: "belgravia", name: "Belgravia", communityId: "jvc", type: "Apartment", priceFactor: 1.15, bedrooms: 2, sizeSqft: 1250, status: "Ready" },
  { id: "binghatti", name: "Binghatti Circle", communityId: "jvc", type: "Apartment", priceFactor: 1.12, bedrooms: 2, sizeSqft: 1100, status: "Off-plan" },
  { id: "sidra", name: "Sidra Villas", communityId: "dhills", type: "Villa", priceFactor: 1.12, bedrooms: 4, sizeSqft: 3523, status: "Ready" },
  { id: "maple", name: "Maple", communityId: "dhills", type: "Townhouse", priceFactor: .92, bedrooms: 3, sizeSqft: 2228, status: "Ready" },
  { id: "park-heights", name: "Park Heights", communityId: "dhills", type: "Apartment", priceFactor: .85, bedrooms: 2, sizeSqft: 1088, status: "Ready" },
  { id: "springs-7", name: "The Springs 7", communityId: "springs", type: "Townhouse", priceFactor: 1.04, bedrooms: 3, sizeSqft: 2456, status: "Ready" },
  { id: "springs-3", name: "The Springs 3", communityId: "springs", type: "Townhouse", priceFactor: .97, bedrooms: 2, sizeSqft: 1690, status: "Ready" },
  { id: "elite", name: "Elite Sports Residence", communityId: "dsc", type: "Apartment", priceFactor: .94, bedrooms: 1, sizeSqft: 820, status: "Ready" },
  { id: "victory", name: "Victory Heights", communityId: "dsc", type: "Villa", priceFactor: 1.7, bedrooms: 4, sizeSqft: 3600, status: "Ready" },
];
export function fromBuilding(b: Building): PropertyDetails {
  return { ...emptyProperty, communityId: b.communityId, building: b.name,
    propertyType: b.type, bedrooms: b.bedrooms, sizeSqft: b.sizeSqft, status: b.status };
}
export const pfProperties: { id: string; property: PropertyDetails }[] = buildings
  .filter(b => ["marina-gate", "belgravia", "sidra"].includes(b.id))
  .map(b => ({ id: b.id, property: { ...fromBuilding(b), view: b.type === "Villa" ? "Garden" : "Open / community", condition: "Good", balcony: "Yes", parking: b.type === "Villa" ? 2 : 1, floor: b.type === "Apartment" ? 12 : null } }));

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
export function propertyErrors(p: PropertyDetails) {
  const errors: string[] = [];
  if (!communities.some(c => c.id === p.communityId)) errors.push("Choose a community.");
  if (!Number.isFinite(p.sizeSqft) || p.sizeSqft < 200 || p.sizeSqft > 30000) errors.push("Size must be between 200 and 30,000 sq ft.");
  if (!Number.isInteger(p.bedrooms) || p.bedrooms < 0 || p.bedrooms > 10) errors.push("Bedrooms must be between 0 and 10.");
  if (p.floor !== null && (!Number.isInteger(p.floor) || p.floor < 0 || p.floor > 200)) errors.push("Floor must be between 0 and 200.");
  if (p.parking !== null && (!Number.isInteger(p.parking) || p.parking < 0 || p.parking > 10)) errors.push("Parking must be between 0 and 10 spaces.");
  return errors;
}

function quality(p: PropertyDetails) {
  return (p.view === "Sea / marina" ? .09 : p.view === "Garden" ? .035 : p.view === "Road" ? -.045 : 0)
    + (p.condition === "Renovated" ? .07 : p.condition === "Needs renovation" ? -.10 : 0)
    + (p.furnishing === "Furnished" ? .025 : p.furnishing === "Part furnished" ? .01 : 0)
    + (p.balcony === "Yes" ? .02 : p.balcony === "No" ? -.02 : 0)
    + (p.parking === null ? 0 : p.parking === 0 ? -.035 : Math.min(p.parking, 3) * .012)
    + (p.propertyType === "Apartment" && p.floor !== null ? Math.min(p.floor, 40) * .001 : 0);
}
function typeFactor(p: PropertyDetails, c: Community) {
  return p.propertyType === c.type ? 1 : p.propertyType === "Villa" ? 1.22 : p.propertyType === "Townhouse" ? 1.05 : .86;
}
export function saleability(score: number) {
  return score >= 70 ? "High" : score >= 50 ? "Moderate" : "Low";
}
export interface MarketActivity {
  searches: number; saves: number; enquiries: number; listings: number; sales90d: number; days: number;
}
export function scoreMarket(activity: MarketActivity) {
  const weighted = activity.searches * .2 + activity.saves + activity.enquiries * 3;
  const demand = Math.round(weighted / (weighted + activity.listings * 10) * 100);
  const competition = Math.round(clamp(activity.listings / (activity.sales90d / 3) * 10));
  const liquidity = Math.round(demand * .45 + (100 - competition) * .3 + clamp(100 - activity.days) * .25);
  return { ...activity, demand, competition, liquidity };
}
function marketSnapshot(c: Community, monthsAgo = 0) {
  // Two summer records deliberately stay stable; other months include seasonal reversals.
  if (monthsAgo === 4) monthsAgo = 3;
  const shifts: Record<string, [number, number, number]> = {
    marina: [.064, -.035, .047], jvc: [.042, .061, .032], dhills: [.081, -.047, .065],
    springs: [.035, -.026, .041], dsc: [-.022, .072, -.031],
  };
  const [d, s, t] = shifts[c.id] ?? [.03, .02, .025];
  const season = [1, 1, .90, 1.12, 1.12, .94, 1.16, .98, 1.12, .88, 1.14, 1.04][monthsAgo] ?? 1;
  return scoreMarket({
    searches: Math.round(c.searches / Math.pow(1 + d, monthsAgo) * season),
    saves: Math.round(c.saves / Math.pow(1 + d * 1.2, monthsAgo) * season),
    enquiries: Math.round(c.enquiries / Math.pow(1 + d * .85, monthsAgo) * season),
    listings: Math.round(c.activeListings / Math.pow(1 + s, monthsAgo) / season),
    sales90d: Math.round(c.transactions90d / Math.pow(1 + t, monthsAgo) * season),
    days: Math.max(14, c.avgDaysOnMarket + Math.round(d * 45 * monthsAgo)),
  });
}
function segmentSnapshot(p: PropertyDetails, c: Community, monthsAgo = 0) {
  const m = marketSnapshot(c, monthsAgo);
  // A fixed segment mix, independent of building, optional characteristics and asking price.
  const share = clamp(.07 / (1 + Math.abs(p.bedrooms - 2) * .4)
    * (p.propertyType === c.type ? 1 : .45) * (p.status === "Off-plan" ? .6 : 1)
    / (1 + Math.max(0, p.sizeSqft - 1500) / 8000), .008, .09);
  const fit = (p.propertyType === c.type ? 1 : .88)
    * (p.status === "Off-plan" ? .78 : 1) / (1 + Math.abs(p.bedrooms - 2) * .065)
    / (1 + Math.max(0, p.sizeSqft - 1500) / 12000);
  return scoreMarket({
    searches: Math.max(1, Math.round(m.searches * share * fit)),
    saves: Math.max(1, Math.round(m.saves * share * fit)),
    enquiries: Math.max(1, Math.round(m.enquiries * share * fit)),
    listings: Math.max(8, Math.round(m.listings * share)),
    sales90d: Math.max(6, Math.round(m.sales90d * share * fit)),
    days: Math.round(m.days / fit),
  });
}
export function monthlyMeaning(now: ReturnType<typeof scoreMarket>, prev: ReturnType<typeof scoreMarket>) {
  const demandGrowth = (now.searches / prev.searches - 1) * 100;
  const supplyGrowth = (now.listings / prev.listings - 1) * 100;
  const delta = now.liquidity - prev.liquidity;
  const activity = `Buyer searches ${demandGrowth >= 0 ? "rose" : "fell"} ${Math.abs(demandGrowth).toFixed(1)}%, while competing supply ${supplyGrowth >= 0 ? "grew" : "fell"} ${Math.abs(supplyGrowth).toFixed(1)}%.`;
  const balance = demandGrowth >= 0 && supplyGrowth > demandGrowth
    ? "More buyers are looking, but listings grew faster, giving them more choice."
    : demandGrowth >= 0 && supplyGrowth <= 0
      ? "More buyers are competing for fewer listings, improving your selling position."
      : demandGrowth > supplyGrowth
        ? "Buyer interest is holding up better than supply, easing competitive pressure."
        : "Supply is outpacing buyer interest, increasing pressure on sellers.";
  const outcome = Math.abs(delta) <= 1
    ? "Overall market liquidity stayed broadly stable: buyer interest, competition and selling speed largely offset one another."
    : delta > 0 ? `Market liquidity improved by ${delta} points as the combined balance of demand, competition and selling speed strengthened.`
      : `Market liquidity fell by ${Math.abs(delta)} points as the combined balance of demand, competition and selling speed weakened.`;
  const advice = Math.abs(delta) <= 1 ? "For you: no clear change in selling conditions; keep your asking price close to comparable sales."
    : delta > 0 ? "For you: similar homes face better selling conditions, but an above-market asking price can still slow a sale."
      : "For you: expect more price-sensitive buyers; competitive pricing and a well-presented home matter more.";
  return { activity, balance, outcome, advice, delta };
}
export const liquidityMonths = ["Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026", "Nov 2026"];

export function propertyInsights(input: OwnedProperty) {
  const p = normalizeProperty(input), c = getCommunity(p.communityId);
  const building = buildings.find(b => b.communityId === p.communityId && b.name.toLowerCase() === p.building.trim().toLowerCase() && b.type === p.propertyType);
  const q = quality(p), type = typeFactor(p, c);
  const sizeFactor = clamp(1.04 - p.sizeSqft / 40000, .82, 1.04);
  const bedroomFactor = 1 + (p.bedrooms - 2) * .012;
  const pricePerSqft = Math.round(c.avgPricePerSqft * (building?.priceFactor ?? type) * (1 + q) * sizeFactor * bedroomFactor * (p.status === "Off-plan" ? .92 : 1));
  const value = Math.round(pricePerSqft * p.sizeSqft / 1000) * 1000;
  const communityMarket = marketSnapshot(c), previousCommunityMarket = marketSnapshot(c, 1);
  const market = segmentSnapshot(p, c), previousMarket = segmentSnapshot(p, c, 1);
  // Illustrative relative positioning only; legacy asking premiums are deliberately ignored.
  const appeal = q * 100 + (building ? (building.priceFactor - type) * 18 : 0);
  const property = { demand: market.demand, competition: market.competition,
    liquidity: Math.round(clamp(market.liquidity + appeal * .65)) };
  // Comparable records use segment-level pricing, never the subject's quality or asking price.
  const segmentPricePerSqft = c.avgPricePerSqft * type * sizeFactor * bedroomFactor * (p.status === "Off-plan" ? .92 : 1);
  const matchingBuildings = buildings.filter(b => b.communityId === p.communityId && b.type === p.propertyType && b.status === p.status);
  const fallbacks = p.propertyType === "Apartment" ? ["Orchid Residences", "Park View Tower", "The Residence"]
    : p.propertyType === "Villa" ? ["Garden Villas", "Parkside Villas", "The Meadows Residences"]
      : ["Parkside Townhouses", "Garden Townhomes", "The Courtyard"];
  const comparables = [.82, .9, .96, 1.04, 1.12, 1.2].map((ratio, i) => {
    const match = matchingBuildings[i % Math.max(1, matchingBuildings.length)];
    const buildingName = match?.name ?? `${c.name} · ${fallbacks[i % 3] ?? "Residences"}`;
    const sizeSqft = Math.round(p.sizeSqft * ratio);
    const rate = segmentPricePerSqft * (match ? match.priceFactor / type : 1) * (1 + (i - 2.5) * .018);
    const price = Math.round(sizeSqft * rate / 1000) * 1000;
    return {
      id: `comp-${i}`, communityId: c.id, building: buildingName, propertyType: p.propertyType,
      bedrooms: p.bedrooms, status: p.status, sizeSqft, price,
      pricePerSqft: Math.round(price / sizeSqft),
      transactionDate: ["2026-11-17", "2026-11-08", "2026-10-26", "2026-10-12", "2026-09-28", "2026-09-09"][i] ?? "2026-11-17",
    };
  });
  const signals = { searches: market.searches, saves: market.saves, enquiries: market.enquiries, listings: market.listings, sales90d: market.sales90d };
  // Seeded sample records use a fixed historical property profile, never today's optional details.
  const historicalGaps = [2, 3, 2, 4, 4, 1, 3, 2, 4, 3, 3, 0];
  const snapshots: OwnerSnapshot[] = liquidityMonths.map((month, i) => {
    const snapshot = segmentSnapshot(p, c, 11 - i);
    return { ...snapshot, month, market: snapshot.liquidity,
      property: i === 11 ? property.liquidity : Math.round(clamp(snapshot.liquidity + (historicalGaps[i] ?? 3))),
      segment: segmentName(p, c.name) };
  });
  const previousProperty = { liquidity: snapshots[10]?.property ?? property.liquidity };
  const history = snapshots.map(({ month, market, property }) => ({ month, market, property }));
  return { p, c, value, pricePerSqft, market, previousMarket, property, previousProperty,
    comparables, signals, history, snapshots, liquidityHistory: history.map(row => row.property),
    matchedBuilding: Boolean(building), communityMarket, previousCommunityMarket,
    saleability: saleability(property.liquidity) };
}
