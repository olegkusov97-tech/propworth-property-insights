import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { buyerHead, useBuyer } from "@/components/pw/buyer-shell";
import { ItemLink, SaveItem, ViewSegmentProperties } from "@/components/pw/buyer-explorer";
import { comparisonIds, findItem, itemScore, itemInsights, itemPrice, itemArea, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";
import { aed, getCommunity } from "@/lib/market";
import { MonthlyLineChart } from "@/components/pw/monthly-line-chart";
import { useState } from "react";
import { MarketComparisonDetail } from "@/components/pw/market-comparison-detail";
export const Route = createFileRoute("/buyer/compare")({
  validateSearch: (s: Record<string, unknown>) => ({ kind: String(s["kind"] ?? "markets"), ids: String(s["ids"] ?? "") }),
  head: () => buyerHead("Compare Liquidity Side by Side", "Compare two or three sample properties or market segments using consistent liquidity indicators."), component: Compare,
});
function Compare() {
  const [month, setMonth] = useState(11);
  const { selected, select } = useBuyer();
  const search = Route.useSearch(), kind: ExploreKind = search.kind === "properties" ? "properties" : "markets";
  const items = comparisonIds(kind, search.ids).flatMap(id => { const item = findItem(kind, id); return item ? [item] : []; });
  const first = items[0];
  if (search.kind !== "properties") return <><Button asChild variant="outline" size="sm"><Link to="/buyer/markets">Change selection</Link></Button>{items.length >= 2 ? <MarketComparisonDetail items={items} /> : <p>Select 2–3 segments in Markets to compare.</p>}</>;
  const values: { label: string; value: (item: ExploreItem) => string | number }[] = [
    { label: kind === "markets" ? "Market Liquidity" : "Property Liquidity", value: item => `${itemScore(item, kind)}/100` },
    ...(kind === "properties" ? [{ label: "Similar Properties", value: (item: ExploreItem) => `${itemInsights(item).market.liquidity}/100` }] : []),
    { label: "Buyer Demand (higher is better)", value: item => `${itemInsights(item).market.demand}/100` },
    { label: "Supply Competition (lower is better)", value: item => `${itemInsights(item).market.competition}/100` },
    { label: "Active listings (month-end)", value: item => itemInsights(item).market.listings },
    { label: "Comparable sales (90 days)", value: item => itemInsights(item).market.sales90d },
    { label: "Monthly liquidity change", value: item => { const r = itemInsights(item), prev = r.snapshots.at(-2), delta = itemScore(item, kind) - (kind === "markets" ? prev?.market ?? 0 : prev?.property ?? 0); return `${delta > 0 ? "+" : ""}${delta} pts`; } },
    { label: kind === "markets" ? "Price band" : "Historical asking price", value: item => kind === "markets" ? item.priceBand?.label ?? "All prices" : itemPrice(item) > 0 ? `AED ${itemPrice(item).toLocaleString("en-GB")}` : "Not supplied" },
    { label: "Bedrooms / type", value: item => `${item.property.bedrooms}BR · ${item.listing?.type ?? item.property.propertyType}` },
    ...(kind === "properties" ? [{ label: "Unit size", value: () => "Not supplied" }] : []),
    { label: "Completion", value: item => item.property.status },
  ];
  return <><h1 className="font-display text-2xl font-bold">Compare {kind === "markets" ? "market segments" : "properties"}</h1><Button asChild variant="outline" size="sm"><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"}>Change selection</Link></Button>{items.length < 2 ? <div className="border-y py-6"><p>Select 2–3 {kind === "markets" ? "market segments" : "properties"} to compare.</p></div> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr><th className="w-32 p-3">November 2026</th>{items.map(item => <th key={item.id} className="min-w-36 p-3"><ItemLink item={item} kind={kind} className="text-primary underline">{item.name}</ItemLink><p className="mt-1 font-normal text-muted-foreground">{itemArea(item)}{item.property.genericBenchmark ? " · generic demo benchmark (area/type not modeled)" : ""}</p><div className="mt-2 flex flex-wrap gap-2"><SaveItem item={item} kind={kind} /><Button asChild variant="ghost" size="sm"><Link to="/buyer/compare" onClick={() => { if (selected[kind].includes(item.id)) select(item.id, kind); }} search={{ kind, ids: items.filter(i => i.id !== item.id).map(i => i.id).join(",") }}>Remove</Link></Button>{kind === "markets" && <ViewSegmentProperties item={item} />}</div></th>)}</tr></thead><tbody>{values.map(row => <tr key={row.label} className="border-t"><th className="p-3 font-normal text-muted-foreground">{row.label}</th>{items.map(item => <td key={item.id} className="p-3 font-semibold">{row.value(item)}</td>)}</tr>)}</tbody></table></div>}{first && items.length >= 2 && <section className="space-y-3 border-y py-3"><h2 className="text-sm font-semibold">Compare liquidity trends · simulated</h2><MonthlyLineChart months={itemInsights(first).snapshots.map(s => s.month)} series={items.map((item, i) => ({ key: item.id, label: item.name + (item.priceBand ? ` · ${item.priceBand.label}` : ""), values: itemInsights(item).snapshots.map(s => kind === "markets" ? s.market : s.property), secondary: i === 1, dashed: i === 2 }))} selected={month} onSelect={setMonth} score /><div className="space-y-1 text-xs" aria-live="polite">{items.map((item, i) => { const point = itemInsights(item).snapshots[month]; return point ? <p key={item.id} className={i === 1 ? "text-accent" : "text-primary"}>{i === 2 ? "Dashed line · " : "Solid line · "}{item.name} · {point.month}: <b>{kind === "markets" ? point.market : point.property}/100</b></p> : null; })}</div></section>}<p className="text-[10px] text-muted-foreground">Historical asking prices are sourced from the uploaded CSV, not transactions. Simulated comparisons · demand and competition describe comparable homes, not confirmed buyers for an individual property.</p></>;
}
