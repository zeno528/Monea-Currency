import { exports as workerExports } from "cloudflare:workers";
import { createExecutionContext, waitOnExecutionContext } from "cloudflare:test";
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

  it("uses a longer cache lifetime for the rarely changed currency catalogue", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([{ iso_code: "USD", name: "United States Dollar", symbol: "$" }])));

    const response = await workerExports.default.fetch("https://example.com/currencies");

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=86400");
    expect(response.headers.get("X-Monea-Cache")).toBe("MISS");
  });

  it("loads a narrowed history series from Frankfurter's documented rates endpoint", async () => {
    vi.useFakeTimers({ now: new Date("2026-07-26T12:00:00Z") });
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("https://api.frankfurter.dev/v2/rates?base=USD&quotes=CNY&from=2026-07-19&to=2026-07-26");
      return Response.json([
        { date: "2026-07-24", base: "USD", quote: "CNY", rate: 6.76 },
        { date: "2026-07-26", base: "USD", quote: "CNY", rate: 6.77 },
      ]);
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/history?from=USD&to=CNY&range=1W");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      from: "USD",
      to: "CNY",
      range: "1W",
      group: "day",
      points: [
        { date: "2026-07-24", rate: 6.76 },
        { date: "2026-07-26", rate: 6.77 },
      ],
    });
    vi.useRealTimers();
  });

  it("uses weekly grouping for the one-year history range", async () => {
    vi.useFakeTimers({ now: new Date("2026-07-26T12:00:00Z") });
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      expect(String(input)).toBe("https://api.frankfurter.dev/v2/rates?base=USD&quotes=CNY&from=2025-07-26&to=2026-07-26&group=week");
      return Response.json([
        { date: "2025-07-27", base: "USD", quote: "CNY", rate: 7.1 },
        { date: "2026-07-26", base: "USD", quote: "CNY", rate: 6.77 },
      ]);
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/history?from=USD&to=CNY&range=1Y");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ range: "1Y", group: "week" });
    vi.useRealTimers();
  });

  it("serves the most recent successful result without client caching when the upstream has a temporary failure", async () => {
    const requestUrl = "https://example.com/latest?base=CHF";
    const upstreamUrl = "https://api.frankfurter.dev/v2/rates?base=CHF";
    const upstream = vi.fn(async () => Response.json([{ date: "2026-07-26", base: "CHF", quote: "USD", rate: 1.25 }]));
    vi.stubGlobal("fetch", upstream);

    const writeContext = createExecutionContext();
    const firstResponse = await workerExports.default.fetch(new Request(requestUrl), {}, writeContext);
    await waitOnExecutionContext(writeContext);
    expect(firstResponse.headers.get("X-Monea-Cache")).toBe("MISS");

    await caches.default.delete(upstreamUrl);
    upstream.mockResolvedValueOnce(new Response("upstream unavailable", { status: 503 }));

    const fallbackResponse = await workerExports.default.fetch(new Request(requestUrl), {}, createExecutionContext());

    expect(fallbackResponse.status).toBe(200);
    expect(fallbackResponse.headers.get("X-Monea-Cache")).toBe("STALE");
    expect(fallbackResponse.headers.get("Cache-Control")).toBe("no-store");
    await expect(fallbackResponse.json()).resolves.toEqual({
      base: "CHF",
      rates: { USD: { rate: 1.25, date: "2026-07-26" } },
    });
  });

  it("returns 504 when the upstream is unreachable instead of stalling", async () => {
    // 上游不可达（网络错误或回源超时 abort）：cachedFetch 应回落到 504 让客户端降级，
    // 而非抛错导致路由层 500、或因无超时而无限卡死。超时阈值的实际生效由本地实测验证。
    const upstream = vi.fn(async () => {
      throw new Error("network unreachable");
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/history?from=USD&to=CNY&range=1M");

    expect(response.status).toBe(504);
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it("derives /convert from a single upstream batch fetch, sharing the cache with /latest", async () => {
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      // 实时路径走批量端点，缓存键与 /latest 复用，避免每切一个币种都打一次欧洲上游。
      // 用 EUR 作 base，与其它测试的 USD/CHF 缓存键不冲突，保证本测试的 cache 状态可断言。
      expect(String(input)).toBe("https://api.frankfurter.dev/v2/rates?base=EUR");
      return Response.json([
        { date: "2026-07-26", base: "EUR", quote: "CNY", rate: 7.71 },
        { date: "2026-07-26", base: "EUR", quote: "JPY", rate: 169.4 },
      ]);
    });
    vi.stubGlobal("fetch", upstream);

    // 同一 base 切换两个目标：只产生 1 次上游调用，第二次走缓存派生。
    const first = await workerExports.default.fetch("https://example.com/convert?from=EUR&to=CNY&amount=100");
    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toEqual({
      from: "EUR",
      to: "CNY",
      amount: 100,
      rate: 7.71,
      result: 771,
      date: "2026-07-26",
    });
    expect(first.headers.get("X-Monea-Cache")).toBe("MISS");
    expect(first.headers.get("Cache-Control")).toBe("public, max-age=86400");

    const second = await workerExports.default.fetch("https://example.com/convert?from=EUR&to=JPY&amount=2");
    expect(second.status).toBe(200);
    await expect(second.json()).resolves.toMatchObject({ from: "EUR", to: "JPY", rate: 169.4, result: 338.8 });
    expect(upstream).toHaveBeenCalledTimes(1);
  });

  it("falls back to the single-pair endpoint when the target is missing from the upstream batch", async () => {
    // 用 SGD 作 base，与其它测试不冲突；同时验证 XAU 这类贵金属若不在批量回源里能回退到单点。
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "https://api.frankfurter.dev/v2/rates?base=SGD") {
        return Response.json([{ date: "2026-07-26", base: "SGD", quote: "CNY", rate: 5.41 }]);
      }
      if (url === "https://api.frankfurter.dev/v2/rate/SGD/XAU") {
        return Response.json({ date: "2026-07-26", base: "SGD", quote: "XAU", rate: 0.00056 });
      }
      throw new Error(`unexpected upstream call: ${url}`);
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/convert?from=SGD&to=XAU&amount=1000");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ from: "SGD", to: "XAU", rate: 0.00056 });
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it("keeps using the single-pair endpoint for historical date queries", async () => {
    const upstream = vi.fn(async (input: RequestInfo | URL) => {
      // 带 date= 的查询不应拉全量：避免给 dated-rate 缓存写膨胀，也省一次上游往返。
      expect(String(input)).toBe("https://api.frankfurter.dev/v2/rate/USD/CNY?date=2024-01-15");
      return Response.json({ date: "2024-01-15", base: "USD", quote: "CNY", rate: 7.18 });
    });
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/convert?from=USD&to=CNY&amount=10&date=2024-01-15");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      from: "USD",
      to: "CNY",
      amount: 10,
      rate: 7.18,
      result: 71.8,
      date: "2024-01-15",
    });
    expect(upstream).toHaveBeenCalledTimes(1);
  });
});
