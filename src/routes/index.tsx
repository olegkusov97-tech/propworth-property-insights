import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/pw/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Understand Property Liquidity — Property Liquidity by Property Finder" },
      { name: "description", content: "See how easily a property could sell." },
      { property: "og:title", content: "Understand Property Liquidity — Property Liquidity by Property Finder" },
      { property: "og:description", content: "See how easily a property could sell." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6"><Brand /></div>
      </header>
      <section className="bg-muted"><div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-6">
        <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">Understand Property Liquidity</h1>
        <p className="mt-1 max-w-xl text-[13px] leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed">See how easily a property could sell.</p>
      </div></section>
      <main className="mx-auto max-w-4xl px-4 pb-4 pt-3 sm:px-6 sm:pt-6">
        <div className="grid items-stretch gap-3 md:grid-cols-2 md:gap-4">
          <Choice to="/owner" audience="FOR HOMEOWNERS" icon={<Home className="h-5 w-5" />} title="My Property Liquidity" text="Track your home's value, liquidity and buyer demand." cta="Check My Property" />
          <Choice to="/buyer" audience="FOR HOMEBUYERS" icon={<KeyRound className="h-5 w-5" />} title="Explore Homes by Liquidity" text="Discover homes and understand their resale potential." cta="Explore Properties" />
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">Prototype · simulated data · estimates are unvalidated</p>
      </main>
    </div>
  );
}

function Choice({ to, audience, icon, title, text, cta }: { to: "/owner" | "/buyer"; audience: string; icon: React.ReactNode; title: string; text: string; cta: string }) {
  return (
    <article className="flex flex-col rounded-lg border bg-card p-3 text-card-foreground sm:p-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2.5"><span className="shrink-0 rounded-lg bg-secondary p-2 text-primary">{icon}</span><div className="min-w-0"><p className="mb-1 text-[9px] font-semibold text-muted-foreground">{audience}</p><h2 className="font-display text-base font-bold leading-tight sm:text-lg">{title}</h2></div></div>
      <p className="mb-2 mt-1 text-[13px] leading-snug text-muted-foreground sm:mb-3 sm:mt-2 sm:text-sm">{text}</p>
      <Button asChild className="mt-auto h-10 w-full justify-between rounded-lg px-3"><Link to={to}>{cta}<ArrowRight /></Link></Button>
    </article>
  );
}

