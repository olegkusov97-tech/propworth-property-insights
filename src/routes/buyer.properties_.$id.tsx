import { createFileRoute } from "@tanstack/react-router";
import { BuyerDetail } from "@/components/pw/buyer-detail";
import { buyerHead } from "@/components/pw/buyer-shell";
import { findItem } from "@/lib/buyer-liquidity";
export const Route = createFileRoute("/buyer/properties_/$id")({ head: ({ params }) => buyerHead(`${findItem("properties", params.id)?.name ?? "Property"} Liquidity Details`, "Compare this sample home's liquidity with similar homes and explore monthly buyer activity."), component: PropertyDetail });
function PropertyDetail() { const { id } = Route.useParams(); return <BuyerDetail kind="properties" id={id} />; }