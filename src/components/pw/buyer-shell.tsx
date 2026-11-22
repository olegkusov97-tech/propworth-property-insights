import { createContext, useContext, useEffect, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStored } from "@/lib/store";
import { propertyWatchlist, toggleSaved, toggleComparison, type ExploreItem, type ExploreKind, type SavedLiquidity } from "@/lib/buyer-liquidity";

interface BuyerState {
  saved: SavedLiquidity[]; loaded: boolean;
  save: (item: ExploreItem, kind: ExploreKind) => void;
  selected: Record<ExploreKind, string[]>; select: (id: string, kind: ExploreKind) => void;
}
const BuyerContext = createContext<BuyerState | null>(null);
export function useBuyer() { const value = useContext(BuyerContext); if (!value) throw new Error("Buyer context missing"); return value; }
export function BuyerShell() {
  const [saved, setSaved, loaded] = useStored<SavedLiquidity[]>("pw-buyer-liquidity-saved", []);
  const [selected, setSelected] = useState<Record<ExploreKind, string[]>>({ properties: [] });
  const properties = propertyWatchlist(saved);
  useEffect(() => { if (loaded && properties.length !== saved.length) setSaved(properties); }, [loaded, properties, saved.length, setSaved]);
  return <BuyerContext.Provider value={{ saved: properties, loaded, save: (item, kind) => setSaved(toggleSaved(properties, item, kind)), selected, select: (id, kind) => setSelected(prev => ({ ...prev, [kind]: toggleComparison(prev[kind], id) })) }}>
    <div className="min-h-screen bg-muted/60"><div className="mx-auto min-h-screen max-w-4xl bg-background pb-10 shadow-card">
      <header className="border-b px-4 py-3"><div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon"><Link to="/" aria-label="Back to homepage"><ArrowLeft /></Link></Button><div><p className="text-[10px] font-semibold text-muted-foreground">Property Liquidity by Property Finder</p><Link to="/buyer" className="font-display text-lg font-bold">Explore before you buy</Link></div></div></header>
      <nav className="sticky top-0 z-20 flex border-b bg-background/95 px-2 py-2 backdrop-blur" aria-label="Buyer navigation">
        {[{ to: "/buyer/properties", label: "Properties", Icon: Building2 }, { to: "/buyer/plan", label: "Saved", Icon: Bookmark }].map(({ to, label, Icon }) => <Button key={to} asChild variant="ghost" className="min-w-0 flex-1"><Link to={to} activeProps={{ className: "bg-secondary text-primary" }}><Icon />{label}{label === "Saved" && loaded && properties.length > 0 ? ` (${properties.length})` : ""}</Link></Button>)}
      </nav><main className="space-y-4 px-4 pt-4"><Outlet /></main>
    </div></div>
  </BuyerContext.Provider>;
}
export function buyerHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Property Liquidity by Property Finder` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Property Liquidity by Property Finder` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}