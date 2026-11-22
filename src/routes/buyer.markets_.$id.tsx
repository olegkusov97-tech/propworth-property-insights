import { createFileRoute } from "@tanstack/react-router";
import { BuyerDetail } from "@/components/pw/buyer-detail";
import { buyerHead } from "@/components/pw/buyer-shell";
import { findItem } from "@/lib/buyer-liquidity";
export const Route = createFileRoute("/buyer/markets_/$id")({ head: ({ params }) => { const item = findItem("markets", params.id); return buyerHead(`${item?.name ?? "Market segment"} · ${item?.property.status ?? ""} · ${item?.priceBand?.label ?? ""} Liquidity`, "Compare simulated buyer interest, competition and trends for this area, property type, bedroom count and price band."); }, component: MarketDetail });
function MarketDetail() { const { id } = Route.useParams(); return <BuyerDetail kind="markets" id={id} />; }