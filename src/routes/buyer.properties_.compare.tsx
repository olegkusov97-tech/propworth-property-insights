import { createFileRoute } from "@tanstack/react-router";
import { BuyerMarketComparison } from "@/components/pw/buyer-market-comparison";
import { buyerHead } from "@/components/pw/buyer-shell";

export const Route = createFileRoute("/buyer/properties_/compare")({
  head: () => buyerHead("Compare Property Liquidity", "Compare simulated liquidity and buyer demand for matching Ready property segments in Dubai, then explore matching historical listings."),
  component: BuyerMarketComparison,
});