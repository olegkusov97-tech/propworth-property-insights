import { useState } from "react";
import { Building2, Heart, MessageSquare, Search, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OwnerSnapshot } from "@/lib/owner-history";
import { MonthlyLineChart } from "./monthly-line-chart";

const metrics = [
  { key: "searches", label: "Buyer Searches", period: "Monthly", icon: Search },
  { key: "saves", label: "Property Saves", period: "Monthly", icon: Heart },
  { key: "enquiries", label: "Enquiries", period: "Monthly", icon: MessageSquare },
  { key: "listings", label: "Active Similar Listings", period: "Month-end", icon: Building2 },
  { key: "sales90d", label: "Comparable Sales", period: "90d rolling", icon: Handshake },
] as const;
export function MarketActivity({ snapshots, segment }: { snapshots: OwnerSnapshot[]; segment: string }) {
  const [metric, setMetric] = useState<(typeof metrics)[number]>(metrics[0]);
  const [period, setPeriod] = useState(12);
  const [month, setMonth] = useState("Nov 2026");
  const rows = snapshots.slice(-period), latest = snapshots.at(-1);
  const index = Math.max(0, rows.findIndex(r => r.month === month));
  const selected = rows[index], previous = rows[index - 1];
  if (!latest || !selected) return null;
  const delta = previous ? selected[metric.key] - previous[metric.key] : 0;
  const insight = metric.key === "listings"
    ? delta < 0 ? "Fewer competing homes give buyers less choice and ease pressure on sellers." : delta > 0 ? "More competing homes give buyers more choice and add pressure on sellers." : "Competing supply is stable."
    : metric.key === "sales90d" ? delta > 0 ? "More comparable sales suggest stronger market activity." : delta < 0 ? "Fewer comparable sales suggest slower market activity." : "Comparable sales activity is stable."
    : delta > 0 ? "Buyer interest in similar homes is growing." : delta < 0 ? "Buyer interest in similar homes has softened." : "Buyer interest in similar homes is stable.";
  return <section className="space-y-5 border-y py-6">
    <div><h2 className="font-display text-lg font-bold">What's happening in your market?</h2><p className="mt-1 text-xs text-muted-foreground" data-testid="market-segment">Similar {segment}</p></div>
    <div className="grid grid-cols-2 gap-3">{metrics.map((m, i) => <Button key={m.key} variant="outline" aria-pressed={metric.key === m.key} className={`grid h-auto min-h-40 min-w-0 grid-rows-[auto_1fr_auto] items-start justify-stretch justify-items-start gap-3 whitespace-normal rounded-lg border-2 p-4 text-left text-foreground hover:text-foreground ${i === metrics.length - 1 ? "col-span-2" : ""} ${metric.key === m.key ? "border-primary bg-primary/5 hover:bg-primary/5" : "border-border bg-card hover:bg-muted"}`} onClick={() => { setMetric(m); setMonth(latest.month); }}>
      <m.icon className={`size-4 shrink-0 ${metric.key === m.key ? "text-primary" : "text-muted-foreground"}`} />
      <span className="min-w-0 self-start"><span className="block text-sm font-semibold leading-5">{m.label}</span><span className="mt-1 block whitespace-nowrap text-xs font-normal text-muted-foreground">{m.period}</span></span>
      <span className="text-xl font-bold leading-6 tabular-nums">{latest[m.key].toLocaleString()}</span>
    </Button>)}</div>
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 pt-1"><h3 className="min-w-0 text-sm font-semibold leading-5">{metric.label}</h3><div className="flex shrink-0 gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Time period">{[6, 12].map(n => <Button key={n} variant="ghost" aria-pressed={period === n} className={`h-11 w-11 rounded-md p-0 text-sm ${period === n ? "bg-card font-semibold text-foreground shadow-card hover:bg-card" : "text-muted-foreground"}`} onClick={() => { setPeriod(n); setMonth(latest.month); }}>{n}M</Button>)}</div></div>
    <MonthlyLineChart months={rows.map(r => r.month)} series={[{ key: metric.key, label: metric.label, values: rows.map(r => r[metric.key]) }]} selected={index} onSelect={i => { const row = rows[i]; if (row) setMonth(row.month); }} />
    <div aria-live="polite" data-testid="activity-summary"><p className="text-sm font-semibold">{selected.month} · {selected[metric.key].toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{metric.period.toLowerCase()}</span></p><p className="mt-1 text-xs text-muted-foreground">{previous ? insight : "First month in this period."}</p>{selected.segment !== segment && <p className="mt-1 text-[11px] text-muted-foreground">Recorded segment: {selected.segment}</p>}</div>
    <p className="text-[10px] text-muted-foreground">Illustrative monthly snapshots · simulated data.</p>
  </section>;
}