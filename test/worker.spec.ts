import { exports as workerExports } from "cloudflare:workers";
import { afterEach, describe, expect, it, vi } from "vitest";
import { warmBaseCache } from "../src/server/api";

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

  it("ships whole-row currency selection feedback and a retryable rate timeout", async () => {
    const response = await workerExports.default.fetch("https://example.com/");
    const html = await response.text();

    expect(html).toContain('id="rate-retry"');
    expect(html).toContain("var RATE_TIMEOUT_MS = 8000;");
    expect(html).toContain("selectCode(favoriteCode);");
    expect(html).toContain("汇率请求超时");
    expect(html).toContain("var panelPointerActive = false;");
    expect(html).toContain("cancelBlurClose();");
    expect(html).toContain("if (panelPointerActive)");
    expect(html).toContain("touch-action: manipulation;");
  });

  it("preloads one EUR snapshot for instant cross-currency conversion", async () => {
    const response = await workerExports.default.fetch("https://example.com/");
    const html = await response.text();

    expect(html).toContain('var RATE_SNAPSHOT_STORAGE_KEY = "monea-currency:rate-snapshot:v1";');
    expect(html).toContain('fetch("/latest?base=EUR")');
    expect(html).toContain("var rate = quoteLeg.rate / baseLeg.rate;");
    expect(html).toContain("if (cached.snapshot) refreshSnapshotRate");
  });

  it("warms only the ten common base currencies", async () => {
    const selfFetch = vi.fn(async () => Response.json({ ok: true }));
    const env = { SELF: { fetch: selfFetch } } as unknown as Parameters<typeof warmBaseCache>[0];

    await warmBaseCache(env, {} as ExecutionContext);

    const urls = selfFetch.mock.calls.map(([url]) => String(url));
    expect(urls).toHaveLength(10);
    expect(urls).toEqual([
      "https://internal.monea-currency.workers.dev/latest?base=USD",
      "https://internal.monea-currency.workers.dev/latest?base=EUR",
      "https://internal.monea-currency.workers.dev/latest?base=CNY",
      "https://internal.monea-currency.workers.dev/latest?base=JPY",
      "https://internal.monea-currency.workers.dev/latest?base=GBP",
      "https://internal.monea-currency.workers.dev/latest?base=HKD",
      "https://internal.monea-currency.workers.dev/latest?base=AUD",
      "https://internal.monea-currency.workers.dev/latest?base=CAD",
      "https://internal.monea-currency.workers.dev/latest?base=CHF",
      "https://internal.monea-currency.workers.dev/latest?base=SGD",
    ]);
  });

  it("uses a longer cache lifetime for the rarely changed currency catalogue", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([{ iso_code: "USD", name: "United States Dollar", symbol: "$" }])));

    const response = await workerExports.default.fetch("https://example.com/currencies");

    expect(response.status).toBe(200);
    // currencies 极少变化：fresh 7 天，SWR/SIE 各 30 天兜底，
    // 让 CF CDN 在 long-tail 场景下也能稳定吐 stale。
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=604800, stale-while-revalidate=2592000, stale-if-error=2592000",
    );
  });

  it("issues the standard SWR + stale-if-error directive on /convert responses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([{ date: "2026-07-26", base: "USD", quote: "EUR", rate: 0.92 }])));

    const response = await workerExports.default.fetch("https://example.com/convert?from=USD&to=EUR&amount=1");

    expect(response.status).toBe(200);
    // live-rate：fresh 1h，SWR/SIE 各 24h。SWR 让缓存过期后下一次访问秒回 stale，
    // SIE 让上游临时故障时吐 stale 而非 5xx。
    expect(response.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, stale-while-revalidate=86400, stale-if-error=86400",
    );
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

  it("marks upstream 5xx as no-store so CF's stale-if-error can take over from the CDN cache", async () => {
    // 旧版本 Worker 自己用 caches.default 兜底 STALE；现在改由 CF CDN 的 stale-if-error 兜底，
    // Worker 侧只需：upstream 失败时返回 5xx + Cache-Control: no-store，避免错误响应被错误地
    // 写进 CDN 边沿（这样 CDN 才能正确判断走 stale-if-error）。
    // 清掉该上游 URL 的缓存（先前测试可能写入了成功响应），确保本次走真实 upstream 路径。
    await caches.default.delete("https://api.frankfurter.dev/v2/rates?base=CHF");
    const upstream = vi.fn(async () => new Response("upstream unavailable", { status: 503 }));
    vi.stubGlobal("fetch", upstream);

    const response = await workerExports.default.fetch("https://example.com/latest?base=CHF");

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining("Upstream error") });
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
    expect(first.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, stale-while-revalidate=86400, stale-if-error=86400",
    );

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
