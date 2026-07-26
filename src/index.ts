/**
 * Currency Worker — 汇率换算 API + Apple 风格首页
 *
 * 数据源：Frankfurter v2 (https://frankfurter.dev) — 免费、无 API Key、201 种货币
 * 缓存：Cloudflare Cache API，边缘缓存 1 小时
 * UI：按 Apple 品牌设计规范 (brands/apple/DESIGN.md) 实现
 */

const UPSTREAM = "https://api.frankfurter.dev/v2";
const CACHE_TTL_SECONDS = 3600; // 1 小时

const CORS_HEADERS: Record<string, string> = {
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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json;charset=utf-8", ...CORS_HEADERS },
  });
}

/** 带边缘缓存的 fetch：命中缓存直接返回，否则拉上游并写入缓存。 */
async function cachedFetch(url: string, ctx: ExecutionContext): Promise<Response> {
  const cache = caches.default;
  const cached = await cache.match(url);
  if (cached) return cached;

  const resp = await fetch(url, { headers: { "User-Agent": "currency-worker/1.0" } });
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
async function handleConvert(url: URL, ctx: ExecutionContext): Promise<Response> {
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
    return json({ from, to, amount, rate: 1, result: amount, date: dateParam ?? today() });
  }

  const params = dateParam ? `?date=${encodeURIComponent(dateParam)}` : "";
  const resp = await cachedFetch(`${UPSTREAM}/rate/${from}/${to}${params}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const data: RateEntry = await resp.json();
  const result = +(amount * data.rate).toFixed(4);
  return json({ from: data.base, to: data.quote, amount, rate: data.rate, result, date: data.date });
}

/** GET /history?from=USD&to=CNY&range=1M — 用于按需加载参考汇率走势。 */
async function handleHistory(url: URL, ctx: ExecutionContext): Promise<Response> {
  const from = (url.searchParams.get("from") || "USD").toUpperCase();
  const to = (url.searchParams.get("to") || "EUR").toUpperCase();
  const range = url.searchParams.get("range") || "1M";
  const presets: Record<string, { days: number; group?: "week" | "month" }> = {
    "1W": { days: 7 },
    "1M": { days: 30 },
    "6M": { days: 183, group: "week" },
    "1Y": { days: 365, group: "month" },
  };
  const preset = presets[range];
  if (!preset) return json({ error: "Invalid range" }, 400);

  const end = today();
  const start = daysBefore(preset.days);
  if (from === to) {
    return json({ from, to, range, start, end, group: preset.group ?? "day", points: [{ date: start, rate: 1 }, { date: end, rate: 1 }] });
  }

  const params = new URLSearchParams({ base: from, quotes: to, from: start, to: end });
  if (preset.group) params.set("group", preset.group);
  const resp = await cachedFetch(`${UPSTREAM}/rates?${params}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const entries: RateEntry[] = await resp.json();
  return json({
    from,
    to,
    range,
    start,
    end,
    group: preset.group ?? "day",
    points: entries.filter((entry) => entry.base === from && entry.quote === to).map((entry) => ({ date: entry.date, rate: entry.rate })),
  });
}

/** GET /latest?base=USD — 把上游数组折叠为 {base, date, rates:{CODE:rate}} */
async function handleLatest(url: URL, ctx: ExecutionContext): Promise<Response> {
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
  return json({ base, date, rates });
}

/** GET /currencies — 转为 {count, currencies:{CODE:{name,symbol}}} */
async function handleCurrencies(ctx: ExecutionContext): Promise<Response> {
  const resp = await cachedFetch(`${UPSTREAM}/currencies`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const arr: CurrencyInfo[] = await resp.json();
  const currencies: Record<string, { name: string; symbol?: string }> = {};
  for (const c of arr) currencies[c.iso_code] = { name: c.name, symbol: c.symbol };
  return json({ count: arr.length, currencies });
}

function today(): string {
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

// ---------- 首页 HTML（Apple 设计规范） ----------

// prettier-ignore
const HOME_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>汇率换算 · Currency</title>
<link rel="icon" href="/currency-logo.svg" type="image/svg+xml">
<style>
  :root {
    --color-primary: #0071e3;
    --color-primary-focus: #0a84ff;
    --color-primary-on-dark: #2997ff;
    --color-ink: #1d1d1f;
    --color-ink-muted-80: #333333;
    --color-ink-muted-48: #7a7a7a;
    --color-canvas: #ffffff;
    --color-parchment: #f5f5f7;
    --color-pearl: #fbfbfd;
    --color-hairline: rgba(0, 0, 0, 0.12);
    --color-divider-soft: rgba(0, 0, 0, 0.06);
    --color-black: #000000;
    --color-on-dark: #ffffff;
    --color-body-muted: #cccccc;
    --color-tile-dark: #272729;
    --radius-sm: 8px;
    --radius-lg: 24px;
    --radius-pill: 9999px;
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --font-display: "SF Pro Display", system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
    --font-text: "SF Pro Text", system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    font-family: var(--font-text);
    color: var(--color-ink);
    background: var(--color-canvas);
    font-size: 17px;
    line-height: 1.47;
    letter-spacing: -0.018em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
  }

  /* 浮动的半透明顶栏：提供位置感，但不抢占内容层级。 */
  .global-nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(20, 20, 22, 0.78);
    backdrop-filter: saturate(180%) blur(20px);
    color: var(--color-on-dark);
    min-height: calc(44px + env(safe-area-inset-top, 0px));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 22px;
    padding-top: env(safe-area-inset-top, 0px);
    font-size: 12px;
    letter-spacing: -0.12px;
  }
  .brand {
    color: inherit;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
  }
  .brand img { width: 20px; height: 20px; }
  .brand span { opacity: 0.92; }

  .brand { min-height: 44px; }
  .brand:focus-visible { outline: 2px solid #fff; outline-offset: 4px; border-radius: 6px; }

  /* 单一、清晰的任务入口。 */
  .hero {
    /* Hero 与换算器共用同一画布，避免两段渐变产生色阶断层。 */
    background: var(--color-parchment);
    padding: 76px 22px 38px;
    text-align: center;
  }
  .eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 4px 11px;
    margin-bottom: 15px;
    color: #6e6e73;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: var(--radius-pill);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: clamp(42px, 5vw, 64px);
    font-weight: 600;
    line-height: 1.07;
    letter-spacing: -0.045em;
    max-width: 980px;
    margin: 0 auto;
  }
  .hero .lead {
    font-family: var(--font-display);
    font-size: clamp(20px, 2.5vw, 26px);
    font-weight: 400;
    line-height: 1.14;
    letter-spacing: -0.02em;
    color: var(--color-ink-muted-80);
    margin: 17px auto 0;
    max-width: 720px;
  }

  /* 换算器是页面唯一的主操作面，输入与结果以深浅两层区分。 */
  .converter-wrap {
    background: var(--color-parchment);
    padding: 0 22px 96px;
    display: flex;
    justify-content: center;
  }
  .converter-card {
    background: var(--color-canvas);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: var(--radius-lg);
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.09), 0 2px 8px rgba(0, 0, 0, 0.04);
    padding: 26px;
    width: 100%;
    max-width: 1040px;
  }
  .converter-card.is-resizing { transition: height 380ms var(--ease-out); }
  .converter-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .converter-title, .history-title { display: inline-flex; align-items: center; gap: 7px; }
  .converter-title { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
  .title-icon {
    width: 20px;
    height: 20px;
    padding: 3px;
    border-radius: 6px;
    background: #e8f2ff;
    color: #0066cc;
    flex: 0 0 auto;
  }
  .currency-title-icon {
    display: inline-grid;
    place-items: center;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 15px;
    font-weight: 600;
    line-height: 1;
  }
  .converter-hint { color: var(--color-ink-muted-48); font-size: 13px; }
  .converter-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
  .date-control {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--color-ink-muted-48);
    font-size: 12px;
    white-space: nowrap;
  }
  .date-control input {
    min-height: 32px;
    padding: 4px 7px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius-sm);
    background: #fff;
    color: var(--color-ink);
    font: inherit;
    font-size: 12px;
  }
  .date-control input:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  .utility-btn {
    min-height: 32px;
    padding: 5px 9px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius-pill);
    background: #fff;
    color: #515154;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 100ms ease-out;
  }
  .utility-btn[aria-pressed="true"] { color: #0066cc; border-color: #b8d8ff; background: #e8f2ff; }
  .utility-btn:active { transform: scale(0.97); }
  .utility-btn:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  .quick-pairs { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 20px; }
  .pair-chip {
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid rgba(0, 0, 0, 0.09);
    border-radius: var(--radius-pill);
    color: #515154;
    background: #fff;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 100ms ease-out;
  }
  .pair-chip[aria-pressed="true"] { background: #e8f2ff; border-color: #b8d8ff; color: #0066cc; }
  .pair-chip:active { transform: scale(0.97); }
  .pair-chip:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  @media (hover: hover) and (pointer: fine) { .pair-chip:hover { border-color: #9fc9ff; color: #0066cc; } }
  .saved-pairs {
    display: grid;
    grid-template-rows: 0fr;
    margin: -8px 0 0;
    opacity: 0;
    transform: translateY(-5px);
    transition: grid-template-rows 360ms var(--ease-out), margin 360ms var(--ease-out), opacity 180ms ease, transform 360ms var(--ease-out);
  }
  .saved-pairs.has-content { grid-template-rows: 1fr; margin-bottom: 20px; opacity: 1; transform: translateY(0); }
  .saved-pairs-inner { min-height: 0; overflow: hidden; }
  .saved-pairs-content { display: grid; gap: 8px; }
  .saved-pair-row { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; }
  .saved-pair-label { min-width: 26px; color: var(--color-ink-muted-48); font-size: 12px; }
  .clear-recent-btn {
    min-height: 28px;
    padding: 4px 6px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-primary);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .clear-recent-btn:active { transform: scale(0.97); }
  .clear-recent-btn:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  @media (hover: hover) and (pointer: fine) { .clear-recent-btn:hover { background: rgba(0, 102, 204, 0.08); } }
  .pair-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
    gap: 14px;
    align-items: center;
  }
  .currency-field {
    min-width: 0;
    background: #fbfbfd;
    border: 1px solid rgba(0, 0, 0, 0.09);
    border-radius: 20px;
    padding: 19px 20px 17px;
    cursor: text;
  }
  .currency-field:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.18);
  }
  .currency-field[data-amount-side="to"] { background: linear-gradient(145deg, #f7fbff, #eef6ff); }
  .currency-field label {
    display: block;
    font-size: 14px;
    color: var(--color-ink-muted-48);
    letter-spacing: -0.224px;
    margin-bottom: 10px;
  }
  .money-input-wrap {
    display: flex;
    align-items: baseline;
    min-width: 0;
  }
  .money-symbol {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 600;
    line-height: 1.1;
    color: var(--color-ink);
    margin-right: 4px;
    flex: 0 0 auto;
  }
  .money-input {
    font-family: var(--font-display);
    font-size: clamp(36px, 4vw, 46px);
    font-weight: 600;
    line-height: 1.1;
    color: var(--color-ink);
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    letter-spacing: 0;
    padding: 0;
    min-width: 0;
  }
  .money-input::placeholder { color: var(--color-ink-muted-48); }
  .money-input::-webkit-outer-spin-button,
  .money-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .money-input { -moz-appearance: textfield; appearance: textfield; }
  .currency-field .combobox { margin-top: 18px; }
  /* combobox: 可搜索货币下拉（Apple search-input pill 规范） */
  .combobox { position: relative; }
  .combo-input {
    font-family: var(--font-text);
    font-size: 17px;
    color: var(--color-ink);
    background-color: var(--color-canvas);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius-pill);
    padding: 12px 56px 12px 20px;
    height: 44px;
    width: 100%;
    cursor: pointer;
    outline: none;
  }
  .combo-input::placeholder { color: var(--color-ink-muted-48); }
  .combo-input:focus {
    outline: 2px solid var(--color-primary-focus);
    outline-offset: 2px;
    cursor: text;
  }
  .combo-arrow {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-ink);
    cursor: pointer;
    display: grid;
    place-items: center;
  }
  .combo-arrow:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; border-radius: 50%; }
  .combo-arrow svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
    transform-origin: center;
    transition: transform 180ms var(--ease-out);
  }
  .combobox.open .combo-arrow svg { transform: rotate(180deg); }
  .combo-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    /* 下拉菜单必须是独立实底层，避免与金额卡片叠色。 */
    background: #ffffff;
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-lg);
    box-shadow: 0 18px 35px rgba(0, 0, 0, 0.14);
    padding: 6px;
    z-index: 50;
    display: block;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-6px) scale(0.98);
    transform-origin: top center;
    transition: opacity 160ms var(--ease-out), transform 180ms var(--ease-out), visibility 0s linear 180ms;
    will-change: opacity, transform;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
  }
  /* 自定义滚动条（WebKit：Chrome / Edge / Safari） */
  .combo-panel::-webkit-scrollbar { width: 8px; }
  .combo-panel::-webkit-scrollbar-track { background: transparent; }
  .combo-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.18);
    border-radius: 4px;
  }
  .combo-panel::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.28); }
  .combobox.open .combo-panel {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0) scale(1);
    transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out), visibility 0s;
  }
  .combo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .combo-item.active { background: var(--color-parchment); }
  @media (hover: hover) {
    .combo-item:hover { background: var(--color-parchment); }
  }
  .combo-item-sym {
    min-width: 34px;
    text-align: center;
    font-weight: 600;
    color: var(--color-ink);
    flex-shrink: 0;
  }
  .combo-item-cn { flex: 1; min-width: 0; font-size: 15px; color: var(--color-ink); }
  .combo-item-code {
    font-size: 13px;
    color: var(--color-ink-muted-48);
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    flex-shrink: 0;
  }
  .combo-empty {
    padding: 18px;
    text-align: center;
    color: var(--color-ink-muted-48);
    font-size: 14px;
  }
  /* 原生 select：移动端用（iOS 原生 picker，无键盘遮挡）；桌面隐藏 */
  .native-select {
    display: none;
    font-family: var(--font-text);
    font-size: 17px;
    color: var(--color-ink);
    background-color: var(--color-canvas);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: var(--radius-pill);
    padding: 12px 40px 12px 20px;
    height: 44px;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231d1d1f' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat: no-repeat;
    background-position: right 16px center;
  }
  .native-select:focus {
    outline: 2px solid var(--color-primary-focus);
    outline-offset: 2px;
  }

  /* 交换是唯一的圆形主控件，按下即反馈。 */
  .swap-btn {
    width: 48px;
    height: 48px;
    border-radius: 9999px;
    background: var(--color-primary);
    border: 1px solid rgba(0, 0, 0, 0.08);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 7px 16px rgba(0, 113, 227, 0.28);
    transition: transform 160ms var(--ease-out), background-color 160ms ease, box-shadow 160ms ease;
  }
  .swap-btn:active { transform: scale(0.95) rotate(180deg); }
  .swap-btn:focus-visible { outline: 3px solid rgba(10, 132, 255, 0.3); outline-offset: 3px; }
  .swap-btn svg { width: 18px; height: 18px; }

  .rate-summary {
    background: #f5f5f7;
    border-radius: 16px;
    padding: 14px 16px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--color-ink-muted-48);
    letter-spacing: -0.224px;
    word-break: keep-all;
  }
  .rate-text { min-width: 0; }
  .rate-summary.is-loading .rate-text { color: #86868b; }
  .summary-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; flex: 0 0 auto; }
  .reset-btn {
    flex: 0 0 auto;
    min-height: 32px;
    padding: 5px 7px;
    border: 0;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-primary);
    font: inherit;
    cursor: pointer;
  }
  .reset-btn:active { transform: scale(0.97); }
  @media (hover: hover) and (pointer: fine) { .reset-btn:hover { background: rgba(0, 102, 204, 0.08); } }
  .reset-btn:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  .history-btn { white-space: nowrap; }
  .history {
    display: grid;
    grid-template-rows: 0fr;
    margin-top: 0;
    padding: 0 18px;
    border: 1px solid transparent;
    border-radius: 18px;
    background: #fbfbfd;
    opacity: 0;
    transform: translateY(-8px) scale(0.99);
    pointer-events: none;
    overflow-anchor: none;
    transition: grid-template-rows 380ms var(--ease-out), margin 380ms var(--ease-out), padding 380ms var(--ease-out), border-color 240ms ease, opacity 180ms ease, transform 380ms var(--ease-out);
  }
  .history[hidden] { display: grid; }
  .history.is-open { grid-template-rows: 1fr; margin-top: 14px; padding: 18px; border-color: rgba(0, 0, 0, 0.08); opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
  .history-content { min-height: 0; overflow: hidden; }
  .history-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; min-height: 72px; margin-bottom: 14px; }
  .history-title { font-size: 15px; font-weight: 600; }
  .history-quote { display: grid; gap: 1px; margin: 7px 0 0; }
  .history-quote-label { color: var(--color-ink-muted-48); font-size: 12px; line-height: 1.2; }
  .history-quote-value { color: var(--color-ink); font-size: 23px; font-weight: 650; letter-spacing: -0.035em; line-height: 1.15; }
  .history-note { margin-top: 4px; color: var(--color-ink-muted-48); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history-ranges { display: flex; gap: 5px; }
  .history-range {
    min-width: 38px;
    min-height: 28px;
    padding: 3px 7px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: var(--radius-pill);
    background: #fff;
    color: #515154;
    font: inherit;
    font-size: 11px;
    cursor: pointer;
    transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
  }
  .history-range[aria-pressed="true"] { color: #0066cc; border-color: #b8d8ff; background: #e8f2ff; }
  .history-range:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  .history-chart { position: relative; height: 340px; }
  .history-chart svg { display: block; width: 100%; height: auto; overflow: visible; }
  .chart-cursor { pointer-events: none; }
  .chart-cursor[hidden] { display: none; }
  .chart-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 70;
    min-width: max-content;
    max-width: calc(100vw - 24px);
    padding: 6px 8px;
    border-radius: 8px;
    background: rgba(29, 29, 31, 0.96);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
    color: #fff;
    font-size: 11px;
    line-height: 1.35;
    letter-spacing: 0;
    pointer-events: none;
    white-space: nowrap;
    transform: translate(14px, -50%) scale(0.98);
    opacity: 0;
    transition: opacity 120ms ease, transform 180ms var(--ease-out);
    will-change: transform, opacity;
  }
  .chart-tooltip.is-visible { opacity: 1; transform: translate(14px, -50%) scale(1); }
  .chart-tooltip.is-left { transform: translate(calc(-100% - 14px), -50%) scale(0.98); }
  .chart-tooltip.is-left.is-visible { transform: translate(calc(-100% - 14px), -50%) scale(1); }
  .history-empty { display: grid; height: 100%; place-items: center; color: var(--color-ink-muted-48); font-size: 13px; text-align: center; }
  .error { color: #d33; font-size: 14px; margin-top: 12px; letter-spacing: -0.224px; }

  /* 信息区域仍然简洁，但用可扫读的统计卡片替代大片装饰。 */
  .features {
    background: #1d1d1f;
    color: var(--color-on-dark);
    padding: 92px 22px;
  }
  .features h2 {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0;
    text-align: center;
    margin-bottom: 48px;
  }
  .feature-grid {
    max-width: 980px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .feature { text-align: center; padding: 28px 20px; border-radius: 20px; background: rgba(255, 255, 255, 0.07); }
  .feature-num {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 600;
    color: var(--color-primary-on-dark);
    line-height: 1;
    margin-bottom: 12px;
  }
  .feature-title {
    font-size: 21px;
    font-weight: 600;
    letter-spacing: 0.231px;
    margin-bottom: 8px;
  }
  .feature-desc {
    font-size: 14px;
    color: var(--color-body-muted);
    line-height: 1.43;
    letter-spacing: -0.224px;
  }

  /* 开发者信息降级为次要任务，适合快速复制而不影响换算。 */
  .api-section {
    background: var(--color-canvas);
    padding: 80px 22px;
  }
  .api-inner { max-width: 980px; margin: 0 auto; }
  .api-section h2 {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 600;
    line-height: 1.1;
    margin-bottom: 24px;
  }
  .api-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .api-endpoint {
    background: var(--color-parchment);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin: 0;
  }
  .api-endpoint h3 {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.374px;
    margin-bottom: 8px;
  }
  .api-code {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 14px;
    color: var(--color-ink-muted-80);
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-sm);
    padding: 12px 17px;
    overflow-x: auto;
    word-break: break-all;
  }
  .api-code .method { color: var(--color-primary); font-weight: 600; }

  /* footer: parchment */
  .footer {
    background: var(--color-parchment);
    color: var(--color-ink-muted-80);
    padding: 48px 22px;
    padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
    font-size: 12px;
    letter-spacing: -0.12px;
    line-height: 1.5;
    text-align: center;
  }
  .footer a { color: var(--color-primary); text-decoration: none; }
  .footer-divider {
    border-top: 1px solid var(--color-hairline);
    margin: 24px auto;
    max-width: 980px;
  }

  /* responsive */
  @media (max-width: 833px) {
    .hero { padding-top: 54px; }
    .hero h1 { font-size: 42px; }
    .feature-grid { grid-template-columns: 1fr; gap: 32px; }
    .api-grid { grid-template-columns: 1fr; }
    .pair-row {
      grid-template-columns: 1fr;
      grid-template-rows: auto 24px auto;
      gap: 0;
      align-items: stretch;
    }
    .currency-field { padding: 18px 20px; }
    .combo-input { height: 52px; padding: 14px 60px 14px 20px; }
    .combo-panel { max-height: min(320px, 42dvh); }
    .rate-summary { font-size: 13px; }
    .converter-topline { align-items: flex-start; }
    .converter-actions { flex-wrap: wrap; justify-content: flex-end; }
    /* 在两张卡片的分界线上，而非任一侧的边缘。 */
    .swap-btn {
      grid-row: 2;
      justify-self: center;
      align-self: center;
      margin: 0;
      transform: rotate(90deg);
      z-index: 2;
    }
    .swap-btn:active { transform: rotate(270deg) scale(0.95); }
    /* 移动端保留可搜索输入框，方便快速筛选较长的货币列表。 */
    .currency-field .combobox { display: block; }
    .native-select { display: none; }
  }
  @media (max-width: 419px) {
    .hero { padding: 44px 20px 30px; }
    .hero h1 { font-size: 34px; }
    .hero .lead { font-size: 21px; }
    .money-input { font-size: 32px; }
    .money-symbol { font-size: 30px; }
    .converter-wrap { padding: 0 14px 64px; }
    .converter-card { padding: 18px; border-radius: 20px; }
    .converter-topline { margin-bottom: 14px; }
    .converter-hint { display: none; }
    .converter-actions { gap: 6px; }
    .date-control span { display: none; }
    .history-head { display: block; min-height: 0; }
    .history-ranges { margin-top: 10px; }
    .history-note { white-space: normal; }
    .history-chart { height: 220px; }
    .rate-summary { align-items: flex-start; }
    .summary-actions { margin-left: 0; }
    .quick-pairs { margin-bottom: 16px; }
    .features, .api-section { padding: 56px 22px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
  }
</style>
</head>
<body>
  <nav class="global-nav">
    <a class="brand" href="/" aria-label="Currency 汇率换算首页">
      <img src="/currency-logo.svg" alt="" width="20" height="20">
      <span>Currency · 汇率换算</span>
    </a>
  </nav>

  <section class="hero">
    <p class="eyebrow">参考汇率</p>
    <h1>全球货币，轻松换算。</h1>
    <p class="lead">基于 Frankfurter 的货币目录，支持 <span id="hero-count">165</span> 种货币的搜索与参考换算，结果附带数据日期。</p>
  </section>

  <div class="converter-wrap">
    <div class="converter-card">
      <div class="converter-topline">
        <h2 class="converter-title"><span class="title-icon currency-title-icon" aria-hidden="true">¤</span>开始换算</h2>
        <div class="converter-actions">
          <label class="date-control"><span>参考日期</span><input id="rate-date" type="date" aria-label="参考日期，留空则使用最新数据"></label>
          <button id="favorite-pair" class="utility-btn" type="button" aria-pressed="false">收藏组合</button>
        </div>
      </div>
      <div class="quick-pairs" aria-label="常用货币组合">
        <button class="pair-chip" type="button" data-from="USD" data-to="CNY" aria-pressed="true">美元 · 人民币</button>
        <button class="pair-chip" type="button" data-from="CNY" data-to="USD" aria-pressed="false">人民币 · 美元</button>
        <button class="pair-chip" type="button" data-from="EUR" data-to="CNY" aria-pressed="false">欧元 · 人民币</button>
        <button class="pair-chip" type="button" data-from="JPY" data-to="CNY" aria-pressed="false">日元 · 人民币</button>
      </div>
      <div id="saved-pairs" class="saved-pairs" aria-label="收藏和最近使用的货币组合"></div>
      <div class="pair-row">
        <div class="currency-field" data-amount-side="from">
          <label>从</label>
          <div class="money-input-wrap">
            <span id="from-symbol" class="money-symbol" aria-hidden="true">$</span>
            <input id="from-amount" class="money-input" type="text" inputmode="decimal" value="100" placeholder="0" aria-label="从货币金额">
          </div>
          <div class="combobox" data-field="from">
            <input type="text" class="combo-input" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="从货币">
            <button class="combo-arrow" type="button" aria-label="展开从货币列表" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
            <div class="combo-panel" role="listbox"></div>
          </div>
          <select class="native-select" aria-label="从货币"></select>
        </div>
        <button id="swap" class="swap-btn" type="button" title="交换货币" aria-label="交换货币">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 5l4 3-4 3M20 16H6M10 13l-4 3 4 3"/></svg>
        </button>
        <div class="currency-field" data-amount-side="to">
          <label>到</label>
          <div class="money-input-wrap">
            <span id="to-symbol" class="money-symbol" aria-hidden="true">¥</span>
            <input id="to-amount" class="money-input" type="text" inputmode="decimal" value="" placeholder="0" aria-label="到货币金额">
          </div>
          <div class="combobox" data-field="to">
            <input type="text" class="combo-input" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="到货币">
            <button class="combo-arrow" type="button" aria-label="展开到货币列表" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
            <div class="combo-panel" role="listbox"></div>
          </div>
          <select class="native-select" aria-label="到货币"></select>
        </div>
      </div>
      <div class="rate-summary">
        <span id="result-rate" class="rate-text" aria-live="polite">输入金额后将自动换算</span>
        <div class="summary-actions">
          <button id="history-toggle" class="reset-btn history-btn" type="button" aria-expanded="false">走势</button>
          <button id="reset" class="reset-btn" type="button" title="恢复默认换算" aria-label="重置为 100 美元换算人民币">↺ 重置</button>
        </div>
      </div>
      <div id="error" class="error" hidden></div>
      <section id="history" class="history" aria-label="参考汇率走势" aria-hidden="true" hidden>
        <div id="history-content" class="history-content" inert>
          <div class="history-head">
            <div><h3 class="history-title"><svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17l5-5 4 3 7-8"/><path d="M16 7h4v4"/></svg>参考汇率走势</h3><p id="history-quote" class="history-quote"><span class="history-quote-label">一单位参考汇率</span><strong class="history-quote-value">加载中</strong></p><p id="history-note" class="history-note">按需加载，不影响首屏。</p></div>
            <div class="history-ranges" aria-label="走势时间范围">
              <button class="history-range" type="button" data-range="1W" aria-pressed="false">1周</button>
              <button class="history-range" type="button" data-range="1M" aria-pressed="true">1月</button>
              <button class="history-range" type="button" data-range="6M" aria-pressed="false">6月</button>
              <button class="history-range" type="button" data-range="1Y" aria-pressed="false">1年</button>
            </div>
          </div>
          <div id="history-chart" class="history-chart" aria-live="polite"></div>
        </div>
      </section>
    </div>
  </div>

  <section class="features">
    <h2>为换算，也为接入</h2>
    <div class="feature-grid">
      <div class="feature">
        <div class="feature-num" id="currency-count">165</div>
        <div class="feature-title">种可选货币</div>
        <div class="feature-desc">货币目录从上游动态加载，可按中文名称、英文名称或 ISO 代码搜索。</div>
      </div>
      <div class="feature">
        <div class="feature-num">5</div>
        <div class="feature-title">JSON 端点</div>
        <div class="feature-desc">同一个 Worker 提供换算、历史走势、最新汇率、货币目录与健康检查接口。</div>
      </div>
      <div class="feature">
        <div class="feature-num">1h</div>
        <div class="feature-title">缓存上限</div>
        <div class="feature-desc">相同的上游请求由 Cloudflare Cache API 缓存最长一小时，减少重复请求。</div>
      </div>
    </div>
  </section>

  <section class="api-section">
    <div class="api-inner">
      <h2>API 端点</h2>
      <div class="api-grid">
        <div class="api-endpoint">
          <h3>换算</h3>
          <div class="api-code"><span class="method">GET</span> /convert?from=USD&amp;to=CNY&amp;amount=100</div>
        </div>
        <div class="api-endpoint">
          <h3>最新汇率</h3>
          <div class="api-code"><span class="method">GET</span> /latest?base=USD</div>
        </div>
        <div class="api-endpoint">
          <h3>历史走势</h3>
          <div class="api-code"><span class="method">GET</span> /history?from=USD&amp;to=CNY&amp;range=1M</div>
        </div>
        <div class="api-endpoint">
          <h3>货币列表</h3>
          <div class="api-code"><span class="method">GET</span> /currencies</div>
        </div>
        <div class="api-endpoint">
          <h3>健康检查</h3>
          <div class="api-code"><span class="method">GET</span> /health</div>
        </div>
      </div>
    </div>
  </section>

  <footer class="footer">
    数据由 <a href="https://frankfurter.dev" target="_blank" rel="noopener">Frankfurter</a> 提供 · 部署于 Cloudflare Workers · <a href="https://github.com/zeno528/currency-worker" target="_blank" rel="noopener">GitHub 仓库</a>
    <div class="footer-divider"></div>
    汇率仅供参考，不构成交易建议。© 2026 Currency Worker
  </footer>

  <script>
    // 货币中文映射（ISO 4217）-- Frankfurter 仅返回英文名，这里补中文名
    var CURRENCY_CN = {
      AED:"阿联酋迪拉姆",AFN:"阿富汗尼",ALL:"阿尔巴尼亚列克",AMD:"亚美尼亚德拉姆",ANG:"荷属安的列斯盾",
      AOA:"安哥拉宽扎",ARS:"阿根廷比索",AUD:"澳大利亚元",AWG:"阿鲁巴弗罗林",AZN:"阿塞拜疆马纳特",
      BAM:"波黑可兑换马克",BBD:"巴巴多斯元",BDT:"孟加拉塔卡",BHD:"巴林第纳尔",BIF:"布隆迪法郎",
      BMD:"百慕大元",BND:"文莱元",BOB:"玻利维亚诺",BRL:"巴西雷亚尔",BSD:"巴哈马元",
      BTN:"不丹努尔特鲁姆",BWP:"博茨瓦纳普拉",BYN:"白俄罗斯卢布",BZD:"伯利兹元",CAD:"加拿大元",
      CDF:"刚果法郎",CHF:"瑞士法郎",CLP:"智利比索",CNH:"离岸人民币",CNY:"人民币",COP:"哥伦比亚比索",
      CRC:"哥斯达黎加科朗",CUP:"古巴比索",CVE:"佛得角埃斯库多",CZK:"捷克克朗",DJF:"吉布提法郎",
      DKK:"丹麦克朗",DOP:"多米尼加比索",DZD:"阿尔及利亚第纳尔",EGP:"埃及镑",ERN:"厄立特里亚纳克法",
      ETB:"埃塞俄比亚比尔",EUR:"欧元",FJD:"斐济元",FKP:"福克兰群岛镑",GBP:"英镑",
      GEL:"格鲁吉亚拉里",GGP:"根西岛镑",GHS:"加纳塞地",GIP:"直布罗陀镑",GMD:"冈比亚达拉西",
      GNF:"几内亚法郎",GTQ:"危地马拉格查尔",GYD:"圭亚那元",HKD:"港元",HNL:"洪都拉斯伦皮拉",
      HTG:"海地古德",HUF:"匈牙利福林",IDR:"印度尼西亚卢比",ILS:"以色列新谢克尔",IMP:"马恩岛镑",
      INR:"印度卢比",IQD:"伊拉克第纳尔",IRR:"伊朗里亚尔",ISK:"冰岛克朗",JEP:"泽西岛镑",
      JMD:"牙买加元",JOD:"约旦第纳尔",JPY:"日元",KES:"肯尼亚先令",KGS:"吉尔吉斯斯坦索姆",
      KHR:"柬埔寨瑞尔",KMF:"科摩罗法郎",KPW:"朝鲜圆",KRW:"韩元",KWD:"科威特第纳尔",
      KYD:"开曼元",KZT:"哈萨克斯坦坚戈",LAK:"老挝基普",LBP:"黎巴嫩镑",LKR:"斯里兰卡卢比",
      LRD:"利比里亚元",LSL:"莱索托洛蒂",LYD:"利比亚第纳尔",MAD:"摩洛哥迪拉姆",MDL:"摩尔多瓦列伊",
      MGA:"马达加斯加阿里亚里",MKD:"北马其顿第纳尔",MMK:"缅元",MNT:"蒙古图格里克",MOP:"澳门元",
      MRO:"毛里塔尼亚旧乌吉亚",MRU:"毛里塔尼亚乌吉亚",MUR:"毛里求斯卢比",MVR:"马尔代夫拉菲亚",MWK:"马拉维克瓦查",
      MXN:"墨西哥比索",MYR:"马来西亚林吉特",MZN:"莫桑比克梅蒂卡尔",NAD:"纳米比亚元",NGN:"尼日利亚奈拉",
      NIO:"尼加拉瓜科多巴",NOK:"挪威克朗",NPR:"尼泊尔卢比",NZD:"新西兰元",OMR:"阿曼里亚尔",
      PAB:"巴拿马巴波亚",PEN:"秘鲁索尔",PGK:"巴布亚新几内亚基那",PHP:"菲律宾比索",PKR:"巴基斯坦卢比",
      PLN:"波兰兹罗提",PYG:"巴拉圭瓜拉尼",QAR:"卡塔尔里亚尔",RON:"罗马尼亚列伊",RSD:"塞尔维亚第纳尔",
      RUB:"俄罗斯卢布",RWF:"卢旺达法郎",SAR:"沙特里亚尔",SBD:"所罗门群岛元",SCR:"塞舌尔卢比",
      SDG:"苏丹镑",SEK:"瑞典克朗",SGD:"新加坡元",SHP:"圣赫勒拿镑",SLE:"塞拉利昂利昂",
      SOS:"索马里先令",SRD:"苏里南元",SSP:"南苏丹镑",STN:"圣多美和普林西比多布拉",SVC:"萨尔瓦多科朗",
      SYP:"叙利亚镑",SZL:"斯威士兰里兰吉尼",THB:"泰铢",TJS:"塔吉克斯坦索莫尼",TMT:"土库曼斯坦马纳特",
      TND:"突尼斯第纳尔",TOP:"汤加潘加",TRY:"土耳其里拉",TTD:"特立尼达和多巴哥元",TWD:"新台币",
      TZS:"坦桑尼亚先令",UAH:"乌克兰格里夫纳",UGX:"乌干达先令",USD:"美元",UYU:"乌拉圭比索",
      UZS:"乌兹别克斯坦苏姆",VES:"委内瑞拉玻利瓦尔",VND:"越南盾",VUV:"瓦努阿图瓦图",WST:"萨摩亚塔拉",
      XAF:"中非法郎",XAG:"白银",XAU:"黄金",XCD:"东加勒比元",XCG:"加勒比盾",XDR:"特别提款权",
      XOF:"西非法郎",XPD:"钯",XPF:"太平洋法郎",XPT:"铂",YER:"也门里亚尔",ZAR:"南非兰特",
      ZMW:"赞比亚克瓦查",ZWG:"津巴布韦金币"
    };

    var $ = function (id) { return document.getElementById(id); };
    var fromAmountEl = $("from-amount"), toAmountEl = $("to-amount");
    var fromSymbolEl = $("from-symbol"), toSymbolEl = $("to-symbol");
    var rateEl = $("result-rate");
    var errEl = $("error"), swapBtn = $("swap"), resetBtn = $("reset");
    var dateEl = $("rate-date"), favoriteBtn = $("favorite-pair");
    var savedPairsEl = $("saved-pairs"), historyEl = $("history"), historyContentEl = $("history-content"), historyToggleEl = $("history-toggle");
    var historyChartEl = $("history-chart"), historyNoteEl = $("history-note"), historyQuoteEl = $("history-quote");
    var rateSummaryEl = document.querySelector(".rate-summary");
    var converterCardEl = document.querySelector(".converter-card");
    var fromBox = document.querySelector('[data-field="from"]');
    var toBox = document.querySelector('[data-field="to"]');
    var CURRENCIES = []; // {code, name, cn}
    var activeSide = "from";
    var requestId = 0;
    var historyRange = "1M";
    var historyRequestId = 0;
    var PAIR_STORAGE_KEY = "currency-worker:pairs:v1";
    var savedPairsInitialized = false;

    dateEl.max = new Date().toISOString().slice(0, 10);

    function pairId(from, to) { return from + ":" + to; }
    function currentPair() { return { from: fromBox.dataset.value, to: toBox.dataset.value }; }
    function readPairStore() {
      try {
        var data = JSON.parse(localStorage.getItem(PAIR_STORAGE_KEY) || "{}");
        return { favorites: Array.isArray(data.favorites) ? data.favorites : [], recent: Array.isArray(data.recent) ? data.recent : [] };
      } catch (_) { return { favorites: [], recent: [] }; }
    }
    function writePairStore(store) {
      try { localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(store)); } catch (_) {}
    }
    function isFavorite(pair) {
      return readPairStore().favorites.some(function (item) { return pairId(item.from, item.to) === pairId(pair.from, pair.to); });
    }
    function pairLabel(pair) {
      var fromName = displayText(pair.from).replace(/^\\S+\\s/, "").replace(/ \\([A-Z]{3}\\)$/, "");
      var toName = displayText(pair.to).replace(/^\\S+\\s/, "").replace(/ \\([A-Z]{3}\\)$/, "");
      return fromName + " · " + toName;
    }
    function renderPairs(items, label) {
      if (!items.length) return "";
      var clear = label === "最近" ? '<button id="clear-recent" class="clear-recent-btn" type="button">清除</button>' : "";
      return '<div class="saved-pair-row"><span class="saved-pair-label">' + label + '</span>' + items.map(function (pair) {
        return '<button class="pair-chip" type="button" data-from="' + pair.from + '" data-to="' + pair.to + '" aria-pressed="false">' + pairLabel(pair) + '</button>';
      }).join("") + clear + '</div>';
    }
    function updateSavedPairs(content) {
      savedPairsEl.classList.toggle("has-content", Boolean(content));
      savedPairsEl.innerHTML = '<div class="saved-pairs-inner"><div class="saved-pairs-content">' + content + '</div></div>';
    }
    function animateSavedPairsUpdate(content) {
      if (!savedPairsInitialized || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updateSavedPairs(content);
        savedPairsInitialized = true;
        return;
      }
      var startHeight = converterCardEl.getBoundingClientRect().height;
      converterCardEl.style.height = startHeight + "px";
      updateSavedPairs(content);
      converterCardEl.style.height = "auto";
      var endHeight = converterCardEl.getBoundingClientRect().height;
      converterCardEl.style.height = startHeight + "px";
      converterCardEl.classList.add("is-resizing");
      requestAnimationFrame(function () { converterCardEl.style.height = endHeight + "px"; });
      converterCardEl.addEventListener("transitionend", function cleanup(event) {
        if (event.propertyName !== "height") return;
        converterCardEl.classList.remove("is-resizing");
        converterCardEl.style.height = "";
        converterCardEl.removeEventListener("transitionend", cleanup);
      });
    }
    function renderSavedPairs() {
      var store = readPairStore();
      var content = renderPairs(store.favorites, "收藏") + renderPairs(store.recent, "最近");
      animateSavedPairsUpdate(content);
      syncQuickPairs();
      favoriteBtn.setAttribute("aria-pressed", isFavorite(currentPair()) ? "true" : "false");
      favoriteBtn.textContent = isFavorite(currentPair()) ? "已收藏" : "收藏组合";
    }
    function rememberCurrentPair() {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      store.recent = [pair].concat(store.recent.filter(function (item) { return pairId(item.from, item.to) !== id; })).slice(0, 4);
      writePairStore(store);
      renderSavedPairs();
    }
    function syncHistory() {
      if (historyEl.classList.contains("is-open")) loadHistory("draw");
    }

    // 展示文本：符号 中文名 (代码)
    function displayText(code) {
      for (var i = 0; i < CURRENCIES.length; i++) {
        if (CURRENCIES[i].code === code) {
          var c = CURRENCIES[i];
          return (c.symbol ? c.symbol + " " : "") + c.cn + " (" + code + ")";
        }
      }
      return code || "";
    }

    function currencySymbol(code) {
      for (var i = 0; i < CURRENCIES.length; i++) {
        if (CURRENCIES[i].code === code) return CURRENCIES[i].symbol || code;
      }
      return code || "";
    }

    function formatEditableAmount(amount) {
      return Number(amount).toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: 4 });
    }

    function parseAmount(value) { return parseFloat(String(value).replace(/,/g, "")); }

    function formatAmountWhileTyping(input) {
      var previous = input.value;
      var caret = input.selectionStart === null ? previous.length : input.selectionStart;
      var raw = previous.replace(/,/g, "");
      var rawBeforeCaret = previous.slice(0, caret).replace(/,/g, "");
      var dots = raw.split(".");
      if (dots.length > 2 || raw.split("").some(function (char) { return char !== "." && (char < "0" || char > "9"); })) return;
      var whole = dots[0], groups = [];
      for (var end = whole.length; end > 0; end -= 3) groups.unshift(whole.slice(Math.max(0, end - 3), end));
      var formatted = groups.join(",") + (dots.length === 2 ? "." + dots[1] : "");
      input.value = formatted;
      var seen = 0, nextCaret = 0;
      while (nextCaret < formatted.length && seen < rawBeforeCaret.length) {
        if (formatted[nextCaret] !== ",") seen++;
        nextCaret++;
      }
      input.setSelectionRange(nextCaret, nextCaret);
    }

    function syncSymbols() {
      fromSymbolEl.textContent = currencySymbol(fromBox.dataset.value);
      toSymbolEl.textContent = currencySymbol(toBox.dataset.value);
    }

    function syncQuickPairs() {
      document.querySelectorAll(".pair-chip").forEach(function (chip) {
        var selected = chip.dataset.from === fromBox.dataset.value && chip.dataset.to === toBox.dataset.value;
        chip.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    }

    function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }
    function clearError() { errEl.hidden = true; }

    function loadCurrencies() {
      fetch("/currencies").then(function (r) { return r.json(); }).then(function (data) {
        var codes = Object.keys(data.currencies).sort();
        CURRENCIES = codes.map(function (code) {
          var info = data.currencies[code];
          return { code: code, name: info.name, cn: CURRENCY_CN[code] || info.name, symbol: info.symbol || "" };
        });
        var n = String(CURRENCIES.length);
        var hc = $("hero-count"), cc = $("currency-count");
        if (hc) hc.textContent = n;
        if (cc) cc.textContent = n;
        // 填充原生 select（移动端用），选项格式：符号 中文名 (代码)
        var optHtml = CURRENCIES.map(function (c) {
          return '<option value="' + c.code + '">' + (c.symbol ? c.symbol + " " : "") + c.cn + " (" + c.code + ")</option>";
        }).join("");
        document.querySelectorAll(".native-select").forEach(function (sel) { sel.innerHTML = optHtml; });
        initCombobox(fromBox, "USD");
        initCombobox(toBox, "CNY");
        syncSymbols();
        renderSavedPairs();
        convert();
      }).catch(function () { showError("无法加载货币列表"); });
    }

    // 可搜索货币下拉（combobox）：输入即过滤，支持代码/中文/英文匹配 + 键盘导航
    function initCombobox(box, initialCode) {
      var input = box.querySelector(".combo-input");
      var panel = box.querySelector(".combo-panel");
      var arrow = box.querySelector(".combo-arrow");
      var nativeSel = box.parentNode.querySelector(".native-select");
      box.dataset.value = initialCode;
      input.value = displayText(initialCode);
      if (nativeSel) nativeSel.value = initialCode;

      function getFiltered(q) {
        q = (q || "").trim().toLowerCase();
        if (!q) return CURRENCIES;
        return CURRENCIES.filter(function (c) {
          return c.code.toLowerCase().indexOf(q) >= 0
            || c.cn.toLowerCase().indexOf(q) >= 0
            || c.name.toLowerCase().indexOf(q) >= 0;
        });
      }

      function render(list) {
        if (!list.length) {
          panel.innerHTML = '<div class="combo-empty">未找到匹配的货币</div>';
          return;
        }
        var cur = box.dataset.value;
        panel.innerHTML = list.map(function (c) {
          var sel = c.code === cur ? " active" : "";
          return '<div class="combo-item' + sel + '" data-code="' + c.code + '">'
            + '<span class="combo-item-sym">' + (c.symbol || "") + '</span>'
            + '<span class="combo-item-cn">' + c.cn + '</span>'
            + '<span class="combo-item-code">' + c.code + '</span>'
            + '</div>';
        }).join("");
      }

      function open() {
        closeAll(box);
        box.classList.add("open");
        if (arrow) arrow.setAttribute("aria-expanded", "true");
        render(getFiltered(""));
      }
      function close() {
        box.classList.remove("open");
        if (arrow) arrow.setAttribute("aria-expanded", "false");
      }

      function selectCode(code) {
        box.dataset.value = code;
        input.value = displayText(code);
        if (nativeSel) nativeSel.value = code;
        close();
        syncSymbols();
        syncQuickPairs();
        rememberCurrentPair();
        syncHistory();
        convertDebounced();
      }

      input.addEventListener("focus", function () { input.select(); });
      input.addEventListener("input", function () {
        if (!box.classList.contains("open")) {
          closeAll(box);
          box.classList.add("open");
          if (arrow) arrow.setAttribute("aria-expanded", "true");
        }
        render(getFiltered(input.value));
      });
      input.addEventListener("keydown", function (e) {
        var items = panel.querySelectorAll(".combo-item");
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (!box.classList.contains("open")) { open(); return; }
          if (!items.length) return;
          var idx = -1;
          items.forEach(function (it, i) { if (it.classList.contains("active")) idx = i; });
          idx = e.key === "ArrowDown" ? (idx + 1) % items.length : (idx - 1 + items.length) % items.length;
          items.forEach(function (it) { it.classList.remove("active"); });
          items[idx].classList.add("active");
          items[idx].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter") {
          e.preventDefault();
          var sel = panel.querySelector(".combo-item.active") || panel.querySelector(".combo-item");
          if (sel) selectCode(sel.dataset.code);
        } else if (e.key === "Escape") {
          e.preventDefault();
          input.value = displayText(box.dataset.value);
          close();
          input.blur();
        }
      });
      panel.addEventListener("click", function (e) {
        var item = e.target.closest(".combo-item");
        if (item) selectCode(item.dataset.code);
      });
      // 失焦延迟关闭，让选项点击先触发；并恢复当前选中值的显示
      input.addEventListener("blur", function () {
        setTimeout(function () {
          close();
          input.value = displayText(box.dataset.value);
        }, 150);
      });
      // 点击下拉箭头：展开/收起全部货币（桌面端入口）
      if (arrow) {
        arrow.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (box.classList.contains("open")) { close(); }
          else { open(); }
        });
      }
      // 移动端原生 select 切换：同步值并换算
      if (nativeSel) {
        nativeSel.addEventListener("change", function () {
          box.dataset.value = nativeSel.value;
          input.value = displayText(nativeSel.value);
          syncSymbols();
          syncQuickPairs();
          rememberCurrentPair();
          syncHistory();
          convertDebounced();
        });
      }
    }

    function closeAll(except) {
      document.querySelectorAll(".combobox.open").forEach(function (b) {
        if (b !== except) {
          b.classList.remove("open");
          var toggle = b.querySelector(".combo-arrow");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    // 点击下拉外部关闭
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".combobox")) closeAll(null);
    });

    function convert() {
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      var inputEl = activeSide === "from" ? fromAmountEl : toAmountEl;
      var outputEl = activeSide === "from" ? toAmountEl : fromAmountEl;
      var base = activeSide === "from" ? from : to;
      var quote = activeSide === "from" ? to : from;
      var amount = parseAmount(inputEl.value);
      if (!from || !to || !isFinite(amount) || amount < 0) {
        outputEl.value = "";
        rateEl.textContent = "输入金额后将自动换算";
        return;
      }
      clearError();
      var currentRequest = ++requestId;
      rateSummaryEl.classList.add("is-loading");
      rateEl.textContent = dateEl.value ? "正在获取指定日期的参考汇率…" : "正在获取最新参考汇率…";
      var url = "/convert?from=" + encodeURIComponent(base) + "&to=" + encodeURIComponent(quote) + "&amount=" + amount;
      if (dateEl.value) url += "&date=" + encodeURIComponent(dateEl.value);
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (currentRequest !== requestId) return;
        rateSummaryEl.classList.remove("is-loading");
        if (data.error) { showError(data.error); return; }
        outputEl.value = formatEditableAmount(data.result);
        rateEl.textContent = "1 " + data.from + " = " + data.rate + " " + data.to + " · 数据日期 " + data.date;
      }).catch(function () {
        if (currentRequest === requestId) {
          rateSummaryEl.classList.remove("is-loading");
          showError("网络错误，请重试");
        }
      });
    }

    var timer;
    function convertDebounced() { clearTimeout(timer); timer = setTimeout(convert, 300); }

    fromAmountEl.addEventListener("focus", function () { activeSide = "from"; });
    toAmountEl.addEventListener("focus", function () { activeSide = "to"; });
    fromAmountEl.addEventListener("input", function () { activeSide = "from"; formatAmountWhileTyping(fromAmountEl); convertDebounced(); });
    toAmountEl.addEventListener("input", function () { activeSide = "to"; formatAmountWhileTyping(toAmountEl); convertDebounced(); });
    [fromAmountEl, toAmountEl].forEach(function (input) {
      input.addEventListener("blur", function () {
        var amount = parseAmount(input.value);
        if (isFinite(amount)) input.value = formatEditableAmount(amount);
      });
    });
    // 整张金额卡片都是输入热区；货币选择控件维持自己的点击语义。
    document.querySelectorAll(".currency-field").forEach(function (field) {
      field.addEventListener("click", function (event) {
        // 直接点数字时交给浏览器定位插入光标，避免二次 focus 把光标送到首位。
        if (event.target.closest(".money-input, .combobox, .native-select")) return;
        var isFrom = field.dataset.amountSide === "from";
        activeSide = isFrom ? "from" : "to";
        (isFrom ? fromAmountEl : toAmountEl).focus({ preventScroll: true });
      });
    });
    // 同步某字段的 combobox 显示与原生 select 值
    function syncDisplay(box) {
      var code = box.dataset.value;
      box.querySelector(".combo-input").value = displayText(code);
      var sel = box.parentNode.querySelector(".native-select");
      if (sel) sel.value = code;
    }
    function applyPair(from, to, remember) {
      fromBox.dataset.value = from;
      toBox.dataset.value = to;
      syncDisplay(fromBox);
      syncDisplay(toBox);
      syncSymbols();
      syncQuickPairs();
      activeSide = "from";
      if (remember) rememberCurrentPair(); else renderSavedPairs();
      syncHistory();
      convert();
    }
    document.addEventListener("click", function (event) {
      if (event.target.closest("#clear-recent")) {
        var store = readPairStore();
        store.recent = [];
        writePairStore(store);
        renderSavedPairs();
        return;
      }
      var chip = event.target.closest(".pair-chip");
      if (chip) applyPair(chip.dataset.from, chip.dataset.to, true);
    });
    swapBtn.addEventListener("click", function () {
      var f = fromBox.dataset.value;
      fromBox.dataset.value = toBox.dataset.value;
      toBox.dataset.value = f;
      syncDisplay(fromBox);
      syncDisplay(toBox);
      var amount = fromAmountEl.value;
      fromAmountEl.value = toAmountEl.value;
      toAmountEl.value = amount;
      activeSide = "from";
      syncSymbols();
      syncQuickPairs();
      rememberCurrentPair();
      syncHistory();
      convert();
    });
    resetBtn.addEventListener("click", function () {
      fromBox.dataset.value = "USD";
      toBox.dataset.value = "CNY";
      fromAmountEl.value = "100";
      toAmountEl.value = "";
      activeSide = "from";
      syncDisplay(fromBox);
      syncDisplay(toBox);
      syncSymbols();
      syncQuickPairs();
      renderSavedPairs();
      syncHistory();
      clearError();
      convert();
      fromAmountEl.focus({ preventScroll: true });
    });

    dateEl.addEventListener("change", function () { convert(); });
    favoriteBtn.addEventListener("click", function () {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      var exists = store.favorites.some(function (item) { return pairId(item.from, item.to) === id; });
      store.favorites = exists ? store.favorites.filter(function (item) { return pairId(item.from, item.to) !== id; }) : [pair].concat(store.favorites).slice(0, 6);
      writePairStore(store);
      renderSavedPairs();
    });

    function setHistoryLoading(message) {
      historyChartEl.innerHTML = '<div class="history-empty">' + message + '</div>';
    }
    function renderHistory(points, from, to, animation) {
      if (!points || points.length < 2) { setHistoryLoading("该时间范围暂无可用参考数据"); return; }
      var width = 640, height = 210, inset = { top: 14, right: 16, bottom: 30, left: 16 };
      var values = points.map(function (point) { return Number(point.rate); }).filter(function (value) { return isFinite(value); });
      if (values.length < 2) { setHistoryLoading("该时间范围暂无可用参考数据"); return; }
      var rangeMin = Math.min.apply(null, values), rangeMax = Math.max.apply(null, values);
      var min = rangeMin, max = rangeMax, span = max - min || Math.max(max * 0.02, 0.01);
      min -= span * 0.12; max += span * 0.12;
      var innerWidth = width - inset.left - inset.right, innerHeight = height - inset.top - inset.bottom;
      var path = points.map(function (point, index) {
        var x = inset.left + innerWidth * index / (points.length - 1);
        var y = inset.top + (max - Number(point.rate)) / (max - min) * innerHeight;
        return (index ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
      }).join(" ");
      var positions = points.map(function (point, index) {
        return { x: inset.left + innerWidth * index / (points.length - 1), y: inset.top + (max - Number(point.rate)) / (max - min) * innerHeight };
      });
      var latest = points[points.length - 1];
      var latestRate = Number(latest.rate).toFixed(4);
      var dateIndexes = [0, Math.round((points.length - 1) / 3), Math.round((points.length - 1) * 2 / 3), points.length - 1].filter(function (index, position, list) { return list.indexOf(index) === position; });
      var dateLabels = dateIndexes.map(function (index, position) {
        var dateParts = points[index].date.split("-");
        var label = historyRange === "1W" ? Number(dateParts[1]) + "月" + Number(dateParts[2]) + "日" : Number(dateParts[1]) + "月";
        var anchor = position === 0 ? "start" : (position === dateIndexes.length - 1 ? "end" : "middle");
        var x = inset.left + innerWidth * index / (points.length - 1);
        return '<text x="' + x.toFixed(2) + '" y="' + (height - 8) + '" fill="#86868b" font-size="11" text-anchor="' + anchor + '">' + label + '</text>';
      }).join("");
      var gridLines = [0, 0.5, 1].map(function (ratio) {
        var y = inset.top + innerHeight * ratio;
        return '<line x1="' + inset.left + '" y1="' + y.toFixed(2) + '" x2="' + (width - inset.right) + '" y2="' + y.toFixed(2) + '" stroke="rgba(0,0,0,.09)"/>';
      }).join("");
      var areaPath = path + "L " + positions[positions.length - 1].x.toFixed(2) + " " + (height - inset.bottom) + "L " + positions[0].x.toFixed(2) + " " + (height - inset.bottom) + "Z";
      var latestPosition = positions[positions.length - 1];
      historyQuoteEl.innerHTML = '<span class="history-quote-label">1 ' + from + ' =</span><strong class="history-quote-value">' + latestRate + " " + to + "</strong>";
      historyNoteEl.textContent = "参考区间 " + rangeMin.toFixed(4) + "–" + rangeMax.toFixed(4) + " · " + points[0].date + " 至 " + latest.date;
      var oldTooltip = $("history-tooltip");
      if (oldTooltip) oldTooltip.remove();
      document.body.insertAdjacentHTML("beforeend", '<div id="history-tooltip" class="chart-tooltip" role="status"></div>');
      historyChartEl.innerHTML = '<svg id="history-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + from + " 到 " + to + ' 的参考汇率走势。移动鼠标查看每个日期的价格。"><defs><linearGradient id="history-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0071e3" stop-opacity=".20"/><stop offset="100%" stop-color="#0071e3" stop-opacity="0"/></linearGradient><clipPath id="history-area-clip"><rect id="history-area-reveal" x="' + inset.left + '" y="' + inset.top + '" width="' + innerWidth + '" height="' + innerHeight + '"/></clipPath></defs>' + gridLines + '<path id="history-area" d="' + areaPath + '" fill="url(#history-area-gradient)" clip-path="url(#history-area-clip)"/><path id="history-line" d="' + path + '" fill="none" stroke="#0071e3" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle id="history-latest-dot" cx="' + latestPosition.x.toFixed(2) + '" cy="' + latestPosition.y.toFixed(2) + '" r="4.5" fill="#0071e3" stroke="#fff" stroke-width="2"/><g id="history-cursor" class="chart-cursor" hidden><line id="history-cursor-line" y1="' + inset.top + '" y2="' + (height - inset.bottom) + '" stroke="#0071e3" stroke-width="1" stroke-dasharray="3 3"/><circle id="history-cursor-dot" r="5" fill="#fff" stroke="#0071e3" stroke-width="3"/></g>' + dateLabels + '</svg>';
      var svg = $("history-svg"), line = $("history-line"), areaReveal = $("history-area-reveal"), latestDot = $("history-latest-dot"), tooltip = $("history-tooltip"), cursor = $("history-cursor"), cursorLine = $("history-cursor-line"), cursorDot = $("history-cursor-dot");
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      function pathFromPositions(list) {
        return list.map(function (position, index) { return (index ? "L" : "M") + position.x.toFixed(2) + " " + position.y.toFixed(2); }).join(" ");
      }
      if (!reduceMotion && animation === "draw") {
        // 从左端进入；先提交隐藏帧，避免浏览器合并起止状态。
        line.setAttribute("d", pathFromPositions(positions));
        var lineLength = line.getTotalLength();
        var drawDuration = 1050;
        line.style.transition = "none";
        line.style.strokeDasharray = String(lineLength);
        line.style.strokeDashoffset = String(lineLength);
        areaReveal.setAttribute("width", "0");
        latestDot.style.opacity = "0";
        line.getBoundingClientRect();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            line.style.transition = "stroke-dashoffset " + drawDuration + "ms cubic-bezier(0.22, 1, 0.36, 1)";
            line.style.strokeDashoffset = "0";
            var areaStartedAt;
            function revealArea(now) {
              if (!areaStartedAt) areaStartedAt = now;
              var progress = Math.min(1, (now - areaStartedAt) / drawDuration);
              var eased = 1 - Math.pow(1 - progress, 4);
              areaReveal.setAttribute("width", String(innerWidth * eased));
              if (progress < 1) requestAnimationFrame(revealArea);
            }
            requestAnimationFrame(revealArea);
            window.setTimeout(function () {
              latestDot.style.transition = "opacity 160ms ease-out";
              latestDot.style.opacity = "1";
            }, drawDuration - 120);
          });
        });
      }
      var activeIndex = points.length - 1;
      function placeTooltip(clientX, clientY) {
        tooltip.style.left = clientX + "px";
        tooltip.style.top = clientY + "px";
        tooltip.classList.remove("is-left");
        var tooltipWidth = tooltip.offsetWidth;
        if (clientX + tooltipWidth + 20 > window.innerWidth) tooltip.classList.add("is-left");
      }
      function showPoint(index, clientX, clientY) {
        activeIndex = Math.max(0, Math.min(points.length - 1, index));
        var point = points[activeIndex];
        var x = inset.left + innerWidth * activeIndex / (points.length - 1);
        var y = inset.top + (max - Number(point.rate)) / (max - min) * innerHeight;
        cursor.removeAttribute("hidden");
        cursorLine.setAttribute("x1", x); cursorLine.setAttribute("x2", x);
        cursorDot.setAttribute("cx", x); cursorDot.setAttribute("cy", y);
        tooltip.textContent = point.date + " · 1 " + from + " = " + Number(point.rate).toFixed(4) + " " + to;
        tooltip.classList.add("is-visible");
        if (clientX === undefined || clientY === undefined) {
          var svgRect = svg.getBoundingClientRect();
          clientX = svgRect.left + x / width * svgRect.width;
          clientY = svgRect.top + y / height * svgRect.height;
        }
        placeTooltip(clientX, clientY);
      }
      function hidePoint() { cursor.setAttribute("hidden", ""); tooltip.classList.remove("is-visible"); }
      svg.addEventListener("pointermove", function (event) {
        var rect = svg.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width * width;
        var y = (event.clientY - rect.top) / rect.height * height;
        if (x < inset.left || x > width - inset.right || y < inset.top || y > height - inset.bottom) {
          hidePoint();
          return;
        }
        showPoint(Math.round((x - inset.left) / innerWidth * (points.length - 1)), event.clientX, event.clientY);
      });
      svg.addEventListener("pointerleave", hidePoint);
    }
    function loadHistory(animation) {
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      if (!from || !to) return;
      var id = ++historyRequestId;
      setHistoryLoading("正在加载参考走势…");
      fetch("/history?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to) + "&range=" + historyRange).then(function (response) { return response.json(); }).then(function (data) {
        if (id !== historyRequestId) return;
        if (data.error) { setHistoryLoading(data.error); return; }
        renderHistory(data.points, from, to, animation || "draw");
      }).catch(function () { if (id === historyRequestId) setHistoryLoading("走势加载失败，请稍后重试"); });
    }
    historyToggleEl.addEventListener("click", function () {
      var opening = !historyEl.classList.contains("is-open");
      if (opening) {
        historyEl.hidden = false;
        historyContentEl.inert = false;
        requestAnimationFrame(function () { historyEl.classList.add("is-open"); });
      } else {
        historyEl.classList.remove("is-open");
        historyContentEl.inert = true;
        var floatingTooltip = $("history-tooltip");
        if (floatingTooltip) floatingTooltip.classList.remove("is-visible");
        setTimeout(function () { if (!historyEl.classList.contains("is-open")) historyEl.hidden = true; }, 400);
      }
      historyEl.setAttribute("aria-hidden", opening ? "false" : "true");
      historyToggleEl.setAttribute("aria-expanded", opening ? "true" : "false");
      historyToggleEl.textContent = opening ? "收起走势" : "走势";
      if (opening) loadHistory("draw");
    });
    document.querySelectorAll(".history-range").forEach(function (button) {
      button.addEventListener("click", function () {
        historyRange = button.dataset.range;
        document.querySelectorAll(".history-range").forEach(function (item) { item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
        loadHistory("draw");
      });
    });

    loadCurrencies();
  </script>
</body>
</html>`;

// ---------- 入口 ----------

export default {
  async fetch(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const { pathname } = url;

    try {
      switch (pathname) {
        case "/":
          return new Response(HOME_HTML, {
            headers: { "Content-Type": "text/html;charset=utf-8", ...CORS_HEADERS },
          });
        case "/convert":
          return await handleConvert(url, ctx);
        case "/history":
          return await handleHistory(url, ctx);
        case "/latest":
          return await handleLatest(url, ctx);
        case "/currencies":
          return await handleCurrencies(ctx);
        case "/health":
          return json({ status: "ok", upstream: UPSTREAM, time: today() });
        case "/api":
          return json({
            name: "currency-worker",
            endpoints: {
              convert: "/convert?from=USD&to=CNY&amount=100",
              history: "/history?from=USD&to=CNY&range=1M",
              latest: "/latest?base=USD",
              currencies: "/currencies",
              health: "/health",
            },
            source: UPSTREAM,
            cache_ttl: CACHE_TTL_SECONDS,
          });
        default:
          return json({ error: "Not found", see: "/api" }, 404);
      }
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },
};
