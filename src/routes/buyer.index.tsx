import { createFileRoute, redirect } from "@tanstack/react-router";
import { buyerHead } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer/")({
  head: () => buyerHead("Find Your Next Property", "Find historical properties, compare their liquidity and start a simulated buying journey."),
  beforeLoad: () => { throw redirect({ to: "/buyer/properties" }); },
});
