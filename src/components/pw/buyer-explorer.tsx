import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dubaiCommunities, propertyInsights } from "@/lib/property";
import { getCommunity, aed } from "@/lib/market";
import { emptyBuyerFilters, filterItems, itemsFor, itemScore, type BuyerFilters, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { useBuyer } from "./buyer-shell";
import { Meter } from "./ui";

export function BuyerExplorer({ kind }: { kind: ExploreKind }) {
  const [filters, setFilters] = useState<BuyerFilters>(emptyBuyerFilters);
  const [sort, setSort] = useState("liquidity");
  const selected = useBuyer().selected[kind];
  const rows = filterItems(itemsFor(kind), filters).sort((a, b) => sort === "price" ? propertyInsights(a.property).value - propertyInsights(b.property).value : itemScore(b, kind) - itemScore(a, kind));
  return <>
    <div><h1 className="font-display text-2xl font-bold">{kind === "markets" ? "Explore Market Liquidity" : "Explore Properties"}</h1><p className="mt-1 text-xs text-muted-foreground">{kind === "markets" ? "Compare selling conditions for similar homes across Dubai." : "A home's price is only part of the picture."}</p></div>
    <input aria-label="Search area or building" placeholder="Search area or building" className="h-10 w-full rounded-lg border bg-card px-3 text-sm" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
    <BuyerFilterPanel filters={filters} onChange={setFilters} />
    <div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">{rows.length} {kind === "markets" ? "sample segments" : "sample properties"}</p><select aria-label="Sort results" value={sort} onChange={e => setSort(e.target.value)} className="max-w-[60%] rounded-lg border bg-card p-2 text-xs"><option value="liquidity">Highest liquidity</option><option value="price">Lowest price</option></select></div>
    {rows.length === 0 ? <div className="border-y py-8 text-center"><p className="font-semibold">No sample matches</p><p className="mt-1 text-xs text-muted-foreground">Try a wider size or price range.</p><Button variant="outline" className="mt-3" onClick={() => setFilters(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></div> : <div className="grid gap-3 md:grid-cols-2">{rows.map(item => <ExploreCard key={item.id} item={item} kind={kind} />)}</div>}
    <p className="text-[10px] text-muted-foreground">Simulated data · November 2026. {kind === "properties" ? "Photos are illustrative, not the listed units." : "Price filters use each segment's typical estimated home value."}</p>
    {selected.length > 0 && <div className="sticky bottom-3 z-10 flex items-center justify-between gap-2 rounded-lg border bg-card p-3 shadow-card"><span className="text-xs">{selected.length} of 3 selected</span>{selected.length >= 2 ? <Button asChild size="sm"><Link to="/buyer/compare" search={{ kind, ids: selected.join(",") }}>Compare {selected.length}</Link></Button> : <span className="text-xs text-muted-foreground">Select one more</span>}</div>}
  </>;
}
function BuyerFilterPanel({ filters, onChange }: { filters: BuyerFilters; onChange: (value: BuyerFilters) => void }) {
  const update = (key: keyof BuyerFilters, value: string) => onChange({ ...filters, [key]: value });
  return <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold"><SlidersHorizontal className="mr-2 inline size-4 text-primary" />Filters {Object.entries(filters).filter(([key, value]) => key !== "search" && value).length > 0 ? "· active" : ""}</summary><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
    {([{ key: "community", label: "Area / community", options: dubaiCommunities.map(c => [c.id, c.name]) }, { key: "type", label: "Property type", options: ["Apartment", "Villa", "Townhouse"].map(x => [x, x]) }, { key: "bedrooms", label: "Bedrooms", options: Array.from({ length: 6 }, (_, i) => [String(i), i === 0 ? "Studio" : String(i)]) }, { key: "status", label: "Ready / off-plan", options: ["Ready", "Off-plan"].map(x => [x, x]) }] as const).map(field => <label key={field.key} className="min-w-0 text-xs font-semibold">{field.label}<select aria-label={field.label} className="mt-1 h-10 w-full rounded-lg border bg-card px-2 text-xs" value={filters[field.key]} onChange={e => update(field.key, e.target.value)}><option value="">All</option>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}
    {([{ key: "minSize", label: "Min size (sq ft)" }, { key: "maxSize", label: "Max size (sq ft)" }, { key: "minPrice", label: "Min price (AED)" }, { key: "maxPrice", label: "Max price (AED)" }] as const).map(field => <label key={field.key} className="text-xs font-semibold">{field.label}<input aria-label={field.label} type="number" min="0" value={filters[field.key]} onChange={e => update(field.key, e.target.value)} className="mt-1 h-10 w-full rounded-lg border bg-card px-2 font-normal" placeholder="Any" /></label>)}
  </div><Button variant="ghost" size="sm" className="mt-3" onClick={() => onChange(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></details>;
}
export function ItemLink({ item, kind, children, className = "" }: { item: ExploreItem; kind: ExploreKind; children: React.ReactNode; className?: string }) {
  return kind === "markets" ? <Link to="/buyer/markets/$id" params={{ id: item.id }} className={className}>{children}</Link> : <Link to="/buyer/properties/$id" params={{ id: item.id }} className={className}>{children}</Link>;
}
export function SaveItem({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const { saved, save, loaded } = useBuyer(), active = saved.some(s => s.kind === kind && s.id === item.id);
  return <Button variant={active ? "secondary" : "outline"} size="icon" disabled={!loaded} title={active ? "Remove from saved" : "Save to track liquidity"} aria-label={`${active ? "Unsave" : "Save"} ${item.name}`} aria-pressed={active} onClick={() => save(item, kind)}><Bookmark className={active ? "fill-primary text-primary" : ""} /></Button>;
}
export function ExploreCard({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const r = propertyInsights(item.property), score = itemScore(item, kind), prev = r.snapshots.at(-2);
  const delta = score - (kind === "markets" ? prev?.market ?? score : prev?.property ?? score);
  const { selected, select } = useBuyer(), active = selected[kind].includes(item.id);
  return <article className="overflow-hidden rounded-2xl border bg-card shadow-card">
    {kind === "properties" && <ItemLink item={item} kind={kind} className="relative block"><img src={item.photo} alt={`Illustrative ${item.property.propertyType.toLowerCase()} interior or exterior`} className="aspect-[16/9] w-full object-cover" loading="lazy" /><span className="absolute bottom-2 right-2 rounded-sm bg-card/95 px-2 py-1 text-[9px] text-muted-foreground">Illustrative photo</span></ItemLink>}
    <div className="space-y-3 p-4"><div className="flex items-start justify-between gap-2"><ItemLink item={item} kind={kind} className="min-w-0"><h2 className="text-sm font-semibold">{item.name}</h2><p className="mt-1 text-xs text-muted-foreground">{getCommunity(item.property.communityId).name} · {item.property.status}</p></ItemLink><SaveItem item={item} kind={kind} /></div>
      <p className="text-xs text-muted-foreground">{item.property.bedrooms} bedrooms · {item.property.sizeSqft.toLocaleString()} sq ft · {item.property.propertyType}</p>
      <div className="flex items-end justify-between"><div><p className="text-[10px] text-muted-foreground">{kind === "markets" ? "Market" : "Property"} Liquidity</p><b className="font-display text-2xl text-primary">{score}<span className="text-xs text-muted-foreground">/100</span></b></div><p className={`text-xs ${delta >= 0 ? "text-success" : "text-destructive"}`}>{delta > 0 ? "+" : ""}{delta} pts this month</p></div><Meter value={score} />
      {kind === "markets" ? <div className="grid grid-cols-2 gap-2 text-[11px]"><span>Buyer Demand <b>{r.market.demand}/100</b></span><span>Competition <b>{r.market.competition}/100</b></span><span>Active listings <b>{r.market.listings}</b></span><span>Sales (90d) <b>{r.market.sales90d}</b></span></div> : <p className="font-semibold">{aed(r.value)}</p>}
      <div className="flex items-center justify-between gap-2"><ItemLink item={item} kind={kind} className="text-xs font-semibold text-primary underline">Liquidity details</ItemLink><Button variant={active ? "secondary" : "outline"} size="sm" disabled={!active && selected[kind].length >= 3} aria-pressed={active} onClick={() => select(item.id, kind)}>{active && <Check />}{active ? "Selected" : "Compare"}</Button></div>
    </div>
  </article>;
}