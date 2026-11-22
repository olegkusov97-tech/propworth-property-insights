import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { PropertyDetails } from "@/lib/property";
import { listingReferencePeriod, listingSourceUrl, matchingListingReferences } from "@/lib/listing-reference";

export function ListingReferences({ property }: { property: PropertyDetails }) {
  const [shown, setShown] = useState(6);
  const rows = matchingListingReferences(property);
  return <details className="rounded-2xl border bg-card p-4 shadow-card">
    <summary className="cursor-pointer text-sm font-semibold">Property Listings · uploaded reference</summary>
    <div className="mt-3 space-y-3 text-xs text-muted-foreground">
      <p>Historical asking prices · {listingReferencePeriod}. Current availability is unknown.</p>
      <p>{rows.length.toLocaleString()} matching advertised records · same city, area, property type, bedrooms and ready/off-plan status.</p>
      <p>Unit size and photos are not supplied. The building-area field is not treated as unit size, so these are not size-matched comparables.</p>
      {rows.length === 0 && <p>No matching listings in this reference. No sample listings have been substituted.</p>}
      <div className="divide-y">{rows.slice(0, shown).map((row, i) => <article key={`${row.address}-${row.date}-${i}`} className="space-y-1 py-3" data-testid="reference-listing">
        <h3 className="font-semibold text-foreground">{row.address}</h3>
        <p>{row.bedrooms === 0 ? "Studio" : `${row.bedrooms} bedrooms`} · {row.bathrooms} bathrooms · {row.type}</p>
        <p>{row.status} · {row.furnishing} · Unit size unavailable</p>
        <p>Posted {row.date}</p>
        <p className="font-semibold text-foreground">Asking price · AED {row.price.toLocaleString("en-GB")}</p>
      </article>)}</div>
      {rows.length > 6 && <div className="flex flex-wrap gap-2">{shown < rows.length && <Button variant="outline" size="sm" onClick={() => setShown(n => Math.min(n + 12, rows.length))}>Show more</Button>}{shown > 6 && <Button variant="ghost" size="sm" onClick={() => setShown(6)}>Show fewer</Button>}</div>}
      <p className="text-[10px]">User-provided bayut_selling_properties.csv · not independently verified. Exact repeated records removed; different adverts may describe the same unit. Asking prices are not completed sale prices and do not affect simulated values, liquidity or active-listing counts.</p>
      <Button asChild variant="link" size="sm" className="h-auto p-0"><a href={listingSourceUrl} target="_blank" rel="noopener noreferrer">Download original listing reference</a></Button>
    </div>
  </details>;
}