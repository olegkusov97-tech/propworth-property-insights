import type { PropertyDetails, MarketActivity } from "./property";

export interface OwnerSnapshot extends MarketActivity {
  month: string; property: number; market: number; segment: string;
}
export function segmentName(p: PropertyDetails, community: string) {
  return `${p.bedrooms === 0 ? "Studio" : `${p.bedrooms}-bedroom`} ${p.propertyType.toLowerCase()}s in ${community} · ${p.status.toLowerCase()}`;
}
// Retain closed months exactly as recorded, even after the homeowner edits details.
export function retainSnapshots(saved: OwnerSnapshot[], seed: OwnerSnapshot[], current: OwnerSnapshot): OwnerSnapshot[] {
  const closed = saved.length ? saved.filter(s => s.month !== current.month) : seed.filter(s => s.month !== current.month);
  return [...closed, current].slice(-12);
}