import { useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { historicalAreas, historicalTypes, historicalListings } from "@/lib/historical-listings";
import { emptyBuyerFilters, defaultBuyerFilters, filterItems, sortItems, itemsFor, itemScore, itemArea, type BuyerFilters, type ExploreItem, type ExploreKind } from "@/lib/buyer-liquidity";
import { useBuyer } from "./buyer-shell";

export function BuyerExplorer({ kind, initialFilters = {}, initialSort = "newest", initialPage = 1 }: { kind: ExploreKind; initialFilters?: Partial<BuyerFilters>; initialSort?: string; initialPage?: number }) {
  const filters = { ...defaultBuyerFilters, ...initialFilters };
  const sort = initialSort, page = initialPage;
  const navigate = useNavigate();
  const persist = (next: BuyerFilters, nextSort = sort, nextPage = 1) => navigate({ to: "/buyer/properties", search: { ...next, sort: nextSort, page: nextPage }, replace: true, resetScroll: false });
  const rows = useMemo(() => sortItems(filterItems(itemsFor(kind), filters), sort, kind), [filters, sort, kind]);
  const pages = Math.max(1, Math.ceil(rows.length / 24)), current = Math.min(page, pages);
  const update = (next: BuyerFilters) => { void persist(next); };
  return <>
    <div><h1 className="font-display text-2xl font-bold">{"Explore Properties"}</h1><p className="mt-1 text-xs text-muted-foreground">{"Historical sample listings · not confirmed currently available."}</p></div>
    <input aria-label="Search area or building" placeholder={"Search area, building or city"} className="h-11 w-full rounded-lg border bg-card px-3 text-sm" value={filters.search} onChange={e => update({ ...filters, search: e.target.value })} />
    <BuyerFilterPanel filters={filters} onChange={update} kind={kind} />
    <div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground" data-testid="result-count">{rows.length.toLocaleString()} {"results"}</p><select aria-label="Sort results" value={sort} onChange={e => { void persist(filters, e.target.value); }} className="max-w-[60%] rounded-lg border bg-card p-2 text-xs"><option value="liquidity">Highest simulated liquidity</option><option value="price">Lowest price</option><option value="price-desc">Highest price</option>{kind === "properties" && <option value="newest">Newest posted</option>}</select></div>
    {rows.length === 0 ? <div className="border-y py-8 text-center"><p className="font-semibold">No matches</p><Button variant="outline" className="mt-3" onClick={() => update(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></div> : <div className="grid gap-3 md:grid-cols-2">{rows.slice((current - 1) * 24, current * 24).map(item => <ExploreCard key={item.id} item={item} kind={kind} />)}</div>}
    {pages > 1 && <div className="flex items-center justify-center gap-3"><Button variant="outline" size="sm" disabled={current <= 1} onClick={() => void persist(filters, sort, current - 1)}>Previous</Button><span className="text-xs" aria-live="polite">Page {current} of {pages.toLocaleString()}</span><Button variant="outline" size="sm" disabled={current >= pages} onClick={() => void persist(filters, sort, current + 1)}>Next</Button></div>}
    <details className="border-t pt-3 text-xs text-muted-foreground"><summary className="cursor-pointer">About these listings</summary><p className="mt-2">Posted 15 Dec 2021–25 Apr 2024. Asking prices are not sale prices. Unit sizes were not supplied; duplicate adverts may refer to the same unit. Liquidity and activity are simulated November 2026 illustrations, not observations of these adverts.</p></details>
  </>;
}
function BuyerFilterPanel({ filters, onChange, kind }: { filters: BuyerFilters; onChange: (value: BuyerFilters) => void; kind: ExploreKind }) {
  const update = (key: keyof BuyerFilters, value: string) => onChange({ ...filters, [key]: value });
  const fields: { key: keyof BuyerFilters; label: string; options: string[][] }[] = [
    { key: "city", label: "City", options: [...new Set(historicalListings.map(r => r.city))].sort().map(c => [c, c]) },
    { key: "community", label: "Area / community", options: historicalAreas.map(a => [a, a]) },
    { key: "type", label: "Property type", options: [["Residential", "Residential"], ...historicalTypes.map(x => [x, x])] },
    { key: "bedrooms", label: "Bedrooms", options: Array.from({ length: 12 }, (_, i) => [String(i), i === 0 ? "Studio" : String(i)]) },
    { key: "status", label: "Ready / off-plan", options: ["Ready", "Off-plan"].map(x => [x, x]) },
  ];
  return <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold"><SlidersHorizontal className="mr-2 inline size-4 text-primary" />Filters {Object.entries(filters).some(([key, value]) => key !== "search" && value) ? "· active" : ""}</summary><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{fields.map(field => <label key={field.key} className="min-w-0 text-xs font-semibold">{field.label}<select aria-label={field.label} className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={filters[field.key]} onChange={e => update(field.key, e.target.value)}><option value="">All</option>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}
    {([{ key: "minPrice", label: "Min price (AED)" }, { key: "maxPrice", label: "Max price (AED)" }] as const).map(field => <label key={field.key} className="text-xs font-semibold">{field.label}<input aria-label={field.label} type="number" min="0" value={filters[field.key]} onChange={e => update(field.key, e.target.value)} className="mt-1 h-11 w-full rounded-lg border bg-card px-2 font-normal" placeholder="Any" /></label>)}
    </div>{kind === "properties" && <p className="mt-2 text-[10px] text-muted-foreground">Unit sizes are unavailable; size filtering is not offered.</p>}<Button variant="ghost" size="sm" className="mt-3" onClick={() => onChange(emptyBuyerFilters)}><RotateCcw />Reset filters</Button></details>;
}
export function ItemLink({ item, kind, children, className = "" }: { item: ExploreItem; kind: ExploreKind; children: React.ReactNode; className?: string }) {
  return <Link to="/buyer/properties/$id" params={{ id: item.id }} className={className}>{children}</Link>;
}
export function SaveItem({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const { saved, save, loaded } = useBuyer(), active = saved.some(s => s.kind === kind && s.id === item.id);
  return <Button variant={active ? "secondary" : "outline"} size="icon" disabled={!loaded} title={active ? "Remove from saved" : "Save to track liquidity"} aria-label={`${active ? "Unsave" : "Save"} ${item.name}`} aria-pressed={active} onClick={() => save(item, kind)}><Bookmark className={active ? "fill-primary text-primary" : ""} /></Button>;
}
export function ExploreCard({ item, kind }: { item: ExploreItem; kind: ExploreKind }) {
  const score = itemScore(item, kind), row = item.listing;
  return <article className="rounded-lg border bg-card shadow-card" data-testid="explore-card"><div className="space-y-2 p-3">
    <div className="flex items-start justify-between gap-2"><ItemLink item={item} kind={kind} className="min-w-0"><h2 className="break-words text-sm font-semibold">{row?.building && row.building !== "Unknown" ? row.building : item.name}</h2></ItemLink><SaveItem item={item} kind={kind} /></div>
    <p className="text-xs text-muted-foreground">{itemArea(item)} · {row?.type ?? item.property.propertyType} · {item.property.bedrooms === 0 ? "Studio" : `${item.property.bedrooms}BR`}</p>
    {row && row.price > 0 && <p className="font-semibold">Asking AED {row.price.toLocaleString("en-GB")}</p>}
    {score === null ? <p className="text-xs text-muted-foreground">Liquidity data unavailable</p> : <div className="flex items-center justify-between gap-2"><span className="text-xs text-muted-foreground">Property Liquidity · simulated</span><b className="text-primary">{score}/100</b></div>}
    <ItemLink item={item} kind={kind} className="inline-block text-xs font-semibold text-primary underline">View Property</ItemLink>
  </div></article>;
}
