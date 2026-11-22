import { createFileRoute } from "@tanstack/react-router";
import { Screen } from "@/components/pw/ui";
import { PropertyOnboarding, newPropertyFlow, type PropertyFlow } from "@/components/pw/property-onboarding";
import { PropertyDashboard } from "@/components/pw/property-dashboard";
import { useOwned, useStored } from "@/lib/store";
import { getCommunity } from "@/lib/market";
import { normalizeProperty } from "@/lib/property";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "My Property Liquidity — PropWorth" },
      { name: "description", content: "Add your Dubai property and review characteristic-aware value, buyer demand, market liquidity and saleability." },
      { property: "og:title", content: "Homeowner Liquidity Dashboard — PropWorth" },
      { property: "og:description", content: "Understand your home's saleability with comparable properties, market changes and an asking price simulator." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Owner,
});

function Owner() {
  const [owned, setOwned, loaded] = useOwned();
  const [flow, setFlow, flowLoaded] = useStored<PropertyFlow | null>("pw-owner-draft", null);
  if (!loaded || !flowLoaded) return <Screen title="My property" back="/" tone="Homeowner"><p className="text-sm text-muted-foreground">Loading your property…</p></Screen>;
  if (flow || !owned) {
    const activeFlow = flow ?? newPropertyFlow;
    return <Screen title={activeFlow.stage === "review" ? "Review property" : activeFlow.source === "Edit Property" ? "Edit Property" : "Add your property"} back="/" tone="Homeowner">
      <PropertyOnboarding flow={activeFlow} onChange={setFlow} hasProperty={Boolean(owned)} onCancel={() => setFlow(null)} onConfirm={p => { setOwned(p); setFlow(null); }} />
    </Screen>;
  }
  const p = normalizeProperty(owned), c = getCommunity(p.communityId);
  return <Screen title={`${p.bedrooms === 0 ? "Studio" : `${p.bedrooms}BR`} ${p.propertyType}, ${p.building || c.name}`} back="/" tone="Homeowner">
    {p.building && <p className="text-xs text-muted-foreground">{c.name}</p>}
    <PropertyDashboard owned={p} onChange={setOwned} onEdit={() => setFlow({ stage: "details", source: "Edit Property", property: p, query: "" })} onReplace={() => setFlow({ ...newPropertyFlow, property: { ...newPropertyFlow.property } })} />
  </Screen>;
}
