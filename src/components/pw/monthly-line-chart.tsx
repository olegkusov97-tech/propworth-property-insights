import { Button } from "@/components/ui/button";

export interface ChartSeries { key: string; label: string; values: number[]; secondary?: boolean }
export function MonthlyLineChart({ months, series, selected, onSelect, score = false }: {
  months: string[]; series: ChartSeries[]; selected: number; onSelect: (index: number) => void; score?: boolean;
}) {
  const max = score ? 100 : Math.max(1, ...series.flatMap(s => s.values)) * 1.15;
  const x = (i: number) => 38 + i / Math.max(1, months.length - 1) * 310;
  const y = (v: number) => 164 - v / max * 148;
  return <div className="relative h-56 w-full" aria-label="Monthly trend chart">
    <svg viewBox="0 0 370 210" className="h-full w-full" aria-hidden="true">
      {[0, .25, .5, .75, 1].map(t => <g key={t}><line x1="38" x2="348" y1={y(t * max)} y2={y(t * max)} className="stroke-border" strokeDasharray="3 4" /><text x="30" y={y(t * max) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{Math.round(t * max).toLocaleString()}</text></g>)}
      <line x1={x(selected)} x2={x(selected)} y1="12" y2="164" className="stroke-muted-foreground" strokeDasharray="3 4" />
      {series.map(s => <g key={s.key}><polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} className={s.secondary ? "fill-none stroke-accent" : "fill-none stroke-primary"} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />{s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === selected ? 4.5 : 2.5} className={s.secondary ? "fill-accent stroke-card" : "fill-primary stroke-card"} strokeWidth="1.5" />)}</g>)}
      {months.map((month, i) => i % (months.length > 6 ? 2 : 1) === 0 || i === months.length - 1 ? <text key={month} x={x(i)} y="185" textAnchor="middle" className="fill-muted-foreground text-[10px]">{month.slice(0, 3)}</text> : null)}
    </svg>
    <div className="absolute inset-y-0 left-[10%] right-[5%] flex">
      {months.map((month, i) => <Button key={month} variant="ghost" aria-label={`Select ${month}`} aria-pressed={i === selected} title={`${month}: ${series.map(s => `${s.label} ${s.values[i]?.toLocaleString() ?? "—"}`).join(" · ")}`} className="h-full min-w-0 flex-1 rounded-none p-0 opacity-0 hover:bg-transparent focus-visible:opacity-100 focus-visible:bg-transparent" onPointerEnter={() => onSelect(i)} onClick={() => onSelect(i)} />)}
    </div>
  </div>;
}