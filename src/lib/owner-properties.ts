import type { OwnedProperty } from "./store";
import type { OwnerSnapshot } from "./owner-history";

export interface RetainedHome { property: OwnedProperty; snapshots: OwnerSnapshot[] }
export type RetainedHomes = Record<string, RetainedHome>;
export function homeKey(p: OwnedProperty) {
  return JSON.stringify([p.sourceAddress ?? "", p.communityId, (p.building ?? "").trim().toLowerCase(), p.propertyType ?? "Apartment", p.bedrooms, p.sizeSqft, p.status ?? "Ready"]);
}
export function switchHome(archive: RetainedHomes, previous: OwnedProperty | null, previousSnapshots: OwnerSnapshot[], chosen: OwnedProperty) {
  const homes = { ...archive };
  if (previous) homes[homeKey(previous)] = { property: { ...previous }, snapshots: previousSnapshots.map(s => ({ ...s })) };
  const existing = homes[homeKey(chosen)];
  const active = existing ?? { property: { ...chosen }, snapshots: [] };
  return { homes: { ...homes, [homeKey(chosen)]: active }, active };
}