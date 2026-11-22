import asset from "@/assets/bayut-buyer-listings.json.asset.json";
import { queryOptions } from "@tanstack/react-query";
export interface HistoricalListing {
  id: string; price: number; type: string; bedrooms: number; bathrooms: number;
  address: string; furnishing: string; status: string; date: string; building: string;
  area: string; city: string; country: string; year: number; buildingParking: number;
  buildingFloors: number; buildingArea: number; elevators: number; purpose: string;
}
export const historicalListings: HistoricalListing[] = [];
export const historicalAreas: string[] = [];
export const historicalTypes: string[] = [];
export async function fetchHistoricalListings(baseUrl?: string): Promise<HistoricalListing[]> {
  const response = await fetch(baseUrl ? new URL(asset.url, baseUrl).href : asset.url);
  if (!response.ok) throw new Error("The historical listing file could not be loaded.");
  const raw: unknown = await response.json();
  if (!Array.isArray(raw) || raw.some(row => typeof row !== "string")) throw new Error("The listing file format is invalid.");
  return raw.map((record: string) => JSON.parse(record) as HistoricalListing);
}
export const historicalCatalogQuery = queryOptions({ queryKey: ["historical-bayut-catalog", asset.asset_id], queryFn: () => fetchHistoricalListings(), staleTime: Infinity });
export function initializeHistoricalListings(rows: HistoricalListing[]) {
  if (historicalListings.length) return;
  for (const row of rows) historicalListings.push(row);
  historicalAreas.push(...[...new Set(rows.map(row => row.area))].sort());
  historicalTypes.push(...[...new Set(rows.map(row => row.type))].sort());
}
export function listingBuilding(row: HistoricalListing) {
  return row.building && row.building !== "Unknown" ? row.building : "Not supplied";
}