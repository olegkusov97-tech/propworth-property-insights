import { useEffect, useState } from "react";

export interface OwnedProperty {
  communityId: string; sizeSqft: number; bedrooms: number; askingPremium: number;
  building?: string; propertyType?: "Apartment" | "Villa" | "Townhouse";
  status?: "Ready" | "Off-plan"; floor?: number | null;
  view?: string; condition?: string; furnishing?: string;
  balcony?: string; parking?: number | null;
}
export interface PurchasePlan { income: number; savings: number; debts: number; budget: number; shortlist: string[]; createdAt: string }

export function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw));
    } catch { /* Keep the default if browser storage is unavailable or malformed. */ }
    setLoaded(true);
  }, [key]);
  const set = (n: T) => {
    setV(n);
    try { localStorage.setItem(key, JSON.stringify(n)); } catch { /* Remain usable without storage. */ }
  };
  return [v, set, loaded] as const;
}
export const useOwned = () => useStored<OwnedProperty | null>("pw-owned", null);
export const usePlan = () => useStored<PurchasePlan | null>("pw-plan", null);
