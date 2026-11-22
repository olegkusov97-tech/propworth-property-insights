import { Link } from "@tanstack/react-router";
import logo from "@/assets/property-finder-logo.svg.asset.json";

export function Brand() {
  return <Link to="/" aria-label="Property Liquidity by Property Finder home" className="inline-flex min-w-0 items-center gap-3">
    <img src={logo.url} alt="Property Finder" width={98} height={40} className="h-9 w-[89px] shrink-0 object-contain" />
    <span className="border-l pl-3 text-sm font-semibold leading-tight text-foreground">Property<br />Liquidity</span>
  </Link>;
}