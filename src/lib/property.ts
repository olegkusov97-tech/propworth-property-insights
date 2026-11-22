import { communities, getCommunity, type Community, type PropertyType } from "./market";
import type { OwnedProperty } from "./store";

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
function marketSnapshot(c: Community, previous = false) {
  const shifts: Record<string, [number, number, number]> = {
    marina: [.064, -.035, .047], jvc: [.042, .061, .032], dhills: [.081, -.047, .065],
    springs: [.035, -.026, .041], dsc: [-.022, .072, -.031],
  };
  const [d, s, t] = shifts[c.id] ?? [.03, .02, .025];
  const searches = Math.round(c.searches / (previous ? 1 + d : 1));
  const saves = Math.round(c.saves / (previous ? 1 + d * 1.2 : 1));
  const enquiries = Math.round(c.enquiries / (previous ? 1 + d * .85 : 1));
  const listings = Math.round(c.activeListings / (previous ? 1 + s : 1));
  const sales90d = Math.round(c.transactions90d / (previous ? 1 + t : 1));
  const days = c.avgDaysOnMarket + (previous ? Math.round(d * 45) : 0);
  const weighted = searches * .2 + saves + enquiries * 3;
  const demand = Math.round(weighted / (weighted + listings * 10) * 100);
  const competition = Math.round(clamp(listings / (sales90d / 3) * 10));
  const liquidity = Math.round(demand * .45 + (100 - competition) * .3 + clamp(100 - days) * .25);
  return { searches, saves, enquiries, listings, sales90d, days, demand, competition, liquidity };
}

export function propertyInsights(input: OwnedProperty) {
  const p = normalizeProperty(input), c = getCommunity(p.communityId);
  const building = buildings.find(b => b.communityId === p.communityId && b.name.toLowerCase() === p.building.trim().toLowerCase() && b.type === p.propertyType);
  const q = quality(p), type = typeFactor(p, c);
  const sizeFactor = clamp(1.04 - p.sizeSqft / 40000, .82, 1.04);
  const bedroomFactor = 1 + (p.bedrooms - 2) * .012;
  const pricePerSqft = Math.round(c.avgPricePerSqft * (building?.priceFactor ?? type) * (1 + q) * sizeFactor * bedroomFactor * (p.status === "Off-plan" ? .92 : 1));
  const value = Math.round(pricePerSqft * p.sizeSqft / 1000) * 1000;
  const market = marketSnapshot(c), previousMarket = marketSnapshot(c, true);
  const appeal = q * 100 + (building ? (building.priceFactor - type) * 18 : 0)
    - p.sizeSqft / (p.propertyType === "Apartment" ? 700 : 1800) - Math.abs(p.bedrooms - 2) * 1.5
    + (p.propertyType === "Villa" ? 4 : p.propertyType === "Townhouse" ? 2 : 0)
    - (p.propertyType !== c.type ? 5 : 0) - (p.status === "Off-plan" ? 12 : 0);
  const atPrice = (m: typeof market) => {
    const demand = Math.round(clamp(m.demand + appeal - p.askingPremium * 1.8));
    const competition = Math.round(clamp(m.competition - appeal * .3 + p.askingPremium * 1.2));
    const days = Math.max(14, Math.round(m.days - appeal * .6 + p.askingPremium * 2));
    const liquidity = Math.round(clamp(demand * .45 + (100 - competition) * .3 + clamp(100 - days) * .25));
    return { demand, competition, days, liquidity };
  };
  const property = atPrice(market), previousProperty = atPrice(previousMarket);
  // Synthetic cohort: every row obeys the exact disclosed matching criteria.
  const comparables = [.82, .9, .96, 1.04, 1.12, 1.2].map((ratio, i) => ({
    id: `comp-${i}`, communityId: c.id, propertyType: p.propertyType, bedrooms: p.bedrooms,
    status: p.status, sizeSqft: Math.round(p.sizeSqft * ratio),
    price: Math.round(p.sizeSqft * ratio * pricePerSqft * (1 + (i - 2.5) * .018) / 1000) * 1000,
    period: ["Nov 2026", "Nov 2026", "Oct 2026", "Oct 2026", "Sep 2026", "Sep 2026"][i] ?? "Nov 2026",
  }));
  const share = clamp(.07 / (1 + Math.abs(p.bedrooms - 2) * .4) * (p.status === "Off-plan" ? .6 : 1), .015, .09);
  const signals = {
    searches: Math.round(market.searches * share * (1 + appeal / 100)),
    saves: Math.round(market.saves * share * (1 + appeal / 100)),
    enquiries: Math.round(market.enquiries * share * (1 + appeal / 100)),
    listings: Math.max(8, Math.round(market.listings * share)),
    sales90d: Math.max(6, Math.round(market.sales90d * share)),
  };
  const liquidityHistory = Array.from({ length: 12 }, (_, i) => Math.round(clamp(previousProperty.liquidity - (10 - i) * .6 + Math.sin(i * .9) * 1.8)));
  liquidityHistory[10] = previousProperty.liquidity;
  liquidityHistory[11] = property.liquidity;
  const valueHistory = Array.from({ length: 12 }, (_, i) => value * (1 - (11 - i) * .006));
  return { p, c, value, pricePerSqft, market, previousMarket, property, previousProperty,
    comparables, signals, liquidityHistory, valueHistory, matchedBuilding: Boolean(building),
    askingPrice: Math.round(value * (1 + p.askingPremium / 100)), saleability: saleability(property.liquidity) };
}