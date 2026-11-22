import { useRef, useState } from "react";
import { Check, Map, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketSegments, itemInsights, type ExploreItem } from "@/lib/buyer-liquidity";
import { bedroomLabel, comparisonRows, dubaiAreas, marketCohorts, transactionActivity, cohortDelta, type ComparisonMode } from "@/lib/market-comparison";
import type { PropertyType } from "@/lib/market";
import { useBuyer } from "./buyer-shell";
import { ViewSegmentProperties } from "./buyer-explorer";
import { MarketComparisonDetail } from "./market-comparison-detail";

export function MarketComparison() {
  const [mode, setMode] = useState<ComparisonMode>("areas");
  const [type, setType] = useState<PropertyType>("Apartment");
  const [area, setArea] = useState("marina");
  const [bedrooms, setBedrooms] = useState(2);
  const [status, setStatus] = useState("Ready");
  const [ranking, setRanking] = useState("liquidity");
  const detail = useRef<HTMLDivElement>(null);
  const { selected, select } = useBuyer();
  const bedOptions = [...new Set(marketCohorts.filter(c => c.property.propertyType === type && c.property.status === status).map(c => c.property.bedrooms))].sort((a, b) => a - b);
  const rows = comparisonRows(mode, type, area, bedrooms, status).flatMap(c => { const item = marketSegments.find(i => i.id === c.id); return item ? [item] : []; });
  const value = (item: ExploreItem) => ranking === "sales" ? transactionActivity(item.property).count : ranking === "demand" ? itemInsights(item).market.demand : ranking === "competition" ? itemInsights(item).market.competition : itemInsights(item).market.liquidity;
  rows.sort((a, b) => ranking === "competition" ? value(a) - value(b) : value(b) - value(a));
  const chosen = selected.markets.flatMap(id => { const item = marketSegments.find(i => i.id === id); return item ? [item] : []; });
  const max = ranking === "sales" ? Math.max(1, ...rows.map(value)) : 100;
  const top = rows[0];
  const updateType = (next: PropertyType) => { setType(next); const options = marketCohorts.filter(c => c.property.propertyType === next && c.property.status === status); if (!options.some(c => c.property.bedrooms === bedrooms)) setBedrooms(options[0]?.property.bedrooms ?? 2); };
  return <>
    <div><h1 className="font-display text-2xl font-bold">Compare market liquidity</h1><p className="mt-1 text-xs text-muted-foreground">Compare Dubai areas or bedroom configurations.</p></div>
    <div className="grid grid-cols-2 gap-2" aria-label="Comparison mode">{([{ key: "areas", label: "Compare Areas", Icon: Map }, { key: "bedrooms", label: "Compare Bedrooms", Icon: BedDouble }] as const).map(({ key, label, Icon }) => <Button key={key} variant={mode === key ? "default" : "outline"} className="h-11 min-w-0 gap-1 px-2 text-xs sm:text-sm" aria-pressed={mode === key} onClick={() => setMode(key)}><Icon className="size-4" />{label}</Button>)}</div>
    <div className="grid grid-cols-2 gap-3 border-y py-3 sm:grid-cols-3">
      <label className="text-xs font-semibold">Property type<select aria-label="Property type" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={type} onChange={e => updateType(e.target.value as PropertyType)}>{["Apartment", "Villa", "Townhouse"].map(t => <option key={t}>{t}</option>)}</select></label>
      {mode === "areas" ? <label className="text-xs font-semibold">Bedrooms<select aria-label="Bedrooms" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={bedrooms} onChange={e => setBedrooms(Number(e.target.value))}>{bedOptions.map(n => <option key={n} value={n}>{bedroomLabel(n)}</option>)}</select></label> : <label className="min-w-0 text-xs font-semibold">Area<select aria-label="Area" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={area} onChange={e => setArea(e.target.value)}>{dubaiAreas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      <label className="text-xs font-semibold">Completion<select aria-label="Completion" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={status} onChange={e => { const next = e.target.value; setStatus(next); const options = marketCohorts.filter(c => c.property.propertyType === type && c.property.status === next); if (!options.some(c => c.property.bedrooms === bedrooms)) setBedrooms(options[0]?.property.bedrooms ?? 2); }}><option>Ready</option><option>Off-plan</option></select></label>
    </div>
    <section className="space-y-3" aria-label="Market ranking">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold">{mode === "areas" ? `${bedroomLabel(bedrooms)} ${type} · ${status}` : `${dubaiAreas.find(c => c.id === area)?.name} · ${type} · ${status}`}</p><select aria-label="Rank by" className="h-10 max-w-full rounded-lg border bg-card px-2 text-xs" value={ranking} onChange={e => setRanking(e.target.value)}><option value="liquidity">Liquidity · simulated</option><option value="demand">Buyer demand · simulated</option><option value="competition">Competition · simulated</option><option value="sales">DLD reference sales · 90d</option></select></div>
      <p className="text-[10px] text-muted-foreground">{ranking === "competition" ? "Lower competition is better." : ranking === "sales" ? "Matching uploaded sales · 25 Aug–22 Nov 2026. No matches is not zero market activity." : "Higher scores are better · simulated, not validated predictions."} All prices · observed configurations only.</p>
      <div className="divide-y border-y">{rows.map(item => {
        const score = value(item), active = chosen.some(c => c.id === item.id), count = transactionActivity(item.property).count;
        const label = mode === "areas" ? dubaiAreas.find(c => c.id === item.property.communityId)?.name ?? item.name : bedroomLabel(item.property.bedrooms);
        const delta = cohortDelta(item.property);
        return <div key={item.id} className="space-y-2 py-3" data-testid="market-row"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{label}</h2><b className="text-sm text-primary">{ranking === "sales" ? count ? `${score} sales` : "No matches" : `${score}/100`}</b></div>
          <svg viewBox="0 0 300 8" preserveAspectRatio="none" className="h-2 w-full" role="img" aria-label={`${label}: ${score}${ranking === "sales" ? " reference sales" : " out of 100"}`}><rect width="300" height="8" rx="4" className="fill-muted" /><rect width={score / max * 300} height="8" rx="4" className={ranking === "competition" ? "fill-accent" : "fill-primary"} /></svg>
          <div className="flex flex-wrap justify-between gap-1 text-[10px] text-muted-foreground"><span>Liquidity {delta > 0 ? "+" : ""}{delta} pts this month · simulated</span><span>DLD 90d: {count ? `${count} reference sales` : "no matching records"}</span></div>
          <div className="flex items-center justify-between gap-2"><Button size="sm" variant={active ? "secondary" : "outline"} aria-label={`${active ? "Remove" : "Compare"} ${label}`} aria-pressed={active} disabled={!active && chosen.length >= 3} onClick={() => select(item.id, "markets")}>{active && <Check />}{active ? "Selected" : "Compare"}</Button><ViewSegmentProperties item={item} /></div>
        </div>;
      })}</div>
      {!rows.length ? <p className="py-5 text-sm text-muted-foreground">No observed configurations match these choices. Try another area or property type.</p> : top && <p className="text-xs leading-relaxed text-muted-foreground">{ranking === "sales" ? "Reference sales show recorded activity, not resale ease; areas may have different market sizes." : `${mode === "areas" ? dubaiAreas.find(c => c.id === top.property.communityId)?.name : bedroomLabel(top.property.bedrooms)} ranks first in this simulated ${ranking === "competition" ? "lower-competition" : ranking} comparison${rows[1] && value(rows[1]) === value(top) ? " (tied)" : ""}. Real transaction activity is shown separately.`}</p>}
    </section>
    {chosen.length > 0 && <div className="space-y-2 border-y bg-background py-3"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">{chosen.length} of 3 selected</h2><Button size="sm" variant="ghost" onClick={() => chosen.forEach(item => select(item.id, "markets"))}>Clear</Button></div><div className="space-y-1">{chosen.map(item => <div key={item.id} className="flex items-center justify-between gap-2 text-xs"><span>{item.name} · {item.property.status}</span><Button size="sm" variant="ghost" aria-label={`Remove ${item.name}`} onClick={() => select(item.id, "markets")}>Remove</Button></div>)}</div>{chosen.length < 2 && <p className="text-xs text-muted-foreground">Select one more segment for a detailed comparison.</p>}</div>}
    {chosen.length >= 2 && <div ref={detail} className="scroll-mt-20"><MarketComparisonDetail items={chosen} /></div>}
    <p className="text-[10px] leading-relaxed text-muted-foreground">Configurations are observed in the uploaded historical Bayut sample (2021–2024), not a complete inventory of Dubai. DLD reference extract covers five areas and ready sales only; missing data is not filled with simulated transactions.</p>
    {chosen.length > 0 && <div className="sticky bottom-3 z-10 flex items-center justify-between gap-2 rounded-lg border bg-card p-3 shadow-card"><span className="text-xs">{chosen.length} of 3 selected</span><Button size="sm" disabled={chosen.length < 2} onClick={() => detail.current?.scrollIntoView({ block: "start" })}>Compare {chosen.length}</Button></div>}
  </>;
}