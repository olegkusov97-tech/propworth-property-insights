import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, KeyRound, ArrowRight, Activity } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PropWorth — Own or buy with liquidity insight" },
      { name: "description", content: "Choose your journey: track how liquid your UAE home is, or plan your first purchase." },
      { property: "og:title", content: "PropWorth by Property Finder" },
      { property: "og:description", content: "Property Liquidity Intelligence for UAE homeowners and first-time buyers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-muted/60">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-hero px-6 pb-8 pt-14 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm font-semibold opacity-90"><Activity className="h-4 w-4" /> PropWorth · by Property Finder</div>
        <h1 className="mt-10 font-display text-4xl font-bold leading-[1.05]">How easily does property really sell?</h1>
        <p className="mt-4 text-base opacity-85">Property Liquidity Intelligence built from buyer searches, saves, enquiries, supply and transactions across the UAE.</p>
        <div className="mt-auto space-y-3 pt-10">
          <Choice to="/owner" icon={<Home className="h-6 w-6" />} title="I Own a Property" text="See your value, demand and Liquidity Score." />
          <Choice to="/buyer" icon={<KeyRound className="h-6 w-6" />} title="I'm Looking to Buy" text="Know your budget and buy where demand is strong." />
          <p className="pt-2 text-center text-[11px] opacity-70">Prototype · simulated data · estimates are unvalidated</p>
        </div>
      </div>
    </div>
  );
}

function Choice({ to, icon, title, text }: { to: "/owner" | "/buyer"; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link to={to} className="flex items-center gap-4 rounded-2xl bg-card p-4 text-card-foreground shadow-card transition active:scale-[0.98]">
      <span className="rounded-xl bg-secondary p-3 text-primary">{icon}</span>
      <span className="flex-1"><span className="block font-display text-lg font-bold">{title}</span><span className="text-sm text-muted-foreground">{text}</span></span>
      <ArrowRight className="h-5 w-5 text-primary" />
    </Link>
  );
}
