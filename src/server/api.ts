/**
 * Monea Currency — 汇率换算 API + Apple 风格首页
 *
 * 数据源：Frankfurter v2 (https://frankfurter.dev) — 免费、无 API Key、201 种货币
 * 缓存：双层——
 *   1) Cache API (caches.default)：按上游 URL 跨 Worker 端点共享（如 /convert + /latest 同 base）。
 *   2) Workers Caching (wrangler cache.enabled)：按 Worker URL 自动落 CDN 边缘，
 *      由 Cache-Control 头开启 stale-while-revalidate + stale-if-error：
 *      - swr：缓存过期后立即吐 stale，Worker 后台静默 revalidate，
 *        用户感知不到 cold-MISS（UPDATING）。
 *      - sie：upstream 挂时吐 stale（STALE），首次冷启+失败才透传错误。
 * UI：按 Apple 品牌设计规范 (brands/apple/DESIGN.md) 实现
 */

export const UPSTREAM = "https://api.frankfurter.dev/v2";
const DAY_SECONDS = 86400;
// 回源超时：上游挂起（TCP 半开、TLS 卡死等）时及时中断，避免整个请求被无限拖死。
const UPSTREAM_TIMEOUT_MS = 6000;

// TTL/SWR/SIE 分级：
//   live-rate：frankfurter 自身 max-age=86400（按 ECB 工作日 16:00 CET 发布），
//               我们给 1h fresh + 24h swr/sie，让热门边沿次日一开工就是缓存命中。
//   dated-rate：历史日期的汇率不可变，可以非常久地兜底。
//   history：Frankfurter 官方文档明说"Historical rates are immutable, so cache them forever"，
//            给 1d fresh + 7d swr/sie 已经远超实际访问频率。
//   currencies：货币列表几乎不变，按月级兜底。
type CachePolicy = {
  name: "live-rate" | "dated-rate" | "history" | "currencies";
  maxAgeSeconds: number;
  swrSeconds: number;
  sieSeconds: number;
};

const CACHE_POLICIES: Record<CachePolicy["name"], CachePolicy> = {
  "live-rate": { name: "live-rate", maxAgeSeconds: 3600, swrSeconds: 86400, sieSeconds: 86400 },
  "dated-rate": { name: "dated-rate", maxAgeSeconds: 86400, swrSeconds: DAY_SECONDS * 30, sieSeconds: DAY_SECONDS * 30 },
  history: { name: "history", maxAgeSeconds: 86400, swrSeconds: DAY_SECONDS * 7, sieSeconds: DAY_SECONDS * 7 },
  currencies: { name: "currencies", maxAgeSeconds: 86400 * 7, swrSeconds: DAY_SECONDS * 30, sieSeconds: DAY_SECONDS * 30 },
};

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

function cacheControlHeader(policy: CachePolicy): string {
  return `public, max-age=${policy.maxAgeSeconds}, stale-while-revalidate=${policy.swrSeconds}, stale-if-error=${policy.sieSeconds}`;
}

/**
 * 带超时的上游 fetch：上游挂起（TCP 半开、TLS 卡死等）时在 timeoutMs 内中断，
 * 避免 fetchUpstream 进而整个请求被无限拖死。
 */
async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers: { "User-Agent": "Monea Currency/1.0" }, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 双层缓存拉取：
 *   1) 先查 caches.default（按上游 URL），命中直接返回 —— 跨端点共享同一上游响应。
 *   2) 缺失则带超时拉上游；成功则物化 body、附加 Cache-Control 后返回，
 *      并后台写入 caches.default 供后续端点复用。
 *   3) 上游失败：返回 504 且 Cache-Control: no-store（不被 CDN 缓存）。
 *      - 若此前 Worker URL 已被 CDN 缓存，CF 的 stale-if-error 会自动吐 stale；
 *      - 首次冷启+失败则如实返回错误。
 */
async function fetchUpstream(url: string, policy: CachePolicy, ctx: ExecutionContext): Promise<Response> {
  const cached = await caches.default.match(url);
  if (cached) return cached;

  let resp: Response;
  try {
    resp = await fetchWithTimeout(url, UPSTREAM_TIMEOUT_MS);
  } catch (error) {
    console.warn(JSON.stringify({ event: "upstream", state: "timeout-or-network", resource: policy.name }));
    return json({ error: "Upstream unavailable" }, 504, { "Cache-Control": "no-store" });
  }

  if (!resp.ok) {
    if (resp.status >= 500) {
      console.warn(JSON.stringify({ event: "upstream", state: `5xx-${resp.status}`, resource: policy.name }));
      return json({ error: `Upstream error: ${resp.status}` }, resp.status, { "Cache-Control": "no-store" });
    }
    return resp; // 4xx 直接透传给客户端可读
  }

  // 先把响应体物化为字符串再分发：frankfurter 时间序列响应是 chunked（无 Content-Length），
  // 直接对原始流做 clone + caches.default.put + 下游 json() 多路消费，会在 workerd 里死锁（流永不结束）。
  const bodyText = await resp.text();
  const responseInit = { status: resp.status, statusText: resp.statusText, headers: { "Content-Type": resp.headers.get("Content-Type") || "application/json" } };
  const response = new Response(bodyText, responseInit);
  response.headers.set("Cache-Control", cacheControlHeader(policy));
  ctx.waitUntil(caches.default.put(url, response.clone()));
  return response;
}

async function upstreamError(resp: Response): Promise<Response> {
  const detail = await resp.text().catch(() => "");
  // 上游错误响应一律 Cache-Control: no-store —— 不让 CDN 把 4xx/5xx 错误缓存进边沿，
  // 否则 CF 的 stale-if-error 会拿错误响应兜底，比透明地吐错还糟。
  return json({ error: `Upstream error: ${resp.status}`, detail }, resp.status, { "Cache-Control": "no-store" });
}

// ---------- 路由处理 ----------

/** GET /convert?from=USD&to=CNY&amount=100 */
export async function handleConvert(url: URL, ctx: ExecutionContext): Promise<Response> {
  const from = (url.searchParams.get("from") || "USD").toUpperCase();
  const to = (url.searchParams.get("to") || "EUR").toUpperCase();
  const amountParam = url.searchParams.get("amount");
  const dateParam = url.searchParams.get("date") || undefined;
  const amount = parseNonNegativeAmount(amountParam);
  if (amount === null) {
    return json({ error: "Invalid amount" }, 400);
  }
  if (dateParam && !isIsoDate(dateParam)) {
    return json({ error: "Invalid date" }, 400);
  }

  // 同币种直接返回，避免上游 404
  if (from === to) {
    const policy = dateParam ? CACHE_POLICIES["dated-rate"] : CACHE_POLICIES["live-rate"];
    return json(
      { from, to, amount, rate: 1, result: amount, date: dateParam ?? today() },
      200,
      { "Cache-Control": cacheControlHeader(policy) },
    );
  }

  const params = dateParam ? `?date=${encodeURIComponent(dateParam)}` : "";
  const policy = dateParam ? CACHE_POLICIES["dated-rate"] : CACHE_POLICIES["live-rate"];

  // 实时路径走批量：一次回源拿到 base 下全量汇率（与 /latest 共享 caches.default 同一上游键），
  // 派生 from→to。同一 base 后续切换目标币种直接命中缓存，零上游。
  // 带 date 的历史日期查询仍走单点 `/rate/{from}/{to}?date=...`——避免拉整张历史全量、也避免给
  // dated-rate 缓存写膨胀。
  if (!dateParam) {
    const batchResp = await fetchUpstream(`${UPSTREAM}/rates?base=${from}`, policy, ctx);
    if (!batchResp.ok) return upstreamError(batchResp);
    const arr: RateEntry[] = await batchResp.json();
    const entry = arr.find((e) => e.base === from && e.quote === to);
    if (entry) {
      const result = +(amount * entry.rate).toFixed(4);
      return json(
        { from: entry.base, to: entry.quote, amount, rate: entry.rate, result, date: entry.date },
        200,
        { "Cache-Control": cacheControlHeader(policy) },
      );
    }
    // 目标不在批量里（极少数 frankfurter 不发布的稀有币种，例如周末/假日未更新），
    // 回退到单点端点保底，不让单边偶发缺口阻塞整条路径。
    console.warn(JSON.stringify({ event: "convert", mode: "fallback-single", from, to }));
  }

  const resp = await fetchUpstream(`${UPSTREAM}/rate/${from}/${to}${params}`, policy, ctx);
  if (!resp.ok) return upstreamError(resp);
  const data: RateEntry = await resp.json();
  const result = +(amount * data.rate).toFixed(4);
  return json(
    { from: data.base, to: data.quote, amount, rate: data.rate, result, date: data.date },
    200,
    { "Cache-Control": cacheControlHeader(policy) },
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
    "6M": { days: 183 },
    "1Y": { days: 365, group: "week" },
    "2Y": { days: 730, group: "week" },
    "5Y": { days: 1826, group: "month" },
  };
  const preset = presets[range];
  if (!preset) return json({ error: "Invalid range" }, 400);

  const end = today();
  const start = daysBefore(preset.days);
  const policy = CACHE_POLICIES.history;
  if (from === to) {
    return json(
      { from, to, range, start, end, group: preset.group ?? "day", points: [{ date: start, rate: 1 }, { date: end, rate: 1 }] },
      200,
      { "Cache-Control": cacheControlHeader(policy) },
    );
  }

  const params = new URLSearchParams({ base: from, quotes: to, from: start, to: end });
  if (preset.group) params.set("group", preset.group);
  const resp = await fetchUpstream(`${UPSTREAM}/rates?${params}`, policy, ctx);
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
    { "Cache-Control": cacheControlHeader(policy) },
  );
}

/** GET /latest?base=USD — 保留每个货币各自的数据日期。 */
export async function handleLatest(url: URL, ctx: ExecutionContext): Promise<Response> {
  const base = (url.searchParams.get("base") || "EUR").toUpperCase();
  const policy = CACHE_POLICIES["live-rate"];
  const resp = await fetchUpstream(`${UPSTREAM}/rates?base=${base}`, policy, ctx);
  if (!resp.ok) return upstreamError(resp);
  const arr: RateEntry[] = await resp.json();

  const rates: Record<string, { rate: number; date: string }> = {};
  for (const e of arr) {
    rates[e.quote] = { rate: e.rate, date: e.date };
  }
  return json({ base, rates }, 200, { "Cache-Control": cacheControlHeader(policy) });
}

/** GET /currencies — 转为 {count, currencies:{CODE:{name,symbol}}} */
export async function handleCurrencies(ctx: ExecutionContext): Promise<Response> {
  const policy = CACHE_POLICIES.currencies;
  const resp = await fetchUpstream(`${UPSTREAM}/currencies`, policy, ctx);
  if (!resp.ok) return upstreamError(resp);
  const arr: CurrencyInfo[] = await resp.json();
  const currencies: Record<string, { name: string; symbol?: string }> = {};
  for (const c of arr) currencies[c.iso_code] = { name: c.name, symbol: c.symbol };
  return json({ count: arr.length, currencies }, 200, { "Cache-Control": cacheControlHeader(policy) });
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

function parseNonNegativeAmount(value: string | null): number | null {
  if (value === null) return 1;
  const normalized = value.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

