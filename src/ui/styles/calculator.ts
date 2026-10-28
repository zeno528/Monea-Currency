export const CALCULATOR_STYLES = String.raw`
  .calculator button, .calculator button *, .calculator-trigger, .calculator-trigger * { -webkit-user-select: none; user-select: none; }
  .calc-expression, .calc-result { -webkit-user-select: text; user-select: text; }
  html.calculator-open { overflow: hidden; overscroll-behavior: none; }
  html.calculator-open body { position: fixed; top: var(--calc-page-top); left: 0; right: 0; padding-right: var(--calc-scrollbar-gap); }
  .calculator, .calc-expression, .calc-result { overscroll-behavior: contain; }
  .calculator:focus { outline: none; }
  .calculator-trigger { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 0; border-radius: 12px; background: transparent; color: var(--color-primary); cursor: pointer; }
  .calculator-trigger svg { width: 23px; height: 23px; }
  @media (hover: hover) and (pointer: fine) { .calculator-trigger:hover { background: rgba(0, 113, 227, .07); } }
  .calculator-trigger:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  .calculator { position: fixed; inset: var(--calc-top, 80px) auto auto var(--calc-left, 12px); margin: 0; width: var(--calc-width, 360px); max-width: calc(100vw - 24px); max-height: calc(100dvh - 24px); overflow-y: auto; padding: 20px; border: 1px solid var(--color-hairline); border-radius: 24px; background: var(--color-pearl); color: var(--color-ink); box-shadow: 0 18px 50px rgba(0, 0, 0, .16); }
  .calculator { opacity: 0; transform: translateY(-8px) scale(.99); transition: var(--panel-motion); }
  .calculator.is-open { opacity: 1; transform: translateY(0) scale(1); }
  .calculator.is-closing { pointer-events: none; }
  .calculator::backdrop { background: rgba(29, 29, 31, .16); opacity: 0; transition: var(--panel-motion); }
  .calculator.is-open::backdrop { opacity: 1; }
  .calc-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .calc-header h2 { font-size: 16px; font-weight: 600; }
  .calc-expression { min-height: 27px; margin-top: 20px; text-align: right; font-size: 18px; color: var(--color-ink-muted-48); letter-spacing: -.015em;  font-variant-numeric: tabular-nums; }
  .calc-result { display: block; min-height: 62px;  padding-top: 4px; font-size: 40px; font-weight: 500; letter-spacing: -.035em; font-variant-numeric: tabular-nums; text-align: right; color: var(--color-ink); }
  .calc-conversion { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); align-items: center; gap: 12px; margin-top: 14px; padding: 10px 12px; border-radius: 12px; background: #eef4fb; }
  .calc-direction { font-size: 12px; color: var(--color-ink-muted-48); overflow-wrap: anywhere; }
  .calc-preview { display: block; min-height: 22px; text-align: right; font-size: 13px; color: var(--color-ink-muted-48); -webkit-user-select: text; user-select: text; }
  .calc-expression, .calc-result, .calc-preview { min-width: 0; white-space: nowrap; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
  .calc-expression::-webkit-scrollbar, .calc-result::-webkit-scrollbar, .calc-preview::-webkit-scrollbar { display: none; }
  .calc-expression > span, .calc-result > span, .calc-preview > span { display: block; width: max-content; min-width: 100%; }
  .calc-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 12px; }
  .calc-keys button { min-height: 48px; border: 1px solid var(--color-divider-soft); border-radius: var(--radius-pill); background: #fff; color: var(--color-ink); font: inherit; font-size: 24px; font-weight: 400; cursor: pointer; transition: transform 100ms ease, background 140ms ease; }
  .calc-keys button[data-calc-key="0"] { grid-column: span 2; }
  .calc-keys button { position: relative; }
  /* 平分 8px 间隙，并补偿按钮的 1px 边框。 */
  .calc-keys button::before { content: ""; position: absolute; inset: -5px; }
  .calc-keys button[data-calc-key="+"], .calc-keys button[data-calc-key="-"], .calc-keys button[data-calc-key="*"], .calc-keys button[data-calc-key="/"], .calc-keys button[data-calc-key="="] { background: #e8f2ff; color: #0066cc; }
  .calc-keys button[data-calc-key="back"], .calc-keys button[data-calc-key="clear"], .calc-keys button[data-calc-key="%"] { background: #eeeef0; color: #515154; }
  .calc-keys button:active { filter: brightness(.96); }
  .calc-keys button:focus-visible { outline: 2px solid var(--color-primary-focus); outline-offset: 2px; }
  @media (max-width: 600px) {
    .calculator { inset: auto 0 0; width: 100%; max-width: 100%; max-height: 90dvh; border-radius: 24px 24px 0 0; padding: 20px 20px calc(20px + env(safe-area-inset-bottom, 0px)); }
    .calculator { opacity: 1; transform: translateY(100%); }
    .calculator.is-open { transform: translateY(0); }
    .calculator::backdrop { transition: opacity var(--panel-motion-duration) var(--ease-out); }
    .calc-keys button { min-height: 50px; }
  }
  @media (prefers-reduced-motion: reduce) { .calculator::backdrop { transition: none; } }
`;
