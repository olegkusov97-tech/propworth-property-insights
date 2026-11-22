import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BuyerShell } from "@/components/pw/buyer-shell";
import { useSuspenseQuery } from "@tanstack/react-query";
import { historicalCatalogQuery } from "@/lib/historical-listings";
import { initializeBuyerCatalog } from "@/lib/buyer-liquidity";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/buyer")({
  ssr: false,
  loader: async ({ context }) => { initializeBuyerCatalog(await context.queryClient.ensureQueryData(historicalCatalogQuery)); },
  pendingComponent: () => <p className="p-4 text-sm">Loading historical property listings…</p>,
  errorComponent: CatalogError,
  notFoundComponent: () => <p className="p-4 text-sm">Property page unavailable.</p>,
  component: LoadedBuyer,
});
function LoadedBuyer() { const { data } = useSuspenseQuery(historicalCatalogQuery); initializeBuyerCatalog(data); return <BuyerShell />; }
function CatalogError() { const router = useRouter(); return <div className="space-y-3 p-4"><p>The historical listings could not be loaded.</p><Button onClick={() => router.invalidate()}>Try again</Button><Button asChild variant="outline"><Link to="/">Back to homepage</Link></Button></div>; }
