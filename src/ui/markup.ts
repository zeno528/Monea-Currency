export const HOME_MARKUP = String.raw`
</head>
<body>
  <nav class="global-nav">
    <a class="brand" href="/" aria-label="Monea Currency 汇率换算首页">
      <img src="/currency-logo.svg" alt="" width="20" height="20">
      <span>Monea Currency · 汇率换算</span>
    </a>
  </nav>

  <section class="hero">
    <p class="eyebrow">
      <span class="eyebrow-dot" aria-hidden="true"></span>
      <span>今日汇率</span>
    </p>
    <h1 id="hero-title">美元兑换人民币</h1>
    <p id="hero-rate" class="hero-rate" aria-live="polite">正在获取最新参考汇率…</p>
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
        <button class="pair-chip" type="button" data-from="EUR" data-to="CNY" aria-pressed="false">欧元 · 人民币</button>
        <button class="pair-chip" type="button" data-from="JPY" data-to="CNY" aria-pressed="false">日元 · 人民币</button>
      </div>
      <div id="saved-pairs" class="saved-pairs" aria-label="收藏和最近使用的货币组合"></div>
      <div class="pair-row">
        <div class="field-group" data-amount-side="from">
          <label class="field-label" for="from-amount">金额</label>
          <div class="currency-field">
            <div class="money-input-wrap">
              <span id="from-symbol" class="money-symbol" aria-hidden="true">$</span>
              <input id="from-amount" class="money-input" type="text" inputmode="decimal" value="100" placeholder="0" aria-label="从货币金额">
            </div>
            <div class="combobox" data-field="from" data-value="USD">
              <span class="combo-selected-flag" aria-hidden="true"></span>
              <input type="text" class="combo-input" value="$ 美元 (USD)" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="从货币">
              <button class="combo-arrow" type="button" aria-label="展开从货币列表" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
              <div class="combo-panel" role="listbox"><div class="combo-scroll"></div></div>
            </div>
          </div>
        </div>
        <button id="swap" class="swap-btn" type="button" title="交换货币" aria-label="交换货币">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h14M14 5l4 3-4 3M20 16H6M10 13l-4 3 4 3"/></svg>
        </button>
        <div class="field-group" data-amount-side="to">
          <label class="field-label" for="to-amount">换算为</label>
          <div class="currency-field">
            <div class="money-input-wrap">
              <span id="to-symbol" class="money-symbol" aria-hidden="true">¥</span>
              <input id="to-amount" class="money-input" type="text" inputmode="decimal" value="" placeholder="0" aria-label="到货币金额">
            </div>
            <div class="combobox" data-field="to" data-value="CNY">
              <span class="combo-selected-flag" aria-hidden="true"></span>
              <input type="text" class="combo-input" value="¥ 人民币 (CNY)" placeholder="搜索货币…" autocomplete="off" spellcheck="false" aria-label="到货币">
              <button class="combo-arrow" type="button" aria-label="展开到货币列表" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
              <div class="combo-panel" role="listbox"><div class="combo-scroll"></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="rate-summary">
        <span id="result-rate" class="rate-text" aria-live="polite">输入金额后将自动换算</span>
        <div class="summary-actions">
          <button id="history-toggle" class="reset-btn history-btn" type="button" aria-expanded="false">汇率走势图</button>
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
              <button class="history-range" type="button" data-range="1M" aria-pressed="true">1个月</button>
              <button class="history-range" type="button" data-range="6M" aria-pressed="false">6个月</button>
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
    数据由 <a href="https://frankfurter.dev" target="_blank" rel="noopener">Frankfurter</a> 提供 · 部署于 Cloudflare Workers · <a href="https://github.com/zeno528/Monea-Currency" target="_blank" rel="noopener">GitHub 仓库</a>
    <div class="footer-divider"></div>
    汇率仅供参考，不构成交易建议。© 2026 Monea Currency
  </footer>

`;
