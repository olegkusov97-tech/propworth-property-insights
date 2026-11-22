import { Button } from "@/components/ui/button";

export interface MarketBar { id: string; label: string; value: number }
export function MarketBarChart({ bars, selected, focused, onFocus, onToggle, max = 100, sales = false }: {
  bars: MarketBar[]; selected: string[]; focused: string; onFocus: (id: string) => void;
  onToggle: (id: string) => void; max?: number; sales?: boolean;
}) {
  const height = bars.length * 48 + 28;
  return <div className="relative mx-auto w-full max-w-2xl" role="group" aria-label="Interactive market comparison chart">
    <svg viewBox={`0 0 360 ${height}`} className="h-auto w-full" aria-hidden="true">
      {[0, .25, .5, .75, 1].map(t => <g key={t}><line x1={130 + t * 202} x2={130 + t * 202} y1="0" y2={height - 28} className="stroke-border" strokeDasharray="3 3" /><text x={130 + t * 202} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">{Math.round(t * max)}</text></g>)}
      {bars.map((bar, i) => <g key={bar.id}>
        {(focused === bar.id || selected.includes(bar.id)) && <rect x="0" y={i * 48 + 2} width="358" height="44" rx="4" className={selected.includes(bar.id) ? "fill-secondary" : "fill-muted/60"} />}
        <text x="5" y={i * 48 + 28} className="fill-foreground text-[12px] font-semibold">{selected.includes(bar.id) ? "✓ " : ""}{bar.label}</text>
        <rect x="130" y={i * 48 + 15} width={bar.value / max * 202} height="18" rx="2" className={selected.includes(bar.id) ? "fill-accent" : "fill-primary"} />
        <text x="352" y={i * 48 + 28} textAnchor="end" className="fill-foreground text-[11px] font-bold">{sales && !bar.value ? "—" : bar.value}</text>
      </g>)}
    </svg>
    <div className="absolute inset-x-0 top-0 flex flex-col" style={{ bottom: `${28 / height * 100}%` }}>{bars.map(bar => <Button key={bar.id} variant="ghost" className="min-h-0 flex-1 rounded-none bg-transparent p-0 hover:bg-primary/5 focus-visible:bg-primary/5" aria-label={`Compare ${bar.label}`} aria-pressed={selected.includes(bar.id)} title={`${bar.label}: ${bar.value}${sales ? " reference sales" : "/100"}`} onPointerEnter={() => onFocus(bar.id)} onFocus={() => onFocus(bar.id)} onClick={() => { onFocus(bar.id); onToggle(bar.id); }}><span className="sr-only">{bar.label}: {bar.value}{sales ? " reference sales" : "/100"}</span></Button>)}</div>
  </div>;
}