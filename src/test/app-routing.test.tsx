import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
  it("has no Markets page or market detail route while keeping property search", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/buyer/markets").at(-1)?.routeId).toBe("/buyer");
    expect(router.matchRoutes("/buyer/markets/example").at(-1)?.routeId).toBe("/buyer");
    expect(Object.keys(router.routesById).some(id => id.includes("markets"))).toBe(false);
    expect(router.matchRoutes("/buyer/properties").at(-1)?.routeId).toBe("/buyer/properties");
  });
  it("removes side-by-side comparison routing while retaining property details and Saved", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(Object.keys(router.routesById).some(id => id.includes("compare"))).toBe(false);
    expect(router.matchRoutes("/buyer/compare").at(-1)?.routeId).toBe("/buyer");
    expect(router.matchRoutes("/buyer/properties/bayut-1").at(-1)?.routeId).toBe("/buyer/properties_/$id");
    expect(router.matchRoutes("/buyer/plan").at(-1)?.routeId).toBe("/buyer/plan");
  });
});
