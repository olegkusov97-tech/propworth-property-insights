import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchHistoricalListings, historicalCatalogPaths } from "@/lib/historical-listings";

afterEach(() => vi.unstubAllGlobals());

describe("Portable partitioned catalog", () => {
  it("preserves all 41,381 original records and their order in files under 5 MB", async () => {
    const encodedRecords: string[] = [];
    const contents = historicalCatalogPaths.map(path => {
      const file = `public${path}`;
      expect(statSync(file).size).toBeLessThan(5_000_000);
      const text = readFileSync(file, "utf8");
      const records = JSON.parse(text) as string[];
      encodedRecords.push(...records);
      return text;
    });
    // SHA-256 of the original catalog's ordered record strings (not file formatting).
    expect(createHash("sha256").update(JSON.stringify(encodedRecords)).digest("hex")).toBe("17e8566adaac7c0861de117d3588a46cbeb5c257e9a0b5b4db2dcd34c6a3b9a4");
    const fetchMock = vi.fn(async (url: string) => {
      const index = historicalCatalogPaths.findIndex(path => path === url);
      const text = contents[index];
      if (!text) return new Response("Missing partition", { status: 404 });
      return new Response(text, { headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const rows = await fetchHistoricalListings();
    expect(rows).toHaveLength(41381);
    expect(new Set(rows.map(row => row.id)).size).toBe(41381);
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual([...historicalCatalogPaths]);
  });

  it("fetches every partition from a normal hosting origin", async () => {
    const fetchMock = vi.fn(async (_url: string) => new Response("[]"));
    vi.stubGlobal("fetch", fetchMock);
    await fetchHistoricalListings("https://example.vercel.app/buyer/properties");
    expect(fetchMock.mock.calls.map(call => call[0])).toEqual(historicalCatalogPaths.map(path => `https://example.vercel.app${path}`));
  });

  it("rejects a missing partition rather than silently using an incomplete catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Missing", { status: 404 })));
    await expect(fetchHistoricalListings()).rejects.toThrow("The historical listing file could not be loaded.");
  });
});