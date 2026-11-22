import { createFileRoute } from "@tanstack/react-router";
import { BuyerDetail } from "@/components/pw/buyer-detail";
import { buyerHead } from "@/components/pw/buyer-shell";
import { findItem } from "@/lib/buyer-liquidity";
export const Route = createFileRoute("/buyer/markets_/$id")({ head: ({ params }) => buyerHead(`${findItem("markets", params.id)?.name ?? "Market segment"} Liquidity`, "Review buyer interest, competition and historical liquidity for a comparable market segment."), component: MarketDetail });
function MarketDetail() { const { id } = Route.useParams(); return <BuyerDetail kind="markets" id={id} />; }