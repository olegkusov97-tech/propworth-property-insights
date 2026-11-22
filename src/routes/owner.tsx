import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/pw/ui";
import { PropertyOnboarding, newPropertyFlow, type PropertyFlow } from "@/components/pw/property-onboarding";
import { PropertyDashboard } from "@/components/pw/property-dashboard";
import { useOwned, useStored } from "@/lib/store";
import { getCommunity } from "@/lib/market";
import { normalizeProperty } from "@/lib/property";
import { homeKey, switchHome, type RetainedHomes } from "@/lib/owner-properties";
import type { OwnerSnapshot } from "@/lib/owner-history";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "My Property Liquidity — Property Liquidity by Property Finder" },
      { name: "description", content: "Add your Dubai property and review characteristic-aware value, buyer demand, market liquidity and saleability." },
      { property: "og:title", content: "Homeowner Liquidity Dashboard — Property Liquidity by Property Finder" },
      { property: "og:description", content: "Compare your home's liquidity with similar properties and explore buyer demand, competition and monthly market trends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Owner,
});

function Owner() {
  const [owned, setOwned, loaded] = useOwned();
  const [flow, setFlow, flowLoaded] = useStored<PropertyFlow | null>("pw-owner-draft", null);
  const [homes, setHomes, homesLoaded] = useStored<RetainedHomes>("pw-owner-retained-homes", {});
  if (!loaded || !flowLoaded || !homesLoaded) return <Screen title="My property" back="/" tone="Homeowner"><p className="text-sm text-muted-foreground">Loading your property…</p></Screen>;
  if (flow || !owned) {
    const activeFlow = flow ?? newPropertyFlow;
    return <Screen title={activeFlow.stage === "review" ? "Review property" : owned ? "Change Property" : "Add your property"} back="/" tone="Homeowner">
      <PropertyOnboarding flow={activeFlow} onChange={setFlow} hasProperty={Boolean(owned)} onCancel={() => setFlow(null)} onConfirm={p => {
        let snapshots: OwnerSnapshot[] = [];
        try { const raw: unknown = JSON.parse(localStorage.getItem("pw-owner-snapshots-v1") ?? "[]"); if (Array.isArray(raw)) snapshots = raw as OwnerSnapshot[]; } catch { /* Keep property selection usable without browser storage. */ }
        const result = switchHome(homes, owned, snapshots, p);
        setHomes(result.homes);
        try { localStorage.setItem("pw-owner-snapshots-v1", JSON.stringify(result.active.snapshots)); } catch { /* Retained data stays in this session. */ }
        setOwned(result.active.property); setFlow(null); window.scrollTo({ top: 0 });
      }} />
    </Screen>;
  }
  const p = normalizeProperty(owned), c = getCommunity(p.communityId);
  return <Screen title={p.sourceAddress ?? `${p.bedrooms === 0 ? "Studio" : `${p.bedrooms}BR`} ${p.propertyType}, ${p.building || c.name}`} back="/" tone="Homeowner">
    {p.building && <p className="text-xs text-muted-foreground">{p.sourceArea ?? c.name}</p>}
    <PropertyDashboard key={homeKey(p)} owned={p} onChange={setOwned} onEdit={() => setFlow({ ...newPropertyFlow, property: { ...newPropertyFlow.property } })} onReplace={() => setFlow({ ...newPropertyFlow, property: { ...newPropertyFlow.property } })} />
  </Screen>;
}
