import { fetchHistoricalListings } from "@/lib/historical-listings";
import { initializeBuyerCatalog } from "@/lib/buyer-liquidity";
import { beforeAll, describe, expect, it } from "vitest";
import { contactErrors, offerError, listingDisposition } from "@/lib/demo-decisions";
import { sampleProperties } from "@/lib/buyer-liquidity";
import { propertyErrors } from "@/lib/property";
beforeAll(async () => { initializeBuyerCatalog(await fetchHistoricalListings("http://localhost:8080")); }, 60000);

describe("Demo buying and selling rules", () => {
  it("requires name, valid email and phone for a demo request", () => {
    expect(contactErrors({name:"",email:"",phone:""})).toHaveLength(3);
    expect(contactErrors({name:"Demo Buyer",email:"demo@example.test",phone:"0501234567"})).toEqual([]);
  });
  it("requires a positive proposed price", () => {
    expect(offerError(0)).not.toBe(""); expect(offerError(-1)).not.toBe(""); expect(offerError(2475000)).toBe("");
  });
  it("keeps a listing unpublished when no agent has been selected", () => {
    expect(listingDisposition("").requiresAgent).toBe(true);
    expect(listingDisposition("").published).toBe(false);
  });
  it("does not publish a listing merely because a demo agent is selected", () => {
    expect(listingDisposition("agent-1").requiresAgent).toBe(false);
    expect(listingDisposition("agent-1").published).toBe(false);
  });
  it("requires the missing actual size before confirming a purchased property", () => {
    const item=sampleProperties.find(p=>p.listing?.area==="Dubai Marina" && p.property.bedrooms===1);
    if (!item) throw new Error("Source listing missing");
    expect(propertyErrors(item.property).length).toBeGreaterThan(0);
    expect(propertyErrors({...item.property,sizeSqft:830})).toEqual([]);
  });
});
