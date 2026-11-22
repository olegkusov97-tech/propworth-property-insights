import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet, TrendingUp, Bookmark } from "lucide-react";
import { Screen, Card, Meter, Disclaimer } from "@/components/pw/ui";
import { usePlan } from "@/lib/store";
import { communities, affordability, liquidityScore, demandIndex, liquidityLabel, aed } from "@/lib/market";

export const Route = createFileRoute("/buyer/")({
  head: () => ({
    meta: [
      { title: "Buyer Planner — PropWorth" },
      { name: "description", content: "Work out your UAE purchase budget and find communities with the strongest buyer demand." },
      { property: "og:title", content: "First-time Buyer Planner — PropWorth" },
      { property: "og:description", content: "Budget, readiness and liquidity-ranked communities for UAE renters ready to buy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Buyer,
});

function Buyer() {
  const [plan] = usePlan();
  const [f, setF] = useState({ income: 35000, savings: 450000, debts: 2000 });
  const [type, setType] = useState<string>("All");
  const [picked, setPicked] = useState<string[]>([]);
  const nav = useNavigate();
  const a = affordability(f.income, f.savings, f.debts);
  const ranked = useMemo(() => communities.filter((c) => type === "All" || c.type === type).sort((x, y) => liquidityScore(y) - liquidityScore(x)), [type]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));

  return (
    <Screen title="Plan your first purchase" back="/" tone="Buyer">
      {plan && <Link to="/buyer/plan" className="flex items-center gap-2 rounded-xl bg-secondary p-3 text-sm font-semibold"><Bookmark className="h-4 w-4 text-primary" /> View your saved purchase plan</Link>}
      <Card className="space-y-3">
        <p className="flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> Your finances (monthly AED)</p>
        {([["income", "Household income"], ["savings", "Savings available"], ["debts", "Existing loan payments"]] as const).map(([k, l]) => (
          <label key={k} className="flex items-center justify-between gap-3 text-sm">{l}
            <input type="number" className="w-32 rounded-lg border bg-background p-2 text-right" value={f[k]} onChange={(e) => setF({ ...f, [k]: +e.target.value })} />
          </label>
        ))}
      </Card>
      <Card className="bg-hero text-primary-foreground">
        <p className="text-xs uppercase tracking-wider opacity-80">Estimated max purchase price</p>
        <p className="font-display text-3xl font-bold">{aed(a.budget)}</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          <div><p className="opacity-75">Deposit 25%</p><b>{aed(a.deposit)}</b></div>
          <div><p className="opacity-75">Fees ~7%</p><b>{aed(a.fees)}</b></div>
          <div><p className="opacity-75">Mortgage/mo</p><b>AED {Math.round(a.monthly).toLocaleString()}</b></div>
        </div>
        <p className="mt-3 text-xs opacity-85">Currently limited by your <b>{a.limitedBy}</b>.</p>
      </Card>
      <Card>
        <div className="flex justify-between text-sm font-semibold"><span>Financial readiness</span><span>{a.readiness}/100</span></div>
        <Meter value={a.readiness} className="bg-success" />
        <p className="mt-2 text-xs text-muted-foreground">Assumes 4.5% rate, 25 years, 50% debt-burden cap. Indicative only — confirm with a mortgage advisor.</p>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <p className="flex items-center gap-2 font-display text-lg font-bold"><TrendingUp className="h-5 w-5 text-primary" /> Where demand is strongest</p>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {["All", "Apartment", "Villa", "Townhouse"].map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1 text-sm ${type === t ? "bg-primary text-primary-foreground" : "bg-card"}`}>{t}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Tap up to 3 to compare. Prices are for a typical 1,000 sq ft home.</p>
      {ranked.map((c) => {
        const price = c.avgPricePerSqft * 1000, liq = liquidityScore(c), fits = price <= a.budget, on = picked.includes(c.id);
        return (
          <button key={c.id} onClick={() => toggle(c.id)} className={`w-full rounded-2xl border bg-card p-4 text-left shadow-card ${on ? "ring-2 ring-primary" : ""}`}>
            <div className="flex items-start justify-between">
              <div><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.city} · {c.type} · {aed(price)}</p></div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${fits ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive"}`}>{fits ? "In budget" : "Over budget"}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs"><span className="w-20">Liquidity {liq}</span><Meter value={liq} /></div>
            <div className="mt-1 flex items-center gap-3 text-xs"><span className="w-20">Demand {demandIndex(c)}</span><Meter value={demandIndex(c)} className="bg-accent" /></div>
            <p className="mt-2 text-xs text-muted-foreground">{liquidityLabel(liq)} resale ease · ~{c.avgDaysOnMarket} days to sell · {c.rentalYield}% yield</p>
          </button>
        );
      })}
      <Disclaimer>Liquidity and demand indices are built from simulated search, save, enquiry, supply and transaction data.</Disclaimer>
      {picked.length >= 2 && (
        <button onClick={() => nav({ to: "/buyer/compare", search: { ids: picked.join(","), income: f.income, savings: f.savings, debts: f.debts } })}
          className="sticky bottom-4 w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground shadow-card">Compare {picked.length} by liquidity</button>
      )}
    </Screen>
  );
}
