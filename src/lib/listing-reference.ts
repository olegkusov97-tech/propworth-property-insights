import raw from "@/data/listing-reference.json";
import source from "@/assets/bayut_selling_properties.csv.asset.json";
import type { PropertyDetails } from "./property";

export const listingSourceUrl = source.url;
export const listingReferencePeriod = "15 Dec 2021–25 Apr 2024";
const areas: Record<string, { area: string; city: string }> = {
  jvc: { area: "Jumeirah Village Circle (JVC)", city: "Dubai" },
  marina: { area: "Dubai Marina", city: "Dubai" },
  dhills: { area: "Dubai Hills Estate", city: "Dubai" },
  springs: { area: "The Springs", city: "Dubai" },
  dsc: { area: "Dubai Sports City", city: "Dubai" },
  reem: { area: "Al Reem Island", city: "Abu Dhabi" },
  yas: { area: "Yas Island", city: "Abu Dhabi" },
  aljada: { area: "Aljada", city: "Sharjah" },
};
export interface ListingReference {
  price: number; type: string; bedrooms: number; bathrooms: number; address: string;
  furnishing: string; status: string; date: string; area: string; city: string;
}
// File order is newest first. These are advertised records, not unique verified units.
export const listingReferences: readonly ListingReference[] = raw;
export function matchingListingReferences(p: PropertyDetails) {
  const location = areas[p.communityId];
  if (!location) return [];
  return listingReferences.filter(row => row.area === location.area && row.city === location.city
    && row.type === p.propertyType && row.bedrooms === p.bedrooms && row.status === p.status);
}