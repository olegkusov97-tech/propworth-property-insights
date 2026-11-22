import type { DemoContact } from "@/lib/demo-decisions";
export const demoFieldClass = "mt-1 h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm font-normal";
export const emptyContact: DemoContact = { name: "", email: "", phone: "" };
export function DemoContactFields({ value, onChange }: { value: DemoContact; onChange: (v: DemoContact) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">{([{ key: "name", label: "Your name", type: "text" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Phone", type: "tel" }] as const).map(field => <label key={field.key} className="text-xs font-semibold">{field.label}<input required aria-label={field.label} type={field.type} autoComplete={field.key === "name" ? "name" : field.key === "phone" ? "tel" : "email"} className={demoFieldClass} value={value[field.key]} onChange={e => onChange({ ...value, [field.key]: e.target.value })} /></label>)}</div>;
}