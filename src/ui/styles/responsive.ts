export const RESPONSIVE_STYLES = String.raw`
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
    .currency-field { --combo-panel-offset: 26px; padding: 18px 20px; }
    .combo-input { height: 52px; padding: 14px 64px 14px 52px; }
    .combo-arrow { width: 56px; padding-right: 13px; }
    .combo-panel { --combo-panel-max-height: min(320px, 42dvh); }
    .rate-summary {
      box-sizing: border-box;
      height: 60px;
      min-height: 60px;
      align-items: center;
      font-size: 13px;
    }
    .rate-text { flex: 1 1 auto; }
    .summary-actions { flex-wrap: nowrap; }
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
    .swap-btn:active { transform: rotate(90deg) scale(0.95); }
    /* 移动端保留可搜索输入框，方便快速筛选较长的货币列表。 */
    .currency-field .combobox { display: block; }
  }
  @media (max-width: 600px) {
    .converter-wrap { padding: 0 12px 56px; }
    .converter-card { padding-inline: 16px; }
    .converter-topline { flex-direction: column; align-items: stretch; gap: 12px; }
    .converter-actions { width: 100%; flex-wrap: nowrap; justify-content: space-between; }
    .date-control { flex: 1; justify-content: space-between; }
    .date-control input { min-height: 40px; flex: 1; min-width: 0; font-size: 14px; }
    .utility-btn { min-height: 40px; padding-inline: 12px; }
    .rate-summary {
      height: auto;
      min-height: 68px;
    }
    .rate-text {
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
      line-height: 18px;
    }
    .quick-pairs { flex-wrap: nowrap; overflow-x: auto; margin-bottom: 16px; padding: 0 0 4px; scrollbar-width: none; }
    .quick-pairs::-webkit-scrollbar { display: none; }
    .pair-chip { flex: 0 0 auto; min-height: 36px; }
    .saved-pair-row { grid-template-columns: auto minmax(0, 1fr); gap: 8px; }
    .saved-pair-row--recent { grid-template-columns: auto minmax(0, 1fr) auto; }
    .saved-pair-track {
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scroll-snap-type: x proximity;
      scrollbar-width: none;
      padding: 4px 0;
      margin: -4px 0;
      -webkit-overflow-scrolling: touch;
    }
    .saved-pair-track::-webkit-scrollbar { display: none; }
    .saved-pair-track .pair-chip { scroll-snap-align: start; }
    .history { padding-inline: 14px; }
    .history-head { display: block; min-height: 0; }
    .history-ranges { overflow-x: auto; margin-top: 12px; padding-bottom: 2px; scrollbar-width: none; }
    .history-ranges::-webkit-scrollbar { display: none; }
    .history-range { min-height: 36px; }
    .history-chart { height: 250px; }
    .history.is-loading .history-chart { height: 132px; }
  }
  @media (max-width: 419px) {
    .hero { padding: 44px 20px 30px; }
    .hero h1 { font-size: 34px; }
    .hero .lead { font-size: 21px; }
    .money-input { font-size: 32px; }
    .money-symbol { font-size: 30px; }
    .converter-wrap { padding: 0 14px 64px; }
    .converter-card { padding: 18px 14px; border-radius: 20px; }
    .converter-topline { margin-bottom: 14px; }
    .converter-hint { display: none; }
    .converter-actions { gap: 6px; }
    .date-control span { display: none; }
    .history-head { display: block; min-height: 0; }
    .history-ranges { margin-top: 10px; }
    .history-note { white-space: normal; }
    .history-chart { height: 220px; }
    .history.is-loading .history-chart { height: 124px; }
    .rate-summary { align-items: center; }
    .summary-actions { margin-left: 0; }
    .quick-pairs { margin-bottom: 16px; }
    .features, .api-section { padding: 56px 22px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
  }
`;
