import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { buyerHead } from "@/components/pw/buyer-shell";
import { ItemLink, SaveItem } from "@/components/pw/buyer-explorer";
import { comparisonIds, findItem, itemScore, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";
import { aed, getCommunity } from "@/lib/market";
export const Route = createFileRoute("/buyer/compare")({
  validateSearch: (s: Record<string, unknown>) => ({ kind: String(s["kind"] ?? "markets"), ids: String(s["ids"] ?? "") }),
  head: () => buyerHead("Compare Liquidity Side by Side", "Compare two or three sample properties or market segments using consistent liquidity indicators."), component: Compare,
});
function Compare() {
  const search = Route.useSearch(), kind: ExploreKind = search.kind === "properties" ? "properties" : "markets";
  const items = comparisonIds(kind, search.ids).flatMap(id => { const item = findItem(kind, id); return item ? [item] : []; });
  const values: { label: string; value: (item: ExploreItem) => string | number }[] = [
    { label: kind === "markets" ? "Market Liquidity" : "Property Liquidity", value: item => `${itemScore(item, kind)}/100` },
    ...(kind === "properties" ? [{ label: "Similar Properties", value: (item: ExploreItem) => `${propertyInsights(item.property).market.liquidity}/100` }] : []),
    { label: "Buyer Demand (higher is better)", value: item => `${propertyInsights(item.property).market.demand}/100` },
    { label: "Supply Competition (lower is better)", value: item => `${propertyInsights(item.property).market.competition}/100` },
    { label: "Active listings (month-end)", value: item => propertyInsights(item.property).market.listings },
    { label: "Comparable sales (90 days)", value: item => propertyInsights(item.property).market.sales90d },
    { label: "Monthly liquidity change", value: item => { const r = propertyInsights(item.property), prev = r.snapshots.at(-2), delta = itemScore(item, kind) - (kind === "markets" ? prev?.market ?? 0 : prev?.property ?? 0); return `${delta > 0 ? "+" : ""}${delta} pts`; } },
    { label: kind === "markets" ? "Typical estimated home value" : "Sample listing price", value: item => aed(propertyInsights(item.property).value) },
    { label: "Bedrooms / size", value: item => `${item.property.bedrooms}BR · ${item.property.sizeSqft.toLocaleString()} sq ft` },
    { label: "Completion", value: item => item.property.status },
  ];
  return <><h1 className="font-display text-2xl font-bold">Compare {kind === "markets" ? "market segments" : "properties"}</h1><Button asChild variant="outline" size="sm"><Link to={kind === "markets" ? "/buyer/markets" : "/buyer/properties"}>Change selection</Link></Button>{items.length < 2 ? <div className="border-y py-6"><p>Select 2–3 {kind === "markets" ? "market segments" : "properties"} to compare.</p></div> : <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full min-w-[560px] text-left text-xs"><thead><tr><th className="w-32 p-3">November 2026</th>{items.map(item => <th key={item.id} className="min-w-36 p-3"><ItemLink item={item} kind={kind} className="text-primary underline">{item.name}</ItemLink><p className="mt-1 font-normal text-muted-foreground">{getCommunity(item.property.communityId).name}</p><div className="mt-2"><SaveItem item={item} kind={kind} /></div></th>)}</tr></thead><tbody>{values.map(row => <tr key={row.label} className="border-t"><th className="p-3 font-normal text-muted-foreground">{row.label}</th>{items.map(item => <td key={item.id} className="p-3 font-semibold">{row.value(item)}</td>)}</tr>)}</tbody></table></div>}<p className="text-[10px] text-muted-foreground">Simulated comparisons · demand and competition describe comparable homes, not confirmed buyers for an individual property.</p></>;
}
