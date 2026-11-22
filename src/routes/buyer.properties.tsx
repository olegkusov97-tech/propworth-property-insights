import { createFileRoute } from "@tanstack/react-router";
import { BuyerExplorer } from "@/components/pw/buyer-explorer";
import { buyerHead } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer/properties")({ head: () => buyerHead("Explore Properties by Liquidity", "Discover sample Dubai homes and compare their liquidity with similar properties."), component: () => <BuyerExplorer kind="properties" /> });