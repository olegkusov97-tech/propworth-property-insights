import { createFileRoute } from "@tanstack/react-router";
import { BuyerExplorer } from "@/components/pw/buyer-explorer";
import { buyerHead } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer/markets")({ head: () => buyerHead("Explore Market Liquidity", "Explore comparable Dubai property segments by demand, competition, sales and liquidity."), component: () => <BuyerExplorer kind="markets" /> });