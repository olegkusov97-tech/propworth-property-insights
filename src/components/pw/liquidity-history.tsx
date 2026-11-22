import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "./ui";

export function LiquidityHistory({ history }: { history: { month: string; property: number; market: number }[] }) {
  const [selected, setSelected] = useState(history.length - 1);
  const row = history[selected];
  if (!row) return null;
  const prev = history[selected - 1];
  const delta = prev ? row.property - prev.property : null;
  return <Card>
    <h2 className="text-sm font-semibold">Liquidity History</h2>
    <div className="mt-3 flex items-start justify-between gap-3" aria-live="polite">
      <div><p className="text-sm font-semibold" data-testid="history-month">{row.month}</p><p className="text-xs text-muted-foreground">{delta === null ? "Start of displayed history" : `${delta > 0 ? "+" : ""}${delta} pts vs previous month`}</p></div>
      <div className="text-right"><p className="text-sm">Property <b data-testid="history-score">{row.property}/100</b></p><p className="text-xs text-muted-foreground">Market segment {row.market}/100</p></div>
    </div>
    <div className="mt-4 flex gap-2">
      <div className="flex h-40 w-6 shrink-0 flex-col justify-between text-[10px] text-muted-foreground"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between" aria-hidden="true">{[100, 75, 50, 25, 0].map(v => <div key={v} className="border-t border-dashed border-border" />)}</div>
        <div className="relative grid grid-cols-12 gap-0.5">
          {history.map((entry, i) => <Button key={entry.month} variant="ghost" aria-label={`${entry.month}: Property Liquidity ${entry.property}, Market Liquidity ${entry.market}`} aria-pressed={selected === i} title={`${entry.month}: Property ${entry.property}/100 · Market ${entry.market}/100`} className={`h-auto min-w-0 flex-col justify-start gap-0 rounded-sm p-0 hover:bg-muted ${selected === i ? "ring-1 ring-ring" : ""}`} onClick={() => setSelected(i)}>
            <span className="relative flex h-40 w-full items-end justify-center gap-px px-0.5"><span className="w-1/2 rounded-t-sm bg-primary" style={{ height: `${entry.property}%` }} /><span className="w-1/2 rounded-t-sm bg-accent" style={{ height: `${entry.market}%` }} /></span>
            <span className="py-2 text-[9px] font-normal text-muted-foreground">{entry.month.slice(0, 3)}</span>
          </Button>)}
        </div>
      </div>
    </div>
    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />Property Liquidity</span><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" />Market segment</span></div>
    <p className="mt-2 text-[11px] text-muted-foreground">Dec 2025–Nov 2026 · simulated monthly snapshots. Property history holds your current details and asking premium constant; market history is unaffected by your asking price.</p>
  </Card>;
}