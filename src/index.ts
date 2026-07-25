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
  .currency-select {
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
  .currency-select:focus {
    outline: 2px solid var(--color-primary-focus);
    outline-offset: 2px;
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
    <p class="lead">基于 Frankfurter 开源数据，覆盖 201 种货币，免费、无需 API Key。</p>
  </section>

  <div class="converter-wrap">
    <div class="converter-card">
      <div class="amount-row">
        <div class="amount-label">金额</div>
        <input id="amount" class="amount-input" type="number" inputmode="decimal" value="100" min="0" step="0.01" placeholder="0">
      </div>
      <div class="pair-row">
        <div class="currency-field">
          <label for="from">从</label>
          <select id="from" class="currency-select"></select>
        </div>
        <button id="swap" class="swap-btn" type="button" title="交换货币" aria-label="交换货币">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/></svg>
        </button>
        <div class="currency-field">
          <label for="to">到</label>
          <select id="to" class="currency-select"></select>
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
        <div class="feature-num">201</div>
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
    var $ = function (id) { return document.getElementById(id); };
    var amountEl = $("amount"), fromEl = $("from"), toEl = $("to");
    var resultEl = $("result-value"), rateEl = $("result-rate");
    var errEl = $("error"), convertBtn = $("convert-btn"), swapBtn = $("swap");

    function showError(msg) { errEl.textContent = msg; errEl.hidden = false; }
    function clearError() { errEl.hidden = true; }

    function loadCurrencies() {
      fetch("/currencies").then(function (r) { return r.json(); }).then(function (data) {
        var codes = Object.keys(data.currencies).sort();
        var html = "";
        for (var i = 0; i < codes.length; i++) {
          var code = codes[i];
          html += '<option value="' + code + '">' + code + " · " + data.currencies[code].name + "</option>";
        }
        fromEl.innerHTML = html;
        toEl.innerHTML = html;
        fromEl.value = "USD";
        toEl.value = "CNY";
        convert();
      }).catch(function () { showError("无法加载货币列表"); });
    }

    function convert() {
      var amount = parseFloat(amountEl.value);
      var from = fromEl.value, to = toEl.value;
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
    fromEl.addEventListener("change", convert);
    toEl.addEventListener("change", convert);
    swapBtn.addEventListener("click", function () {
      var f = fromEl.value; fromEl.value = toEl.value; toEl.value = f; convert();
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
