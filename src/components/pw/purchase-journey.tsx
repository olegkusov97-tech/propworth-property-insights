import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Home, CalendarDays, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStored } from "@/lib/store";
import { contactErrors, offerError } from "@/lib/demo-decisions";
import { propertyErrors } from "@/lib/property";
import { itemPrice, itemScore, type ExploreItem } from "@/lib/buyer-liquidity";
import type { PropertyFlow } from "./property-onboarding";
import { DemoContactFields, demoFieldClass, emptyContact } from "./demo-contact";

export function PurchaseJourney({ item }: { item: ExploreItem }) {
  const [stage, setStage] = useState<"idle" | "choose" | "form" | "confirmed" | "purchased">("idle");
  const [action, setAction] = useState<"viewing" | "offer">("viewing");
  const [contact, setContact] = useState(emptyContact), [offer, setOffer] = useState(String(itemPrice(item) || ""));
  const [size, setSize] = useState(""), [errors, setErrors] = useState<string[]>([]);
  const [, setDraft, loaded] = useStored<PropertyFlow | null>("pw-owner-draft", null);
  const navigate = useNavigate();
  const choose = (next: "viewing" | "offer") => { setAction(next); setErrors([]); setStage("form"); };
  return <section className="space-y-3 border-y py-4" aria-label="Demo purchase journey">
    {stage === "idle" ? <Button disabled={!loaded} className="w-full sm:w-auto" onClick={() => setStage("choose")}>Start Buying<ArrowRight /></Button> : <>
      <h2 className="font-display text-xl font-bold">{stage === "confirmed" ? "Demo request confirmed" : stage === "purchased" ? "Become a homeowner · demo" : "Start Buying · demo"}</h2>
      <p className="text-xs">{itemPrice(item) > 0 ? `Historical asking price AED ${itemPrice(item).toLocaleString("en-GB")}` : "Historical asking price not supplied"} · Simulated liquidity {itemScore(item, "properties")}/100</p>
      {stage === "choose" && <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => choose("viewing")}><CalendarDays />Request a Viewing</Button><Button variant="outline" onClick={() => choose("offer")}><Handshake />Make an Offer</Button></div>}
      {stage === "form" && <form className="space-y-3" onSubmit={e => { e.preventDefault(); const next = [...contactErrors(contact), ...(action === "offer" && offerError(Number(offer)) ? [offerError(Number(offer))] : [])]; setErrors(next); if (!next.length) setStage("confirmed"); }}>
        <h3 className="text-sm font-semibold">{action === "offer" ? "Make an Offer" : "Request a Viewing"}</h3>
        <DemoContactFields value={contact} onChange={setContact} />
        {action === "offer" && <label className="block text-xs font-semibold">Proposed price (AED)<input required aria-label="Proposed price (AED)" type="number" min="1" step="1" className={demoFieldClass} value={offer} onChange={e => setOffer(e.target.value)} /></label>}
        <Button type="submit"><Check />Confirm demo {action === "offer" ? "offer" : "viewing request"}</Button><Button type="button" variant="ghost" onClick={() => setStage("choose")}>Back</Button>
      </form>}
      {stage === "confirmed" && <div className="space-y-3" role="status"><p className="text-sm">{action === "offer" ? `Your demo offer of AED ${Number(offer).toLocaleString("en-GB")} is recorded for this session.` : "Your demo viewing request is recorded for this session."} No agent has been contacted.</p><ol className="space-y-2 text-xs text-muted-foreground">{["Agent discussion and negotiation", "Sale agreement", "Developer NOC where required", "Ownership transfer with the relevant authority"].map((step, i) => <li key={step}><b className="mr-2 text-primary">{i + 1}.</b>{step}</li>)}</ol><Button onClick={() => setStage("purchased")}><Home />Mark as Purchased · demo</Button></div>}
      {stage === "purchased" && <form className="space-y-3" onSubmit={e => { e.preventDefault(); const property = { ...item.property, sizeSqft: Number(size) }; const next = propertyErrors(property); setErrors(next); if (!next.length && loaded) { setDraft({ stage: "review", source: "Demo purchase · historical Bayut listing", property, query: "" }); navigate({ to: "/owner" }); } }}>
        <p className="text-xs text-muted-foreground">The file does not include unit size. Enter the actual size to continue. This opens a review; your existing home stays unchanged until you confirm. Any unfinished owner setup will be replaced.</p>
        {item.property.genericBenchmark && <p className="text-xs text-muted-foreground">This area or property type is outside the modeled catalog. The original address and type will be retained; analytics use a generic demo benchmark, not local market evidence.</p>}
        <label className="block text-xs font-semibold">Actual unit size (sq ft)<input required aria-label="Actual unit size (sq ft)" type="number" min="200" max="30000" className={demoFieldClass} value={size} onChange={e => setSize(e.target.value)} /></label>
        <Button disabled={!loaded} type="submit">Review as homeowner<ArrowRight /></Button>
      </form>}
      {stage !== "confirmed" && stage !== "purchased" && <Button variant="ghost" size="sm" onClick={() => { setStage("idle"); setErrors([]); }}>Cancel buying demo</Button>}
    </>}
    {errors.length > 0 && <p role="alert" className="text-xs text-destructive">{errors.join(" ")}</p>}
    <p className="text-[10px] text-muted-foreground">Simulation only. No real enquiries, offers, payments or transactions are submitted. These historical listings are not confirmed available; contact details are not sent or saved.</p>
  </section>;
}