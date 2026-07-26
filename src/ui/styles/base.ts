export const BASE_STYLES = String.raw`
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
  .saved-pair-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 7px;
  }
  .saved-pair-label { min-width: 26px; color: var(--color-ink-muted-48); font-size: 12px; }
  .saved-pair-track { display: flex; flex-wrap: wrap; gap: 7px; min-width: 0; }
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
    padding: 12px 80px 12px 20px;
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
    top: 0;
    bottom: 0;
    width: 72px;
    padding: 0 13px 0 0;
    border: 0;
    background: transparent;
    color: var(--color-ink);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .combo-arrow:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; border-radius: 0 var(--radius-pill) var(--radius-pill) 0; }
  .combo-arrow svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
    transform-origin: center;
    transition: transform 180ms var(--ease-out);
  }
  .combobox.open .combo-arrow svg { transform: rotate(180deg); }
  .combo-panel {
    --combo-panel-max-height: 300px;
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: var(--combo-panel-max-height);
    overflow: hidden;
    /* 下拉菜单必须是独立实底层，避免与金额卡片叠色。 */
    background: #ffffff;
    border: 1px solid var(--color-hairline);
    border-radius: var(--radius-lg);
    box-shadow: 0 18px 35px rgba(0, 0, 0, 0.14);
    padding: 10px 4px 10px 6px;
    z-index: 50;
    display: block;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-6px) scale(0.98);
    transform-origin: top center;
    transition: opacity 160ms var(--ease-out), transform 180ms var(--ease-out), visibility 0s linear 180ms;
    will-change: opacity, transform;
  }
  .combo-scroll {
    max-height: calc(var(--combo-panel-max-height) - 20px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
    scrollbar-gutter: stable;
  }
  /* 自定义滚动条（WebKit：Chrome / Edge / Safari） */
  .combo-scroll::-webkit-scrollbar { width: 10px; }
  .combo-scroll::-webkit-scrollbar-track { background: transparent; margin: 2px 2px 2px 0; border-radius: var(--radius-pill); }
  .combo-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.18);
    border: 3px solid transparent;
    border-radius: var(--radius-pill);
    background-clip: padding-box;
  }
  .combo-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.28); }
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
  .history.is-loading .history-head { min-height: 0; margin-bottom: 10px; }
  .history.is-loading .history-quote, .history.is-loading .history-note, .history.is-loading .history-ranges { display: none; }
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
  .history.is-loading .history-chart { height: 148px; border: 1px solid rgba(0, 102, 204, 0.1); border-radius: 14px; background: linear-gradient(135deg, rgba(0, 113, 227, 0.06), rgba(0, 113, 227, 0.015)); }
  .history-chart svg { display: block; width: 100%; height: auto; overflow: visible; }
  .chart-cursor { pointer-events: none; }
  .chart-cursor[hidden] { display: none; }
  .chart-tooltip {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 70;
    min-width: 166px;
    max-width: calc(100vw - 24px);
    padding: 11px 13px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14), 0 1px 2px rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(18px) saturate(180%);
    color: var(--color-ink);
    line-height: 1.3;
    letter-spacing: 0;
    pointer-events: none;
    white-space: normal;
    transform: translate(14px, -50%) scale(0.98);
    opacity: 0;
    transition: opacity 120ms ease, transform 180ms var(--ease-out);
    will-change: transform, opacity;
  }
  .chart-tooltip-rate { display: block; font-size: 16px; font-weight: 650; letter-spacing: -0.02em; line-height: 1.2; }
  .chart-tooltip-meta { display: block; margin-top: 4px; color: var(--color-ink-muted-48); font-size: 11px; line-height: 1.35; }
  .chart-tooltip.is-visible { opacity: 1; transform: translate(14px, -50%) scale(1); }
  .chart-tooltip.is-left { transform: translate(calc(-100% - 14px), -50%) scale(0.98); }
  .chart-tooltip.is-left.is-visible { transform: translate(calc(-100% - 14px), -50%) scale(1); }
  .history-empty { display: grid; height: 100%; place-items: center; color: var(--color-ink-muted-48); font-size: 13px; text-align: center; }
  .history-empty.is-loading { align-content: center; gap: 10px; color: #6e6e73; font-weight: 500; }
  .history-loading-indicator { width: 18px; height: 18px; border: 2px solid rgba(0, 113, 227, 0.16); border-top-color: #0071e3; border-radius: 50%; animation: history-loading-spin 720ms linear infinite; }
  @keyframes history-loading-spin { to { transform: rotate(360deg); } }
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

`;
