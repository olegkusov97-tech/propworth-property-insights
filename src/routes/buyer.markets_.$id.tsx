import { createFileRoute } from "@tanstack/react-router";
import { MarketComparisonDetail } from "@/components/pw/market-comparison-detail";
import { buyerHead } from "@/components/pw/buyer-shell";
import { findItem } from "@/lib/buyer-liquidity";
export const Route = createFileRoute("/buyer/markets_/$id")({ head: ({ params }) => { const item = findItem("markets", params.id); return buyerHead(`${item?.name ?? "Market segment"} · ${item?.property.status ?? ""} Liquidity`, "Explore simulated liquidity, demand and competition alongside uploaded DLD transaction activity for this observed market segment."); }, component: MarketDetail });
function MarketDetail() { const { id } = Route.useParams(); const item = findItem("markets", id); return item ? <MarketComparisonDetail items={[item]} /> : <p>This segment is no longer available. Choose an observed segment in Markets.</p>; }