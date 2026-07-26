/**
 * Monea Currency — 汇率换算 API + Apple 风格首页
 *
 * 数据源：Frankfurter v2 (https://frankfurter.dev) — 免费、无 API Key、201 种货币
 * 缓存：Cloudflare Cache API，边缘缓存 1 小时
 * UI：按 Apple 品牌设计规范 (brands/apple/DESIGN.md) 实现
 */

export const UPSTREAM = "https://api.frankfurter.dev/v2";
export const CACHE_TTL_SECONDS = 3600; // 1 小时

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface RateEntry {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

interface CurrencyInfo {
  iso_code: string;
  name: string;
  symbol?: string;
}

interface Env {}

// ---------- 工具函数 ----------

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=utf-8", ...CORS_HEADERS, ...headers },
  });
}

/** 带边缘缓存的 fetch：命中缓存直接返回，否则拉上游并写入缓存。 */
async function cachedFetch(url: string, ctx: ExecutionContext): Promise<Response> {
  const cache = caches.default;
  const cached = await cache.match(url);
  if (cached) return cached;

  const resp = await fetch(url, { headers: { "User-Agent": "Monea Currency/1.0" } });
  if (!resp.ok) return resp; // 透传上游错误

  // body 只能读一次，克隆后存缓存
  const forCache = new Response(resp.body, resp);
  forCache.headers.set("Cache-Control", `public, max-age=${CACHE_TTL_SECONDS}`);
  ctx.waitUntil(cache.put(url, forCache.clone()));
  return forCache;
}

async function upstreamError(resp: Response): Promise<Response> {
  const detail = await resp.text().catch(() => "");
  return json({ error: `Upstream error: ${resp.status}`, detail }, resp.status);
}

// ---------- 路由处理 ----------

/** GET /convert?from=USD&to=CNY&amount=100 */
export async function handleConvert(url: URL, ctx: ExecutionContext): Promise<Response> {
  const from = (url.searchParams.get("from") || "USD").toUpperCase();
  const to = (url.searchParams.get("to") || "EUR").toUpperCase();
  const amountParam = url.searchParams.get("amount");
  const dateParam = url.searchParams.get("date") || undefined;
  const amount = amountParam === null ? 1 : parseFloat(amountParam);
  if (!Number.isFinite(amount) || amount < 0) {
    return json({ error: "Invalid amount" }, 400);
  }
  if (dateParam && !isIsoDate(dateParam)) {
    return json({ error: "Invalid date" }, 400);
  }

  // 同币种直接返回，避免上游 404
  if (from === to) {
    return json(
      { from, to, amount, rate: 1, result: amount, date: dateParam ?? today() },
      200,
      { "Cache-Control": `public, max-age=${dateParam ? 86400 : CACHE_TTL_SECONDS}` },
    );
  }

  const params = dateParam ? `?date=${encodeURIComponent(dateParam)}` : "";
  const resp = await cachedFetch(`${UPSTREAM}/rate/${from}/${to}${params}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const data: RateEntry = await resp.json();
  const result = +(amount * data.rate).toFixed(4);
  return json(
    { from: data.base, to: data.quote, amount, rate: data.rate, result, date: data.date },
    200,
    { "Cache-Control": `public, max-age=${dateParam ? 86400 : CACHE_TTL_SECONDS}` },
  );
}

/** GET /history?from=USD&to=CNY&range=1M — 用于按需加载参考汇率走势。 */
export async function handleHistory(url: URL, ctx: ExecutionContext): Promise<Response> {
  const from = (url.searchParams.get("from") || "USD").toUpperCase();
  const to = (url.searchParams.get("to") || "EUR").toUpperCase();
  const range = url.searchParams.get("range") || "1M";
  const presets: Record<string, { days: number; group?: "week" | "month" }> = {
    "1D": { days: 1 },
    "1W": { days: 7 },
    "1M": { days: 30 },
    "6M": { days: 183, group: "week" },
    "1Y": { days: 365, group: "month" },
    "2Y": { days: 730, group: "month" },
    "5Y": { days: 1826, group: "month" },
  };
  const preset = presets[range];
  if (!preset) return json({ error: "Invalid range" }, 400);

  const end = today();
  const start = daysBefore(preset.days);
  if (from === to) {
    return json(
      { from, to, range, start, end, group: preset.group ?? "day", points: [{ date: start, rate: 1 }, { date: end, rate: 1 }] },
      200,
      { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
    );
  }

  const params = new URLSearchParams({ base: from, quotes: to, from: start, to: end });
  if (preset.group) params.set("group", preset.group);
  const resp = await cachedFetch(`${UPSTREAM}/rates?${params}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const entries: RateEntry[] = await resp.json();
  return json(
    {
      from,
      to,
      range,
      start,
      end,
      group: preset.group ?? "day",
      points: entries.filter((entry) => entry.base === from && entry.quote === to).map((entry) => ({ date: entry.date, rate: entry.rate })),
    },
    200,
    { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` },
  );
}

/** GET /latest?base=USD — 把上游数组折叠为 {base, date, rates:{CODE:rate}} */
export async function handleLatest(url: URL, ctx: ExecutionContext): Promise<Response> {
  const base = (url.searchParams.get("base") || "EUR").toUpperCase();
  const resp = await cachedFetch(`${UPSTREAM}/rates/latest?base=${base}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const arr: RateEntry[] = await resp.json();

  const rates: Record<string, number> = {};
  const dateCount: Record<string, number> = {};
  for (const e of arr) {
    rates[e.quote] = e.rate;
    dateCount[e.date] = (dateCount[e.date] || 0) + 1;
  }
  // 不同央行更新日期不一，取出现次数最多的作为整体日期
  const date = Object.entries(dateCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? arr[0]?.date;
  return json({ base, date, rates }, 200, { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` });
}

/** GET /currencies — 转为 {count, currencies:{CODE:{name,symbol}}} */
export async function handleCurrencies(ctx: ExecutionContext): Promise<Response> {
  const resp = await cachedFetch(`${UPSTREAM}/currencies`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const arr: CurrencyInfo[] = await resp.json();
  const currencies: Record<string, { name: string; symbol?: string }> = {};
  for (const c of arr) currencies[c.iso_code] = { name: c.name, symbol: c.symbol };
  return json({ count: arr.length, currencies }, 200, { "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}` });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBefore(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}


