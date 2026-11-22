import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, ChevronRight, FilePenLine, LockKeyhole, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Disclaimer } from "./ui";
import { buildings, dubaiCommunities, emptyProperty, fromBuilding, pfProperties, propertyErrors, type PropertyDetails } from "@/lib/property";
import { getCommunity } from "@/lib/market";

export interface PropertyFlow {
  stage: "choose" | "import" | "search" | "details" | "review";
  source: string; property: PropertyDetails; query: string;
}
export const newPropertyFlow: PropertyFlow = { stage: "choose", source: "Manual entry", property: emptyProperty, query: "" };

export function PropertyOnboarding({ flow, onChange, onConfirm, onCancel, hasProperty }: {
  flow: PropertyFlow; onChange: (flow: PropertyFlow) => void;
  onConfirm: (property: PropertyDetails) => void; onCancel: () => void; hasProperty: boolean;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const update = (property: PropertyDetails) => { setErrors([]); onChange({ ...flow, property }); };
  const choose = (stage: PropertyFlow["stage"], source: string) => onChange({ ...flow, stage, source });
  const review = () => {
    const nextErrors = propertyErrors(flow.property);
    setErrors(nextErrors);
    if (!nextErrors.length) onChange({ ...flow, stage: "review" });
  };
  const select = (property: PropertyDetails) => onChange({ ...flow, property, stage: "review" });
  const q = flow.query.toLowerCase().trim();
  const foundBuildings = buildings.filter(b => `${b.name} ${getCommunity(b.communityId).name}`.toLowerCase().includes(q));
  const foundCommunities = dubaiCommunities.filter(c => c.name.toLowerCase().includes(q));
  return <>
    {flow.stage !== "choose" && <Button variant="ghost" size="sm" onClick={() => choose("choose", flow.source)}><ArrowLeft /> All options</Button>}
    {flow.stage === "choose" && <>
      <p className="text-sm text-muted-foreground">How would you like to add your property?</p>
      <div className="space-y-3">
        <Method icon={<Building2 />} title="Import from Property Finder" description="Choose a property from your PF account." onClick={() => choose("import", "Property Finder import")} />
        <Method icon={<Search />} title="Find My Property" description="Search a building or community." onClick={() => choose("search", "Building / community search")} />
        <Method icon={<FilePenLine />} title="Enter Manually" description="Add your property details yourself." onClick={() => choose("details", "Manual entry")} />
        <div className="flex gap-3 rounded-2xl border bg-muted/50 p-4" aria-disabled="true">
          <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 space-y-1"><p className="text-sm font-semibold">Connect with Dubai Land Department</p><span className="inline-block rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-secondary-foreground">Coming Soon</span><p className="text-xs text-muted-foreground">Future UAE PASS integration to retrieve registered properties. Not connected.</p></div>
        </div>
      </div>
    </>}
    {flow.stage === "import" && <>
      <h2 className="font-display text-xl font-bold">Your PF properties</h2>
      <Disclaimer>Demo PF account · these properties are mock records, not connected to your Property Finder account.</Disclaimer>
      {pfProperties.map(({ id, property }) => <PropertyChoice key={id} property={property} onClick={() => select(property)} />)}
    </>}
    {flow.stage === "search" && <>
      <h2 className="font-display text-xl font-bold">Find My Property</h2>
      <label className="block text-sm font-semibold">Building or community
        <div className="relative mt-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input type="search" className="w-full rounded-xl border bg-background py-3 pl-10 pr-3 text-sm" placeholder="e.g. Marina Gate or Dubai Hills" value={flow.query} onChange={e => onChange({ ...flow, query: e.target.value })} /></div>
      </label>
      <p className="text-xs text-muted-foreground">Simulated Dubai building directory</p>
      {!foundBuildings.length && !foundCommunities.length && <Card><p className="text-sm">No matches found.</p><Button variant="link" className="px-0" onClick={() => choose("details", "Manual entry")}>Enter Manually <ArrowRight /></Button></Card>}
      {foundBuildings.map(b => <PropertyChoice key={b.id} property={fromBuilding(b)} onClick={() => select(fromBuilding(b))} />)}
      {foundCommunities.length > 0 && <h3 className="text-xs font-semibold uppercase text-muted-foreground">Communities</h3>}
      {foundCommunities.map(c => <Button key={c.id} variant="outline" className="h-auto w-full justify-between whitespace-normal rounded-xl p-3 text-left" onClick={() => select({ ...emptyProperty, communityId: c.id, propertyType: c.type })}><span>{c.name}<span className="block text-xs font-normal text-muted-foreground">Community only · confirm your unit details</span></span><ChevronRight /></Button>)}
    </>}
    {flow.stage === "details" && <>
      <h2 className="font-display text-xl font-bold">Property details</h2>
      <PropertyForm property={flow.property} onChange={update} />
      {errors.length > 0 && <div role="alert" className="space-y-1 text-sm text-destructive">{errors.map(e => <p key={e}>{e}</p>)}</div>}
      <Button className="h-12 w-full rounded-xl" onClick={review}>Review property <ArrowRight /></Button>
    </>}
    {flow.stage === "review" && <>
      <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl font-bold">Confirm your property</h2><Button variant="outline" size="sm" onClick={() => choose("details", flow.source)}><Pencil /> Edit details</Button></div>
      <p className="text-xs text-muted-foreground">{flow.source} · review the details before saving</p>
      <Card>
        <h3 className="font-semibold">{flow.property.building || getCommunity(flow.property.communityId).name}</h3>
        <dl className="mt-3 divide-y text-sm">
          {reviewRows(flow.property).map(([label, value]) => <div className="flex justify-between gap-4 py-2" key={label}><dt className="text-muted-foreground">{label}</dt><dd className="max-w-[65%] break-words text-right font-medium">{value}</dd></div>)}
        </dl>
      </Card>
      <Disclaimer>All market figures are simulated. Property details stay in this browser only.</Disclaimer>
      {errors.length > 0 && <div role="alert" className="text-sm text-destructive">{errors.join(" ")}</div>}
      <Button className="h-12 w-full rounded-xl" onClick={() => { const e = propertyErrors(flow.property); setErrors(e); if (!e.length) onConfirm(flow.property); }}><Check /> Save & open dashboard</Button>
    </>}
    {hasProperty && <Button variant="link" className="w-full text-muted-foreground" onClick={onCancel}>Cancel — keep current property</Button>}
  </>;
}

function Method({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick: () => void }) {
  return <Button variant="outline" className="h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl bg-card p-4 text-left shadow-card" onClick={onClick}><span className="rounded-xl bg-secondary p-3 text-primary">{icon}</span><span className="min-w-0 flex-1"><span className="block font-display text-base font-bold">{title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{description}</span></span><ChevronRight /></Button>;
}
function PropertyChoice({ property, onClick }: { property: PropertyDetails; onClick: () => void }) {
  return <Button variant="outline" className="h-auto w-full justify-start gap-3 whitespace-normal rounded-2xl bg-card p-4 text-left shadow-card" onClick={onClick}><Building2 className="text-primary" /><span className="min-w-0 flex-1"><span className="block font-semibold">{property.building}</span><span className="block text-xs font-normal text-muted-foreground">{getCommunity(property.communityId).name}</span><span className="mt-1 block text-xs font-normal">{property.bedrooms === 0 ? "Studio" : `${property.bedrooms}BR`} {property.propertyType} · {property.sizeSqft.toLocaleString()} sq ft · {property.status}</span></span><ChevronRight /></Button>;
}
function reviewRows(p: PropertyDetails): [string, string][] {
  return [["Community", p.sourceArea ?? getCommunity(p.communityId).name], ["Building / development", p.building || "Not specified"], ["Property type", p.sourceType ?? p.propertyType], ["Bedrooms", p.bedrooms === 0 ? "Studio" : String(p.bedrooms)], ["Size", `${p.sizeSqft.toLocaleString()} sq ft`], ["Status", p.status], ["Floor", p.floor === null ? "Not specified" : String(p.floor)], ["View", p.view], ["Condition", p.condition], ["Furnishing", p.furnishing], ["Balcony", p.balcony], ["Parking", p.parking === null ? "Not specified" : `${p.parking} space(s)`], ...(p.genericBenchmark ? [["Analysis benchmark", `${getCommunity(p.communityId).name} · ${p.propertyType} · generic simulation`] as [string, string]] : [])];
}
const fieldClass = "mt-1 block w-full min-w-0 rounded-xl border bg-background p-3 text-sm font-normal";
export function PropertyForm({ property: p, onChange }: { property: PropertyDetails; onChange: (p: PropertyDetails) => void }) {
  const set = <K extends keyof PropertyDetails>(key: K, value: PropertyDetails[K]) => onChange({ ...p, [key]: value });
  return <div className="space-y-4">
    {p.sourceAddress && <p className="text-xs text-muted-foreground">Imported address: {p.sourceAddress}. Original type: {p.sourceType ?? p.propertyType}.{p.genericBenchmark ? " The selected community/type below is a generic analysis benchmark, not the recorded location/type." : ""}</p>}
    <Card className="space-y-4">
      <label className="block text-sm font-semibold">Community<select aria-label="Community" className={fieldClass} value={p.communityId} onChange={e => onChange({ ...p, communityId: e.target.value, building: "" })}><option value="">Choose community</option>{communitiesForForm(p.communityId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="block text-sm font-semibold">Building / development<input className={fieldClass} list="property-buildings" value={p.building} onChange={e => set("building", e.target.value)} placeholder="Name, if known" /><datalist id="property-buildings">{buildings.filter(b => b.communityId === p.communityId).map(b => <option key={b.id} value={b.name} />)}</datalist></label>
      <div className="grid grid-cols-2 gap-3"><SelectField label="Property type" value={p.propertyType} options={["Apartment", "Villa", "Townhouse"]} onChange={v => set("propertyType", v as PropertyDetails["propertyType"])} /><label className="block text-sm font-semibold">Bedrooms<select aria-label="Bedrooms" className={fieldClass} value={p.bedrooms} onChange={e => set("bedrooms", Number(e.target.value))}>{Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i === 0 ? "Studio" : i}</option>)}</select></label></div>
      <label className="block text-sm font-semibold">Size (sq ft)<input type="number" min={200} max={30000} className={fieldClass} value={p.sizeSqft || ""} onChange={e => set("sizeSqft", Number(e.target.value))} /></label>
      <SelectField label="Ready / off-plan status" value={p.status} options={["Ready", "Off-plan"]} onChange={v => set("status", v as PropertyDetails["status"])} />
    </Card>
    <Card className="space-y-4"><h3 className="text-sm font-semibold">Optional details</h3>
      <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-semibold">Floor<input type="number" min={0} max={200} className={fieldClass} value={p.floor ?? ""} placeholder="Not specified" onChange={e => set("floor", e.target.value === "" ? null : Number(e.target.value))} /></label><label className="block text-sm font-semibold">Parking spaces<input type="number" min={0} max={10} className={fieldClass} value={p.parking ?? ""} placeholder="Not specified" onChange={e => set("parking", e.target.value === "" ? null : Number(e.target.value))} /></label></div>
      <SelectField label="View" value={p.view} options={["Not specified", "Sea / marina", "Garden", "Open / community", "Road"]} onChange={v => set("view", v)} />
      <SelectField label="Condition" value={p.condition} options={["Not specified", "Good", "Renovated", "Needs renovation"]} onChange={v => set("condition", v)} />
      <SelectField label="Furnishing" value={p.furnishing} options={["Not specified", "Unfurnished", "Part furnished", "Furnished"]} onChange={v => set("furnishing", v)} />
      <SelectField label="Balcony" value={p.balcony} options={["Not specified", "Yes", "No"]} onChange={v => set("balcony", v)} />
    </Card>
  </div>;
}
function communitiesForForm(id: string) {
  const c = getCommunity(id);
  return c.city !== "Dubai" && c.id === id ? [...dubaiCommunities, c] : dubaiCommunities;
}
function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block text-sm font-semibold">{label}<select aria-label={label} className={fieldClass} value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select></label>;
}