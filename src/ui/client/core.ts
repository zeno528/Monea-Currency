export const HOME_CLIENT_CORE = String.raw`
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
    var heroTitleEl = $("hero-title"), heroRateEl = $("hero-rate");
    var errEl = $("error"), swapBtn = $("swap"), resetBtn = $("reset");
    var dateEl = $("rate-date"), favoriteBtn = $("favorite-pair");
    var savedPairsEl = $("saved-pairs"), historyEl = $("history"), historyContentEl = $("history-content"), historyToggleEl = $("history-toggle");
    var historyChartEl = $("history-chart"), historyNoteEl = $("history-note"), historyQuoteEl = $("history-quote");
    var rateSummaryEl = document.querySelector(".rate-summary");
    var converterCardEl = document.querySelector(".converter-card");
    var fromBox = document.querySelector('[data-field="from"]');
    var toBox = document.querySelector('[data-field="to"]');
    var CURRENCIES = []; // {code, name, cn}
    var activeSide = "from";
    var requestId = 0;
    var historyRange = "1M";
    var historyRequestId = 0;
    var historyVisual = null;
    var historyAnimationId = 0;
    var PAIR_STORAGE_KEY = "currency-worker:pairs:v1";
    var savedPairsInitialized = false;

    dateEl.max = new Date().toISOString().slice(0, 10);

    function pairId(from, to) { return from + ":" + to; }
    function currentPair() { return { from: fromBox.dataset.value, to: toBox.dataset.value }; }
    function readPairStore() {
      try {
        var data = JSON.parse(localStorage.getItem(PAIR_STORAGE_KEY) || "{}");
        return { favorites: Array.isArray(data.favorites) ? data.favorites : [], recent: Array.isArray(data.recent) ? data.recent : [] };
      } catch (_) { return { favorites: [], recent: [] }; }
    }
    function writePairStore(store) {
      try { localStorage.setItem(PAIR_STORAGE_KEY, JSON.stringify(store)); } catch (_) {}
    }
    function isFavorite(pair) {
      return readPairStore().favorites.some(function (item) { return pairId(item.from, item.to) === pairId(pair.from, pair.to); });
    }
    function pairLabel(pair) {
      var fromName = displayText(pair.from).replace(/^\\S+\\s/, "").replace(/ \\([A-Z]{3}\\)$/, "");
      var toName = displayText(pair.to).replace(/^\\S+\\s/, "").replace(/ \\([A-Z]{3}\\)$/, "");
      return fromName + " · " + toName;
    }
    function renderPairs(items, label) {
      if (!items.length) return "";
      var clear = label === "最近" ? '<button id="clear-recent" class="clear-recent-btn" type="button">清除</button>' : "";
      var rowClass = label === "最近" ? " saved-pair-row--recent" : "";
      return '<div class="saved-pair-row' + rowClass + '"><span class="saved-pair-label">' + label + '</span><div class="saved-pair-track" aria-label="' + label + '组合，可左右滑动查看">' + items.map(function (pair) {
        return '<button class="pair-chip" type="button" data-from="' + pair.from + '" data-to="' + pair.to + '" aria-pressed="false">' + pairLabel(pair) + '</button>';
      }).join("") + '</div>' + clear + '</div>';
    }
    function updateSavedPairs(content) {
      savedPairsEl.classList.toggle("has-content", Boolean(content));
      savedPairsEl.innerHTML = '<div class="saved-pairs-inner"><div class="saved-pairs-content">' + content + '</div></div>';
    }
    function animateSavedPairsUpdate(content) {
      if (!savedPairsInitialized || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        updateSavedPairs(content);
        savedPairsInitialized = true;
        return;
      }
      var startHeight = converterCardEl.getBoundingClientRect().height;
      converterCardEl.style.height = startHeight + "px";
      updateSavedPairs(content);
      converterCardEl.style.height = "auto";
      var endHeight = converterCardEl.getBoundingClientRect().height;
      converterCardEl.style.height = startHeight + "px";
      converterCardEl.classList.add("is-resizing");
      requestAnimationFrame(function () { converterCardEl.style.height = endHeight + "px"; });
      converterCardEl.addEventListener("transitionend", function cleanup(event) {
        if (event.propertyName !== "height") return;
        converterCardEl.classList.remove("is-resizing");
        converterCardEl.style.height = "";
        converterCardEl.removeEventListener("transitionend", cleanup);
      });
    }
    function renderSavedPairs() {
      var store = readPairStore();
      var content = renderPairs(store.favorites, "收藏") + renderPairs(store.recent, "最近");
      animateSavedPairsUpdate(content);
      syncQuickPairs();
      favoriteBtn.setAttribute("aria-pressed", isFavorite(currentPair()) ? "true" : "false");
      favoriteBtn.textContent = isFavorite(currentPair()) ? "已收藏" : "收藏组合";
    }
    function rememberCurrentPair() {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      store.recent = [pair].concat(store.recent.filter(function (item) { return pairId(item.from, item.to) !== id; })).slice(0, 4);
      writePairStore(store);
      renderSavedPairs();
    }
    function syncHistory() {
      if (historyEl.classList.contains("is-open")) loadHistory("morph");
    }

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

    function currencyName(code) {
      for (var i = 0; i < CURRENCIES.length; i++) {
        if (CURRENCIES[i].code === code) return CURRENCIES[i].cn;
      }
      return CURRENCY_CN[code] || code || "";
    }

    function formatHeroRate(rate) {
      return Number(rate).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 6 });
    }

    function syncHeroPair() {
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      if (!from || !to) return;
      requestId++;
      heroTitleEl.textContent = currencyName(from) + "兑换" + currencyName(to);
      heroRateEl.textContent = "正在获取" + (dateEl.value ? "指定日期" : "最新") + "参考汇率…";
    }

    function syncHeroRate(data) {
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      var rate = data.from === from && data.to === to ? Number(data.rate) : 1 / Number(data.rate);
      if (!isFinite(rate)) return;
      heroRateEl.textContent = "1 " + currencyName(from) + " = " + formatHeroRate(rate) + " " + currencyName(to) + " · 数据日期 " + data.date;
    }

    function formatEditableAmount(amount) {
      return Number(amount).toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: 4 });
    }

    function parseAmount(value) { return parseFloat(String(value).replace(/,/g, "")); }

    function formatAmountWhileTyping(input) {
      var previous = input.value;
      var caret = input.selectionStart === null ? previous.length : input.selectionStart;
      var raw = previous.replace(/,/g, "");
      var rawBeforeCaret = previous.slice(0, caret).replace(/,/g, "");
      var dots = raw.split(".");
      if (dots.length > 2 || raw.split("").some(function (char) { return char !== "." && (char < "0" || char > "9"); })) return;
      var whole = dots[0], groups = [];
      for (var end = whole.length; end > 0; end -= 3) groups.unshift(whole.slice(Math.max(0, end - 3), end));
      var formatted = groups.join(",") + (dots.length === 2 ? "." + dots[1] : "");
      input.value = formatted;
      var seen = 0, nextCaret = 0;
      while (nextCaret < formatted.length && seen < rawBeforeCaret.length) {
        if (formatted[nextCaret] !== ",") seen++;
        nextCaret++;
      }
      input.setSelectionRange(nextCaret, nextCaret);
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
        var cc = $("currency-count");
        if (cc) cc.textContent = String(CURRENCIES.length);
        // 填充原生 select（移动端用），选项格式：符号 中文名 (代码)
        var optHtml = CURRENCIES.map(function (c) {
          return '<option value="' + c.code + '">' + (c.symbol ? c.symbol + " " : "") + c.cn + " (" + c.code + ")</option>";
        }).join("");
        document.querySelectorAll(".native-select").forEach(function (sel) { sel.innerHTML = optHtml; });
        initCombobox(fromBox, "USD");
        initCombobox(toBox, "CNY");
        syncSymbols();
        syncHeroPair();
        renderSavedPairs();
        convert();
      }).catch(function () { showError("无法加载货币列表"); });
    }

    // 可搜索货币下拉（combobox）：输入即过滤，支持代码/中文/英文匹配 + 键盘导航
    function initCombobox(box, initialCode) {
      var input = box.querySelector(".combo-input");
      var panel = box.querySelector(".combo-panel");
      var listEl = panel.querySelector(".combo-scroll");
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
          listEl.innerHTML = '<div class="combo-empty">未找到匹配的货币</div>';
          return;
        }
        var cur = box.dataset.value;
        listEl.innerHTML = list.map(function (c) {
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
        syncHeroPair();
        syncQuickPairs();
        rememberCurrentPair();
        syncHistory();
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
          syncHeroPair();
          syncQuickPairs();
          rememberCurrentPair();
          syncHistory();
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
      var amount = parseAmount(inputEl.value);
      if (!from || !to || !isFinite(amount) || amount < 0) {
        outputEl.value = "";
        rateEl.textContent = "输入金额后将自动换算";
        return;
      }
      clearError();
      var currentRequest = ++requestId;
      rateSummaryEl.classList.add("is-loading");
      rateEl.textContent = dateEl.value ? "正在获取指定日期的参考汇率…" : "正在获取最新参考汇率…";
      var url = "/convert?from=" + encodeURIComponent(base) + "&to=" + encodeURIComponent(quote) + "&amount=" + amount;
      if (dateEl.value) url += "&date=" + encodeURIComponent(dateEl.value);
      fetch(url).then(function (r) { return r.json(); }).then(function (data) {
        if (currentRequest !== requestId) return;
        rateSummaryEl.classList.remove("is-loading");
        if (data.error) {
          heroRateEl.textContent = "暂时无法获取参考汇率";
          showError(data.error);
          return;
        }
        outputEl.value = formatEditableAmount(data.result);
        rateEl.textContent = "1 " + data.from + " = " + data.rate + " " + data.to + " · 数据日期 " + data.date;
        syncHeroRate(data);
      }).catch(function () {
        if (currentRequest === requestId) {
          rateSummaryEl.classList.remove("is-loading");
          heroRateEl.textContent = "暂时无法获取参考汇率";
          showError("网络错误，请重试");
        }
      });
    }

    var timer;
    function convertDebounced() { clearTimeout(timer); timer = setTimeout(convert, 300); }

    fromAmountEl.addEventListener("focus", function () { activeSide = "from"; });
    toAmountEl.addEventListener("focus", function () { activeSide = "to"; });
    fromAmountEl.addEventListener("input", function () { activeSide = "from"; formatAmountWhileTyping(fromAmountEl); convertDebounced(); });
    toAmountEl.addEventListener("input", function () { activeSide = "to"; formatAmountWhileTyping(toAmountEl); convertDebounced(); });
    [fromAmountEl, toAmountEl].forEach(function (input) {
      input.addEventListener("blur", function () {
        var amount = parseAmount(input.value);
        if (isFinite(amount)) input.value = formatEditableAmount(amount);
      });
    });
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
    function applyPair(from, to, remember) {
      fromBox.dataset.value = from;
      toBox.dataset.value = to;
      syncDisplay(fromBox);
      syncDisplay(toBox);
      syncSymbols();
      syncHeroPair();
      syncQuickPairs();
      activeSide = "from";
      if (remember) rememberCurrentPair(); else renderSavedPairs();
      syncHistory();
      convert();
    }
    document.addEventListener("click", function (event) {
      if (event.target.closest("#clear-recent")) {
        var store = readPairStore();
        store.recent = [];
        writePairStore(store);
        renderSavedPairs();
        return;
      }
      var chip = event.target.closest(".pair-chip");
      if (chip) applyPair(chip.dataset.from, chip.dataset.to, true);
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
      syncHeroPair();
      syncQuickPairs();
      rememberCurrentPair();
      syncHistory();
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
      syncHeroPair();
      syncQuickPairs();
      renderSavedPairs();
      syncHistory();
      clearError();
      convert();
      fromAmountEl.focus({ preventScroll: true });
    });

    dateEl.addEventListener("change", function () { syncHeroPair(); convert(); });
    favoriteBtn.addEventListener("click", function () {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      var exists = store.favorites.some(function (item) { return pairId(item.from, item.to) === id; });
      store.favorites = exists ? store.favorites.filter(function (item) { return pairId(item.from, item.to) !== id; }) : [pair].concat(store.favorites).slice(0, 6);
      writePairStore(store);
      renderSavedPairs();
    });

`;
