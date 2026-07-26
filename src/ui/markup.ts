export const HOME_MARKUP = String.raw`
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
        <h2 class="converter-title"><svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.25"/><path d="M6.5 10.25h.01M17.5 13.75h.01"/></svg>开始换算</h2>
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

`;

