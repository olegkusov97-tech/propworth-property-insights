import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PropertyDetails } from "@/lib/property";
import { matchingReferenceSales } from "@/lib/transaction-reference";

export function TransactionReferences({ property }: { property: PropertyDetails }) {
  const sales = matchingReferenceSales(property);
  const [expanded, setExpanded] = useState(false);
  return <details className="rounded-2xl border bg-card p-4 shadow-card"><summary className="cursor-pointer text-sm font-semibold">Comparable Sales · uploaded reference</summary><div className="mt-3 space-y-3 text-xs text-muted-foreground">
    <p>{sales.length} matching sale records · 25 Aug–22 Nov 2026.</p>
    <p>User-provided transactions-2026-11-22.csv. Not independently verified. Same area, recorded property subtype, bedrooms and ready/off-plan status; size within ±25%.</p>
    {sales.length === 0 && <p>No matching sale records in this reference. No fictional transactions have been substituted. Townhouses are not inferred from records labelled Villa.</p>}
    <div className="divide-y">{sales.slice(0, expanded ? 30 : 6).map(s => <article key={s.id} className="space-y-1 py-3" data-testid="reference-sale"><h3 className="font-semibold text-foreground">{s.project}</h3><p>{s.bedrooms === 0 ? "Studio" : `${s.bedrooms} bedrooms`} · {s.subtype} · {s.status}</p><p>{s.areaSqm.toLocaleString()} m² · {Math.round(s.sizeSqft).toLocaleString()} sq ft</p><p>{s.date} · Transaction {s.id}</p><div className="flex flex-wrap justify-between gap-2"><b className="text-foreground">AED {s.price.toLocaleString("en-GB")}</b><span>AED {s.pricePerSqft.toLocaleString()}/sq ft</span></div></article>)}</div>
    {sales.length > 6 && <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>{expanded ? "Show fewer" : `Show more (${Math.min(30, sales.length)})`}</Button>}
    <p className="text-[10px]">Area uses PROCEDURE_AREA, interpreted as m² (1 m² = 10.7639 sq ft); the file does not declare units. References are separate from simulated sales counts, valuation and liquidity. Sale registrations do not establish time to sell.</p>
  </div></details>;
}