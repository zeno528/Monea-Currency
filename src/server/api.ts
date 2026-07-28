/**
 * Monea Currency — 汇率换算 API + Apple 风格首页
 *
 * 数据源：Frankfurter v2 (https://frankfurter.dev) — 免费、无 API Key、201 种货币
 * 缓存：双层——
 *   1) Cache API (caches.default)：按上游 URL 跨 Worker 端点共享（如 /convert + /latest 同 base）。
 *   2) Workers Caching (wrangler cache.enabled)：按 Worker URL 自动落 CDN 边缘，
 *      由各数据类型的 Cache-Control 策略控制：
 *      - swr：仅用于历史/目录等允许短时旧值的资源；
 *      - live-rate：不用 swr，过期后同步回源，避免继续显示昨日数据。
 *      - sie：upstream 挂时吐 stale（STALE），首次冷启+失败才透传错误。
 * UI：按 Apple 品牌设计规范 (brands/apple/DESIGN.md) 实现
 */

export const UPSTREAM = "https://api.frankfurter.dev/v2";
// Cache API 的 key 不随 Worker 部署版本自动隔离；变更 live-rate 新鲜度策略时递增，
// 让新版本立即绕过旧策略写入的一小时缓存。
export const LIVE_RATE_CACHE_VERSION = "v2";
const DAY_SECONDS = 86400;
// 回源超时：上游挂起（TCP 半开、TLS 卡死等）时及时中断，避免整个请求被无限拖死。
const UPSTREAM_TIMEOUT_MS = 6000;

// TTL/SWR/SIE 分级：
//   live-rate：参考汇率会在各数据源发布后更新。只给 5min fresh，不使用 SWR，
//              避免上游已有当日数据时仍立即吐出昨日旧值；上游故障时才由 SIE 兜底。
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
  "live-rate": { name: "live-rate", maxAgeSeconds: 300, swrSeconds: 0, sieSeconds: 86400 },
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

interface Env {
  // SELF service binding：在 scheduled handler 中调用本 Worker 自己的 fetch handler，
  // 走 Service Bindings 通道，避免 cron 经公网回环；host 任意，path 须匹配 router。
  SELF: Fetcher;
}

// ---------- 工具函数 ----------

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=utf-8", ...CORS_HEADERS, ...headers },
  });
}

function cacheControlHeader(policy: CachePolicy): string {
  const directives = [`public`, `max-age=${policy.maxAgeSeconds}`];
  if (policy.swrSeconds > 0) directives.push(`stale-while-revalidate=${policy.swrSeconds}`);
  if (policy.sieSeconds > 0) directives.push(`stale-if-error=${policy.sieSeconds}`);
  return directives.join(", ");
}

function upstreamCacheKey(url: string, policy: CachePolicy): string {
  if (policy.name !== "live-rate") return url;
  const key = new URL(url);
  key.searchParams.set("__monea_cache", LIVE_RATE_CACHE_VERSION);
  return key.toString();
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
  const cacheKey = upstreamCacheKey(url, policy);
  const cached = await caches.default.match(cacheKey);
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
  ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
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

/** Cron-triggered cache warming: 只覆盖最常用的 base，长尾币种继续按需缓存。
 *  通过 SELF service binding 调用自身 /latest 端点，响应按 live-rate 策略
 *  (max-age=5min, 无 SWR, SIE=24h) 写入 CDN 边沿（cache.enabled: true 自动按
 *  Cache-Control 头落），降低常用货币首次切换的等待。
 *
 *  fetch handler 内部已经走 caches.default + fetchUpstream + live-rate 缓存头，
 *  重复预热同一 base 在缓存有效期内直接命中；过期后同步取得上游最新批次。
 */
export async function warmBaseCache(env: Env, _ctx: ExecutionContext): Promise<void> {
  const bases = ["USD", "EUR", "CNY", "JPY", "GBP", "HKD", "AUD", "CAD", "CHF", "SGD"];
  // Service binding 不解析 host——用占位 host 即可，path 必须以 /latest?base= 开头
  // 才能被本 Worker 的 router 命中。
  const url = (base: string) => `https://internal.monea-currency.workers.dev/latest?base=${base}`;
  const CONCURRENCY = 10;
  for (let i = 0; i < bases.length; i += CONCURRENCY) {
    const batch = bases.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map((base) =>
        env.SELF.fetch(url(base), {
          headers: { "X-Monea-Cache-Warm": "1" },
        }).then((resp) => {
          // 不消费 body（handleLatest 已经物化并由 CF 缓存接管），读完即弃。
          resp.body?.cancel();
          return resp;
        }).catch((error) => {
          // 个别 base 失败不抛错；CDN 边沿首次访问会自然回源补齐。
          console.warn(JSON.stringify({ event: "cache-warm", state: "fail", base, error: String(error) }));
        }),
      ),
    );
  }
}

