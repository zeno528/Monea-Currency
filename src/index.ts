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
  const amount = amountParam === null ? 1 : parseFloat(amountParam);
  if (!Number.isFinite(amount) || amount < 0) {
    return json({ error: "Invalid amount" }, 400);
  }

  // 同币种直接返回，避免上游 404
  if (from === to) {
    return json({ from, to, amount, rate: 1, result: amount, date: today() });
  }

  const resp = await cachedFetch(`${UPSTREAM}/rate/${from}/${to}`, ctx);
  if (!resp.ok) return upstreamError(resp);
  const data: RateEntry = await resp.json();
  const result = +(amount * data.rate).toFixed(4);
  return json({ from: data.base, to: data.quote, amount, rate: data.rate, result, date: data.date });
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
    background: radial-gradient(circle at 50% 0%, #ffffff 0, #f5f5f7 52%, #ececf1 100%);
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
    background: linear-gradient(#f5f5f7, #ffffff 84%);
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
    max-width: 820px;
  }
  .converter-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 18px;
  }
  .converter-title { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
  .converter-hint { color: var(--color-ink-muted-48); font-size: 13px; }
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
  .combo-arrow svg { width: 18px; height: 18px; pointer-events: none; }
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
    display: none;
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
  .combobox.open .combo-panel { display: block; }
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
  .reset-btn {
    margin-left: auto;
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
    <p class="lead">基于 Frankfurter 开源数据，覆盖 <span id="hero-count">165</span> 种货币，免费、无需 API Key。</p>
  </section>

  <div class="converter-wrap">
    <div class="converter-card">
      <div class="converter-topline">
        <h2 class="converter-title">开始换算</h2>
        <p class="converter-hint">修改金额或选择货币，结果自动更新</p>
      </div>
      <div class="quick-pairs" aria-label="常用货币组合">
        <button class="pair-chip" type="button" data-from="USD" data-to="CNY" aria-pressed="true">美元 · 人民币</button>
        <button class="pair-chip" type="button" data-from="CNY" data-to="USD" aria-pressed="false">人民币 · 美元</button>
        <button class="pair-chip" type="button" data-from="EUR" data-to="CNY" aria-pressed="false">欧元 · 人民币</button>
        <button class="pair-chip" type="button" data-from="JPY" data-to="CNY" aria-pressed="false">日元 · 人民币</button>
      </div>
      <div class="pair-row">
        <div class="currency-field" data-amount-side="from">
          <label>从</label>
          <div class="money-input-wrap">
            <span id="from-symbol" class="money-symbol" aria-hidden="true">$</span>
            <input id="from-amount" class="money-input" type="number" inputmode="decimal" value="100" min="0" step="any" placeholder="0" aria-label="从货币金额">
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
            <input id="to-amount" class="money-input" type="number" inputmode="decimal" value="" min="0" step="any" placeholder="0" aria-label="到货币金额">
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
        <button id="reset" class="reset-btn" type="button" title="恢复默认换算" aria-label="重置为 100 美元换算人民币">↺ 重置</button>
      </div>
      <div id="error" class="error" hidden></div>
    </div>
  </div>

  <section class="features">
    <h2>为何选择它</h2>
    <div class="feature-grid">
      <div class="feature">
        <div class="feature-num" id="currency-count">165</div>
        <div class="feature-title">种货币</div>
        <div class="feature-desc">覆盖全球主要与新兴市场货币，来自 84 个央行参考汇率。</div>
      </div>
      <div class="feature">
        <div class="feature-num">0</div>
        <div class="feature-title">API Key</div>
        <div class="feature-desc">完全开放，无需注册，无需密钥，直接调用。</div>
      </div>
      <div class="feature">
        <div class="feature-num">1h</div>
        <div class="feature-title">边缘缓存</div>
        <div class="feature-desc">Cloudflare 边缘节点缓存一小时，响应低延迟。</div>
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
    数据由 <a href="https://frankfurter.dev" target="_blank" rel="noopener">Frankfurter</a> 提供 · 部署于 Cloudflare Workers
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
    var rateSummaryEl = document.querySelector(".rate-summary");
    var fromBox = document.querySelector('[data-field="from"]');
    var toBox = document.querySelector('[data-field="to"]');
    var CURRENCIES = []; // {code, name, cn}
    var activeSide = "from";
    var requestId = 0;

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
      return Number(amount).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 4 });
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
        syncQuickPairs();
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
      var amount = parseFloat(inputEl.value);
      if (!from || !to || !isFinite(amount) || amount < 0) {
        outputEl.value = "";
        rateEl.textContent = "输入金额后将自动换算";
        return;
      }
      clearError();
      var currentRequest = ++requestId;
      rateSummaryEl.classList.add("is-loading");
      rateEl.textContent = "正在获取最新参考汇率…";
      var url = "/convert?from=" + encodeURIComponent(base) + "&to=" + encodeURIComponent(quote) + "&amount=" + amount;
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (currentRequest !== requestId) return;
        rateSummaryEl.classList.remove("is-loading");
        if (data.error) { showError(data.error); return; }
        outputEl.value = formatEditableAmount(data.result);
        rateEl.textContent = "1 " + data.from + " = " + data.rate + " " + data.to + " · 更新于 " + data.date;
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
    fromAmountEl.addEventListener("input", function () { activeSide = "from"; convertDebounced(); });
    toAmountEl.addEventListener("input", function () { activeSide = "to"; convertDebounced(); });
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
    document.querySelectorAll(".pair-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        fromBox.dataset.value = chip.dataset.from;
        toBox.dataset.value = chip.dataset.to;
        syncDisplay(fromBox);
        syncDisplay(toBox);
        syncSymbols();
        syncQuickPairs();
        activeSide = "from";
        convert();
      });
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
      clearError();
      convert();
      fromAmountEl.focus({ preventScroll: true });
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
