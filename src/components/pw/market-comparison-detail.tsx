import { useState } from "react";
import { Button } from "@/components/ui/button";
import { itemInsights, type ExploreItem } from "@/lib/buyer-liquidity";
import { cohortDelta, transactionActivity } from "@/lib/market-comparison";
import { scoreMarket } from "@/lib/property";
import { MonthlyLineChart } from "./monthly-line-chart";
import { SaveItem, ViewSegmentProperties } from "./buyer-explorer";

export function MarketComparisonDetail({ items }: { items: ExploreItem[] }) {
  const [metric, setMetric] = useState("liquidity");
  const [month, setMonth] = useState(11);
  const [period, setPeriod] = useState(12);
  const first = items[0];
  if (!first) return null;
  const real = metric === "sales";
  const months = real ? ["Aug 25–31", "Sep 2026", "Oct 2026", "Nov 1–22"] : itemInsights(first).snapshots.slice(-period).map(s => s.month);
  const selected = Math.min(month, months.length - 1);
  const series = items.map((item, i) => ({ key: item.id, label: item.name, secondary: i === 1, dashed: i === 2,
    values: real ? transactionActivity(item.property).months : itemInsights(item).snapshots.slice(-period).map(s => metric === "demand" ? scoreMarket(s).demand : metric === "competition" ? scoreMarket(s).competition : s.market) }));
  const rows = [
    { label: "Liquidity · simulated", value: (item: ExploreItem) => `${itemInsights(item).market.liquidity}/100` },
    { label: "Buyer demand · simulated ↑", value: (item: ExploreItem) => `${itemInsights(item).market.demand}/100` },
    { label: "Supply competition · simulated ↓", value: (item: ExploreItem) => `${itemInsights(item).market.competition}/100` },
    { label: "Active listings · simulated", value: (item: ExploreItem) => itemInsights(item).market.listings.toLocaleString() },
    { label: "Monthly liquidity change", value: (item: ExploreItem) => `${cohortDelta(item.property) > 0 ? "+" : ""}${cohortDelta(item.property)} pts` },
    { label: "DLD reference sales · 90 days", value: (item: ExploreItem) => transactionActivity(item.property).count || "No matching records" },
    { label: "Median reference sale price", value: (item: ExploreItem) => { const n = transactionActivity(item.property).median; return n === null ? "Not available" : `AED ${Math.round(n).toLocaleString("en-GB")}`; } },
  ];
  return <section className="space-y-4 border-t pt-4" aria-label="Detailed market comparison">
    <h2 className="font-display text-xl font-bold">{items.length > 1 ? "Side-by-side comparison" : "Segment analysis"}</h2>
    <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-left text-xs"><thead><tr><th className="min-w-28 p-3">Nov 2026</th>{items.map(item => <th key={item.id} className="min-w-36 p-3 align-top"><p>{item.name}</p><p className="mt-1 font-normal text-muted-foreground">{item.property.status} · all prices</p><div className="mt-3 flex flex-wrap gap-2"><SaveItem item={item} kind="markets" /><ViewSegmentProperties item={item} /></div></th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.label} className="border-t"><th className="p-3 font-normal text-muted-foreground">{row.label}</th>{items.map(item => <td key={item.id} className="p-3 font-semibold">{row.value(item)}</td>)}</tr>)}</tbody></table></div>
    <div className="flex flex-wrap items-end justify-between gap-2"><label className="text-xs font-semibold">Historical trends<select aria-label="Comparison trend" value={metric} onChange={e => { setMetric(e.target.value); setMonth(11); }} className="mt-1 block h-11 rounded-lg border bg-card px-2"><option value="liquidity">Liquidity · simulated</option><option value="demand">Buyer demand · simulated</option><option value="competition">Competition · simulated</option><option value="sales">DLD reference sales</option></select></label>{!real && <div className="flex">{[6, 12].map(n => <Button key={n} variant={period === n ? "secondary" : "ghost"} size="sm" aria-pressed={period === n} onClick={() => { setPeriod(n); setMonth(n - 1); }}>{n}M</Button>)}</div>}</div>
    <MonthlyLineChart months={months} series={series} selected={selected} onSelect={setMonth} score={!real} />
    <div className="space-y-1 text-xs" aria-live="polite" data-testid="market-trend-summary"><b>{months[selected]}</b>{series.map((s, i) => <p key={s.key} className={i === 1 ? "text-accent" : "text-primary"}>{i === 2 ? "Dashed · " : ""}{s.label}: <b>{s.values[selected]}{real ? " reference sales" : "/100"}</b></p>)}</div>
    <p className="text-[10px] leading-relaxed text-muted-foreground">{real ? "Aug and Nov are partial months, not comparable full-month totals. Zero means no matching records in this reference extract, not no market sales." : "Liquidity, demand, competition, active listings and their history are simulated illustrations, not measured market conditions or validated forecasts."}</p>
    <details className="border-t pt-3"><summary className="cursor-pointer text-xs font-semibold">Data sources and matching</summary><p className="mt-2 text-xs leading-relaxed text-muted-foreground">DLD Sale registrations from the uploaded transaction file · 25 Aug–22 Nov 2026 (90 days), user-supplied and not independently verified. Match area, exact property subtype, bedrooms and ready/off-plan status; no unit-size or price restriction. The retained extract contains ready-property sales only. The Springs uses Springs projects within Emirates Living; Villa records are never relabeled Townhouse. Missing matches do not establish zero sales. Configurations come from the historical Bayut catalog, not current availability. Real sale counts do not calibrate the simulated scores.</p></details>
  </section>;
}