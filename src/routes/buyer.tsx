import { createFileRoute } from "@tanstack/react-router";
import { BuyerShell } from "@/components/pw/buyer-shell";
export const Route = createFileRoute("/buyer")({ component: BuyerShell });
