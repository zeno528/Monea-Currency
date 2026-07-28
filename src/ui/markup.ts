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
      <span>央行参考汇率 · 多源混合</span>
    </p>
    <h1 id="hero-title">USD 兑换 CNY</h1>
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
        <span class="quick-pairs-label">常用组合</span>
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
        <span class="rate-spinner" aria-hidden="true"></span>
        <span id="result-rate" class="rate-text" aria-live="polite">输入金额后将自动换算</span>
        <div class="summary-actions">
          <button id="history-toggle" class="btn btn-primary history-btn" type="button" aria-expanded="false">
            <span>查看图表</span>
            <svg class="history-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <button id="reset" class="btn btn-secondary" type="button" title="恢复默认换算" aria-label="重置为 100 美元换算人民币">重置 ↺</button>
        </div>
      </div>
      <div id="error" class="error" role="status" aria-live="polite" hidden>
        <span id="error-text"></span>
        <button id="rate-retry" class="error-retry" type="button" hidden>重试</button>
      </div>
      <section id="history" class="history" aria-label="参考汇率走势" aria-hidden="true" hidden>
        <div id="history-content" class="history-content" inert>
          <div class="history-head">
            <div><h3 class="history-title"><svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 17l5-5 4 3 7-8"/><path d="M16 7h4v4"/></svg>参考汇率走势</h3><p id="history-quote" class="history-quote" hidden></p><p id="history-note" class="history-note" hidden></p></div>
            <div class="history-ranges" aria-label="走势时间范围">
              <button class="history-range" type="button" data-range="1D" aria-pressed="false">1天</button>
              <button class="history-range" type="button" data-range="1W" aria-pressed="false">1周</button>
              <button class="history-range" type="button" data-range="1M" aria-pressed="true">1个月</button>
              <button class="history-range" type="button" data-range="6M" aria-pressed="false">6个月</button>
              <button class="history-range" type="button" data-range="1Y" aria-pressed="false">1年</button>
              <button class="history-range" type="button" data-range="2Y" aria-pressed="false">2年</button>
              <button class="history-range" type="button" data-range="5Y" aria-pressed="false">5年</button>
            </div>
          </div>
          <div id="history-chart" class="history-chart" aria-live="polite"></div>
        </div>
      </section>
    </div>
  </div>

  <section class="features">
    <h2>全球货币，轻松换算</h2>
    <div class="feature-grid">
      <div class="feature">
        <div class="feature-num" id="currency-count">165</div>
        <div class="feature-title">种可选货币</div>
        <div class="feature-desc">覆盖人民币、美元、欧元、日元等常用货币，可按中文、英文或代码搜索。</div>
      </div>
      <div class="feature">
        <div class="feature-num">84</div>
        <div class="feature-title">家中央银行</div>
        <div class="feature-desc">数据由 Frankfurter 汇聚多家中央银行公开参考汇率提供，默认显示综合参考结果。</div>
      </div>
      <div class="feature">
        <div class="feature-num">Daily</div>
        <div class="feature-title">参考数据更新</div>
        <div class="feature-desc">参考汇率通常按日更新，数据日期可见。<br>相同查询最长缓存 1 小时。</div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div class="footer-identity">
          <div class="footer-brand">Monea Currency</div>
          <a href="https://github.com/zeno528/" target="_blank" rel="noopener" class="footer-author-link">by Scott Z</a>
        </div>
        <nav class="footer-links" aria-label="页脚链接">
          <a href="https://frankfurter.dev" target="_blank" rel="noopener">数据来源 Frankfurter</a>
        </nav>
      </div>
      <p class="footer-star">此项目完全开源、免费。如果它帮到了你，欢迎在GitHub上 <a href="https://github.com/zeno528/Monea-Currency" target="_blank" rel="noopener">点个 Star<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>，这是对我最大的鼓励。</p>
      <p class="footer-notice">参考汇率由 Frankfurter 汇聚的多家中央银行公开数据提供，并非实时交易报价；仅供参考，不构成交易建议。</p>
      <div class="footer-bottom">
        <span>© 2026 Monea Currency</span>
        <a href="https://dash.cloudflare.com/?to=/:account/workers" target="_blank" rel="noopener">Cloudflare 安全支持</a>
      </div>
    </div>
  </footer>

`;
