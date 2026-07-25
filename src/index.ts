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
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>汇率换算 · Currency</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --color-primary: #0066cc;
    --color-primary-focus: #0071e3;
    --color-primary-on-dark: #2997ff;
    --color-ink: #1d1d1f;
    --color-ink-muted-80: #333333;
    --color-ink-muted-48: #7a7a7a;
    --color-canvas: #ffffff;
    --color-parchment: #f5f5f7;
    --color-pearl: #fafafc;
    --color-hairline: #e0e0e0;
    --color-divider-soft: #f0f0f0;
    --color-black: #000000;
    --color-on-dark: #ffffff;
    --color-body-muted: #cccccc;
    --color-tile-dark: #272729;
    --radius-sm: 8px;
    --radius-lg: 18px;
    --radius-pill: 9999px;
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
    letter-spacing: -0.374px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* global-nav: surface-black, 44px */
  .global-nav {
    background: var(--color-black);
    color: var(--color-on-dark);
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 22px;
    font-size: 12px;
    letter-spacing: -0.12px;
  }
  .global-nav span { opacity: 0.92; }

  /* hero tile: parchment */
  .hero {
    background: var(--color-parchment);
    padding: 80px 22px 56px;
    text-align: center;
  }
  .hero h1 {
    font-family: var(--font-display);
    font-size: 56px;
    font-weight: 600;
    line-height: 1.07;
    letter-spacing: -0.28px;
    max-width: 980px;
    margin: 0 auto;
  }
  .hero .lead {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 400;
    line-height: 1.14;
    letter-spacing: 0.196px;
    color: var(--color-ink-muted-80);
    margin: 17px auto 0;
    max-width: 720px;
  }

  /* converter card: store-utility-card */
  .converter-wrap {
    background: var(--color-parchment);
    padding: 0 22px 80px;
    display: flex;
    justify-content: center;
  }
  .converter-card {
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-lg);
    padding: 24px;
    width: 100%;
    max-width: 720px;
  }
  .amount-row { margin-bottom: 24px; }
  .amount-label {
    font-size: 14px;
    color: var(--color-ink-muted-48);
    letter-spacing: -0.224px;
    margin-bottom: 8px;
    padding-left: 4px;
  }
  .amount-input {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 600;
    line-height: 1.1;
    color: var(--color-ink);
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    letter-spacing: 0;
    padding: 8px 0;
  }
  .amount-input::placeholder { color: var(--color-ink-muted-48); }
  .amount-input::-webkit-outer-spin-button,
  .amount-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
  .amount-input { -moz-appearance: textfield; appearance: textfield; }

  .pair-row {
    display: grid;
    grid-template-columns: 1fr 44px 1fr;
    gap: 12px;
    align-items: end;
    margin-bottom: 24px;
  }
  .currency-field { display: flex; flex-direction: column; gap: 6px; }
  .currency-field label {
    font-size: 14px;
    color: var(--color-ink-muted-48);
    letter-spacing: -0.224px;
    padding-left: 4px;
  }
  /* combobox: 可搜索货币下拉（Apple search-input pill 规范） */
  .combobox { position: relative; }
  .combo-input {
    font-family: var(--font-text);
    font-size: 17px;
    color: var(--color-ink);
    background-color: var(--color-canvas);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: var(--radius-pill);
    padding: 12px 40px 12px 20px;
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
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    color: var(--color-ink);
    pointer-events: none;
  }
  .combo-panel {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: 300px;
    overflow-y: auto;
    background: var(--color-canvas);
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    padding: 6px;
    z-index: 30;
    display: none;
  }
  .combobox.open .combo-panel { display: block; }
  .combo-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .combo-item:hover,
  .combo-item.active { background: var(--color-parchment); }
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

  /* swap button: icon-circular (pearl variant for light bg) */
  .swap-btn {
    width: 44px;
    height: 44px;
    border-radius: 9999px;
    background: var(--color-pearl);
    border: 1px solid var(--color-divider-soft);
    color: var(--color-ink);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease;
  }
  .swap-btn:active { transform: scale(0.95); }
  .swap-btn svg { width: 18px; height: 18px; }

  /* result block */
  .result {
    background: var(--color-parchment);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 24px;
  }
  .result-label {
    font-size: 14px;
    color: var(--color-ink-muted-48);
    letter-spacing: -0.224px;
    margin-bottom: 8px;
  }
  .result-value {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: 0;
    word-break: break-word;
  }
  .result-rate {
    font-size: 14px;
    color: var(--color-ink-muted-48);
    margin-top: 8px;
    letter-spacing: -0.224px;
  }

  /* primary button: Action Blue pill */
  .btn-primary {
    font-family: var(--font-text);
    font-size: 17px;
    font-weight: 400;
    color: var(--color-on-dark);
    background: var(--color-primary);
    border: none;
    border-radius: var(--radius-pill);
    padding: 11px 22px;
    cursor: pointer;
    width: 100%;
    transition: transform 0.15s ease;
  }
  .btn-primary:active { transform: scale(0.95); }
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-primary-focus);
    outline-offset: 2px;
  }
  .error { color: #d33; font-size: 14px; margin-top: 12px; letter-spacing: -0.224px; }

  /* features tile: dark */
  .features {
    background: var(--color-tile-dark);
    color: var(--color-on-dark);
    padding: 80px 22px;
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
    gap: 24px;
  }
  .feature { text-align: center; }
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

  /* API section: light */
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
  .api-endpoint {
    background: var(--color-parchment);
    border-radius: var(--radius-lg);
    padding: 24px;
    margin-bottom: 17px;
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
    .hero h1 { font-size: 40px; }
    .feature-grid { grid-template-columns: 1fr; gap: 32px; }
    .pair-row { grid-template-columns: 1fr; }
    .swap-btn { margin: 0 auto; transform: rotate(90deg); }
    .swap-btn:active { transform: rotate(90deg) scale(0.95); }
  }
  @media (max-width: 419px) {
    .hero { padding: 48px 22px 32px; }
    .hero h1 { font-size: 28px; }
    .hero .lead { font-size: 21px; }
    .amount-input { font-size: 32px; }
    .result-value { font-size: 32px; }
    .features, .api-section { padding: 48px 22px; }
  }
</style>
</head>
<body>
  <nav class="global-nav"><span>Currency · 汇率换算</span></nav>

  <section class="hero">
    <h1>汇率换算，简洁如 Apple。</h1>
    <p class="lead">基于 Frankfurter 开源数据，覆盖 <span id="hero-count">165</span> 种货币，免费、无需 API Key。</p>
  </section>

  <div class="converter-wrap">
    <div class="converter-card">
      <div class="amount-row">
        <div class="amount-label">金额</div>
        <input id="amount" class="amount-input" type="number" inputmode="decimal" value="100" min="0" step="0.01" placeholder="0">
      </div>
      <div class="pair-row">
        <div class="currency-field">
          <label>从</label>
          <div class="combobox" data-field="from">
            <input type="text" class="combo-input" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="从货币">
            <svg class="combo-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            <div class="combo-panel" role="listbox"></div>
          </div>
        </div>
        <button id="swap" class="swap-btn" type="button" title="交换货币" aria-label="交换货币">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 5l4 3-4 3M20 16H6M10 13l-4 3 4 3"/></svg>
        </button>
        <div class="currency-field">
          <label>到</label>
          <div class="combobox" data-field="to">
            <input type="text" class="combo-input" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="到货币">
            <svg class="combo-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
            <div class="combo-panel" role="listbox"></div>
          </div>
        </div>
      </div>
      <div class="result">
        <div class="result-label">换算结果</div>
        <div id="result-value" class="result-value">—</div>
        <div id="result-rate" class="result-rate"></div>
      </div>
      <button id="convert-btn" class="btn-primary" type="button">换算</button>
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
    var amountEl = $("amount");
    var resultEl = $("result-value"), rateEl = $("result-rate");
    var errEl = $("error"), convertBtn = $("convert-btn"), swapBtn = $("swap");
    var fromBox = document.querySelector('[data-field="from"]');
    var toBox = document.querySelector('[data-field="to"]');
    var CURRENCIES = []; // {code, name, cn}

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
        initCombobox(fromBox, "USD");
        initCombobox(toBox, "CNY");
        convert();
      }).catch(function () { showError("无法加载货币列表"); });
    }

    // 可搜索货币下拉（combobox）：输入即过滤，支持代码/中文/英文匹配 + 键盘导航
    function initCombobox(box, initialCode) {
      var input = box.querySelector(".combo-input");
      var panel = box.querySelector(".combo-panel");
      box.dataset.value = initialCode;
      input.value = displayText(initialCode);

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

      function open() { closeAll(box); box.classList.add("open"); render(getFiltered("")); }
      function close() { box.classList.remove("open"); }

      function selectCode(code) {
        box.dataset.value = code;
        input.value = displayText(code);
        close();
        convert();
      }

      input.addEventListener("focus", function () { open(); input.select(); });
      input.addEventListener("input", function () {
        if (!box.classList.contains("open")) box.classList.add("open");
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
    }

    function closeAll(except) {
      document.querySelectorAll(".combobox.open").forEach(function (b) {
        if (b !== except) b.classList.remove("open");
      });
    }
    // 点击下拉外部关闭
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".combobox")) closeAll(null);
    });

    function convert() {
      var amount = parseFloat(amountEl.value);
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      if (!from || !to || !isFinite(amount) || amount < 0) {
        resultEl.textContent = "—";
        rateEl.textContent = "";
        return;
      }
      clearError();
      var url = "/convert?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to) + "&amount=" + amount;
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (data.error) { showError(data.error); return; }
        resultEl.textContent = data.result.toLocaleString("zh-CN", { maximumFractionDigits: 4 }) + " " + data.to;
        rateEl.textContent = "1 " + data.from + " = " + data.rate + " " + data.to + " · 更新于 " + data.date;
      }).catch(function () { showError("网络错误，请重试"); });
    }

    var timer;
    function convertDebounced() { clearTimeout(timer); timer = setTimeout(convert, 300); }

    convertBtn.addEventListener("click", convert);
    amountEl.addEventListener("input", convertDebounced);
    swapBtn.addEventListener("click", function () {
      var f = fromBox.dataset.value;
      fromBox.dataset.value = toBox.dataset.value;
      toBox.dataset.value = f;
      fromBox.querySelector(".combo-input").value = displayText(fromBox.dataset.value);
      toBox.querySelector(".combo-input").value = displayText(toBox.dataset.value);
      convert();
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
