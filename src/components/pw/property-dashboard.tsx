import { Link } from "@tanstack/react-router";
import { Bell, BellOff, Building2, Heart, MessageSquare, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Gauge, Spark, Meter, Disclaimer, Trend } from "./ui";
import { propertyInsights, type PropertyDetails } from "@/lib/property";
import { aed, months } from "@/lib/market";
import { useStored, type OwnedProperty } from "@/lib/store";

export function PropertyDashboard({ owned, onChange, onEdit, onReplace }: {
  owned: OwnedProperty; onChange: (p: PropertyDetails) => void; onEdit: () => void; onReplace: () => void;
}) {
  const r = propertyInsights(owned);
  const { p, c, market, previousMarket, property, previousProperty } = r;
  const [alerts, setAlerts] = useStored("pw-owner-alerts", false);
  const color = r.saleability === "High" ? "text-success" : r.saleability === "Low" ? "text-destructive" : "text-primary";
  return <>
    <div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{p.status} · {p.sizeSqft.toLocaleString()} sq ft</span><Button variant="outline" size="sm" onClick={onEdit}><Pencil /> Edit Property</Button></div>
    <Card className="bg-hero text-primary-foreground">
      <p className="text-xs uppercase tracking-wider opacity-80">Estimated value</p>
      <p className="font-display text-3xl font-bold" data-testid="property-value">{aed(r.value)}</p>
      <p className="text-xs opacity-80">Indicative range {aed(r.value * .93)}–{aed(r.value * 1.07)}</p>
      <p className="mt-2 text-xs opacity-80">AED {r.pricePerSqft.toLocaleString()}/sq ft · adjusted for your property</p>
      <Spark data={r.valueHistory} className="stroke-primary-foreground" />
      <p className="text-[11px] opacity-80">12-month trend · +7.1% · simulated</p>
    </Card>
    <Card className="space-y-3">
      <div className="flex items-center gap-4"><Gauge value={property.liquidity} label="Property" /><div className="min-w-0 flex-1"><h2 className="font-display text-xl font-bold">Property Liquidity</h2><p className={`font-semibold ${color}`} data-testid="saleability">{r.saleability} Saleability</p><p className="mt-1 text-xs text-muted-foreground">{p.status === "Off-plan" ? "Indicative resale / assignment time" : "Indicative time on market"}: ~{property.days} days</p></div></div>
      <PointChange now={property.liquidity} prev={previousProperty.liquidity} />
      <p className="text-xs text-muted-foreground">Your home's buyer appeal and pricing, relative to similar properties.</p>
      <Disclaimer>Unvalidated mock estimate, not a valuation or guarantee of sale. {p.status === "Off-plan" ? "Resale depends on developer permissions and payment milestones, which are not checked here." : "Saleability describes relative ease of selling, not a probability."}</Disclaimer>
    </Card>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">Asking price simulator</h2>
      <p className="font-display text-2xl font-bold" data-testid="asking-price">{aed(r.askingPrice)}</p>
      <label className="block text-xs text-muted-foreground">Asking price vs estimated value: <b className="text-foreground">{p.askingPremium > 0 ? "+" : ""}{p.askingPremium}%</b><input aria-label="Asking price premium" type="range" min={-10} max={15} step={1} value={p.askingPremium} onChange={e => onChange({ ...p, askingPremium: Number(e.target.value) })} className="mt-3 w-full accent-primary" /></label>
      <div className="flex justify-between text-[10px] text-muted-foreground"><span>−10% · Competitive</span><span>+15% · Premium</span></div>
      <div className="grid grid-cols-2 gap-3 border-t pt-3 text-xs"><div>Buyer Demand <b className="block text-lg text-primary" data-testid="property-demand">{property.demand}/100</b></div><div>Property Liquidity <b className="block text-lg text-primary" data-testid="property-liquidity">{property.liquidity}/100</b></div></div>
      <p className="text-xs text-muted-foreground">Higher pricing reduces buyer demand and increases competitive pressure. Market activity and estimated value stay unchanged.</p>
      <Button variant="link" size="sm" className="px-0" disabled={p.askingPremium === 0} onClick={() => onChange({ ...p, askingPremium: 0 })}>Reset to estimated value</Button>
    </Card>

    <div className="grid grid-cols-2 gap-3">
      <Card><h2 className="text-xs text-muted-foreground">Buyer Demand</h2><p className="font-display text-2xl font-bold">{property.demand}<span className="text-sm text-muted-foreground">/100</span></p><PointChange now={property.demand} prev={previousProperty.demand} /><Meter value={property.demand} /><p className="mt-2 text-[11px] text-muted-foreground">For your home at this asking price</p></Card>
      <Card><h2 className="text-xs text-muted-foreground">Supply Competition</h2><p className="font-display text-2xl font-bold">{property.competition}<span className="text-sm text-muted-foreground">/100</span></p><PointChange now={property.competition} prev={previousProperty.competition} invert /><Meter value={property.competition} className="bg-accent" /><p className="mt-2 text-[11px] text-muted-foreground">Higher = more competitive pressure</p></Card>
    </div>

    <section className="space-y-3 border-y py-4">
      <div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Market Liquidity</h2><p className="text-xs text-muted-foreground">{c.name} · all property types</p></div><p className="font-display text-3xl font-bold" data-testid="market-liquidity">{market.liquidity}<span className="text-xs text-muted-foreground">/100</span></p></div>
      <PointChange now={market.liquidity} prev={previousMarket.liquidity} />
      <p className="text-xs text-muted-foreground">Community-wide market conditions, independent of your home's details and asking price.</p>
      <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Demand index</p><b>{market.demand}/100</b></div><div><p className="text-xs text-muted-foreground">Competition index</p><b>{market.competition}/100</b></div></div>
    </section>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">Monthly market changes</h2>
      <p className="text-xs text-muted-foreground">Nov vs Oct 2026 · {c.name} · simulated snapshots</p>
      <MonthlyRow label="Buyer searches" now={market.searches} prev={previousMarket.searches} />
      <MonthlyRow label="Active supply" now={market.listings} prev={previousMarket.listings} invert />
      <div className="flex items-center justify-between gap-2 text-sm"><span>Market Liquidity</span><span><b>{market.liquidity}</b> <PointChange now={market.liquidity} prev={previousMarket.liquidity} compact /></span></div>
      <p className="text-[11px] text-muted-foreground">Monthly property changes hold your current details and asking premium constant, isolating the change in the market.</p>
    </Card>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">What's driving demand</h2>
      <p className="text-xs text-muted-foreground">Similar homes · buyer activity in the last 30 days</p>
      <Signal icon={<Search />} label="Buyer searches" value={r.signals.searches} />
      <Signal icon={<Heart />} label="Property saves" value={r.signals.saves} />
      <Signal icon={<MessageSquare />} label="Enquiries" value={r.signals.enquiries} />
      <Signal icon={<Building2 />} label="Active similar listings" value={r.signals.listings} />
      <Signal icon={<Building2 />} label={p.status === "Off-plan" ? "Resale / assignment records (90d)" : "Comparable sales (90d)"} value={r.signals.sales90d} />
      <p className="text-[11px] text-muted-foreground">Synthetic cohort counts, scaled from community activity by bedroom mix, status and buyer appeal. Price simulation changes the indices, not recorded activity.</p>
    </Card>

    <details className="rounded-2xl border bg-card p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-semibold">Which properties are compared?</summary>
      <div className="mt-3 space-y-3 text-xs text-muted-foreground">
        <p>{c.name} · {p.propertyType} · {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bedrooms`} · {p.status} · {Math.round(p.sizeSqft * .75).toLocaleString()}–{Math.round(p.sizeSqft * 1.25).toLocaleString()} sq ft (±25%). Same community, type, bedroom count and completion status.</p>
        <p>Community-wide matches, not just your building. {r.matchedBuilding ? "A known building price premium is applied." : "No building-specific benchmark is available; community pricing is used."} Floor, view, condition, furnishing, balcony and parking adjust your estimate. Unspecified details are neutral.</p>
        <p>Six illustrative {p.status === "Off-plan" ? "resale / assignment" : "sale"} records from the last 90 days are shown below. These are generated mock comparisons, not actual transactions.</p>
        <div className="divide-y">{r.comparables.map((comp, i) => <div key={comp.id} className="flex items-center justify-between gap-2 py-2"><span>Comparable {i + 1}<span className="block text-[11px]">{comp.sizeSqft.toLocaleString()} sq ft · {comp.period}</span></span><b className="text-foreground">{aed(comp.price)}</b></div>)}</div>
      </div>
    </details>

    <details className="rounded-2xl border bg-card p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-semibold">How are the indicators calculated?</summary>
      <dl className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <div><dt className="font-semibold text-foreground">Buyer Demand</dt><dd>Weighted interest W = searches × 0.2 + saves × 1 + enquiries × 3. Market demand = 100 × W ÷ (W + active listings × 10). Property demand adds a mock buyer-appeal adjustment for building, type, bedrooms, size, readiness and optional details, then subtracts 1.8 points per 1% asking premium.</dd></div>
        <div><dt className="font-semibold text-foreground">Supply Competition</dt><dd>Market competition = active listings ÷ (90-day sales ÷ 3) × 10. Property competition adjusts this for buyer appeal (−0.3 × appeal) and asking price (+1.2 points per 1% premium). Higher scores mean more competing supply relative to sales.</dd></div>
        <div><dt className="font-semibold text-foreground">Liquidity Score</dt><dd>45% Buyer Demand + 30% inverse Supply Competition + 25% selling speed (100 − indicative days on market). Property time adjusts the community average for buyer appeal and pricing. Each index is bounded to 0–100 and rounded.</dd></div>
        <div><dt className="font-semibold text-foreground">Saleability</dt><dd>High: Property Liquidity ≥70. Moderate: 50–69. Low: below 50. These are unvalidated relative bands, not 90-day sale probabilities.</dd></div>
        <div><dt className="font-semibold text-foreground">Estimated value</dt><dd>Community or building AED/sq ft × size, adjusted for type, bedrooms, size bracket, readiness and optional characteristics. Off-plan values are discounted 8% in this mock model. No asking-price premium is included. The ±7% range is illustrative, not a statistical confidence interval.</dd></div>
      </dl>
    </details>

    <Card>
      <h2 className="mb-2 text-sm font-semibold">Property Liquidity history</h2>
      <div className="flex h-24 items-end gap-1">{r.liquidityHistory.map((v, i) => <div key={i} className="flex-1 rounded-t bg-primary/80" style={{ height: `${v}%` }} title={`${months[i]}: ${v}`} />)}</div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>Dec 2025</span><span>Nov 2026</span></div>
      <p className="mt-2 text-[11px] text-muted-foreground">Simulated history at your current property details and asking premium.</p>
    </Card>
    <Card className="flex items-start gap-3 bg-secondary">
      <Bell className="mt-1 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold">Monthly liquidity updates</p><p className="text-xs text-muted-foreground">{alerts ? "Preference saved. Demo only — no notifications are sent." : "Save your preference for demand and liquidity alerts. Demo only."}</p><Button variant={alerts ? "outline" : "default"} size="sm" className="mt-2" onClick={() => setAlerts(!alerts)}>{alerts ? <BellOff /> : <Bell />}{alerts ? "Turn off alerts" : "Notify me"}</Button></div>
    </Card>
    <Button variant="link" className="w-full text-muted-foreground" onClick={onReplace}>Change property</Button>
    <Link to="/buyer" className="block text-center text-xs text-primary underline">Thinking of buying another? Open buyer tools</Link>
  </>;
}

function PointChange({ now, prev, invert = false, compact = false }: { now: number; prev: number; invert?: boolean; compact?: boolean }) {
  const delta = now - prev;
  const tone = delta === 0 ? "text-muted-foreground" : (invert ? delta < 0 : delta > 0) ? "text-success" : "text-destructive";
  return <span className={`text-[11px] ${tone}`}>{delta > 0 ? "+" : ""}{delta} pts{compact ? "" : " vs last month"}</span>;
}
function MonthlyRow({ label, now, prev, invert = false }: { label: string; now: number; prev: number; invert?: boolean }) {
  return <div className="flex items-center justify-between gap-2 text-sm"><span>{label}</span><span className="text-right"><b>{now.toLocaleString()}</b> <Trend now={now} prev={prev} invert={invert} /><span className="block text-[10px] text-muted-foreground">was {prev.toLocaleString()}</span></span></div>;
}
function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return <div className="flex items-center gap-3 text-sm"><span className="rounded-lg bg-muted p-2 text-primary [&_svg]:size-4">{icon}</span><span className="min-w-0 flex-1">{label}</span><b>{value.toLocaleString()}</b></div>;
}