import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Screen } from "@/components/pw/ui";
import { SellingJourney } from "@/components/pw/selling-journey";
import { useOwned } from "@/lib/store";
import { normalizeProperty } from "@/lib/property";
import { buyerHead } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/owner_/sell")({ head: () => buyerHead("Sell My Property · Demo", "Prepare a property listing draft or explore sample local agents without publishing or sending real requests."), component: Sell });
function Sell() {
  const [owned, , loaded] = useOwned();
  return <Screen title="Selling · demo" back="/owner" tone="Homeowner">{!loaded ? <p className="text-sm">Loading your property…</p> : owned ? <SellingJourney property={normalizeProperty(owned)} /> : <><p className="text-sm">Add your property before starting a selling demo.</p><Button asChild><Link to="/owner">Add property</Link></Button></>}</Screen>;
}