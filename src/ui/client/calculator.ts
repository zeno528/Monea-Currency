export function reduceFraction(n: bigint, d: bigint): [bigint, bigint] {
  let a = n < 0n ? -n : n, b = d < 0n ? -d : d;
  while (b !== 0n) [a, b] = [b, a % b];
  return d < 0n ? [-n / a, -d / a] : [n / a, d / a];
}

// 与金额框实际使用的格式化路径核对，防止有限数值仍在回填时改变数字。
export function canConvertAmount(value: string): boolean {
  const number = Number(value);
  return Number.isFinite(number)
    && number.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 8 }) === value;
}

// 四则运算用整数分数计算，最后统一四舍五入到 8 位小数。
export function calculateAmount(expression: string): string {
  const source = expression.replace(/\s/g, "");
  if (!source || source.length > 120) throw new Error("请输入有效算式（最多 120 个字符）");
  const tokens = source.match(/\d+(?:\.\d*)?|\.\d+|[+\-*/%]/g) || [];
  if (tokens.join("") !== source) throw new Error("只支持数字、加减乘除和百分比");
  let index = 0, n = 0n, d = 1n, termN = 0n, termD = 1n, pending = "+";
  while (index < tokens.length) {
    const hasLeft = index > 0;
    let sign = 1n;
    if (tokens[index] === "+" || tokens[index] === "-") sign = tokens[index++] === "-" ? -1n : 1n;
    const token = tokens[index++];
    if (!token || !/^(\d+(\.\d*)?|\.\d+)$/.test(token)) throw new Error("请补全算式");
    const parts = token.split(".");
    if ((parts[1] || "").length > 8) throw new Error("最多支持 8 位小数");
    let a = sign * BigInt((parts[0] || "0") + (parts[1] || ""));
    let b = 10n ** BigInt((parts[1] || "").length);
    if (tokens[index] === "%") {
      index++;
      b *= 100n;
      // 加减中的百分比以左侧已算金额为基数，乘除中则直接除以 100。
      if ((pending === "+" || pending === "-") && hasLeft) {
        a *= n * termD + termN * d;
        b *= d * termD;
      }
    }
    if (pending === "*") { termN *= a; termD *= b; }
    else if (pending === "/") {
      if (a === 0n) throw new Error("不能除以零");
      termN *= b; termD *= a;
    } else {
      n = n * termD + termN * d;
      d *= termD;
      termN = pending === "-" ? -a : a;
      termD = b;
    }
    [n, d] = reduceFraction(n, d);
    [termN, termD] = reduceFraction(termN, termD);
    if (index === tokens.length) break;
    pending = tokens[index++];
    if (!/^[+\-*/]$/.test(pending) || index === tokens.length) throw new Error("请补全算式");
  }
  n = n * termD + termN * d;
  d *= termD;
  if (d < 0n) [n, d] = [-n, -d];
  const negative = n < 0n;
  if (negative) n = -n;
  const scaled = (n * 100000000n * 2n + d) / (2n * d);
  const digits = scaled.toString().padStart(9, "0");
  const result = (digits.slice(0, -8) + "." + digits.slice(-8)).replace(/\.?0+$/, "");
  return (negative && scaled !== 0n ? "-" : "") + result;
}

export function editCalculator(value: string, key: string, solved: boolean): { value: string; solved: boolean } {
  if (key === "clear") return { value: "0", solved: true };
  if (key === "back") return { value: value.slice(0, -1), solved: false };
  if (key === "=") {
    try { calculateAmount(value || "0"); return { value, solved: true }; } catch (_) { return { value, solved }; }
  }
  if (!/^[0-9.+\-*/%]$/.test(key)) return { value, solved };
  const previous = value;
  if (solved) {
    try { value = /[0-9.]/.test(key) ? "" : calculateAmount(value || "0"); } catch (_) { return { value, solved }; }
  }
  if (/^[+\-*/]$/.test(key)) {
    value = /[+\-*/]$/.test(value) ? value.slice(0, -1) + key : (value || "0") + key;
  } else {
    if (key === "%" && !/\d$/.test(value)) return { value, solved: false };
    if (/[0-9.]/.test(key) && value.endsWith("%")) return { value, solved: false };
    const number = value.split(/[+\-*/]/).pop() || "";
    if (key === "." && number.includes(".")) return { value, solved: false };
    if (/\d/.test(key) && number.includes(".") && number.split(".")[1].length >= 8) return { value, solved: false };
    value += key === "." && !number ? "0." : key;
  }
  if (value.length > 120) return { value: previous, solved: false };
  return { value, solved: false };
}

export const CALCULATOR_CLIENT = String.raw`
  var calculator = document.getElementById("calculator");
  var calcExpression = document.getElementById("calc-expression-value");
  var calcResult = document.getElementById("calc-result-value");
  var calcPreview = document.getElementById("calc-preview-value");
  var calcDirection = document.getElementById("calc-direction");
  var calcTarget, calcTrigger, calcValue = "", calcSolved = false, calcKeyboardUsed = false;
  var calcPageX = 0, calcPageY = 0;
  function syncCalculatorPreview() {
    if (!calculator || !calculator.open || !calcTarget) return;
    var output = calcTarget === fromAmountEl ? toAmountEl : fromAmountEl;
    var quote = calcTarget === fromAmountEl ? toBox.dataset.value : fromBox.dataset.value;
    var base = calcTarget === fromAmountEl ? fromBox.dataset.value : toBox.dataset.value;
    calcDirection.textContent = currencyName(base) + " → " + currencyName(quote);
    calcPreview.textContent = !errEl.hidden ? "暂时无法更新换算结果"
      : rateSummaryEl.classList.contains("is-loading") ? "正在更新换算结果…"
      : output.value ? "≈ " + output.value + " " + quote : "暂无换算结果";
    positionCalculator();
    [calcExpression, calcResult, calcPreview].forEach(function (text) {
      text.parentElement.scrollLeft = text.parentElement.scrollWidth;
    });
  }
  [calcExpression, calcResult, calcPreview].forEach(function (text) {
    var scroller = text.parentElement;
    scroller.addEventListener("wheel", function (event) {
      if (event.ctrlKey || scroller.scrollWidth <= scroller.clientWidth) return;
      event.preventDefault();
      var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientWidth : 1;
      scroller.scrollLeft += (event.deltaX || event.deltaY) * unit;
    }, { passive: false });
  });
  function updateCalculator(syncAmount) {
    var formula = (calcValue || "0").replace(/\d+(?:\.\d*)?|\.\d+/g, groupAmountText).replace(/\*/g, "×").replace(/\//g, "÷").replace(/-/g, "−");
    calcResult.textContent = formula;
    calcExpression.textContent = "";
    if (!calcValue || /[+\-*/]$/.test(calcValue)) {
      syncCalculatorPreview();
      return;
    }
    try {
      var result = calculateAmount(calcValue);
      if (!canConvertAmount(result)) throw new Error("结果超出换算精度范围，已保留上次有效金额");
      var displayResult = result.replace(/\d+(?:\.\d*)?/g, groupAmountText);
      if (calcSolved) {
        calcExpression.textContent = calcValue === result ? "" : formula;
        calcResult.textContent = displayResult;
      } else {
        calcExpression.textContent = calcValue === result ? "" : "= " + displayResult;
      }
      if (result.startsWith("-")) {
        calcExpression.textContent = "金额不能为负数";
      } else if (syncAmount !== false && calcTarget.value.replace(/,/g, "") !== result) {
        calcTarget.value = result;
        calcTarget.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (error) {
      calcExpression.textContent = error.message;
    }
    syncCalculatorPreview();
  }
  function calculatorKey(key) {
    var next = editCalculator(calcValue, key, calcSolved);
    calcValue = next.value;
    calcSolved = next.solved;
    updateCalculator();
  }
  function positionCalculator() {
    var cardRect = calcTrigger.closest(".currency-field").getBoundingClientRect();
    var buttonRect = calcTrigger.getBoundingClientRect();
    calculator.style.setProperty("--calc-width", Math.max(360, Math.min(420, cardRect.width)) + "px");
    var width = calculator.offsetWidth;
    calculator.style.setProperty("--calc-left", Math.max(12, Math.min(cardRect.right - width, window.innerWidth - width - 12)) + "px");
    calculator.style.setProperty("--calc-top", Math.max(12, Math.min(buttonRect.bottom + 12, window.innerHeight - calculator.offsetHeight - 12)) + "px");
  }
  window.addEventListener("resize", function () { if (calculator.open) positionCalculator(); });
  document.querySelectorAll(".calculator-trigger").forEach(function (button) {
    button.addEventListener("click", function (event) {
      calcKeyboardUsed = event.detail === 0;
      calcTrigger = button;
      calcTarget = document.getElementById(button.dataset.amount);
      calcValue = calcTarget.value.replace(/,/g, "") || "0";
      calcSolved = true;
      updateCalculator(false);
      calcPageX = window.scrollX;
      calcPageY = window.scrollY;
      document.documentElement.style.setProperty("--calc-page-top", -calcPageY + "px");
      document.documentElement.style.setProperty("--calc-scrollbar-gap", (window.innerWidth - document.documentElement.clientWidth) + "px");
      document.documentElement.classList.add("calculator-open");
      document.activeElement.blur();
      calculator.showModal();
      syncCalculatorPreview();
      positionCalculator();
      calculator.focus({ preventScroll: true });
      calculator.getBoundingClientRect();
      getComputedStyle(calculator, "::backdrop").opacity;
      requestAnimationFrame(function () {
        if (calculator.open && !calculator.classList.contains("is-closing")) calculator.classList.add("is-open");
      });
    });
  });
  function closeCalculator() {
    if (!calculator.open || calculator.classList.contains("is-closing")) return;
    calculator.classList.add("is-closing");
    calculator.classList.remove("is-open");
    Promise.all(calculator.getAnimations().map(function (animation) {
      return animation.finished.catch(function () {});
    })).then(function () { calculator.close(); });
  }
  calculator.addEventListener("cancel", function (event) {
    event.preventDefault();
    closeCalculator();
  });
  calculator.addEventListener("pointerdown", function () { calcKeyboardUsed = false; });
  calculator.addEventListener("click", function (event) {
    if (calculator.classList.contains("is-closing")) return;
    var key = event.target.closest("[data-calc-key]");
    if (key) calculatorKey(key.dataset.calcKey);
    if (event.target.closest("#calc-close")) closeCalculator();
    if (event.target === calculator) {
      var rect = calculator.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeCalculator();
    }
  });
  calculator.addEventListener("keydown", function (event) {
    if (calculator.classList.contains("is-closing")) { event.preventDefault(); return; }
    calcKeyboardUsed = true;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    var key = event.key;
    if (/^[0-9.+\-*/=%]$/.test(key)) { event.preventDefault(); calculatorKey(key); }
    else if (key === "Backspace" || key === "Delete") { event.preventDefault(); calculatorKey(key === "Backspace" ? "back" : "clear"); }
    else if (key === "Enter") { event.preventDefault(); closeCalculator(); }
  });
  calculator.addEventListener("close", function () {
    calculator.classList.remove("is-closing", "is-open");
    document.documentElement.classList.remove("calculator-open");
    document.documentElement.style.removeProperty("--calc-page-top");
    document.documentElement.style.removeProperty("--calc-scrollbar-gap");
    window.scrollTo({ left: calcPageX, top: calcPageY, behavior: "instant" });
    if (!calcTrigger) return;
    if (calcKeyboardUsed) calcTrigger.focus({ preventScroll: true });
    else calcTrigger.blur();
  });
`;
