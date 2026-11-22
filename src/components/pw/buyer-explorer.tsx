import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Check, SlidersHorizontal, RotateCcw, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { communities } from "@/lib/market";
import { historicalAreas, historicalTypes, listingBuilding } from "@/lib/historical-listings";
import { emptyBuyerFilters, filterItems, sortItems, itemsFor, itemScore, itemInsights, itemArea, segmentFilters, type BuyerFilters, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { useBuyer } from "./buyer-shell";
import { Meter } from "./ui";
export function BuyerExplorer({ kind, initialFilters = {} }: { kind: ExploreKind; initialFilters?: Partial<BuyerFilters> }) {
  const [filters, setFilters] = useState<BuyerFilters>({ ...emptyBuyerFilters, ...initialFilters });
  const [sort, setSort] = useState(kind === "markets" ? "liquidity" : "newest");
  const [page, setPage] = useState(1);
  const selected = useBuyer().selected[kind];
  const rows = useMemo(() => sortItems(filterItems(itemsFor(kind), filters), sort, kind), [filters, sort, kind]);
  const pages = Math.max(1, Math.ceil(rows.length / 24)), current = Math.min(page, pages);
  const update = (next: BuyerFilters) => { setFilters(next); setPage(1); };
  return <>
    <div><h1 className="font-display text-2xl font-bold">{kind === "markets" ? "Compare Market Liquidity" : "Explore Properties"}</h1><p className="mt-1 text-xs text-muted-foreground">{kind === "markets" ? "Compare areas, home types, bedrooms and price bands." : "41,381 uploaded Bayut records · historical sample data, not current availability."}</p></div>
    <input aria-label="Search area or building" placeholder={kind === "markets" ? "Search an area" : "Search area, building or city"} className="h-11 w-full rounded-lg border bg-card px-3 text-sm" value={filters.search} onChange={e => update({ ...filters, search: e.target.value })} />
    <BuyerFilterPanel filters={filters} onChange={update} kind={kind} />
    <div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground" data-testid="result-count">{rows.length.toLocaleString()} {kind === "markets" ? "simulated segments" : "historical records"}</p><select aria-label="Sort results" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="max-w-[60%] rounded-lg border bg-card p-2 text-xs"><option value="liquidity">Highest simulated liquidity</option><option value="price">Lowest price</option><option value="price-desc">Highest price</option>{kind === "properties" && <option value="newest">Newest posted</option>}</select></div>
    {rows.length === 0 ? <div className="border-y py-8 text-center"><p className="font-semibold">No matches</p><Button variant="outline" className="mt-3" onClick={() => update(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></div> : <div className="grid gap-3 md:grid-cols-2">{rows.slice((current - 1) * 24, current * 24).map(item => <ExploreCard key={item.id} item={item} kind={kind} />)}</div>}
    {pages > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>Previous</Button><span className="text-xs" aria-live="polite">Page {current} of {pages.toLocaleString()}</span><Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</Button></div>}
    <p className="text-[10px] text-muted-foreground">{kind === "markets" ? "November 2026 simulated liquidity and activity. Price bands use neutral illustrative profiles, not validated price-specific demand." : "Posted 15 Dec 2021–25 Apr 2024. Asking prices are not sale prices. No unit sizes or photos were supplied. Duplicate adverts may refer to the same unit. Liquidity and activity are simulated November 2026 illustrations, not observations of these adverts."}</p>
    {selected.length > 0 && <div className="sticky bottom-3 z-10 flex items-center justify-between gap-2 rounded-lg border bg-card p-3 shadow-card"><span className="text-xs">{selected.length} of 3 selected</span>{selected.length >= 2 ? <Button asChild size="sm"><Link to="/buyer/compare" search={{ kind, ids: selected.join(",") }}>Compare {selected.length}</Link></Button> : <span className="text-xs text-muted-foreground">Select one more</span>}</div>}
  </>;
}
function BuyerFilterPanel({ filters, onChange, kind }: { filters: BuyerFilters; onChange: (value: BuyerFilters) => void; kind: ExploreKind }) {
  const update = (key: keyof BuyerFilters, value: string) => onChange({ ...filters, [key]: value });
  const fields: { key: keyof BuyerFilters; label: string; options: string[][] }[] = [
    { key: "community", label: "Area / community", options: kind === "markets" ? communities.map(c => [c.id, c.name]) : historicalAreas.map(a => [a, a]) },
    { key: "type", label: "Property type", options: (kind === "markets" ? ["Apartment", "Villa", "Townhouse"] : historicalTypes).map(x => [x, x]) },
    { key: "bedrooms", label: "Bedrooms", options: Array.from({ length: 12 }, (_, i) => [String(i), i === 0 ? "Studio" : String(i)]) },
    { key: "status", label: "Ready / off-plan", options: ["Ready", "Off-plan"].map(x => [x, x]) },
  ];
  return <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold"><SlidersHorizontal className="mr-2 inline size-4 text-primary" />Filters {Object.entries(filters).some(([key, value]) => key !== "search" && value) ? "· active" : ""}</summary><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{fields.map(field => <label key={field.key} className="min-w-0 text-xs font-semibold">{field.label}<select aria-label={field.label} className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={filters[field.key]} onChange={e => update(field.key, e.target.value)}><option value="">All</option>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}
    {([{ key: "minPrice", label: "Min price (AED)" }, { key: "maxPrice", label: "Max price (AED)" }] as const).map(field => <label key={field.key} className="text-xs font-semibold">{field.label}<input aria-label={field.label} type="number" min="0" value={filters[field.key]} onChange={e => update(field.key, e.target.value)} className="mt-1 h-11 w-full rounded-lg border bg-card px-2 font-normal" placeholder="Any" /></label>)}
    </div>{kind === "properties" && <p className="mt-2 text-[10px] text-muted-foreground">Unit sizes are unavailable; size filtering is not offered.</p>}<Button variant="ghost" size="sm" className="mt-3" onClick={() => onChange(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></details>;
}
export function ItemLink({ item, kind, children, className = "" }: { item: ExploreItem; kind: ExploreKind; children: React.ReactNode; className?: string }) {
  return kind === "markets" ? <Link to="/buyer/markets/$id" params={{ id: item.id }} className={className}>{children}</Link> : <Link to="/buyer/properties/$id" params={{ id: item.id }} className={className}>{children}</Link>;
}
export function SaveItem({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const { saved, save, loaded } = useBuyer(), active = saved.some(s => s.kind === kind && s.id === item.id);
  return <Button variant={active ? "secondary" : "outline"} size="icon" disabled={!loaded} title={active ? "Remove from saved" : "Save to track liquidity"} aria-label={`${active ? "Unsave" : "Save"} ${item.name}`} aria-pressed={active} onClick={() => save(item, kind)}><Bookmark className={active ? "fill-primary text-primary" : ""} /></Button>;
}
export function ViewSegmentProperties({ item }: { item: ExploreItem }) { return <Button asChild variant="outline" size="sm"><Link to="/buyer/properties" search={segmentFilters(item)}>View Properties<ArrowRight /></Link></Button>; }
export function ExploreCard({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const r = itemInsights(item), score = itemScore(item, kind), prev = r.snapshots.at(-2);
  const delta = score - (kind === "markets" ? prev?.market ?? score : prev?.property ?? score);
  const { selected, select } = useBuyer(), active = selected[kind].includes(item.id), row = item.listing;
  return <article className="overflow-hidden rounded-lg border bg-card shadow-card" data-testid="explore-card"><div className="space-y-3 p-4">
    <div className="flex items-start justify-between gap-2"><ItemLink item={item} kind={kind} className="min-w-0"><h2 className="break-words text-sm font-semibold">{item.name}</h2><p className="mt-1 text-xs text-muted-foreground">{itemArea(item)} · {row?.city ?? ""} · {item.property.status}</p></ItemLink><SaveItem item={item} kind={kind} /></div>
    {kind === "markets" ? <p className="text-xs font-semibold">{item.priceBand?.label}</p> : <><div className="flex items-center gap-2 text-xs text-muted-foreground"><Building2 className="size-5 shrink-0" />Photo not supplied · historical listing</div><p className="text-xs text-muted-foreground">{row?.bedrooms === 0 ? "Studio" : `${item.property.bedrooms} bedrooms`} · {row?.type ?? item.property.propertyType} · Unit size unavailable</p>{row && <p className="text-xs text-muted-foreground">Building: {listingBuilding(row)} · Posted {row.date}</p>}</>}
    <div className="flex items-end justify-between gap-2"><div><p className="text-[10px] text-muted-foreground">Simulated {kind === "markets" ? "Market" : "Property"} Liquidity</p><b className="font-display text-2xl text-primary">{score}<span className="text-xs text-muted-foreground">/100</span></b></div><p className={`text-xs ${delta >= 0 ? "text-success" : "text-destructive"}`}>{delta > 0 ? "+" : ""}{delta} pts this month</p></div><Meter value={score} />
    {kind === "markets" ? <div className="grid grid-cols-2 gap-2 text-[11px]"><span>Buyer Demand <b>{r.market.demand}/100</b></span><span>Competition <b>{r.market.competition}/100</b></span><span>Active listings <b>{r.market.listings}</b></span><span>Sales (90d) <b>{r.market.sales90d}</b></span></div> : <><p className="font-semibold">{row && row.price > 0 ? `Asking AED ${row.price.toLocaleString("en-GB")}` : "Asking price not supplied"}</p>{item.property.genericBenchmark && <p className="text-[10px] text-muted-foreground">Generic demo benchmark · area/type not modeled.</p>}</>}
    <div className="flex flex-wrap items-center justify-between gap-2"><ItemLink item={item} kind={kind} className="text-xs font-semibold text-primary underline">Liquidity details</ItemLink><Button variant={active ? "secondary" : "outline"} size="sm" disabled={!active && selected[kind].length >= 3} aria-pressed={active} onClick={() => select(item.id, kind)}>{active && <Check />}{active ? "Selected" : "Compare"}</Button></div>
    {kind === "markets" && <ViewSegmentProperties item={item} />}
  </div></article>;
}
