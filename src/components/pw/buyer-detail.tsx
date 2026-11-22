import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gauge, Meter } from "./ui";
import { propertyInsights } from "@/lib/property";
import { aed, liquidityLabel } from "@/lib/market";
import { findItem, itemScore, itemSegment, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { useStored } from "@/lib/store";
import type { PropertyFlow } from "./property-onboarding";
import { SaveItem } from "./buyer-explorer";
import { MarketActivity } from "./market-activity";
import { MonthlyLineChart } from "./monthly-line-chart";

export function BuyerDetail({ kind, id }: { kind: ExploreKind; id: string }) {
  const item = findItem(kind, id);
  if (!item) return <><h1 className="font-display text-xl font-bold">Sample unavailable</h1><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"} className="text-primary underline">Back to explore</Link></>;
  const r = propertyInsights(item.property), score = itemScore(item, kind);
  return <>
    <Button asChild variant="ghost" size="sm"><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"}><ArrowLeft />{kind === "markets" ? "All market segments" : "All properties"}</Link></Button>
    <div className="flex items-start justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">{item.name}</h1><p className="mt-1 text-xs text-muted-foreground">{itemSegment(item)} · {item.property.sizeSqft.toLocaleString()} sq ft</p></div><SaveItem item={item} kind={kind} /></div>
    {kind === "properties" && <><img src={item.photo} alt={`Illustrative ${item.property.propertyType.toLowerCase()} photo`} className="aspect-[16/9] w-full rounded-lg object-cover" /><p className="text-[10px] text-muted-foreground">Illustrative photo · not the actual unit.</p></>}
    <section className="border-y py-4"><div className="flex items-center gap-4"><Gauge value={score} label="Liquidity Score" labelClassName="max-w-16 text-center leading-tight" /><div><h2 className="font-display text-xl font-bold">{liquidityLabel(score)} Liquidity</h2><p className="text-xs text-muted-foreground">{kind === "markets" ? "Selling conditions for similar homes." : "How this home compares with similar properties."}</p>{kind === "properties" && <p className="mt-2 text-xs">Similar Properties <b>{r.market.liquidity}/100</b></p>}</div></div><p className="mt-3 text-xs text-muted-foreground">{kind === "markets" ? "A higher score reflects stronger buyer interest and less competitive pressure." : `This property scores ${Math.abs(score - r.market.liquidity)} points ${score >= r.market.liquidity ? "above" : "below"} its comparable market segment.`} Simulated, not a guarantee of sale.</p></section>
    <div className="grid grid-cols-2 gap-3"><div className="rounded-lg border bg-card p-3"><h2 className="text-xs">Buyer Demand</h2><p className="my-1 text-xl font-bold">{r.market.demand}/100</p><Meter value={r.market.demand} /><p className="mt-2 text-[10px] text-muted-foreground">Similar homes · higher is better</p></div><div className="rounded-lg border bg-card p-3"><h2 className="text-xs">Supply Competition</h2><p className="my-1 text-xl font-bold">{r.market.competition}/100</p><Meter value={r.market.competition} className="bg-accent" /><p className="mt-2 text-[10px] text-muted-foreground">Lower is better</p></div></div>
    <p className="text-sm">{kind === "markets" ? "Typical estimated home value" : "Sample listing price"}: <b>{aed(r.value)}</b></p>
    <BuyerLiquidityTrend item={item} kind={kind} />
    <MarketActivity snapshots={r.snapshots} segment={itemSegment(item)} />
    <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold">How is this calculated?</summary><div className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground"><p>We use the same simulated model as the homeowner dashboard. Searches, saves and enquiries describe buyer interest in similar homes. Active listings show available choice; comparable sales cover the last 90 days.</p><p>Comparison segment: {itemSegment(item)} · {Math.round(item.property.sizeSqft * .75).toLocaleString()}–{Math.round(item.property.sizeSqft * 1.25).toLocaleString()} sq ft. Optional home details affect only the illustrative property score and estimated value, not market activity.</p><p>High: 70–100; Moderate: 50–69; Low: below 50. Scores are illustrative comparisons, not validated resale forecasts or estimated sale times.</p></div></details>
    {kind === "properties" && <PurchaseHandoff item={item} />}
  </>;
}
function BuyerLiquidityTrend({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const r = propertyInsights(item.property);
  const [period, setPeriod] = useState(12), [month, setMonth] = useState("Nov 2026");
  const rows = r.snapshots.slice(-period), selected = Math.max(0, rows.findIndex(row => row.month === month)), row = rows[selected], prev = rows[selected - 1];
  if (!row) return null;
  const value = kind === "markets" ? row.market : row.property;
  const delta = prev ? value - (kind === "markets" ? prev.market : prev.property) : null;
  return <section className="space-y-3 py-2"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Liquidity History</h2><div className="flex gap-1">{[6, 12].map(n => <Button key={n} variant={period === n ? "secondary" : "ghost"} size="sm" aria-pressed={period === n} onClick={() => { setPeriod(n); setMonth("Nov 2026"); }}>{n}M</Button>)}</div></div><MonthlyLineChart months={rows.map(s => s.month)} series={[{ key: "liquidity", label: kind === "markets" ? "Market Liquidity" : "This Property", values: rows.map(s => kind === "markets" ? s.market : s.property) }, ...(kind === "properties" ? [{ key: "similar", label: "Similar Properties", values: rows.map(s => s.market), secondary: true }] : [])]} selected={selected} onSelect={i => { const point = rows[i]; if (point) setMonth(point.month); }} score /><div className="text-xs" aria-live="polite" data-testid="buyer-history-summary"><b>{row.month} · {value}/100</b><p className="mt-1 text-muted-foreground">{delta === null ? "First record in this period" : `${delta > 0 ? "+" : ""}${delta} pts vs previous month`}{kind === "properties" ? ` · Similar Properties ${row.market}/100` : ""}</p></div><p className="text-[10px] text-muted-foreground">Simulated monthly snapshots.</p></section>;
}
function PurchaseHandoff({ item }: { item: ExploreItem }) {
  const [confirm, setConfirm] = useState(false);
  const [, setDraft, loaded] = useStored<PropertyFlow | null>("pw-owner-draft", null);
  const navigate = useNavigate();
  return <section className="space-y-3 border-t pt-4"><Button variant="outline" onClick={() => setConfirm(!confirm)}><Home />I Bought This Property</Button>{confirm && <div className="space-y-3"><h2 className="text-sm font-semibold">Review your new home</h2><p className="text-xs text-muted-foreground">This starts a new property review, replacing any unfinished setup. Your current home remains unchanged until you confirm the new one.</p><div className="flex flex-wrap gap-2"><Button disabled={!loaded} onClick={() => { setDraft({ stage: "review", source: "Purchased property", property: item.property, query: "" }); navigate({ to: "/owner" }); }}>Continue to review</Button><Button variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button></div></div>}</section>;
}