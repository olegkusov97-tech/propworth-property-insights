import { useRef, useState } from "react";
import { Map, BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketSegments, itemInsights, type ExploreItem } from "@/lib/buyer-liquidity";
import { bedroomLabel, comparisonRows, dubaiAreas, marketCohorts, transactionActivity, cohortDelta, type ComparisonMode } from "@/lib/market-comparison";
import type { PropertyType } from "@/lib/market";
import { useBuyer } from "./buyer-shell";
import { ViewSegmentProperties } from "./buyer-explorer";
import { MarketComparisonDetail } from "./market-comparison-detail";
import { MarketBarChart } from "./market-bar-chart";

export function MarketComparison() {
  const [mode, setMode] = useState<ComparisonMode>("areas");
  const [type, setType] = useState<PropertyType>("Apartment");
  const [area, setArea] = useState("marina");
  const [bedrooms, setBedrooms] = useState(2);
  const [status, setStatus] = useState("Ready");
  const [metric, setMetric] = useState("liquidity");
  const [focusId, setFocusId] = useState("");
  const detail = useRef<HTMLDivElement>(null);
  const { selected, select } = useBuyer();
  const bedOptions = [...new Set(marketCohorts.filter(c => c.property.propertyType === type && c.property.status === status).map(c => c.property.bedrooms))].sort((a, b) => a - b);
  const rows = comparisonRows(mode, type, area, bedrooms, status).flatMap(c => { const item = marketSegments.find(i => i.id === c.id); return item ? [item] : []; });
  const value = (item: ExploreItem) => metric === "sales" ? transactionActivity(item.property).count : metric === "demand" ? itemInsights(item).market.demand : metric === "competition" ? itemInsights(item).market.competition : itemInsights(item).market.liquidity;
  const chosen = selected.markets.flatMap(id => { const item = marketSegments.find(i => i.id === id); return item ? [item] : []; });
  const max = metric === "sales" ? Math.max(1, ...rows.map(value)) : 100;
  const focused = rows.find(item => item.id === focusId) ?? rows[0];
  const label = (item: ExploreItem) => mode === "bedrooms" ? bedroomLabel(item.property.bedrooms) : ({ jvc: "JVC", marina: "Dubai Marina", dhills: "Dubai Hills", dsc: "Sports City", springs: "The Springs" }[item.property.communityId] ?? item.name);
  const updateType = (next: PropertyType) => { setType(next); const options = marketCohorts.filter(c => c.property.propertyType === next && c.property.status === status); if (!options.some(c => c.property.bedrooms === bedrooms)) setBedrooms(options[0]?.property.bedrooms ?? 2); };
  return <>
    <h1 className="font-display text-xl font-bold">Compare market liquidity</h1>
    <div className="grid grid-cols-2 gap-2" aria-label="Comparison mode">{([{ key: "areas", label: "Compare Areas", Icon: Map }, { key: "bedrooms", label: "Compare Bedrooms", Icon: BedDouble }] as const).map(({ key, label, Icon }) => <Button key={key} variant={mode === key ? "default" : "outline"} className="h-11 min-w-0 gap-1 px-2 text-xs sm:text-sm" aria-pressed={mode === key} onClick={() => setMode(key)}><Icon className="size-4" />{label}</Button>)}</div>
    <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">
      <label className="text-xs font-semibold">Property type<select aria-label="Property type" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={type} onChange={e => updateType(e.target.value as PropertyType)}>{["Apartment", "Villa", "Townhouse"].map(t => <option key={t}>{t}</option>)}</select></label>
      {mode === "areas" ? <label className="text-xs font-semibold">Bedrooms<select aria-label="Bedrooms" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={bedrooms} onChange={e => setBedrooms(Number(e.target.value))}>{bedOptions.map(n => <option key={n} value={n}>{bedroomLabel(n)}</option>)}</select></label> : <label className="min-w-0 text-xs font-semibold">Area<select aria-label="Area" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={area} onChange={e => setArea(e.target.value)}>{dubaiAreas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
      <label className="text-xs font-semibold">Completion<select aria-label="Completion" className="mt-1 h-11 w-full rounded-lg border bg-card px-2 text-xs" value={status} onChange={e => { const next = e.target.value; setStatus(next); const options = marketCohorts.filter(c => c.property.propertyType === type && c.property.status === next); if (!options.some(c => c.property.bedrooms === bedrooms)) setBedrooms(options[0]?.property.bedrooms ?? 2); }}><option>Ready</option><option>Off-plan</option></select></label>
    </div>
    <section className="space-y-2" aria-label="Market comparison">
      <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{mode === "areas" ? `${bedroomLabel(bedrooms)} ${type} · ${status}` : `${dubaiAreas.find(c => c.id === area)?.name} · ${type} · ${status}`}</p><span className="text-[10px] text-muted-foreground">{metric === "sales" ? "DLD · 90 days" : "Simulated · /100"}</span></div>
      {rows.length ? <MarketBarChart bars={rows.map(item => ({ id: item.id, label: label(item), value: value(item) }))} selected={selected.markets} focused={focused?.id ?? ""} onFocus={setFocusId} onToggle={id => select(id, "markets")} max={max} sales={metric === "sales"} /> : <p className="py-5 text-sm text-muted-foreground">No observed configurations match these choices. Try another area or property type.</p>}
      <div className="grid grid-cols-4 gap-1" aria-label="Chart metric">{[{ key: "liquidity", label: "Liquidity" }, { key: "demand", label: "Demand" }, { key: "competition", label: "Competition" }, { key: "sales", label: "DLD sales" }].map(option => <Button key={option.key} size="sm" variant={metric === option.key ? "secondary" : "ghost"} className="min-w-0 px-1 text-[11px]" aria-pressed={metric === option.key} onClick={() => setMetric(option.key)}>{option.label}</Button>)}</div>
      <p className="text-[10px] text-muted-foreground">{metric === "competition" ? "Lower competition is better · simulated." : metric === "sales" ? "25 Aug–22 Nov 2026 · missing matches do not mean zero market sales." : "Higher is better · simulated, not a validated forecast."}</p>
    </section>
    {focused && <section className="space-y-3 border-y py-3" aria-label="Focused segment"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="min-w-0 text-sm font-semibold">{focused.name}</h2><ViewSegmentProperties item={focused} /></div><div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs" aria-live="polite"><span>Liquidity <b>{itemInsights(focused).market.liquidity}/100</b></span><span>Buyer demand <b>{itemInsights(focused).market.demand}/100</b></span><span>Competition <b>{itemInsights(focused).market.competition}/100</b></span><span>DLD sales (90d) <b>{transactionActivity(focused.property).count || "No matches"}</b></span></div><p className="text-[10px] text-muted-foreground">Liquidity {cohortDelta(focused.property) > 0 ? "+" : ""}{cohortDelta(focused.property)} pts this month · liquidity, demand and competition are simulated.</p></section>}
    {chosen.length > 0 && <div className="flex flex-wrap items-center justify-between gap-2"><p className="min-w-0 text-xs text-muted-foreground">{chosen.map(item => `${label(item)} · ${item.property.status}`).join(" / ")}</p><Button size="sm" variant="ghost" onClick={() => chosen.forEach(item => select(item.id, "markets"))}>Clear selection</Button></div>}
    {chosen.length >= 2 && <div ref={detail} className="scroll-mt-20"><MarketComparisonDetail items={chosen} /></div>}
    <p className="text-[10px] leading-relaxed text-muted-foreground">Configurations are observed in the uploaded historical Bayut sample (2021–2024), not a complete inventory of Dubai. DLD reference extract covers five areas and ready sales only; missing data is not filled with simulated transactions.</p>
    {chosen.length > 0 && <div className="sticky bottom-3 z-10 flex items-center justify-end gap-2 rounded-lg border bg-card p-2 shadow-card"><Button size="sm" disabled={chosen.length < 2} onClick={() => detail.current?.scrollIntoView({ block: "start" })}>{chosen.length < 2 ? "Select another area or configuration" : "View detailed comparison"}</Button></div>}
  </>;
}