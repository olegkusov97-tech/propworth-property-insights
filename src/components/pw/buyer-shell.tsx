import { createContext, useContext, useEffect } from "react";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bookmark, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStored } from "@/lib/store";
import { propertyWatchlist, toggleSaved, type ExploreItem, type ExploreKind, type SavedLiquidity } from "@/lib/buyer-liquidity";
import { StickyNavigation } from "./sticky-navigation";
import { buyerBackTarget } from "@/lib/navigation";

interface BuyerState {
  saved: SavedLiquidity[]; loaded: boolean;
  save: (item: ExploreItem, kind: ExploreKind) => void;
}
const BuyerContext = createContext<BuyerState | null>(null);
export function useBuyer() { const value = useContext(BuyerContext); if (!value) throw new Error("Buyer context missing"); return value; }
export function BuyerShell() {
  const back = buyerBackTarget(useLocation().pathname);
  const [saved, setSaved, loaded] = useStored<SavedLiquidity[]>("pw-buyer-liquidity-saved", []);
  const properties = propertyWatchlist(saved);
  useEffect(() => { if (loaded && properties.length !== saved.length) setSaved(properties); }, [loaded, properties, saved.length, setSaved]);
  return <BuyerContext.Provider value={{ saved: properties, loaded, save: (item, kind) => setSaved(toggleSaved(properties, item, kind)) }}>
    <div className="min-h-screen bg-muted"><div className="mx-auto min-h-screen max-w-4xl bg-background pb-10">
      <StickyNavigation back={back} navigation={<nav className="flex border-t bg-background px-2 py-1" aria-label="Buyer navigation">
        {[{ to: "/buyer/properties", label: "Properties", Icon: Building2 }, { to: "/buyer/plan", label: "Saved", Icon: Bookmark }].map(({ to, label, Icon }) => <Button key={to} asChild variant="ghost" className="min-w-0 flex-1 rounded-none border-b-2 border-transparent"><Link to={to} activeProps={{ className: "border-primary bg-secondary text-primary" }}><Icon />{label}{label === "Saved" && loaded && properties.length > 0 ? ` (${properties.length})` : ""}</Link></Button>)}
      </nav>}><main className="space-y-4 px-4 pt-4"><Outlet /></main></StickyNavigation>
    </div></div>
  </BuyerContext.Provider>;
}
export function buyerHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Property Liquidity by Property Finder` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Property Liquidity by Property Finder` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}