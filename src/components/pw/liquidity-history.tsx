import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OwnerSnapshot } from "@/lib/owner-history";
import { MonthlyLineChart } from "./monthly-line-chart";

export function LiquidityHistory({ history }: { history: OwnerSnapshot[] }) {
  const [selected, setSelected] = useState(history.length - 1);
  const [showProperty, setShowProperty] = useState(true);
  const [showMarket, setShowMarket] = useState(true);
  const row = history[selected];
  if (!row) return null;
  const prev = history[selected - 1];
  const delta = prev ? row.property - prev.property : null;
  return <section className="liquidity-history-colors space-y-3 py-2">
    <h2 className="text-sm font-semibold">Liquidity History</h2>
    <div className="flex flex-wrap gap-1"><Button variant={showProperty ? "secondary" : "ghost"} size="sm" aria-pressed={showProperty} onClick={() => setShowProperty(!showProperty)}><span className="h-2 w-2 rounded-full bg-primary" />Your Property</Button><Button variant={showMarket ? "secondary" : "ghost"} size="sm" aria-pressed={showMarket} onClick={() => setShowMarket(!showMarket)}><span className="h-2 w-2 rounded-full bg-accent" />Similar Properties</Button></div>
    <MonthlyLineChart months={history.map(r => r.month)} series={[...(showProperty ? [{ key: "property", label: "Your Property", values: history.map(r => r.property) }] : []), ...(showMarket ? [{ key: "market", label: "Similar Properties", values: history.map(r => r.market), secondary: true }] : [])]} selected={selected} onSelect={setSelected} score />
    <div aria-live="polite" className="border-t pt-3"><p className="text-xs font-semibold" data-testid="history-month">{row.month}</p><div className="mt-2 grid grid-cols-2 gap-3 text-xs"><div>Your Property <b className="block text-lg text-primary" data-testid="history-score">{row.property}/100</b><span className="text-muted-foreground">{delta === null ? "First snapshot" : `${delta > 0 ? "+" : ""}${delta} pts vs previous month`}</span></div><div>Similar Properties <b className="block text-lg text-accent">{row.market}/100</b><span className="text-muted-foreground">{prev ? `${row.market - prev.market > 0 ? "+" : ""}${row.market - prev.market} pts vs previous month` : "First snapshot"}</span></div></div></div>
    <p className="text-[10px] text-muted-foreground">Simulated monthly records · past snapshots retain the details recorded at that time.</p>
  </section>;
}