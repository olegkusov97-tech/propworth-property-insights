import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Screen, Card, Meter, Disclaimer } from "@/components/pw/ui";
import { usePlan } from "@/lib/store";
import { getCommunity, liquidityScore, demandIndex, competitionIndex, sale90Probability, affordability, liquidityLabel, aed } from "@/lib/market";

type S = { ids: string; income: number; savings: number; debts: number };
export const Route = createFileRoute("/buyer/compare")({
  validateSearch: (s: Record<string, unknown>): S => ({ ids: String(s["ids"] ?? "jvc,marina"), income: Number(s["income"] ?? 35000), savings: Number(s["savings"] ?? 450000), debts: Number(s["debts"] ?? 0) }),
  head: () => ({
    meta: [
      { title: "Compare by Liquidity — Property Liquidity by Property Finder" },
      { name: "description", content: "Compare UAE communities on liquidity, demand and future resale ease — not just price." },
      { property: "og:title", content: "Compare Properties by Liquidity — Property Liquidity by Property Finder" },
      { property: "og:description", content: "See which homes may be easier to resell in the future." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Compare,
});

function Compare() {
  const s = Route.useSearch();
  const [, setPlan] = usePlan();
  const nav = useNavigate();
  const list = s.ids.split(",").map(getCommunity);
  const best = [...list].sort((a, b) => liquidityScore(b) - liquidityScore(a))[0]!;
  const rows: [string, (c: ReturnType<typeof getCommunity>) => string | number, boolean?][] = [
    ["Typical price (1,000 sq ft)", (c) => aed(c.avgPricePerSqft * 1000)],
    ["Liquidity Score", liquidityScore, true],
    ["Buyer demand", demandIndex, true],
    ["Competition", competitionIndex, true],
    ["Avg days to sell", (c) => c.avgDaysOnMarket],
    ["Est. resale in 90d*", (c) => `${sale90Probability(c)}%`],
    ["Rental yield", (c) => `${c.rentalYield}%`],
  ];
  return (
    <Screen title="Compare by liquidity" back="/buyer" tone="Buyer">
      <Card className="bg-secondary">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Easiest to resell</p>
        <p className="font-display text-xl font-bold">{best.name}</p>
        <p className="text-sm text-muted-foreground">{liquidityLabel(liquidityScore(best))} liquidity — stronger demand relative to supply means more buyers when you sell.</p>
      </Card>
      {rows.map(([label, fn, bar]) => (
        <Card key={label} className="space-y-2 p-3">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <span className="w-28 truncate">{c.name}</span>
              {bar ? <Meter value={Number(fn(c))} className={label === "Competition" ? "bg-accent" : "bg-primary"} /> : <span className="flex-1" />}
              <b className="w-16 text-right">{fn(c)}</b>
            </div>
          ))}
        </Card>
      ))}
      <Disclaimer>*Indicative probability a typical home would sell within 90 days at market price. Unvalidated estimate from simulated data.</Disclaimer>
      <button className="w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground" onClick={() => {
        setPlan({ income: s.income, savings: s.savings, debts: s.debts, budget: affordability(s.income, s.savings, s.debts).budget, shortlist: list.map((c) => c.id), createdAt: new Date().toISOString() });
        nav({ to: "/buyer/plan" });
      }}>Save as my purchase plan</button>
    </Screen>
  );
}
