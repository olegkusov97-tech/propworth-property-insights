import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Bell, BellOff, Minus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Gauge, Meter } from "./ui";
import { propertyInsights, scoreMarket, type PropertyDetails } from "@/lib/property";
import { aed } from "@/lib/market";
import { useStored, type OwnedProperty } from "@/lib/store";
import { retainSnapshots, segmentName, type OwnerSnapshot } from "@/lib/owner-history";
import { LiquidityHistory } from "./liquidity-history";
import { MarketActivity } from "./market-activity";
import { TransactionReferences } from "./transaction-references";
import { ListingReferences } from "./listing-references";

export function PropertyDashboard({ owned, onEdit, onReplace }: {
  owned: OwnedProperty; onChange: (p: PropertyDetails) => void; onEdit: () => void; onReplace: () => void;
}) {
  const r = propertyInsights(owned);
  const { p, c, market, property } = r;
  const [alerts, setAlerts] = useStored("pw-owner-alerts", false);
  const [saved, setSaved, loaded] = useStored<OwnerSnapshot[]>("pw-owner-snapshots-v1", []);
  const current = r.snapshots.at(-1);
  const snapshots = current ? retainSnapshots(saved, r.snapshots, current) : r.snapshots;
  const serialized = JSON.stringify(snapshots);
  useEffect(() => {
    if (loaded && JSON.stringify(saved) !== serialized) setSaved(JSON.parse(serialized) as OwnerSnapshot[]);
  }, [loaded, serialized, saved, setSaved]);
  const previous = snapshots.at(-2);
  if (!previous || !current) return null;
  const segment = segmentName(p, c.name);
  const gap = property.liquidity - market.liquidity;
  const interpretation = gap === 0 ? "Your property has similar liquidity to comparable homes." : `Your property has ${Math.abs(gap) < 10 ? "slightly " : ""}${gap > 0 ? "higher" : "lower"} liquidity than similar homes.`;
  const searchDelta = (market.searches / previous.searches - 1) * 100;
  const supplyDelta = (market.listings / previous.listings - 1) * 100;
  const liquidityDelta = property.liquidity - previous.property;
  const insight = searchDelta > 0 && supplyDelta < 0
    ? "Buyer interest increased while the number of competing properties decreased."
    : searchDelta > 0 && supplyDelta > searchDelta ? "Buyer interest increased, but competing listings grew faster."
    : searchDelta < 0 && supplyDelta > 0 ? "Buyer interest softened while more properties competed for buyers."
    : searchDelta < 0 && supplyDelta < 0 ? "Buyer interest softened, but fewer competing homes eased pressure on sellers."
    : "Buyer interest and competing supply are broadly balanced.";
  const previousIndicators = scoreMarket(previous);
  const prevDemand = previousIndicators.demand;
  const prevCompetition = previousIndicators.competition;
  return <>
    <div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">{p.status} · {p.sizeSqft.toLocaleString()} sq ft</span><Button variant="outline" size="sm" onClick={onEdit}><Pencil /> Edit Property</Button></div>
    <Card className="space-y-3">
      <div className="flex items-center gap-3"><div className="shrink-0"><Gauge value={property.liquidity} label="Liquidity Score" labelClassName="max-w-16 text-center leading-tight" /></div><div className="min-w-0"><h2 className="font-display text-xl font-bold">Property Liquidity</h2><p className="font-semibold text-primary" data-testid="saleability">{r.saleability} Liquidity</p><Change delta={liquidityDelta} unit="pts" /><span className="block text-[10px] text-muted-foreground">vs last month</span></div></div>
      <p className="text-xs text-muted-foreground">How easily your property could sell compared with similar homes.</p>
      <div className="grid grid-cols-2 gap-3 border-y py-3 text-xs" data-testid="score-comparison"><div>Your Property <b className="block font-display text-xl text-primary" data-testid="property-liquidity">{property.liquidity}/100</b></div><div>Similar Properties <b className="block font-display text-xl" data-testid="market-liquidity">{market.liquidity}/100</b></div></div>
      <p className="text-xs">{interpretation}</p>
      <details><summary className="cursor-pointer text-xs font-semibold text-primary">How is this calculated?</summary><div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground"><p>Buyer Demand reflects interest in similar homes. Supply Competition reflects how much choice buyers have relative to recent sales. Together with comparable market activity, these form the similar-properties benchmark.</p><p>Your Property Liquidity is an illustrative comparison that also considers your home's details. It is not confirmed demand for your home or a prediction of a sale.</p><p>Comparison segment: {segment}; sizes {Math.round(p.sizeSqft * .75).toLocaleString()}–{Math.round(p.sizeSqft * 1.25).toLocaleString()} sq ft. Activity is monthly; sales cover the preceding 90 days.</p><p>High: 70–100, Moderate: 50–69, Low: below 50. These bands and the value range are illustrative, not validated forecasts.</p></div></details>
      <p className="text-[10px] text-muted-foreground">Simulated estimates · not a valuation or guarantee of sale.</p>
    </Card>
    <div className="grid grid-cols-2 gap-3">
      <Card><h2 className="text-xs font-semibold">Buyer Demand</h2><p className="my-1 font-display text-2xl font-bold" data-testid="market-demand">{market.demand}<span className="text-sm text-muted-foreground">/100</span></p><Change delta={market.demand - prevDemand} unit="pts" /><Meter value={market.demand} /><p className="mt-2 text-[11px] text-muted-foreground">{market.demand > prevDemand ? "Demand is growing" : market.demand < prevDemand ? "Demand is softening" : "Demand is stable"}<br />Similar homes · higher is better</p></Card>
      <Card><h2 className="text-xs font-semibold">Supply Competition</h2><p className="my-1 font-display text-2xl font-bold" data-testid="market-competition">{market.competition}<span className="text-sm text-muted-foreground">/100</span></p><Change delta={market.competition - prevCompetition} unit="pts" invert /><Meter value={market.competition} className="bg-accent" /><p className="mt-2 text-[11px] text-muted-foreground">{market.competition < prevCompetition ? "Competition is easing" : market.competition > prevCompetition ? "Competition is growing" : "Competition is stable"}<br />Lower is better</p></Card>
    </div>
    <section className="space-y-3 py-1"><div><h2 className="text-sm font-semibold">What changed this month?</h2><p className="text-[10px] text-muted-foreground">{current.month} vs {previous.month}</p></div><div className="grid grid-cols-3 gap-2">
      <Metric label="Buyer Searches" value={market.searches.toLocaleString()} delta={searchDelta} unit="%" />
      <Metric label="Competing Listings" value={market.listings.toLocaleString()} delta={supplyDelta} unit="%" invert />
      <Metric label="Property Liquidity" value={`${property.liquidity}/100`} delta={liquidityDelta} unit="pts" />
    </div><p className="text-xs leading-relaxed" data-testid="monthly-meaning">{liquidityDelta > 1 ? "Selling conditions improved this month. " : liquidityDelta < -1 ? "Selling conditions softened this month. " : "Selling conditions stayed broadly stable. "}{insight}</p><p className="text-[10px] text-muted-foreground">Simulated data · changes compare monthly records.</p></section>
    <MarketActivity snapshots={snapshots} segment={segment} />
    <LiquidityHistory history={snapshots} />
    <Card className="space-y-1"><h2 className="text-xs font-semibold text-muted-foreground">Estimated Value</h2><p className="font-display text-xl font-bold" data-testid="property-value">{aed(r.value)}</p><p className="text-[11px] text-muted-foreground">Indicative range {aed(r.value * .93)}–{aed(r.value * 1.07)}</p><p className="text-xs text-muted-foreground">AED {r.pricePerSqft.toLocaleString()}/sq ft · simulated</p></Card>
    <TransactionReferences property={p} />
    <ListingReferences property={p} />
    <Card className="flex items-start gap-3 bg-secondary"><Bell className="mt-1 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Monthly liquidity updates</p><p className="text-xs text-muted-foreground">{alerts ? "Preference saved. Demo only — no notifications sent." : "Keep up with demand and liquidity. Demo only."}</p><Button variant={alerts ? "outline" : "default"} size="sm" className="mt-2" onClick={() => setAlerts(!alerts)}>{alerts ? <BellOff /> : <Bell />}{alerts ? "Turn off alerts" : "Notify me"}</Button></div></Card>
    <Button variant="link" className="w-full text-muted-foreground" onClick={onReplace}>Change property</Button>
    <Link to="/buyer" className="block text-center text-xs text-primary underline">Thinking of buying another? Open buyer tools</Link>
  </>;
}
function Change({ delta, unit, invert = false }: { delta: number; unit: string; invert?: boolean }) {
  const good = invert ? delta < 0 : delta > 0;
  const Icon = delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return <span className={`my-1 inline-flex items-center gap-0.5 text-[11px] font-semibold ${delta === 0 ? "text-muted-foreground" : good ? "text-success" : "text-destructive"}`}><Icon className="size-3 shrink-0" />{delta > 0 ? "+" : ""}{unit === "%" ? delta.toFixed(1) : delta}{unit === "%" ? "%" : ` ${unit}`}</span>;
}
function Metric({ label, value, delta, unit, invert = false }: { label: string; value: string; delta: number; unit: string; invert?: boolean }) {
  return <Card className="min-w-0 p-2"><h3 className="min-h-8 text-[10px] font-semibold text-muted-foreground">{label}</h3><p className="text-base font-bold">{value}</p><Change delta={delta} unit={unit} invert={invert} /></Card>;
}
