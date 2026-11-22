import { createFileRoute } from "@tanstack/react-router";
import { MarketComparison } from "@/components/pw/market-comparison";
import { buyerHead } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer/markets")({ head: () => buyerHead("Compare Dubai Market Liquidity", "Compare Dubai areas and bedroom configurations using simulated liquidity and real uploaded DLD sale references."), component: MarketComparison });