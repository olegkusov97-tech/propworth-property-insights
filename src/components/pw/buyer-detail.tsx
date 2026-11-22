import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gauge, Meter } from "./ui";
import { propertyInsights } from "@/lib/property";
import { aed, liquidityLabel } from "@/lib/market";
import { findItem, itemScore, itemSegment, itemInsights, itemPrice, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";


import { SaveItem, ViewSegmentProperties } from "./buyer-explorer";
import { MarketActivity } from "./market-activity";
import { MonthlyLineChart } from "./monthly-line-chart";
import { TransactionReferences } from "./transaction-references";
import { PurchaseJourney } from "./purchase-journey";
import { listingBuilding } from "@/lib/historical-listings";

export function BuyerDetail({ kind, id }: { kind: ExploreKind; id: string }) {
  const item = findItem(kind, id);
  if (!item) return <><h1 className="font-display text-xl font-bold">Sample unavailable</h1><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"} className="text-primary underline">Back to explore</Link></>;
  const r = itemInsights(item), score = itemScore(item, kind);
  return <>
    <Button asChild variant="ghost" size="sm"><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"}><ArrowLeft />{kind === "markets" ? "All market segments" : "All properties"}</Link></Button>
    <div className="flex items-start justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">{item.name}</h1><p className="mt-1 text-xs text-muted-foreground">{itemSegment(item)}</p></div><SaveItem item={item} kind={kind} /></div>
    {kind === "markets" ? <><p className="text-sm font-semibold">{item.priceBand?.label}</p><ViewSegmentProperties item={item} /></> : <>
      <p className="text-xs text-muted-foreground">Historical Bayut sample · not currently available. Photos and unit size are not supplied.</p>
      {item.listing && <dl className="grid grid-cols-2 gap-3 border-y py-3 text-xs">{[["Asking price", item.listing.price > 0 ? `AED ${item.listing.price.toLocaleString("en-GB")}` : "Not supplied"], ["Building", listingBuilding(item.listing)], ["City", item.listing.city], ["Bathrooms", String(item.listing.bathrooms)], ["Furnishing", item.listing.furnishing], ["Posted", item.listing.date], ["Completion year (building)", item.listing.year > 0 ? String(item.listing.year) : "Not supplied"], ["Purpose", item.listing.purpose]].map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold">{value}</dd></div>)}</dl>}
      {item.listing && <details className="border-y py-3"><summary className="cursor-pointer text-xs font-semibold">Building information · not unit details</summary><div className="mt-3 space-y-2 text-xs text-muted-foreground">{[["Total building floors", item.listing.buildingFloors], ["Total building parking spaces", item.listing.buildingParking], ["Elevators", item.listing.elevators], ["Reported total building area (source sq ft)", item.listing.buildingArea]].map(([label, value]) => <p key={String(label)}>{label}: <b className="text-foreground">{typeof value === "number" && value > 0 ? value.toLocaleString() : "Not supplied"}</b></p>)}<p>These are unverified building-level fields from the CSV. They do not establish this unit's size, floor or allocated parking.</p></div></details>}
      {item.property.genericBenchmark && <p className="text-xs text-muted-foreground">Generic simulated benchmark: this area or property type is outside the modeled catalog. Scores and charts do not represent this local market.</p>}
      <PurchaseJourney item={item} />
    </>}
    <section className="border-y py-4"><div className="flex items-center gap-4"><Gauge value={score} label="Liquidity Score" labelClassName="max-w-16 text-center leading-tight" /><div><h2 className="font-display text-xl font-bold">{liquidityLabel(score)} Liquidity</h2><p className="text-xs text-muted-foreground">{kind === "markets" ? "Selling conditions for similar homes." : "Illustrative liquidity, using available recorded characteristics."}</p>{kind === "properties" && <p className="mt-2 text-xs">Simulated benchmark <b>{r.market.liquidity}/100</b></p>}</div></div><p className="mt-3 text-xs text-muted-foreground">{kind === "markets" ? "A higher score reflects stronger buyer interest and less competitive pressure." : `This property scores ${Math.abs(score - r.market.liquidity)} points ${score >= r.market.liquidity ? "above" : "below"} the simulated benchmark. No unit-size matching is possible.`} Simulated, not a guarantee of sale.</p></section>
    <div className="grid grid-cols-2 gap-3"><div className="rounded-lg border bg-card p-3"><h2 className="text-xs">Buyer Demand</h2><p className="my-1 text-xl font-bold">{r.market.demand}/100</p><Meter value={r.market.demand} /><p className="mt-2 text-[10px] text-muted-foreground">Similar homes · higher is better</p></div><div className="rounded-lg border bg-card p-3"><h2 className="text-xs">Supply Competition</h2><p className="my-1 text-xl font-bold">{r.market.competition}/100</p><Meter value={r.market.competition} className="bg-accent" /><p className="mt-2 text-[10px] text-muted-foreground">Lower is better</p></div></div>

    <BuyerLiquidityTrend item={item} kind={kind} />
    <MarketActivity snapshots={r.snapshots} segment={itemSegment(item)} />
    {kind === "properties" && !item.listing && <TransactionReferences property={item.property} />}
    <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold">How is this calculated?</summary><div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground"><p>We use the same simulated model as the homeowner dashboard. Searches, saves and enquiries describe buyer interest in similar homes. Active listings show available choice; comparable sales cover the last 90 days.</p><p>Comparison segment: {itemSegment(item)}. {kind === "markets" ? "Price bands use neutral simulated home profiles; these are not individual properties or calibrated price-specific predictions." : "Unit size is absent, so the illustration omits size adjustments and cannot provide size-matched sale references. Building-level parking, floors and area are never treated as unit characteristics."}</p><p>High: 70–100; Moderate: 50–69; Low: below 50. Scores are illustrative comparisons, not validated resale forecasts or estimated sale times.</p></div></details>

  </>;
}
function BuyerLiquidityTrend({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const r = itemInsights(item);
  const [period, setPeriod] = useState(12), [month, setMonth] = useState("Nov 2026");
  const rows = r.snapshots.slice(-period), selected = Math.max(0, rows.findIndex(row => row.month === month)), row = rows[selected], prev = rows[selected - 1];
  if (!row) return null;
  const value = kind === "markets" ? row.market : row.property;
  const delta = prev ? value - (kind === "markets" ? prev.market : prev.property) : null;
  return <section className="space-y-3 py-2"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Liquidity History</h2><div className="flex gap-1">{[6, 12].map(n => <Button key={n} variant={period === n ? "secondary" : "ghost"} size="sm" aria-pressed={period === n} onClick={() => { setPeriod(n); setMonth("Nov 2026"); }}>{n}M</Button>)}</div></div><MonthlyLineChart months={rows.map(s => s.month)} series={[{ key: "liquidity", label: kind === "markets" ? "Market Liquidity" : "This Property", values: rows.map(s => kind === "markets" ? s.market : s.property) }, ...(kind === "properties" ? [{ key: "similar", label: "Similar Properties", values: rows.map(s => s.market), secondary: true }] : [])]} selected={selected} onSelect={i => { const point = rows[i]; if (point) setMonth(point.month); }} score /><div className="text-xs" aria-live="polite" data-testid="buyer-history-summary"><b>{row.month} · {value}/100</b><p className="mt-1 text-muted-foreground">{delta === null ? "First record in this period" : `${delta > 0 ? "+" : ""}${delta} pts vs previous month`}{kind === "properties" ? ` · Similar Properties ${row.market}/100` : ""}</p></div><p className="text-[10px] text-muted-foreground">Simulated monthly snapshots.</p></section>;
}
