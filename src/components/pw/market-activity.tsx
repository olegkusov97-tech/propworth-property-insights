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
  { key: "sales90d", label: "Comparable Sales", period: "Rolling 90 days", icon: Handshake },
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
  return <section className="space-y-3 border-y py-4">
    <div><h2 className="font-display text-lg font-bold">What's happening in your market?</h2><p className="mt-1 text-xs text-muted-foreground" data-testid="market-segment">Similar {segment}</p></div>
    <div className="grid grid-cols-3 gap-2">{metrics.map(m => <Button key={m.key} variant="outline" aria-pressed={metric.key === m.key} className={`h-28 min-w-0 flex-col items-start justify-between whitespace-normal rounded-lg p-2 text-left ${metric.key === m.key ? "border-primary bg-primary/5" : ""}`} onClick={() => { setMetric(m); setMonth(latest.month); }}><span className="flex w-full items-center justify-between"><m.icon className="size-4 text-primary" /><span className="text-[9px] font-normal text-muted-foreground">{m.period}</span></span><span className="text-[11px] leading-tight">{m.label}</span><b className="text-base">{latest[m.key].toLocaleString()}</b></Button>)}</div>
    <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-semibold">{metric.label}</h3><div className="flex gap-1" aria-label="Time period">{[6, 12].map(n => <Button key={n} variant={period === n ? "secondary" : "ghost"} size="sm" aria-pressed={period === n} onClick={() => { setPeriod(n); setMonth(latest.month); }}>{n}M</Button>)}</div></div>
    <MonthlyLineChart months={rows.map(r => r.month)} series={[{ key: metric.key, label: metric.label, values: rows.map(r => r[metric.key]) }]} selected={index} onSelect={i => { const row = rows[i]; if (row) setMonth(row.month); }} />
    <div aria-live="polite" data-testid="activity-summary"><p className="text-sm font-semibold">{selected.month} · {selected[metric.key].toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{metric.period.toLowerCase()}</span></p><p className="mt-1 text-xs text-muted-foreground">{previous ? insight : "First month in this period."}</p>{selected.segment !== segment && <p className="mt-1 text-[11px] text-muted-foreground">Recorded segment: {selected.segment}</p>}</div>
    <p className="text-[10px] text-muted-foreground">Illustrative monthly snapshots · simulated data.</p>
  </section>;
}