import { describe, expect, it } from "vitest";
import { homeKey, switchHome } from "@/lib/owner-properties";
import { emptyProperty, propertyInsights } from "@/lib/property";

const original = { ...emptyProperty, communityId: "dsc", building: "Elite Sports Residence", bedrooms: 1, sizeSqft: 820, condition: "Renovated" };
const different = { ...emptyProperty, communityId: "marina", building: "Marina Gate", bedrooms: 2, sizeSqft: 1325 };
describe("Safe homeowner property switching", () => {
  it("retains the previous property's exact details and monthly snapshots instead of replacing them", () => {
    const snapshots = propertyInsights(original).snapshots;
    const result = switchHome({}, original, snapshots, different);
    expect(result.homes[homeKey(original)]).toEqual({ property: original, snapshots });
    expect(result.active.property).toEqual(different);
    expect(result.active.snapshots).toEqual([]);
    expect(result.homes[homeKey(original)]?.property.condition).toBe("Renovated");
  });
  it("restores retained details and history when a previous property is selected again", () => {
    const originalHistory = propertyInsights(original).snapshots;
    const first = switchHome({}, original, originalHistory, different);
    const returned = switchHome(first.homes, different, propertyInsights(different).snapshots, { ...original, condition: "Not specified" });
    expect(returned.active).toEqual({ property: original, snapshots: originalHistory });
    expect(returned.homes[homeKey(different)]?.property).toEqual(different);
  });
  it("uses the newly selected home's valuation and liquidity rather than the prior home's", () => {
    const result = switchHome({}, original, [], different);
    const insights = propertyInsights(result.active.property);
    expect(insights.value).toBe(propertyInsights(different).value);
    expect(insights.market.liquidity).toBe(propertyInsights(different).market.liquidity);
    expect(insights.value).not.toBe(propertyInsights(original).value);
  });
});