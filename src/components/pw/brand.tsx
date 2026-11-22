import { Link } from "@tanstack/react-router";

export function Brand() {
  return <Link to="/" aria-label="Property Liquidity by Property Finder home" className="inline-grid max-w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
    <img src="/assets/property-finder-logo.svg" alt="Property Finder" width={98} height={40} className="h-9 w-[89px] shrink-0 object-contain" />
    <span className="min-w-0 border-l pl-3 text-foreground"><span className="block text-sm font-semibold leading-tight">Property Liquidity</span><span className="mt-1 block text-[10px] leading-tight text-muted-foreground">Home Values &amp; Market Insights</span></span>
  </Link>;
}