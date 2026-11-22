import { Link } from "@tanstack/react-router";
import { Bell, BellOff, Building2, Heart, MessageSquare, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Gauge, Spark, Meter, Disclaimer, Trend } from "./ui";
import { propertyInsights, type PropertyDetails } from "@/lib/property";
import { aed } from "@/lib/market";
import { useStored, type OwnedProperty } from "@/lib/store";
import { LiquidityHistory } from "./liquidity-history";

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
      <p className="text-xs text-muted-foreground">Your home's selling position within its matching market segment, including its characteristics and asking price.</p>
      <Disclaimer>Unvalidated mock estimate, not a valuation or guarantee of sale. {p.status === "Off-plan" ? "Resale depends on developer permissions and payment milestones, which are not checked here." : "Saleability describes relative ease of selling, not a probability."}</Disclaimer>
    </Card>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">Why your property scores {r.scoreReasons.total > 0 ? "higher" : r.scoreReasons.total < 0 ? "lower" : "in line with its market"}</h2>
      <p className="text-sm" data-testid="score-comparison">Your property <b>{property.liquidity}/100</b> · Similar homes <b>{market.liquidity}/100</b></p>
      <p className="text-xs text-muted-foreground">Market Liquidity is the baseline for similar homes. Property Liquidity starts from that baseline and adjusts for your home's buyer appeal and asking price.</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between gap-3"><span>Characteristics and buyer appeal</span><b>{signed(r.scoreReasons.characteristics)} pts</b></div>
        <div className="flex justify-between gap-3"><span>Asking price adjustment ({signed(p.askingPremium)}%)</span><b>{signed(r.scoreReasons.pricing)} pts</b></div>
        <div className="flex justify-between gap-3 border-t pt-2"><span>Total vs market segment</span><b>{signed(r.scoreReasons.total)} pts</b></div>
      </div>
      <p className="text-xs text-muted-foreground">{p.askingPremium > 0 ? "Your price premium narrows the buyer pool and adds competitive pressure." : p.askingPremium < 0 ? "Pricing below estimated value attracts a wider buyer pool and eases competitive pressure." : "At estimated value, pricing adds no premium or discount adjustment."} Your Buyer Demand is {property.demand}/100 vs {market.demand}/100 for the segment.</p>
      <ul className="space-y-1 text-xs text-muted-foreground">{r.characteristicFactors.filter(f => f.appeal !== 0).map(f => <li key={f.label}><span className="font-semibold text-foreground">{f.label}: {f.detail}.</span> {f.appeal > 0 ? "Supports buyer appeal." : "Reduces buyer appeal."}</li>)}</ul>
      {!r.characteristicFactors.some(f => f.appeal !== 0) && <p className="text-xs text-muted-foreground">No additional characteristic adjustment. Unspecified details are treated as neutral.</p>}
      <p className="text-[11px] text-muted-foreground">Size, bedrooms, property type and ready/off-plan status define the comparison segment. Characteristics affect demand, competitive pressure and indicative selling time; the point changes above reconcile to your final score.</p>
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
      <div className="flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="font-display text-lg font-bold">Market Liquidity</h2><p className="text-xs text-muted-foreground" data-testid="market-segment">{segmentLabel(p, c.name)}</p></div><p className="shrink-0 font-display text-3xl font-bold" data-testid="market-liquidity">{market.liquidity}<span className="text-xs text-muted-foreground">/100</span></p></div>
      <p className="text-[11px] text-muted-foreground">Size match: {Math.round(p.sizeSqft * .75).toLocaleString()}–{Math.round(p.sizeSqft * 1.25).toLocaleString()} sq ft (±25%)</p>
      <PointChange now={market.liquidity} prev={previousMarket.liquidity} />
      <p className="text-xs text-muted-foreground">Selling conditions for comparable properties, before adjusting for your individual home's appeal or asking price.</p>
      <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Market demand</p><b data-testid="market-demand">{market.demand}/100</b></div><div><p className="text-xs text-muted-foreground">Market competition</p><b data-testid="market-competition">{market.competition}/100</b></div></div>
      <details className="border-t pt-3"><summary className="cursor-pointer text-xs text-muted-foreground">Community context · {c.name}: {r.communityMarket.liquidity}/100</summary><div className="mt-2 space-y-2 text-xs text-muted-foreground"><p>All community property types, bedrooms and completion stages. This broader context is not your property's comparison baseline.</p><PointChange now={r.communityMarket.liquidity} prev={r.previousCommunityMarket.liquidity} /><p>Demand {r.communityMarket.demand}/100 · Competition {r.communityMarket.competition}/100</p></div></details>
    </section>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">What changed this month?</h2>
      <p className="text-xs text-muted-foreground">Nov vs Oct 2026 · comparable property segment · simulated</p>
      <MonthlyRow label="Buyer searches" now={market.searches} prev={previousMarket.searches} />
      <MonthlyRow label="Competing listings" now={market.listings} prev={previousMarket.listings} invert />
      <div className="flex items-center justify-between gap-2 text-sm"><span>Market Liquidity</span><span><b>{market.liquidity}</b> <PointChange now={market.liquidity} prev={previousMarket.liquidity} compact /></span></div>
      <div className="space-y-2 border-t pt-3 text-xs text-muted-foreground" data-testid="monthly-meaning"><p>{r.monthlyUpdate.activity} {r.monthlyUpdate.balance}</p><p>{r.monthlyUpdate.outcome}</p><p className="font-semibold text-foreground">{r.monthlyUpdate.advice}</p></div>
      <p className="text-[11px] text-muted-foreground">These updates compare the latest two mock months, not your actual visit dates. Property changes hold your current details and asking premium constant, so they reflect only changes in market conditions.</p>
    </Card>

    <Card className="space-y-3">
      <h2 className="text-sm font-semibold">What's driving demand</h2>
      <p className="text-xs text-muted-foreground">Similar homes · buyer activity in the last 30 days</p>
      <Signal icon={<Search />} label="Buyer searches" value={r.signals.searches} />
      <Signal icon={<Heart />} label="Property saves" value={r.signals.saves} />
      <Signal icon={<MessageSquare />} label="Enquiries" value={r.signals.enquiries} />
      <Signal icon={<Building2 />} label="Active similar listings" value={r.signals.listings} />
      <Signal icon={<Building2 />} label={p.status === "Off-plan" ? "Resale / assignment records (90d)" : "Comparable sales (90d)"} value={r.signals.sales90d} />
      <p className="text-[11px] text-muted-foreground">Mock segment activity matched by community, type, bedrooms, size and readiness. These same counts drive Market Liquidity; your characteristics and asking price affect only your property-specific indicators.</p>
    </Card>

    <details className="rounded-2xl border bg-card p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-semibold">Which properties are compared?</summary>
      <div className="mt-3 space-y-3 text-xs text-muted-foreground">
        <p>{c.name} · {p.propertyType} · {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bedrooms`} · {p.status} · {Math.round(p.sizeSqft * .75).toLocaleString()}–{Math.round(p.sizeSqft * 1.25).toLocaleString()} sq ft (±25%). Same community, type, bedroom count and completion status.</p>
        <p>Community-wide matches, not just your building. {r.matchedBuilding ? "A known building price premium is applied." : "No building-specific benchmark is available; community pricing is used."} Floor, view, condition, furnishing, balcony and parking adjust your estimate. Unspecified details are neutral.</p>
        <h3 className="font-semibold text-foreground">{p.status === "Off-plan" ? "Comparable resale / assignments" : "Comparable Sales"}</h3>
        <p>Six simulated transactions from the last 90 days. Building names are sample context; unit details and sales are fictional, not verified records. Subject-specific view, condition and asking-price changes never rewrite these transactions.</p>
        <div className="divide-y">{r.comparables.map(comp => <article key={comp.id} className="space-y-1 py-3" data-testid="comparable-sale"><p className="font-semibold text-foreground">{comp.building}</p><p>{comp.bedrooms === 0 ? "Studio" : `${comp.bedrooms} bedrooms`} · {comp.propertyType} · {comp.sizeSqft.toLocaleString()} sq ft · {comp.status}</p><p>{p.status === "Off-plan" ? "Assignment date" : "Transaction date"}: {new Date(`${comp.transactionDate}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</p><div className="flex flex-wrap justify-between gap-2"><b className="text-foreground">{p.status === "Off-plan" ? "Assignment price" : "Sale price"}: {aed(comp.price)}</b><span>AED {comp.pricePerSqft.toLocaleString()}/sq ft</span></div></article>)}</div>
      </div>
    </details>

    <details className="rounded-2xl border bg-card p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-semibold">How are the indicators calculated?</summary>
      <dl className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <div><dt className="font-semibold text-foreground">Buyer Demand</dt><dd>How much buyer interest similar homes attract relative to available listings. Searches show interest, saves show consideration, and enquiries show stronger intent.</dd></div>
        <div><dt className="font-semibold text-foreground">Supply Competition</dt><dd>How many homes compete for buyers compared with the pace of recent sales. A higher score means buyers have more alternatives and sellers face more pressure.</dd></div>
        <div><dt className="font-semibold text-foreground">Market vs Property Liquidity</dt><dd>Market Liquidity describes your matching segment using buyer interest, competing listings and selling speed. Property Liquidity adjusts that baseline for your home's buyer appeal and asking price. Higher scores mean easier selling conditions, not a guaranteed sale.</dd></div>
        <div><dt className="font-semibold text-foreground">Saleability</dt><dd>High, Moderate or Low describes your property's relative selling position. It is not a probability of selling within a fixed period.</dd></div>
        <div><dt className="font-semibold text-foreground">Estimated value</dt><dd>A mock community or building price per square foot, adjusted for your property's size, type, bedrooms, readiness and optional details. The asking price does not change this estimate.</dd></div>
      </dl>
    </details>
    <details className="rounded-2xl border bg-card p-4 shadow-card">
      <summary className="cursor-pointer text-sm font-semibold">Technical Methodology</summary>
      <dl className="mt-3 space-y-3 text-xs leading-relaxed text-muted-foreground">
        <div><dt className="font-semibold text-foreground">Simulated segment activity</dt><dd>Community counts are scaled to a matching segment by bedroom mix, property type, ready/off-plan status and size. Buyer activity and sales use a segment-fit factor; active supply uses the segment share. The same scaling is applied to each monthly snapshot. Building and optional characteristics do not change these market counts.</dd></div>
        <div><dt className="font-semibold text-foreground">Demand and competition</dt><dd>Weighted interest W = searches × 0.2 + saves + enquiries × 3. Market demand = 100 × W ÷ (W + listings × 10). Competition = listings ÷ (90-day sales ÷ 3) × 10.</dd></div>
        <div><dt className="font-semibold text-foreground">Property adjustments</dt><dd>Property demand = market demand + buyer appeal − asking premium × 1.8. Property competition = market competition − buyer appeal × 0.3 + premium × 1.2. Property days = market days − buyer appeal × 0.6 + premium × 2, with a 14-day floor. Premium is measured in percentage points.</dd></div>
        <div><dt className="font-semibold text-foreground">Buyer appeal assumptions</dt><dd>Known building adjustment: (building price factor − type factor) × 18. Sea/marina view +9; garden +3.5; road −4.5. Renovated +7; needs renovation −10. Furnished +2.5; part furnished +1. Balcony yes +2; no −2. No parking −3.5; otherwise +1.2 per space up to 3. Apartment floor +0.1 per floor up to 40. Unspecified details are neutral. These are mock assumptions, not validated premiums.</dd></div>
        <div><dt className="font-semibold text-foreground">Liquidity and saleability</dt><dd>Liquidity = 45% demand + 30% (100 − competition) + 25% selling speed, where speed = 100 − days, bounded to 0–100. Demand, competition and liquidity are bounded and rounded. High ≥70; Moderate 50–69; Low below 50. The characteristic contribution compares your home at estimated value to the segment. The pricing contribution compares your chosen price to that value-priced home; these contributions add exactly to the total score difference.</dd></div>
        <div><dt className="font-semibold text-foreground">Valuation and transactions</dt><dd>Community or building rate × size, adjusted for type, bedrooms, size, readiness and optional quality details. Off-plan receives an illustrative 8% discount; the ±7% range is not a confidence interval. Comparable transactions use segment/building rates, not the subject's quality adjustments or asking premium. Each record's AED/sq ft equals its simulated price divided by its size, rounded.</dd></div>
        <div><dt className="font-semibold text-foreground">History</dt><dd>Each month scores its own simulated searches, saves, enquiries, listings, 90-day sales and selling days using the same formulas. Property history applies your current characteristics and asking premium to every month; it does not record previous edits or actual visit dates.</dd></div>
      </dl>
    </details>

    <LiquidityHistory history={r.history} />
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
function signed(value: number) { return `${value > 0 ? "+" : ""}${value}`; }
function segmentLabel(p: PropertyDetails, community: string) {
  return `${community} · ${p.bedrooms === 0 ? "Studio" : `${p.bedrooms}-bedroom`} ${p.propertyType.toLowerCase()}s · ${p.status.toLowerCase()}`;
}
