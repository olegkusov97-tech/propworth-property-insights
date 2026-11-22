import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { historicalListings } from "@/lib/historical-listings";
import { bedroomLabel, buildBuyerMarketSegments, initialMarketComparison, marketComparisonRows, marketSegmentListingFilters, updateMarketComparison, type MarketComparisonFilters } from "@/lib/buyer-market-comparison";

export function BuyerMarketComparison() {
  const segments = useMemo(() => buildBuyerMarketSegments(historicalListings), []);
  const [filters, setFilters] = useState(initialMarketComparison);
  const [selectedId, setSelectedId] = useState("");
  const navigate = useNavigate();
  const rows = marketComparisonRows(segments, filters);
  const selected = rows.find(row => row.id === selectedId) ?? rows[0];
  const areaOptions = [...new Map(segments.map(segment => [segment.communityId, segment.area])).entries()];
  const typeOptions = ["Apartment", "Villa", "Townhouse"].filter(type => segments.some(segment => segment.type === type));
  const bedroomOptions = [...new Set(segments.filter(segment => (!filters.area || segment.communityId === filters.area) && (!filters.type || segment.type === filters.type)).map(segment => segment.bedrooms))].sort((a, b) => a - b);
  const fields: { key: keyof MarketComparisonFilters; label: string; all: string; options: [string, string][] }[] = [
    { key: "area", label: "Area / Community", all: "Compare areas", options: areaOptions },
    { key: "type", label: "Property Type", all: "All types", options: typeOptions.map(type => [type, type]) },
    { key: "bedrooms", label: "Bedrooms", all: "All bedrooms", options: bedroomOptions.map(bedrooms => [String(bedrooms), bedroomLabel(bedrooms)]) },
  ];
  const criteria = [filters.area ? areaOptions.find(([id]) => id === filters.area)?.[1] : "", filters.bedrooms ? bedroomLabel(Number(filters.bedrooms)) : "All bedrooms", filters.type ? `${filters.type}s` : "All types"].filter(Boolean).join(" ");
  return <section className="space-y-4" aria-label="Compare Property Liquidity">
    <div><h1 className="font-display text-2xl font-bold">Compare Property Liquidity</h1><p className="mt-1 text-xs text-muted-foreground">Simulated scores · unvalidated</p></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{fields.map((field, index) => <label key={field.key} className={`min-w-0 text-xs font-semibold ${index === 0 ? "col-span-2 sm:col-span-1" : ""}`}>{field.label}<select aria-label={`Market ${field.label}`} value={filters[field.key]} onChange={event => { setFilters(updateMarketComparison(filters, field.key, event.target.value)); setSelectedId(""); }} className="mt-1 h-11 w-full min-w-0 rounded-lg border bg-card px-2 font-normal">
      <option value="">{field.all}</option>{field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      {filters[field.key] && !field.options.some(([value]) => value === filters[field.key]) && <option value={filters[field.key]}>{field.key === "bedrooms" ? bedroomLabel(Number(filters[field.key])) : filters[field.key]}</option>}
    </select></label>)}</div>
    <div className="space-y-2 border-t pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"><h2 className="text-sm font-bold">{criteria} · Ready</h2><span className="text-xs text-muted-foreground">Highest liquidity first · /100</span></div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Chart legend"><span className="flex items-center gap-2"><span className="h-2 w-4 rounded-sm bg-primary" />Market Liquidity</span><span className="flex items-center gap-2"><span className="h-2 w-4 rounded-sm bg-market-demand" />Buyer Demand</span></div>
    </div>
    <div role="group" aria-label="Market segment comparison" className="space-y-2">{rows.map(row => {
      const label = !filters.area ? row.area : !filters.type ? row.type : bedroomLabel(row.bedrooms);
      const active = selected?.id === row.id;
      return <Button key={row.id} variant="ghost" aria-pressed={active} aria-label={`${row.area}, ${bedroomLabel(row.bedrooms)} ${row.type}: market liquidity ${row.liquidity}, buyer demand ${row.demand}`} onClick={() => setSelectedId(row.id)} className={`grid h-auto min-h-24 w-full min-w-0 justify-stretch gap-2 rounded-md border px-3 py-2 text-left ${active ? "border-primary bg-secondary hover:bg-secondary" : "border-border hover:bg-muted"}`}>
        <span className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><span className="flex min-w-0 items-center gap-2 whitespace-normal text-sm font-semibold leading-5">{label}{active && <Check className="text-primary" />}</span><span className="text-xl font-bold tabular-nums text-primary" title="Market Liquidity">{row.liquidity}<span className="ml-0.5 text-xs font-normal text-muted-foreground">/100</span></span></span>
        <span className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-2 gap-y-1" aria-hidden="true">
          <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-1.5! w-full!"><rect width="100" height="6" rx="2" className="fill-border" /><rect width={row.liquidity} height="6" rx="2" className="fill-primary" /></svg><span className="text-right text-xs font-bold tabular-nums text-primary">{row.liquidity}</span>
          <svg viewBox="0 0 100 6" preserveAspectRatio="none" className="h-1.5! w-full!"><rect width="100" height="6" rx="2" className="fill-border" /><rect width={row.demand} height="6" rx="2" className="fill-market-demand" /></svg><span className="text-right text-xs font-semibold tabular-nums text-market-demand">{row.demand}</span>
        </span>
      </Button>;
    })}{rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">No supported segment matches these filters.</p>}</div>
    {selected && <div className="space-y-3 border-t pt-3" aria-live="polite" data-testid="market-comparison-details">
      <div><h2 className="text-base font-bold">{selected.area}</h2><p className="mt-1 text-xs text-muted-foreground">{bedroomLabel(selected.bedrooms)} {selected.type} · Ready</p></div>
      <dl className="grid grid-cols-3 gap-3 text-xs"><div><dt className="text-muted-foreground">Buyer Demand</dt><dd className="mt-1 text-base font-bold tabular-nums">{selected.demand}/100</dd></div><div><dt className="text-muted-foreground">Supply Competition</dt><dd className="mt-1 text-base font-bold tabular-nums">{selected.competition}/100</dd></div><div><dt className="text-muted-foreground">DLD sales · 90d</dt><dd className="mt-1 text-base font-bold tabular-nums">{selected.sales.length ? selected.sales.length.toLocaleString() : "No matches"}</dd></div></dl>
      <p className="text-xs text-muted-foreground">{selected.historicalListings.toLocaleString()} historical listing samples</p><Button className="h-11 w-full" onClick={() => void navigate({ to: "/buyer/properties", search: { ...marketSegmentListingFilters(selected), sort: "newest", page: 1 } })}>View Properties<ArrowRight /></Button>
      <details className="text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold"><ChevronDown className="mr-1 inline size-3" />Data and sale references</summary><p className="mt-2">Liquidity, demand and competition use the existing simulated segment model. DLD sales are separate uploaded records from 25 Aug–22 Nov 2026, matched by area, type, bedrooms and Ready status, without a unit-size filter; not independently verified.</p>{selected.sales.length > 0 && <ul className="mt-2 space-y-2">{selected.sales.slice(0, 3).map(sale => <li key={sale.id} className="border-t pt-2"><p>{sale.project} · {sale.date}</p><p>AED {sale.price.toLocaleString()} · {Math.round(sale.sizeSqft).toLocaleString()} sq ft</p></li>)}</ul>}</details>
    </div>}
  </section>;
}