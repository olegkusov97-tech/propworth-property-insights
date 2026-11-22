import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buyerHead, useBuyer } from "@/components/pw/buyer-shell";
import { ItemLink, SaveItem } from "@/components/pw/buyer-explorer";
import { findItem, itemScore, marketSegments } from "@/lib/buyer-liquidity";
import { propertyInsights } from "@/lib/property";
import { usePlan } from "@/lib/store";
import { aed } from "@/lib/market";
export const Route = createFileRoute("/buyer/plan")({ head: () => buyerHead("Saved Liquidity Watchlist", "Return to your saved properties and market segments and follow their monthly liquidity changes."), component: Saved });
function Saved() {
  const { saved, loaded } = useBuyer();
  const [legacyPlan] = usePlan();
  if (!loaded) return <p className="text-sm text-muted-foreground">Loading your watchlist…</p>;
  return <><div><h1 className="font-display text-2xl font-bold">Saved and tracking</h1><p className="mt-1 text-xs text-muted-foreground">Saved on this device · illustrative November 2026 snapshots.</p></div>{saved.length === 0 ? <div className="space-y-3 border-y py-8 text-center"><Bookmark className="mx-auto size-8 text-primary" /><h2 className="font-semibold">Start your liquidity watchlist</h2><p className="text-xs text-muted-foreground">Save a property or market segment to return to its trends.</p><div className="flex flex-wrap justify-center gap-2"><Button asChild variant="outline"><Link to="/buyer/markets">Explore Markets</Link></Button><Button asChild variant="outline"><Link to="/buyer/properties">Explore Properties</Link></Button></div></div> : <div className="grid gap-3 md:grid-cols-2">{saved.map(record => {
    const item = findItem(record.kind, record.id); if (!item) return null;
    const r = propertyInsights(item.property), score = itemScore(item, record.kind), prev = r.snapshots.at(-2);
    const monthDelta = score - (record.kind === "markets" ? prev?.market ?? score : prev?.property ?? score), sinceSave = score - record.score;
    return <article key={`${record.kind}-${record.id}`} className="space-y-3 rounded-2xl border bg-card p-4 shadow-card"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] text-muted-foreground">{record.kind === "markets" ? "Market segment" : "Property"}</p><ItemLink item={item} kind={record.kind} className="text-sm font-semibold text-primary underline">{item.name}</ItemLink></div><SaveItem item={item} kind={record.kind} /></div><p className="font-display text-2xl font-bold">{score}/100</p><p className="text-xs"><span className={monthDelta >= 0 ? "text-success" : "text-destructive"}>{monthDelta > 0 ? "+" : ""}{monthDelta} pts this month</span><span className="ml-2 text-muted-foreground">{sinceSave > 0 ? "+" : ""}{sinceSave} pts since saved</span></p><p className="text-[10px] text-muted-foreground">Saved {new Date(record.savedAt).toLocaleDateString("en-GB", { timeZone: "UTC" })} · Nov 2026 data</p><ItemLink item={item} kind={record.kind} className="text-xs font-semibold text-primary underline">View trends</ItemLink></article>;
  })}</div>}{legacyPlan && <details className="border-t pt-3"><summary className="cursor-pointer text-xs font-semibold">Previous purchase plan</summary><p className="mt-2 text-xs text-muted-foreground">Your previously saved budget: {aed(legacyPlan.budget)}. The original plan is retained.</p><div className="mt-2 flex flex-col gap-2">{legacyPlan.shortlist.map(id => { const item = marketSegments.find(s => s.property.communityId === id); return item ? <ItemLink key={id} item={item} kind="markets" className="text-xs text-primary underline">{item.name}</ItemLink> : null; })}</div></details>}<p className="text-[10px] text-muted-foreground">Prototype data is fixed, not a live feed. No alerts are sent. Monthly changes use the latest two simulated records.</p></>;
}
