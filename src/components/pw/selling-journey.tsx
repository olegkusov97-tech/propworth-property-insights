import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ImagePlus, Trash2, Users, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyInsights, propertyErrors, type PropertyDetails } from "@/lib/property";
import { getCommunity } from "@/lib/market";
import { useStored } from "@/lib/store";
import { contactErrors, listingDisposition, offerError } from "@/lib/demo-decisions";
import { DemoContactFields, demoFieldClass, emptyContact } from "./demo-contact";
import { PropertyForm } from "./property-onboarding";
import { useStepBack } from "./sticky-navigation";

interface ListingDraft { property: PropertyDetails; asking: string; description: string; agentId: string }
const dispositionLabel = (agentId: string) => listingDisposition(agentId).requiresAgent ? "Draft · agent required" : "Agent selected · awaiting authorization";
export function SellingJourney({ property }: { property: PropertyDetails }) {
  const r = propertyInsights(property), area = property.sourceArea ?? getCommunity(property.communityId).name;
  const key = `pw-selling-draft-v1:${property.communityId}:${property.sourceAddress ?? property.building}:${property.bedrooms}`;
  const [draft, setDraft, loaded] = useStored<ListingDraft>(key, { property, asking: String(r.value), description: "", agentId: "" });
  const [method, setMethod] = useState<"choose" | "agent" | "listing">("choose");
  const [confirmed, setConfirmed] = useState(false), [contact, setContact] = useState(emptyContact), [error, setError] = useState("");
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  useStepBack(confirmed || method !== "choose" ? () => {
    if (confirmed) setConfirmed(false);
    else setMethod("choose");
  } : null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  const update = (next: Partial<ListingDraft>) => { setDraft({ ...draft, ...next }); setConfirmed(false); };
  const agents = [
    { id: "agent-1", name: "Aisha Khan", detail: `${area} · ${property.sourceType ?? property.propertyType} specialist` },
    { id: "agent-2", name: "Daniel Reed", detail: `${area} · residential sales` },
    { id: "agent-3", name: "Sara Nasser", detail: `${area} · owner representation` },
  ];
  const agent = agents.find(a => a.id === draft.agentId);
  const shortlist = <fieldset className="space-y-2"><legend className="mb-2 text-sm font-semibold">Sample local agents</legend><p className="text-[10px] text-muted-foreground">Fictional people for this demo, not verified or recommended agents.</p>{agents.map(a => <label key={a.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${draft.agentId === a.id ? "bg-secondary" : "bg-card"}`}><input type="radio" name="agent" aria-label={a.name} checked={draft.agentId === a.id} onChange={() => update({ agentId: a.id })} /><span className="min-w-0"><b className="block text-sm">{a.name}</b><span className="text-xs text-muted-foreground">{a.detail}</span></span></label>)}</fieldset>;
  if (!loaded) return <p className="text-sm text-muted-foreground">Loading your selling draft…</p>;
  return <div className="space-y-4">
    <div><h1 className="font-display text-2xl font-bold">Sell My Property</h1><p className="mt-1 text-xs text-muted-foreground">{property.sourceAddress ?? property.building ?? area}</p></div>
    <div className="grid grid-cols-2 gap-3 border-y py-3 text-xs"><div><span className="text-muted-foreground">Estimated value · simulated</span><b className="mt-1 block text-base">AED {r.value.toLocaleString("en-GB")}</b></div><div><span className="text-muted-foreground">Property Liquidity · simulated</span><b className="mt-1 block text-base">{r.property.liquidity}/100</b></div></div>
    <p className="text-[10px] text-muted-foreground">Demo only. No agent is contacted, no photos are uploaded and no listing is published.</p>
    {confirmed ? <section className="space-y-3 border-y py-4" role="status"><Check className="size-7 text-primary" /><h2 className="font-display text-xl font-bold">{method === "agent" ? "Demo contact request completed" : "Listing draft saved"}</h2><p className="text-sm">{method === "agent" ? `You selected ${agent?.name ?? "a sample agent"}. No contact request was sent.` : `${dispositionLabel(draft.agentId)}. Your asking price and description are saved on this device, not published.`}</p><p className="text-xs text-muted-foreground">An agent handles the required authorization and publishes the listing on Property Finder. Selecting a sample agent here does not authorize or publish anything.</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => { setConfirmed(false); setMethod("listing"); }}>{draft.agentId ? "Review listing draft" : "Select an agent"}</Button><Button asChild><Link to="/owner">Back to dashboard</Link></Button></div></section> : <>
      <div className="flex flex-wrap gap-2"><Button variant={method === "agent" ? "default" : "outline"} onClick={() => { setMethod("agent"); setError(""); }}><Users />Find an Agent</Button><Button variant={method === "listing" ? "default" : "outline"} onClick={() => { setMethod("listing"); setError(""); }}><FilePenLine />Prepare My Listing</Button></div>
      {method === "agent" && <form className="space-y-4" onSubmit={e => { e.preventDefault(); const errors = contactErrors(contact); if (!draft.agentId) errors.push("Select a sample agent."); setError(errors.join(" ")); if (!errors.length) setConfirmed(true); }}>{shortlist}<DemoContactFields value={contact} onChange={setContact} /><p className="text-[10px] text-muted-foreground">Contact details are only used in this session and are not sent or saved.</p><Button type="submit">Confirm demo contact request</Button></form>}
      {method === "listing" && <form className="space-y-4" onSubmit={e => { e.preventDefault(); const next = offerError(Number(draft.asking)) || (!draft.description.trim() ? "Enter a listing description." : "") || propertyErrors(draft.property).join(" "); setError(next); if (!next) { setDraft(draft); setConfirmed(true); } }}>
        <details className="border-y py-3"><summary className="cursor-pointer text-sm font-semibold">Review property details</summary><div className="mt-3"><PropertyForm property={draft.property} onChange={p => update({ property: p })} /></div></details>
        <label className="block text-xs font-semibold">Asking price (AED)<input aria-label="Asking price (AED)" required type="number" min="1" className={demoFieldClass} value={draft.asking} onChange={e => update({ asking: e.target.value })} /></label>
        <label className="block text-xs font-semibold">Listing description<textarea aria-label="Listing description" required rows={4} className="mt-1 w-full rounded-lg border bg-background p-3 text-sm font-normal" value={draft.description} onChange={e => update({ description: e.target.value })} /></label>
        <div className="space-y-3"><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold"><ImagePlus className="size-4 text-primary" />Add photos (optional)<input aria-label="Add listing photos" className="min-w-0 flex-1 text-xs" type="file" accept="image/*" multiple onChange={e => { const additions = Array.from(e.target.files ?? []).filter(file => file.type.startsWith("image/")).map(file => { const url = URL.createObjectURL(file); urls.current.push(url); return { name: file.name, url }; }); setPhotos(old => [...old, ...additions]); e.target.value = ""; }} /></label><p className="text-[10px] text-muted-foreground">Local previews only, not uploaded; photos disappear when you leave this page.</p><div className="grid grid-cols-3 gap-2">{photos.map(photo => <div key={photo.url} className="relative"><img src={photo.url} alt={photo.name} className="aspect-square w-full rounded-lg object-cover" /><Button type="button" variant="secondary" size="icon" className="absolute right-1 top-1" aria-label={`Remove ${photo.name}`} onClick={() => { URL.revokeObjectURL(photo.url); setPhotos(old => old.filter(p => p.url !== photo.url)); }}><Trash2 /></Button></div>)}</div></div>
        {shortlist}<p className="text-xs text-muted-foreground">{dispositionLabel(draft.agentId)}. The listing remains a draft until an agent is selected; the agent then handles required authorization and publication on Property Finder. Nothing is published in this demo.</p><Button type="submit">Save listing draft</Button>
      </form>}
    </>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}