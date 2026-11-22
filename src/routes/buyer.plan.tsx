import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BellRing, PartyPopper } from "lucide-react";
import { Screen, Card, Spark, Trend, Disclaimer } from "@/components/pw/ui";
import { usePlan, useOwned } from "@/lib/store";
import { getCommunity, liquidityScore, history, aed } from "@/lib/market";

export const Route = createFileRoute("/buyer/plan")({
  head: () => ({
    meta: [
      { title: "My Purchase Plan — PropWorth" },
      { name: "description", content: "Your saved budget and shortlist, with market changes to watch." },
      { property: "og:title", content: "My Purchase Plan — PropWorth" },
      { property: "og:description", content: "Monitor price and liquidity changes in your shortlisted communities." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Plan,
});

function Plan() {
  const [plan] = usePlan();
  const [, setOwned] = useOwned();
  const nav = useNavigate();
  if (!plan) return <Screen title="My purchase plan" back="/buyer" tone="Buyer"><Card><p className="text-sm">No plan saved yet.</p><Link to="/buyer" className="mt-2 inline-block text-primary underline">Start planning</Link></Card></Screen>;
  return (
    <Screen title="My purchase plan" back="/buyer" tone="Buyer">
      <Card className="bg-hero text-primary-foreground">
        <p className="text-xs uppercase opacity-80">Budget</p>
        <p className="font-display text-3xl font-bold">{aed(plan.budget)}</p>
        <p className="text-xs opacity-80">Saved {new Date(plan.createdAt).toLocaleDateString()}</p>
      </Card>
      <p className="flex items-center gap-2 font-display text-lg font-bold"><BellRing className="h-5 w-5 text-primary" /> Market watch</p>
      {plan.shortlist.map((id) => {
        const c = getCommunity(id), price = c.avgPricePerSqft * 1000, pH = history(id + "v", price, 0.08), liq = liquidityScore(c), lH = history(id + "l", liq, 0.06, 0.1);
        return (
          <Card key={id} className="space-y-2">
            <div className="flex justify-between"><p className="font-semibold">{c.name}</p><span className="text-xs text-muted-foreground">{c.type}</span></div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>Price {aed(price)} <Trend now={price} prev={pH[10]!} /><Spark data={pH} /></div>
              <div>Liquidity {liq} <Trend now={liq} prev={lH[10]!} /><Spark data={lH} className="stroke-accent" /></div>
            </div>
            <button className="w-full rounded-lg border p-2 text-xs font-semibold text-primary" onClick={() => { setOwned({ communityId: id, sizeSqft: 1000, bedrooms: 2, askingPremium: 0 }); nav({ to: "/owner" }); }}>
              <PartyPopper className="mr-1 inline h-3.5 w-3.5" /> I bought here — track it as my home
            </button>
          </Card>
        );
      })}
      <Disclaimer>We'll alert you when prices or liquidity in your shortlist move more than 3% (prototype, simulated data).</Disclaimer>
    </Screen>
  );
}
