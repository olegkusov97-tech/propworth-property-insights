import { createFileRoute } from "@tanstack/react-router";
import { BuyerExplorer } from "@/components/pw/buyer-explorer";
import { buyerHead } from "@/components/pw/buyer-shell";
import { parseBuyerFilters } from "@/lib/buyer-liquidity";
export const Route = createFileRoute("/buyer/properties")({ validateSearch: parseBuyerFilters, head: () => buyerHead("Historical Property Search", "Search the uploaded Bayut property listings using original asking prices and clearly simulated liquidity."), component: Properties });
function Properties() { const filters = Route.useSearch(); return <BuyerExplorer key={JSON.stringify(filters)} kind="properties" initialFilters={filters} />; }