import { createFileRoute, Link } from "@tanstack/react-router";
import { Home, KeyRound, ArrowRight, Activity, Search, House, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PropWorth — Know the value. Understand the demand." },
      { name: "description", content: "Property value tells you what a home is worth. PropWorth by Property Finder helps you understand buyer demand and how easily it could sell." },
      { property: "og:title", content: "PropWorth by Property Finder" },
      { property: "og:description", content: "Explore buyer demand, competing properties and recent sales. Check your property's liquidity or explore a home's resale potential." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-6">
          <div className="flex items-center gap-2"><Activity className="h-5 w-5" /><span className="font-display text-2xl font-bold">PropWorth</span><span className="ml-2 border-l border-primary-foreground/30 pl-3 text-xs opacity-90">by Property Finder</span></div>
          <div className="mt-7 max-w-3xl sm:mt-9">
            <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Know the value.<br className="sm:hidden" /> Understand the demand.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">Property value tells you what a home is worth. Liquidity tells you how easily it could sell.</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-85">Explore buyer demand, competing properties and recent sales to make more informed property decisions.</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-6 pt-6 sm:px-8">
        <div className="grid items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <Choice to="/owner" icon={<Home className="h-6 w-6" />} title="I Own a Property" proposition="Your home has a value. But how easily could you sell it?" text="Discover how many buyers are looking for homes like yours, understand your property's liquidity and track how demand changes over time." cta="Check My Property" />
          <Choice to="/buyer" icon={<KeyRound className="h-6 w-6" />} title="I'm Looking to Buy" proposition="Don't just find a home you love. Understand its resale potential." text="Discover which properties are in demand, compare liquidity across different homes and make a more informed purchase decision." cta="Explore Properties" />
        </div>
        <section className="mt-7 border-t pt-5" aria-labelledby="why-liquidity">
          <h2 id="why-liquidity" className="font-display text-xl font-bold">Why does liquidity matter?</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3 md:gap-6">
            <Benefit icon={<Search className="h-5 w-5" />} text="Understand buyer demand before making a property decision." />
            <Benefit icon={<House className="h-5 w-5" />} text="Compare how easily different properties could sell." />
            <Benefit icon={<TrendingUp className="h-5 w-5" />} text="Track changes in demand and competition over time." />
          </div>
        </section>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">Prototype · simulated data · estimates are unvalidated</p>
      </main>
    </div>
  );
}

function Choice({ to, icon, title, proposition, text, cta }: { to: "/owner" | "/buyer"; icon: React.ReactNode; title: string; proposition: string; text: string; cta: string }) {
  return (
    <article className="flex flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-card sm:p-6">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-secondary p-3 text-primary">{icon}</span><h2 className="font-display text-xl font-bold">{title}</h2></div>
      <p className="mt-4 text-base font-semibold leading-relaxed">{proposition}</p>
      <p className="mb-5 mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
      <Button asChild className="mt-auto h-11 w-full justify-between rounded-xl px-4"><Link to={to}>{cta}<ArrowRight /></Link></Button>
    </article>
  );
}

function Benefit({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-start gap-3"><span className="mt-0.5 text-primary">{icon}</span><p className="text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}
