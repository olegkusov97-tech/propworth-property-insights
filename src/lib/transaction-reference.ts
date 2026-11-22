import raw from "@/data/transaction-reference.json";
import type { PropertyDetails } from "./property";

export const referenceDate = "2026-11-22";
const areaByCommunity: Record<string, string> = { marina: "DUBAI MARINA", jvc: "JUMEIRAH VILLAGE CIRCLE", dhills: "DUBAI HILLS", dsc: "DUBAI SPORTS CITY", springs: "EMIRATE LIVING" };
export interface ReferenceSale { id: string; date: string; area: string; project: string; subtype: string; status: string; bedrooms: number; price: number; areaSqm: number; sizeSqft: number; pricePerSqft: number }
export const referenceSales: ReferenceSale[] = raw.flatMap(row => {
  const [id, date, area, project, subtype, status, rooms, price, areaSqm] = row;
  if (typeof id !== "string" || typeof date !== "string" || typeof area !== "string" || typeof subtype !== "string" || typeof status !== "string" || typeof price !== "number" || typeof areaSqm !== "number") return [];
  const bedrooms = rooms === "Studio" ? 0 : typeof rooms === "string" && /^\d+ B\/R$/.test(rooms) ? Number(rooms.split(" ")[0]) : null;
  if (bedrooms === null) return [];
  const sizeSqft = areaSqm * 10.7639104167;
  return [{ id, date, area, project: typeof project === "string" ? project : "Project not supplied", subtype, status, bedrooms, price, areaSqm, sizeSqft, pricePerSqft: Math.round(price / sizeSqft) }];
});
export function matchingReferenceSales(p: PropertyDetails) {
  // Never infer townhouse classification from records explicitly labelled Villa.
  const subtype = p.propertyType === "Apartment" ? "Flat" : p.propertyType;
  return referenceSales.filter(s => s.area === areaByCommunity[p.communityId] && s.subtype === subtype
    && s.status === p.status && s.bedrooms === p.bedrooms && s.sizeSqft >= p.sizeSqft * .75 && s.sizeSqft <= p.sizeSqft * 1.25
    && (p.communityId !== "springs" || /springs/i.test(s.project)));
}