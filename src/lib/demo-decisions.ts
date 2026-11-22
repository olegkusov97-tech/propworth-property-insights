export interface DemoContact { name: string; email: string; phone: string }
export function contactErrors(contact: DemoContact) {
  return [!contact.name.trim() ? "Enter your name." : "", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) ? "Enter a valid email." : "", contact.phone.replace(/\D/g, "").length < 7 ? "Enter a valid phone number." : ""].filter(Boolean);
}
export function offerError(price: number) { return !Number.isFinite(price) || price <= 0 ? "Enter a positive offer price." : ""; }
export function listingDisposition(agentId: string) { return { requiresAgent: !agentId, published: false, status: agentId ? "awaiting-authorization" : "draft" } as const; }