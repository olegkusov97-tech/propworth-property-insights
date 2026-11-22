import { Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Brand } from "./brand";

export function Screen({ title, back, children, tone }: { title: string; back?: "/" | "/buyer" | "/owner"; children: ReactNode; tone?: string }) {
  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto min-h-screen max-w-2xl bg-background pb-10">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-background px-4 py-3 sm:px-6">
          <Brand />
          {back && <Button asChild variant="ghost" size="icon"><Link to={back} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link></Button>}
        </header>
        <main className="space-y-4 px-4 pt-5 sm:px-6"><div className="space-y-1"><p className="text-[11px] font-semibold text-muted-foreground">{tone ?? "Property Liquidity"}</p><h1 className="font-display text-xl font-bold leading-snug">{title}</h1></div>{children}</main>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border bg-card p-4 shadow-card ${className}`}>{children}</section>;
}

export function Gauge({ value, label, labelClassName = "uppercase" }: { value: number; label: string; labelClassName?: string }) {
  const c = 2 * Math.PI * 42;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" className="fill-none stroke-muted" strokeWidth="10" />
        <circle cx="50" cy="50" r="42" className="fill-none stroke-primary" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold">{value}</span>
        <span className={`text-[10px] font-semibold text-muted-foreground ${labelClassName}`}>{label}</span>
      </div>
    </div>
  );
}

export function Spark({ data, className = "stroke-primary" }: { data: number[]; className?: string }) {
  const min = Math.min(...data), max = Math.max(...data), r = max - min || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${30 - ((d - min) / r) * 26 - 2}`).join(" ");
  return <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-10 w-full"><polyline points={pts} className={`fill-none ${className}`} strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>;
}

export function Meter({ value, className = "bg-primary" }: { value: number; className?: string }) {
  return <div className="h-2 w-full rounded-full bg-muted"><div className={`h-2 rounded-full ${className}`} style={{ width: `${value}%` }} /></div>;
}

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="flex gap-2 rounded-xl bg-secondary px-3 py-2 text-[11px] leading-snug text-secondary-foreground">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{children ?? "Unvalidated estimate based on simulated data. Not a valuation or guarantee of sale."}</span>
    </p>
  );
}

export function Trend({ now, prev, invert }: { now: number; prev: number; invert?: boolean }) {
  const d = ((now - prev) / prev) * 100;
  const good = invert ? d < 0 : d > 0;
  return <span className={`text-xs font-semibold ${good ? "text-success" : "text-destructive"}`}>{d > 0 ? "▲" : "▼"} {Math.abs(d).toFixed(1)}%</span>;
}
