import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search, Heart, MessageSquare, Building2 } from "lucide-react";
import { Screen, Card, Gauge, Spark, Meter, Disclaimer, Trend } from "@/components/pw/ui";
import { useOwned } from "@/lib/store";
import { communities, getCommunity, demandIndex, competitionIndex, liquidityScore, sale90Probability, liquidityLabel, history, months, aed } from "@/lib/market";

export const Route = createFileRoute("/owner")({
  head: () => ({
    meta: [
      { title: "My Property Liquidity — PropWorth" },
      { name: "description", content: "Track your UAE property's value, buyer demand, competition and Liquidity Score over time." },
      { property: "og:title", content: "Homeowner Liquidity Dashboard — PropWorth" },
      { property: "og:description", content: "How easily could you sell your home? See demand and an indicative 90-day sale estimate." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Owner,
});

function Owner() {
  const [owned, setOwned] = useOwned();
  const [form, setForm] = useState({ communityId: "marina", sizeSqft: 1100, bedrooms: 2 });
  if (!owned) {
    return (
      <Screen title="Add your property" back="/" tone="Homeowner">
        <p className="text-sm text-muted-foreground">Tell us about your home to unlock its liquidity dashboard.</p>
        <Card className="space-y-4">
          <label className="block text-sm font-semibold">Community
            <select className="mt-1 w-full rounded-xl border bg-background p-3" value={form.communityId} onChange={(e) => setForm({ ...form, communityId: e.target.value })}>
              {communities.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.type}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold">Size (sq ft)
            <input type="number" className="mt-1 w-full rounded-xl border bg-background p-3" value={form.sizeSqft} onChange={(e) => setForm({ ...form, sizeSqft: +e.target.value })} />
          </label>
          <label className="block text-sm font-semibold">Bedrooms
            <input type="number" className="mt-1 w-full rounded-xl border bg-background p-3" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: +e.target.value })} />
          </label>
          <button className="w-full rounded-xl bg-primary p-3 font-semibold text-primary-foreground" onClick={() => setOwned({ ...form, askingPremium: 0 })}>See my dashboard</button>
        </Card>
      </Screen>
    );
  }
  const c = getCommunity(owned.communityId);
  const value = c.avgPricePerSqft * owned.sizeSqft;
  const liq = liquidityScore(c), dem = demandIndex(c), comp = competitionIndex(c);
  const prob = sale90Probability(c, owned.askingPremium);
  const vH = history(c.id + "v", value, 0.08), lH = history(c.id + "l", liq, 0.06, 0.1), dH = history(c.id + "d", dem, 0.1, 0.12), cH = history(c.id + "c", comp, -0.05, 0.1);
  return (
    <Screen title={`${owned.bedrooms}BR ${c.type}, ${c.name}`} back="/" tone="Homeowner">
      <Card className="bg-hero text-primary-foreground">
        <p className="text-xs uppercase tracking-wider opacity-80">Estimated value</p>
        <p className="font-display text-3xl font-bold">{aed(value)}</p>
        <p className="text-xs opacity-80">{owned.sizeSqft.toLocaleString()} sq ft · AED {c.avgPricePerSqft.toLocaleString()}/sq ft</p>
        <Spark data={vH} className="stroke-primary-foreground" />
        <p className="text-[11px] opacity-80">12-month trend · {((value / vH[0]! - 1) * 100).toFixed(1)}% change</p>
      </Card>

      <Card className="flex items-center gap-4">
        <Gauge value={liq} label="Liquidity" />
        <div className="flex-1">
          <p className="font-display text-xl font-bold">{liquidityLabel(liq)} liquidity</p>
          <p className="text-sm text-muted-foreground">Homes like yours sell in ~{c.avgDaysOnMarket} days on average.</p>
          <div className="mt-1"><Trend now={liq} prev={lH[10]!} /> <span className="text-xs text-muted-foreground">vs last month</span></div>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold">Indicative chance of selling within 90 days</p>
        <p className="font-display text-4xl font-bold text-primary">{prob}%</p>
        <label className="mt-2 block text-xs text-muted-foreground">Asking price vs estimated value: <b className="text-foreground">{owned.askingPremium > 0 ? "+" : ""}{owned.askingPremium}% ({aed(value * (1 + owned.askingPremium / 100))})</b>
          <input type="range" min={-10} max={15} value={owned.askingPremium} onChange={(e) => setOwned({ ...owned, askingPremium: +e.target.value })} className="mt-2 w-full accent-primary" />
        </label>
        <Disclaimer />
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card><p className="text-xs text-muted-foreground">Buyer demand</p><p className="font-display text-2xl font-bold">{dem}<span className="text-sm text-muted-foreground">/100</span></p><Trend now={dem} prev={dH[10]!} /><Spark data={dH} /></Card>
        <Card><p className="text-xs text-muted-foreground">Competition</p><p className="font-display text-2xl font-bold">{comp}<span className="text-sm text-muted-foreground">/100</span></p><Trend now={comp} prev={cH[10]!} invert /><Spark data={cH} className="stroke-accent" /></Card>
      </div>

      <Card className="space-y-3">
        <p className="text-sm font-semibold">What's driving demand (last 30 days)</p>
        <Signal icon={<Search className="h-4 w-4" />} label="Searches for similar homes" v={c.searches.toLocaleString()} />
        <Signal icon={<Heart className="h-4 w-4" />} label="Saves" v={c.saves.toLocaleString()} />
        <Signal icon={<MessageSquare className="h-4 w-4" />} label="Enquiries" v={c.enquiries.toLocaleString()} />
        <Signal icon={<Building2 className="h-4 w-4" />} label="Competing listings" v={c.activeListings.toLocaleString()} />
        <Signal icon={<Building2 className="h-4 w-4" />} label="Comparable sales (90d)" v={c.transactions90d.toLocaleString()} />
      </Card>

      <Card>
        <p className="mb-2 text-sm font-semibold">Liquidity Score history</p>
        <div className="flex h-24 items-end gap-1">
          {lH.map((v, i) => <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${v}%` }} title={`${months[i]}: ${Math.round(v)}`} />)}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>{months[0]}</span><span>{months[11]}</span></div>
        <Meter value={liq} />
      </Card>

      <Card className="flex items-center gap-3 bg-secondary">
        <Bell className="h-5 w-5 text-primary" />
        <p className="flex-1 text-sm">Get a monthly liquidity update and alerts when demand shifts.</p>
        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground" onClick={() => alert("Monthly alerts enabled (prototype)")}>Notify me</button>
      </Card>
      <button className="w-full text-center text-xs text-muted-foreground underline" onClick={() => setOwned(null)}>Change property</button>
      <Link to="/buyer" className="block text-center text-xs text-primary underline">Thinking of buying another? Open buyer tools</Link>
    </Screen>
  );
}

function Signal({ icon, label, v }: { icon: React.ReactNode; label: string; v: string }) {
  return <div className="flex items-center gap-3 text-sm"><span className="rounded-lg bg-muted p-2 text-primary">{icon}</span><span className="flex-1">{label}</span><b>{v}</b></div>;
}
