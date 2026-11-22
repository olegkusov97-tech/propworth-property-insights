import { useEffect, useState } from "react";

export interface OwnedProperty { communityId: string; sizeSqft: number; bedrooms: number; askingPremium: number }
export interface PurchasePlan { income: number; savings: number; debts: number; budget: number; shortlist: string[]; createdAt: string }

function useStored<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setV(JSON.parse(raw));
  }, [key]);
  const set = (n: T) => { setV(n); localStorage.setItem(key, JSON.stringify(n)); };
  return [v, set] as const;
}
export const useOwned = () => useStored<OwnedProperty | null>("pw-owned", null);
export const usePlan = () => useStored<PurchasePlan | null>("pw-plan", null);
