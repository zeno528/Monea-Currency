import { exports as workerExports } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Monea Currency Worker", () => {
  it("uses the documented rates endpoint and preserves each quote's date", async () => {
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("https://api.frankfurter.dev/v2/rates?base=USD");
      return Response.json([
        { date: "2026-07-26", base: "USD", quote: "CNY", rate: 6.77 },
        { date: "2026-07-24", base: "USD", quote: "JPY", rate: 152.3 },
      ]);
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/latest?base=USD");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      base: "USD",
      rates: {
        CNY: { rate: 6.77, date: "2026-07-26" },
        JPY: { rate: 152.3, date: "2026-07-24" },
      },
    });
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed amount values before calling the upstream API", async () => {
    const upstream = vi.fn();
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/convert?from=USD&to=CNY&amount=12abc");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid amount" });
    expect(upstream).not.toHaveBeenCalled();
  });

  it("rejects methods other than GET and OPTIONS", async () => {
    const response = await workerExports.default.fetch(new Request("https://example.com/convert?from=USD&to=CNY", { method: "POST" }));

    expect(response.status).toBe(405);
    expect(response.headers.get("Allow")).toBe("GET, OPTIONS");
    await expect(response.json()).resolves.toEqual({ error: "Method not allowed" });
  });
});
