import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Map, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buyerHead, useBuyer } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer/")({ head: () => buyerHead("Explore Before You Buy", "Explore property and market liquidity to understand buyer demand and competition before buying."), component: Buyer });
function Buyer() {
  const { saved } = useBuyer();
  return <>
    <div className="py-2"><p className="text-xs font-semibold text-primary">Your next home, a clearer picture</p><h1 className="mt-2 font-display text-2xl font-bold">Look beyond the price.</h1><p className="mt-2 max-w-xl text-sm text-muted-foreground">Understand buyer demand, competing homes and how easily a property could sell.</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      <article className="flex flex-col items-start rounded-2xl border bg-card p-5 shadow-card"><Map className="mb-3 size-7 text-primary" /><h2 className="font-display text-xl font-bold">Explore Market Liquidity</h2><p className="mt-2 flex-1 text-sm text-muted-foreground">Compare areas and property types. See where buyer interest is stronger and competition is lower.</p><Button asChild className="mt-4"><Link to="/buyer/markets">Explore Markets <ArrowRight /></Link></Button></article>
      <article className="flex flex-col items-start rounded-2xl border bg-card p-5 shadow-card"><Building2 className="mb-3 size-7 text-accent" /><h2 className="font-display text-xl font-bold">Explore Properties</h2><p className="mt-2 flex-1 text-sm text-muted-foreground">Compare individual homes by liquidity and understand how they stand against similar properties.</p><Button asChild className="mt-4"><Link to="/buyer/properties">Explore Properties <ArrowRight /></Link></Button></article>
    </div>
    <Button asChild variant="outline" className="w-full"><Link to="/buyer/plan"><Bookmark />Saved properties and markets{saved.length ? ` (${saved.length})` : ""}</Link></Button>
    <p className="text-[11px] text-muted-foreground">Illustrative Dubai data · not a resale prediction or guarantee.</p>
  </>;
}
