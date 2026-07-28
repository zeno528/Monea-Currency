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

    // 货币代码对应的主要发行国家/地区。多国或非国家货币使用本地图标，避免错误归属。
    var CURRENCY_REGIONS = {
      AED:"AE",AFN:"AF",ALL:"AL",AMD:"AM",ANG:"CW",AOA:"AO",ARS:"AR",AUD:"AU",AWG:"AW",AZN:"AZ",
      BAM:"BA",BBD:"BB",BDT:"BD",BHD:"BH",BIF:"BI",BMD:"BM",BND:"BN",BOB:"BO",BRL:"BR",BSD:"BS",
      BTN:"BT",BWP:"BW",BYN:"BY",BZD:"BZ",CAD:"CA",CDF:"CD",CHF:"CH",CLP:"CL",CNH:"CN",CNY:"CN",
      COP:"CO",CRC:"CR",CUP:"CU",CVE:"CV",CZK:"CZ",DJF:"DJ",DKK:"DK",DOP:"DO",DZD:"DZ",EGP:"EG",
      ERN:"ER",ETB:"ET",EUR:"EU",FJD:"FJ",FKP:"FK",GBP:"GB",GEL:"GE",GGP:"GG",GHS:"GH",GIP:"GI",
      GMD:"GM",GNF:"GN",GTQ:"GT",GYD:"GY",HKD:"HK",HNL:"HN",HTG:"HT",HUF:"HU",IDR:"ID",ILS:"IL",
      IMP:"IM",INR:"IN",IQD:"IQ",IRR:"IR",ISK:"IS",JEP:"JE",JMD:"JM",JOD:"JO",JPY:"JP",KES:"KE",
      KGS:"KG",KHR:"KH",KMF:"KM",KPW:"KP",KRW:"KR",KWD:"KW",KYD:"KY",KZT:"KZ",LAK:"LA",LBP:"LB",
      LKR:"LK",LRD:"LR",LSL:"LS",LYD:"LY",MAD:"MA",MDL:"MD",MGA:"MG",MKD:"MK",MMK:"MM",MNT:"MN",
      MOP:"MO",MRO:"MR",MRU:"MR",MUR:"MU",MVR:"MV",MWK:"MW",MXN:"MX",MYR:"MY",MZN:"MZ",NAD:"NA",
      NGN:"NG",NIO:"NI",NOK:"NO",NPR:"NP",NZD:"NZ",OMR:"OM",PAB:"PA",PEN:"PE",PGK:"PG",PHP:"PH",
      PKR:"PK",PLN:"PL",PYG:"PY",QAR:"QA",RON:"RO",RSD:"RS",RUB:"RU",RWF:"RW",SAR:"SA",SBD:"SB",
      SCR:"SC",SDG:"SD",SEK:"SE",SGD:"SG",SHP:"SH",SLE:"SL",SOS:"SO",SRD:"SR",SSP:"SS",STN:"ST",
      SVC:"SV",SYP:"SY",SZL:"SZ",THB:"TH",TJS:"TJ",TMT:"TM",TND:"TN",TOP:"TO",TRY:"TR",TTD:"TT",
      TWD:"TW",TZS:"TZ",UAH:"UA",UGX:"UG",USD:"US",UYU:"UY",UZS:"UZ",VES:"VE",VND:"VN",VUV:"VU",
      WST:"WS",YER:"YE",ZAR:"ZA",ZMW:"ZM",ZWG:"ZW"
    };
    // 无单一主权国家的货币使用轻量类别图标，而非空白占位旗帜。
    var CURRENCY_ICON_SOURCES = {
      XAF:"cfa.svg",XOF:"cfa.svg",XCD:"caribbean.svg",XCG:"caribbean-guilder.svg",XDR:"sdr.svg",XPF:"pacific.svg",
      XAG:"metal-silver.svg",XAU:"metal-gold.svg",XPD:"metal-palladium.svg",XPT:"metal-platinum.svg"
    };
    // 旗帜更新时只改此版本号；与一年 immutable 缓存配套，确保新旧图标 URL 不冲突。
    var FLAG_ASSET_VERSION = "20260727";

    var $ = function (id) { return document.getElementById(id); };
    var fromAmountEl = $("from-amount"), toAmountEl = $("to-amount");
    var fromSymbolEl = $("from-symbol"), toSymbolEl = $("to-symbol");
    var rateEl = $("result-rate");
    // rateEl 子元素预创建（双行布局结构不变，热路径只更新 textContent）
    var rateMainEl = document.createElement("span");
    rateMainEl.className = "rate-main";
    var rateSubEl = document.createElement("span");
    rateSubEl.className = "rate-sub";
    rateSubEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
    var rateDateText = document.createTextNode("");
    rateSubEl.appendChild(rateDateText);
    var heroTitleEl = $("hero-title");
    var errEl = $("error"), errTextEl = $("error-text"), rateRetryEl = $("rate-retry");
    var swapBtn = $("swap"), resetBtn = $("reset");
    var dateEl = $("rate-date"), favoriteBtn = $("favorite-pair");
    var savedPairsEl = $("saved-pairs"), historyEl = $("history"), historyContentEl = $("history-content"), historyToggleEl = $("history-toggle");
    var historyChartEl = $("history-chart"), historyNoteEl = $("history-note"), historyQuoteEl = $("history-quote");
    var rateSummaryEl = document.querySelector(".rate-summary");
    var converterCardEl = document.querySelector(".converter-card");
    var fromBox = document.querySelector('[data-field="from"]');
    var toBox = document.querySelector('[data-field="to"]');
    var CURRENCIES = []; // {code, name, cn}
    var activeSide = "from";
    // 快捷组合的高亮表示本次操作来源，而不是所有恰好匹配当前货币对的按钮。
    var activePairSource = "quick";
    var requestId = 0;
    var rateCache = new Map();
    var rateRequest = null;
    var RATE_TIMEOUT_MS = 8000;
    var RATE_CACHE_TTL_MS = 60 * 60 * 1000;
    var RATE_SNAPSHOT_STORAGE_KEY = "monea-currency:rate-snapshot:v1";
    var fullRateSnapshot = null;
    var fullRateSnapshotRequest = null;
    var historyRange = "1M";
    var historyRequestId = 0;
    var historyRequestController = null;
    var historyCache = new Map();
    var historyStoreLoaded = false;
    var HISTORY_STORAGE_KEY = "monea-currency:history:v1";
    var historyClientPromise = null;
    // 与 Worker 24h CDN 缓存对齐：客户端 localStorage 同样保留 24h，避免日内反复重访还付一次上游往返。
    var HISTORY_TTL_MS = 24 * 60 * 60 * 1000;
    // /history 客户端超时：Worker 自身有 6s 上游超时 + STALE 兜底，给足网络 buffer 即可；
    // 不要再额外设更短阈值，否则跨大区（亚洲→欧洲 frankfurter）慢响应会先被判失败。
    var HISTORY_TIMEOUT_MS = 8000;
    var PAIR_STORAGE_KEY = "monea-currency:pairs:v1";
    var CURRENCY_FAVORITES_STORAGE_KEY = "monea-currency:favorite-currencies:v1";
    var savedPairsInitialized = false;
    var savedPairsResizeCleanup = null; // 当前正在进行的卡片高度动画的清理器（模块级，保证同一时刻只有一个动画拥有共享卡片）
    // 移动端搜索货币时，键盘会缩小可视区域；记录原位置，避免输入框与下拉列表被键盘遮住。
    var comboKeyboardSession = null;
    var comboKeyboardSettleTimer = null;
    // 金额输入框第二次聚焦时，复用上一次键盘可视高度，避免原生滚动先补偿再回弹。
    var amountKeyboardBaseHeight = 0;
    var amountKeyboardViewportHeight = 0;
    var amountKeyboardViewportWidth = 0;

    dateEl.max = new Date().toISOString().slice(0, 10);

    function isCompactViewport() {
      return window.matchMedia("(max-width: 833px)").matches;
    }

    function comboViewportHeight() {
      return window.visualViewport ? window.visualViewport.height : window.innerHeight;
    }

    function rememberAmountKeyboardViewport(input) {
      if (!isCompactViewport() || document.activeElement !== input) return;
      var viewport = window.visualViewport;
      var height = comboViewportHeight();
      var width = viewport ? viewport.width : window.innerWidth;
      if (width !== amountKeyboardViewportWidth || height > amountKeyboardBaseHeight) {
        amountKeyboardBaseHeight = height;
        amountKeyboardViewportHeight = 0;
        amountKeyboardViewportWidth = width;
      }
      if (amountKeyboardBaseHeight - height > 80) amountKeyboardViewportHeight = height;
    }

    function amountInputIsKeyboardSafe(input) {
      var viewport = window.visualViewport;
      var width = viewport ? viewport.width : window.innerWidth;
      if (!isCompactViewport() || !amountKeyboardViewportHeight || width !== amountKeyboardViewportWidth) return false;
      var rect = input.getBoundingClientRect();
      return rect.top >= 16 && rect.bottom <= amountKeyboardViewportHeight - 20;
    }

    function revealComboPanel(panel) {
      if (!isCompactViewport()) return;
      // 等浮层进入布局后再量尺寸；不聚焦输入框，因此不会触发键盘或键盘回弹逻辑。
      requestAnimationFrame(function () {
        var rect = panel.getBoundingClientRect();
        var visibleHeight = comboViewportHeight();
        var safeTop = 16;
        var safeBottom = visibleHeight - 16;
        var delta = rect.top < safeTop
          ? rect.top - safeTop
          : (rect.bottom > safeBottom ? rect.bottom - safeBottom : 0);
        if (Math.abs(delta) <= 8) return;
        var targetTop = Math.max(0, window.scrollY + delta);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.scrollTo(window.scrollX, targetTop);
        } else {
          window.scrollTo({ left: window.scrollX, top: targetTop, behavior: "smooth" });
        }
      });
    }

    function cancelComboKeyboardAlignment() {
      if (comboKeyboardSettleTimer === null) return;
      clearTimeout(comboKeyboardSettleTimer);
      comboKeyboardSettleTimer = null;
    }

    function startComboKeyboardSession(input) {
      if (!isCompactViewport()) return;
      var previous = comboKeyboardSession;
      comboKeyboardSession = {
        input: input,
        scrollX: previous ? previous.scrollX : window.scrollX,
        scrollY: previous ? previous.scrollY : window.scrollY,
        initialViewportHeight: previous ? previous.initialViewportHeight : comboViewportHeight(),
        keyboardWasShown: previous ? previous.keyboardWasShown : false,
        restoreRequested: false,
      };
    }

    function scheduleComboKeyboardAlignment(input) {
      cancelComboKeyboardAlignment();
      // iOS 键盘动画期间不与系统争夺滚动；等可视区域停止变化后再检查一次。
      comboKeyboardSettleTimer = setTimeout(function () {
        comboKeyboardSettleTimer = null;
        alignComboWithKeyboard(input);
      }, 100);
    }

    function alignComboWithKeyboard(input) {
      var session = comboKeyboardSession;
      if (!session || session.input !== input || !isCompactViewport()) return;
      var visibleHeight = comboViewportHeight();
      var keyboardOpen = session.initialViewportHeight - visibleHeight > 80;
      if (!keyboardOpen) return;
      if (keyboardOpen) session.keyboardWasShown = true;

      var rect = input.getBoundingClientRect();
      // 顶栏随文档滚动，不占键盘场景的固定安全区；仅做最小校正。
      var safeTop = 16;
      var safeBottom = visibleHeight - 20;
      var delta = rect.top < safeTop
        ? rect.top - safeTop
        : (rect.bottom > safeBottom ? rect.bottom - safeBottom : 0);
      if (Math.abs(delta) > 8) {
        var targetTop = Math.max(0, window.scrollY + delta);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          window.scrollTo(window.scrollX, targetTop);
        } else {
          window.scrollTo({ left: window.scrollX, top: targetTop, behavior: "smooth" });
        }
      }
    }

    function requestComboScrollRestore(input) {
      var session = comboKeyboardSession;
      if (!session || session.input !== input) return;
      session.restoreRequested = true;
      cancelComboKeyboardAlignment();
      // 旧版 Safari 可能不报告键盘的 viewport 变化，给系统关闭键盘动画留出时间。
      setTimeout(tryRestoreComboScroll, session.keyboardWasShown ? 0 : 300);
    }

    function tryRestoreComboScroll() {
      var session = comboKeyboardSession;
      if (!session || !session.restoreRequested) return;
      var keyboardStillOpen = session.keyboardWasShown && session.initialViewportHeight - comboViewportHeight() > 80;
      if (keyboardStillOpen) {
        setTimeout(tryRestoreComboScroll, 120);
        return;
      }
      // iOS 可能在键盘收起后保留输入焦点；清掉它，下一次真实点击才能重新触发原生键盘。
      if (document.activeElement === session.input) session.input.blur();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.scrollTo(session.scrollX, session.scrollY);
      } else {
        // 交给浏览器的原生滚动实现，与 Safari 的键盘收起节奏保持一致。
        window.scrollTo({ left: session.scrollX, top: session.scrollY, behavior: "smooth" });
      }
      comboKeyboardSession = null;
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", function () {
        var activeInput = document.activeElement;
        if (activeInput === fromAmountEl || activeInput === toAmountEl) rememberAmountKeyboardViewport(activeInput);
        var session = comboKeyboardSession;
        if (!session) return;
        if (session.initialViewportHeight - comboViewportHeight() > 80) {
          session.keyboardWasShown = true;
          scheduleComboKeyboardAlignment(session.input);
        } else {
          cancelComboKeyboardAlignment();
          // Android 返回键等场景可能收起键盘但不触发 input 的 blur。
          if (session.keyboardWasShown) session.restoreRequested = true;
          tryRestoreComboScroll();
        }
      }, { passive: true });
    }

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
    function readFavoriteCurrencies() {
      try {
        var codes = JSON.parse(localStorage.getItem(CURRENCY_FAVORITES_STORAGE_KEY) || "[]");
        return Array.isArray(codes) ? codes.filter(function (code) { return typeof code === "string"; }) : [];
      } catch (_) { return []; }
    }
    function writeFavoriteCurrencies(codes) {
      try { localStorage.setItem(CURRENCY_FAVORITES_STORAGE_KEY, JSON.stringify(codes)); } catch (_) {}
    }
    function isFavoriteCurrency(code) {
      return readFavoriteCurrencies().indexOf(code) !== -1;
    }
    function toggleFavoriteCurrency(code) {
      var favorites = readFavoriteCurrencies();
      var index = favorites.indexOf(code);
      if (index === -1) favorites.unshift(code);
      else favorites.splice(index, 1);
      writeFavoriteCurrencies(favorites);
    }
    function isFavorite(pair) {
      return readPairStore().favorites.some(function (item) { return pairId(item.from, item.to) === pairId(pair.from, pair.to); });
    }
    function pairLabel(pair) {
      // 胶囊只留中文名：直接复用 currencyName（返回 cn），避免脆弱的符号/代码 strip 正则。
      return currencyName(pair.from) + " · " + currencyName(pair.to);
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
      // 若上一次高度动画尚未收尾，先就地结算，确保同一时刻只有一个动画拥有共享卡片，
      // 否则旧的定时器/transitionend 会在本次动画进行中清掉 is-resizing 与 height，造成跳变。
      if (savedPairsResizeCleanup) savedPairsResizeCleanup();
      var startHeight = converterCardEl.getBoundingClientRect().height;
      converterCardEl.style.height = startHeight + "px";
      updateSavedPairs(content);
      converterCardEl.style.height = "auto";
      var endHeight = converterCardEl.getBoundingClientRect().height;
      // 高度无变化时不会触发 transition/transitionend，直接复位，
      // 否则卡片会被钉死在固定像素高度，随后展开走势图便会溢出卡片背景。
      if (Math.abs(endHeight - startHeight) < 0.5) {
        converterCardEl.style.height = "";
        return;
      }
      converterCardEl.style.height = startHeight + "px";
      converterCardEl.classList.add("is-resizing");
      // 守卫：若本次动画已被后续调用结算，陈旧的 rAF 不得再把卡片钉回固定高度。
      requestAnimationFrame(function () { if (savedPairsResizeCleanup === cleanup) converterCardEl.style.height = endHeight + "px"; });
      var timer = setTimeout(cleanup, 500); // 兜底：过渡被打断（transitioncancel 而非 transitionend）时也复位（过渡时长 380ms）
      function cleanup() {
        if (savedPairsResizeCleanup !== cleanup) return; // 仅当前动画的清理器生效，杜绝跨调用误伤
        savedPairsResizeCleanup = null;
        clearTimeout(timer);
        converterCardEl.classList.remove("is-resizing");
        converterCardEl.style.height = "";
        converterCardEl.removeEventListener("transitionend", onEnd);
      }
      function onEnd(event) { if (event.propertyName === "height") cleanup(); }
      converterCardEl.addEventListener("transitionend", onEnd);
      savedPairsResizeCleanup = cleanup;
    }
    function renderSavedPairs() {
      var store = readPairStore();
      var content = renderPairs(store.favorites, "收藏") + renderPairs(store.recent, "最近");
      animateSavedPairsUpdate(content);
      syncQuickPairs();
      syncFavoriteButton();
    }
    function syncFavoriteButton() {
      favoriteBtn.setAttribute("aria-pressed", isFavorite(currentPair()) ? "true" : "false");
      favoriteBtn.textContent = isFavorite(currentPair()) ? "已收藏" : "收藏组合";
    }
    function rememberCurrentPair() {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      // 已在最近列表中的组合保留原位置，避免重复选择时打乱用户的空间记忆。
      if (store.recent.some(function (item) { return pairId(item.from, item.to) === id; })) {
        syncFavoriteButton();
        return;
      }
      store.recent = [pair].concat(store.recent).slice(0, 4);
      writePairStore(store);
      renderSavedPairs();
    }
    function syncHistory() {
      if (historyEl.classList.contains("is-open")) loadHistory("morph");
    }

    function setHistoryLoading(message, loading) {
      setHistoryUpdating(false);
      historyEl.classList.toggle("is-loading", Boolean(loading));
      historyEl.setAttribute("aria-busy", loading ? "true" : "false");
      historyQuoteEl.hidden = true;
      historyNoteEl.hidden = true;
      historyChartEl.innerHTML = '<div class="history-empty' + (loading ? ' is-loading' : '') + '" role="status">' + (loading ? '<span class="history-loading-indicator" aria-hidden="true"></span>' : '') + '<span>' + message + '</span></div>';
    }

    function setHistoryUpdating(updating) {
      historyEl.classList.toggle("is-updating", Boolean(updating));
      historyEl.setAttribute("aria-busy", updating ? "true" : "false");
    }

    function ensureHistoryClient() {
      if (window.CurrencyHistoryRenderer) return Promise.resolve(window.CurrencyHistoryRenderer);
      if (historyClientPromise) return historyClientPromise;
      historyClientPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = window.__HISTORY_CLIENT_URL || "/history-client.js";
        script.async = true;
        script.onload = function () {
          if (window.CurrencyHistoryRenderer) resolve(window.CurrencyHistoryRenderer);
          else {
            historyClientPromise = null;
            script.remove();
            reject(new Error("走势图模块初始化失败"));
          }
        };
        script.onerror = function () {
          historyClientPromise = null;
          script.remove();
          reject(new Error("走势图模块加载失败"));
        };
        document.head.appendChild(script);
      });
      return historyClientPromise;
    }

    function loadHistoryStore() {
      if (historyStoreLoaded) return;
      historyStoreLoaded = true;
      try {
        var raw = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!raw) return;
        var entries = JSON.parse(raw);
        if (!entries || typeof entries !== "object") return;
        var cutoff = Date.now() - HISTORY_TTL_MS;
        Object.keys(entries).forEach(function (storeKey) {
          var entry = entries[storeKey];
          if (entry && entry.storedAt > cutoff) historyCache.set(storeKey, entry);
        });
      } catch (_) {}
    }

    function persistHistoryStore() {
      try {
        var keys = Array.from(historyCache.keys());
        // 仅保留最近 24 条，避免长期使用后无限增长
        if (keys.length > 24) keys = keys.slice(keys.length - 24);
        var entries = {};
        keys.forEach(function (storeKey) { entries[storeKey] = historyCache.get(storeKey); });
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
      } catch (_) {}
    }

    function readHistoryCache(key) {
      loadHistoryStore();
      var cached = historyCache.get(key);
      if (!cached) return null;
      if (Date.now() - cached.storedAt > HISTORY_TTL_MS) {
        historyCache.delete(key);
        return null;
      }
      return cached.data;
    }

    function fetchJsonWithin(url, signal, timeoutMs) {
      var controller = new AbortController();
      var timedOut = false;
      function abortWithParent() { controller.abort(); }
      signal.addEventListener("abort", abortWithParent, { once: true });
      var timeoutId = window.setTimeout(function () {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      return fetch(url, { signal: controller.signal })
        .then(function (response) {
          if (!response.ok) throw new Error("history-response");
          return response.json();
        })
        .catch(function (error) {
          if (timedOut) throw new Error("history-timeout");
          throw error;
        })
        .finally(function () {
          window.clearTimeout(timeoutId);
          signal.removeEventListener("abort", abortWithParent);
        });
    }

    function loadHistory(animation) {
      var from = fromBox.dataset.value, to = toBox.dataset.value;
      if (!from || !to) return;
      var id = ++historyRequestId;
      var key = from + ":" + to + ":" + historyRange;
      var hasVisibleChart = Boolean(historyChartEl.querySelector("#history-svg"));
      // 首次加载需要完整占位；切换范围时保留旧曲线，并明确标注它正在更新。
      if (animation === "draw" || (animation === "morph" && !hasVisibleChart)) setHistoryLoading("正在加载汇率走势图…", true);
      else if (animation === "morph") setHistoryUpdating(true);
      if (historyRequestController) historyRequestController.abort();
      historyRequestController = new AbortController();
      var signal = historyRequestController.signal;
      var cached = readHistoryCache(key);
      var dataPromise = cached
        ? Promise.resolve(cached)
        : fetchJsonWithin("/history?from=" + encodeURIComponent(from) + "&to=" + encodeURIComponent(to) + "&range=" + historyRange, signal, HISTORY_TIMEOUT_MS)
          .then(function (data) {
            if (data.error) throw new Error("history-response");
            return data;
          })
          .then(function (data) {
            // fetchJsonWithin 只解析 body，X-Monea-Cache 头不进入 data；无论 fresh 还是 STALE 都缓存，
            // 让用户重访该 (from, to, range) 组合时能立刻出图，不必再付一次上游往返。
            historyCache.set(key, { data: data, storedAt: Date.now() });
            persistHistoryStore();
            return data;
          });
      Promise.all([ensureHistoryClient(), dataPromise]).then(function (result) {
        if (id !== historyRequestId) return;
        var renderer = result[0], data = result[1];
        if (data.error) { setHistoryLoading(data.error); return; }
        renderer.render(data.points, from, to, animation, historyRange);
      }).catch(function (error) {
        if (id !== historyRequestId || error.name === "AbortError") return;
        setHistoryLoading(error.message === "history-timeout" ? "走势数据加载超时，请重试" : "走势加载失败，请稍后重试");
      });
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

    function currencyFlagSource(code) {
      var filename = CURRENCY_ICON_SOURCES[code];
      var region = CURRENCY_REGIONS[code];
      if (!filename) filename = (region || "XX").toLowerCase() + ".svg";
      return "/flags/" + filename + "?v=" + FLAG_ASSET_VERSION;
    }

    function syncComboFlag(box) {
      var flagEl = box.querySelector(".combo-selected-flag");
      if (!flagEl) return;
      var code = box.dataset.value;
      if (flagEl.dataset.code === code && flagEl.firstElementChild) return;
      var image = document.createElement("img");
      image.src = currencyFlagSource(code);
      image.alt = "";
      image.width = 24;
      image.height = 18;
      image.decoding = "async";
      image.setAttribute("fetchpriority", "low");
      flagEl.dataset.code = code;
      flagEl.replaceChildren(image);
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
      heroTitleEl.textContent = from + " 兑换 " + to;
    }

    function formatEditableAmount(amount) {
      return Number(amount).toLocaleString("en-US", { useGrouping: true, maximumFractionDigits: 4 });
    }

    function parseAmount(value) { return parseFloat(String(value).replace(/,/g, "")); }

    // 只保留数字和第一个小数点，其余字符（字母、符号、逗号、多余小数点）一律剔除。
    function sanitizeAmount(text) {
      var cleaned = text.replace(/[^0-9.]/g, "");
      var dot = cleaned.indexOf(".");
      return dot === -1 ? cleaned : cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
    }

    function formatAmountWhileTyping(input) {
      var previous = input.value;
      var caret = input.selectionStart === null ? previous.length : input.selectionStart;
      var raw = sanitizeAmount(previous);
      var rawBeforeCaret = sanitizeAmount(previous.slice(0, caret));
      var dots = raw.split(".");
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
        var selected = activePairSource === pairChipSource(chip)
          && chip.dataset.from === fromBox.dataset.value
          && chip.dataset.to === toBox.dataset.value;
        chip.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    }

    function pairChipSource(chip) {
      if (chip.closest(".quick-pairs")) return "quick";
      if (chip.closest(".saved-pair-row--recent")) return "recent";
      return "favorite";
    }

    function showError(msg, retryable) {
      errTextEl.textContent = msg;
      rateRetryEl.hidden = !retryable;
      errEl.hidden = false;
    }
    function clearError() {
      errEl.hidden = true;
      errTextEl.textContent = "";
      rateRetryEl.hidden = true;
    }

    function loadCurrencies() {
      fetch("/currencies").then(function (r) { return r.json(); }).then(function (data) {
        var codes = Object.keys(data.currencies).sort();
        CURRENCIES = codes.map(function (code) {
          var info = data.currencies[code];
          return { code: code, name: info.name, cn: CURRENCY_CN[code] || info.name, symbol: info.symbol || "" };
        });
        var cc = $("currency-count");
        if (cc) cc.textContent = String(CURRENCIES.length);
        initCombobox(fromBox, fromBox.dataset.value || "USD");
        initCombobox(toBox, toBox.dataset.value || "CNY");
        syncSymbols();
        renderSavedPairs();
      }).catch(function () { showError("无法加载货币列表"); });
    }

    // 可搜索货币下拉（combobox）：输入即过滤，支持代码/中文/英文匹配 + 键盘导航
    function initCombobox(box, initialCode) {
      var input = box.querySelector(".combo-input");
      var panel = box.querySelector(".combo-panel");
      var listEl = panel.querySelector(".combo-scroll");
      var arrow = box.querySelector(".combo-arrow");
      var lastTouchY = null;
      var flagObserver = null;
      var renderedCurrencies = [];
      var renderedCount = 0;
      var blurCloseTimer = null;
      var panelPointerActive = false;
      // 当前输入的搜索词与输入框的“已选货币展示值”是两种状态，不能混用。
      var searchQuery = "";
      box.dataset.value = initialCode;
      input.value = displayText(initialCode);
      syncComboFlag(box);

      function getFiltered(q) {
        q = (q || "").trim().toLowerCase();
        var matches = !q ? CURRENCIES : CURRENCIES.filter(function (c) {
          return c.code.toLowerCase().indexOf(q) >= 0
            || c.cn.toLowerCase().indexOf(q) >= 0
            || c.name.toLowerCase().indexOf(q) >= 0;
        });
        var favorites = readFavoriteCurrencies();
        if (!favorites.length) return matches;
        return matches.slice().sort(function (a, b) {
          var aIndex = favorites.indexOf(a.code), bIndex = favorites.indexOf(b.code);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }

      function currencyItemsHtml(list) {
        var cur = box.dataset.value;
        return list.map(function (c) {
          var sel = c.code === cur ? " active" : "";
          var favorite = isFavoriteCurrency(c.code);
          var favoriteLabel = favorite ? "取消收藏 " + c.code : "收藏 " + c.code;
          return '<div class="combo-item' + sel + '" data-code="' + c.code + '">'
            + '<img class="combo-item-flag" data-src="' + currencyFlagSource(c.code) + '" alt="" width="24" height="18" decoding="async" fetchpriority="low">'
            + '<span class="combo-item-sym" aria-hidden="true">' + (c.symbol || "—") + '</span>'
            + '<span class="combo-item-cn">' + c.cn + '</span>'
            + '<span class="combo-item-code">' + c.code + '</span>'
            + '<button class="combo-favorite" type="button" data-code="' + c.code + '" aria-label="' + favoriteLabel + '" aria-pressed="' + favorite + '" title="' + favoriteLabel + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m12 3.7 2.57 5.21 5.75.84-4.16 4.05.98 5.73L12 16.82l-5.14 2.71.98-5.73-4.16-4.05 5.75-.84L12 3.7Z"/></svg></button>'
            + '</div>';
        }).join("");
      }

      function observePendingFlags() {
        var images = listEl.querySelectorAll(".combo-item-flag[data-src]:not([data-observed])");
        images.forEach(function (image) { image.setAttribute("data-observed", ""); });
        if (!images.length) return;
        if (flagObserver) {
          images.forEach(function (image) { flagObserver.observe(image); });
          return;
        }
        images.forEach(function (image) {
          image.src = image.dataset.src;
          image.removeAttribute("data-src");
        });
      }

      function appendCurrencyBatch() {
        if (renderedCount >= renderedCurrencies.length) return;
        var batch = renderedCurrencies.slice(renderedCount, renderedCount + 32);
        renderedCount += batch.length;
        listEl.insertAdjacentHTML("beforeend", currencyItemsHtml(batch));
        observePendingFlags();
      }

      function render(list) {
        if (flagObserver) flagObserver.disconnect();
        flagObserver = null;
        listEl.replaceChildren();
        renderedCurrencies = list;
        renderedCount = 0;
        if (!list.length) {
          listEl.innerHTML = '<div class="combo-empty">未找到匹配的货币</div>';
          return;
        }
        if ("IntersectionObserver" in window) {
          var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              var image = entry.target;
              image.src = image.dataset.src;
              image.removeAttribute("data-src");
              observer.unobserve(image);
            });
          }, { root: listEl, rootMargin: "48px 0px" });
          flagObserver = observer;
        }
        appendCurrencyBatch();
      }

      function cancelBlurClose() {
        if (blurCloseTimer === null) return;
        clearTimeout(blurCloseTimer);
        blurCloseTimer = null;
      }
      function open() {
        // 快速连续切换时，前一次失焦留下的关闭任务不能清空刚重新打开的列表。
        cancelBlurClose();
        closeAll(box);
        box.classList.add("open");
        if (arrow) arrow.setAttribute("aria-expanded", "true");
        render(getFiltered(searchQuery));
      }
      function close() {
        cancelBlurClose();
        box.classList.remove("open");
        if (arrow) arrow.setAttribute("aria-expanded", "false");
        searchQuery = "";
        if (flagObserver) flagObserver.disconnect();
        flagObserver = null;
        renderedCurrencies = [];
        renderedCount = 0;
        listEl.replaceChildren();
      }
      box._closeCombo = close;

      // 浮层内列表滚到边界时，显式截断滚轮/触摸事件。
      // 某些浏览器在 absolute 浮层中仍会把剩余滚动量传给页面，
      // 单靠 CSS 的 overscroll-behavior 无法稳定阻止这个链路。
      function preventScrollChaining(deltaY, event) {
        var atTop = listEl.scrollTop <= 0;
        var atBottom = listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 1;
        if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) event.preventDefault();
      }
      listEl.addEventListener("wheel", function (event) {
        preventScrollChaining(event.deltaY, event);
      }, { passive: false });
      listEl.addEventListener("touchstart", function (event) {
        lastTouchY = event.touches[0] ? event.touches[0].clientY : null;
      }, { passive: true });
      listEl.addEventListener("touchmove", function (event) {
        var touch = event.touches[0];
        if (!touch || lastTouchY === null) return;
        preventScrollChaining(lastTouchY - touch.clientY, event);
        lastTouchY = touch.clientY;
      }, { passive: false });
      listEl.addEventListener("touchend", function () { lastTouchY = null; }, { passive: true });
      listEl.addEventListener("scroll", function () {
        if (listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 160) appendCurrencyBatch();
      }, { passive: true });

      function selectCode(code) {
        box.dataset.value = code;
        input.value = displayText(code);
        syncComboFlag(box);
        close();
        // 选项已提交：结束搜索输入，避免整张货币卡因 focus-within 继续显示编辑态。
        input.blur();
        syncSymbols();
        syncHeroPair();
        activePairSource = "";
        syncQuickPairs();
        rememberCurrentPair();
        syncHistory();
        convert();
      }

      function activateTextSearch() {
        startComboKeyboardSession(input);
        input.select();
        if (!box.classList.contains("open")) open();
      }
      input.addEventListener("focus", activateTextSearch);
      // 输入框已持有焦点、但列表刚被收起时，focus 不会再次触发；点击文本仍须恢复编辑状态。
      input.addEventListener("click", function () {
        if (!box.classList.contains("open")) activateTextSearch();
      });
      input.addEventListener("input", function () {
        searchQuery = input.value;
        if (!box.classList.contains("open")) {
          closeAll(box);
          box.classList.add("open");
          if (arrow) arrow.setAttribute("aria-expanded", "true");
        }
        render(getFiltered(searchQuery));
      });
      input.addEventListener("keydown", function (e) {
        var items = panel.querySelectorAll(".combo-item");
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          if (!box.classList.contains("open")) { open(); return; }
          if (!items.length) return;
          var idx = -1;
          items.forEach(function (it, i) { if (it.classList.contains("active")) idx = i; });
          if (e.key === "ArrowDown" && idx === items.length - 1 && renderedCount < renderedCurrencies.length) {
            appendCurrencyBatch();
            items = panel.querySelectorAll(".combo-item");
          } else if (e.key === "ArrowUp" && idx <= 0 && renderedCount < renderedCurrencies.length) {
            while (renderedCount < renderedCurrencies.length) appendCurrencyBatch();
            items = panel.querySelectorAll(".combo-item");
          }
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
        var favoriteButton = e.target.closest(".combo-favorite");
        if (favoriteButton) {
          e.preventDefault();
          e.stopPropagation();
          var favoriteCode = favoriteButton.dataset.code;
          toggleFavoriteCurrency(favoriteCode);
          // 星标是货币行的一部分：点中它既完成收藏，也提交该货币。
          // 这样整行任意位置都能稳定切换，不再出现“点了但币种没变”的体感。
          selectCode(favoriteCode);
          return;
        }
        var item = e.target.closest(".combo-item");
        if (item) {
          // selectCode 会移除菜单节点；阻止这次点击继续冒泡到整张金额卡片，
          // 否则外层会把已脱离 combobox 的目标误判为卡片空白并聚焦金额输入框。
          e.stopPropagation();
          selectCode(item.dataset.code);
        }
      });
      // 长按或快速点选时，input 会在合成 click 前失焦。记录仍在列表内进行的指针手势，
      // 避免失焦定时器提前移除选项节点；继续用 click 提交，以免把滚动误判成选择。
      panel.addEventListener("pointerdown", function () {
        panelPointerActive = true;
      });
      panel.addEventListener("pointerup", function () {
        panelPointerActive = false;
      });
      panel.addEventListener("pointercancel", function () {
        panelPointerActive = false;
      });
      panel.addEventListener("pointerleave", function () {
        panelPointerActive = false;
      });
      // 星标点击的「不让输入框失焦」曾用 pointerdown preventDefault 实现，但移动端（iOS Safari /
      // Android Chrome）的 pointerdown 等同于 touchstart，对它 preventDefault 会**取消合成 click 事件**，
      // 导致星标点击完全不响应——用户体感是「点击下拉里的货币没反应」（星标占 item 第 5 列 36px，
      // 命中这列的点击都失败，左侧列正常）。
      // 移除该处理器，让 click 事件正常派发；移动端 tap 星标会让 input 失焦、下拉可能收起，
      // 但星标本身的收藏/取消功能可用——这是更关键的能力。
      // 失焦延迟关闭，让选项点击先触发；并恢复当前选中值的显示
      input.addEventListener("blur", function () {
        requestComboScrollRestore(input);
        cancelBlurClose();
        function closeAfterPointerGesture() {
          if (panelPointerActive) {
            blurCloseTimer = setTimeout(closeAfterPointerGesture, 50);
            return;
          }
          blurCloseTimer = null;
          close();
          input.value = displayText(box.dataset.value);
        }
        blurCloseTimer = setTimeout(closeAfterPointerGesture, 150);
      });
      // 点击下拉箭头：仅展开/收起列表，不进入输入编辑或唤起键盘。
      if (arrow) {
        arrow.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (box.classList.contains("open")) {
            close();
          } else {
            open();
            revealComboPanel(panel);
          }
        });
      }
    }

    function closeAll(except) {
      document.querySelectorAll(".combobox.open").forEach(function (b) {
        if (b !== except) {
          if (typeof b._closeCombo === "function") b._closeCombo();
          else b.classList.remove("open");
        }
      });
    }
    // 点击下拉外部关闭
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".combobox")) closeAll(null);
    });

    function rateCacheKey(base, quote) {
      return base + ":" + quote + ":" + (dateEl.value || "latest");
    }

    function validRateSnapshot(snapshot) {
      return snapshot
        && snapshot.base === "EUR"
        && snapshot.rates
        && typeof snapshot.rates === "object"
        && Number.isFinite(snapshot.storedAt)
        && Date.now() - snapshot.storedAt <= RATE_CACHE_TTL_MS;
    }

    function restoreRateSnapshot() {
      try {
        var snapshot = JSON.parse(localStorage.getItem(RATE_SNAPSHOT_STORAGE_KEY) || "null");
        if (validRateSnapshot(snapshot)) fullRateSnapshot = snapshot;
        else localStorage.removeItem(RATE_SNAPSHOT_STORAGE_KEY);
      } catch (_) {
        try { localStorage.removeItem(RATE_SNAPSHOT_STORAGE_KEY); } catch (_) {}
      }
    }

    function snapshotLeg(code) {
      if (code === "EUR") return { rate: 1, date: "" };
      if (!fullRateSnapshot) return null;
      var entry = fullRateSnapshot.rates[code];
      var rate = entry && Number(entry.rate);
      return rate > 0 && Number.isFinite(rate) ? { rate: rate, date: entry.date || "" } : null;
    }

    function snapshotRate(base, quote) {
      if (dateEl.value || !validRateSnapshot(fullRateSnapshot)) return null;
      var baseLeg = snapshotLeg(base);
      var quoteLeg = snapshotLeg(quote);
      if (!baseLeg || !quoteLeg) return null;
      var rate = quoteLeg.rate / baseLeg.rate;
      if (!(rate > 0) || !Number.isFinite(rate)) return null;
      var date = baseLeg.date && quoteLeg.date
        ? (baseLeg.date < quoteLeg.date ? baseLeg.date : quoteLeg.date)
        : (baseLeg.date || quoteLeg.date || new Date().toISOString().slice(0, 10));
      return { from: base, to: quote, rate: rate, date: date, snapshot: true };
    }

    function preloadAllRates() {
      if (fullRateSnapshotRequest) return fullRateSnapshotRequest;
      fullRateSnapshotRequest = fetch("/latest?base=EUR")
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (!data || data.base !== "EUR" || !data.rates || data.error) throw new Error("Invalid rate snapshot");
          var snapshot = { base: "EUR", rates: data.rates, storedAt: Date.now() };
          if (!validRateSnapshot(snapshot)) throw new Error("Invalid rate snapshot");
          fullRateSnapshot = snapshot;
          try { localStorage.setItem(RATE_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot)); } catch (_) {}
          // 快照就绪后立即重算当前货币对；若用户已经切换，convert 会读取最新状态。
          convert();
          return snapshot;
        })
        .catch(function () {
          // 全量快照只是加速层，失败时保留现有按货币对请求路径。
          return null;
        })
        .finally(function () { fullRateSnapshotRequest = null; });
      return fullRateSnapshotRequest;
    }

    function readCachedRate(key, base, quote) {
      var cached = rateCache.get(key);
      if (cached) {
        if (Date.now() - cached.storedAt <= RATE_CACHE_TTL_MS) return cached.data;
        rateCache.delete(key);
      }
      return snapshotRate(base, quote);
    }

    function storeRate(data, requestedDate) {
      var normalized = { from: data.from, to: data.to, rate: Number(data.rate), date: data.date };
      rateCache.set(data.from + ":" + data.to + ":" + requestedDate, { data: normalized, storedAt: Date.now() });
      if (Number(data.rate)) {
        rateCache.set(data.to + ":" + data.from + ":" + requestedDate, {
          data: { from: data.to, to: data.from, rate: 1 / Number(data.rate), date: data.date },
          storedAt: Date.now()
        });
      }
      return normalized;
    }

    function fetchUnitRate(base, quote, key) {
      if (rateRequest && rateRequest.key === key) return rateRequest.promise;
      if (rateRequest) rateRequest.controller.abort();
      if (base === quote) {
        return Promise.resolve({ from: base, to: quote, rate: 1, date: dateEl.value || new Date().toISOString().slice(0, 10) });
      }
      var controller = new AbortController();
      var timedOut = false;
      var timeoutId = setTimeout(function () {
        timedOut = true;
        controller.abort();
      }, RATE_TIMEOUT_MS);
      var requestedDate = dateEl.value || "latest";
      var url = "/convert?from=" + encodeURIComponent(base) + "&to=" + encodeURIComponent(quote) + "&amount=1";
      if (dateEl.value) url += "&date=" + encodeURIComponent(dateEl.value);
      var promise = fetch(url, { signal: controller.signal })
        .then(function (response) { return response.json(); })
        .then(function (data) { return data.error ? data : storeRate(data, requestedDate); })
        .catch(function (error) {
          if (timedOut && error.name === "AbortError") {
            var timeoutError = new Error("Rate request timed out");
            timeoutError.name = "TimeoutError";
            throw timeoutError;
          }
          throw error;
        })
        .finally(function () {
          clearTimeout(timeoutId);
          if (rateRequest && rateRequest.promise === promise) rateRequest = null;
        });
      rateRequest = { key: key, controller: controller, promise: promise };
      return promise;
    }

    function applyConversion(data, amount, outputEl) {
      var rate = Number(data.rate);
      outputEl.value = formatEditableAmount(+(amount * rate).toFixed(4));
      // 双行布局：上行汇率 + 下行日历图标
      rateMainEl.textContent = "1 " + data.from + " = " + formatHeroRate(rate) + " " + data.to;
      rateDateText.textContent = "数据日期 " + data.date;
      rateEl.replaceChildren(rateMainEl, rateSubEl);
    }

    function refreshSnapshotRate(base, quote, key, currentRequest, amount, outputEl) {
      fetchUnitRate(base, quote, key).then(function (data) {
        if (currentRequest !== requestId || data.error) return;
        applyConversion(data, amount, outputEl);
      }).catch(function () {
        // 快照已经给出可用结果；后台校准失败时保持当前值，不打断用户。
      });
    }

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
      var key = rateCacheKey(base, quote);
      if (base === quote) {
        if (rateRequest) {
          rateRequest.controller.abort();
          rateRequest = null;
        }
        rateSummaryEl.classList.remove("is-loading");
        applyConversion(
          { from: base, to: quote, rate: 1, date: dateEl.value || new Date().toISOString().slice(0, 10) },
          amount,
          outputEl
        );
        return;
      }
      var cached = readCachedRate(key, base, quote);
      if (cached) {
        if (rateRequest && rateRequest.key !== key) {
          rateRequest.controller.abort();
          rateRequest = null;
        }
        rateSummaryEl.classList.remove("is-loading");
        applyConversion(cached, amount, outputEl);
        if (cached.snapshot) refreshSnapshotRate(base, quote, key, currentRequest, amount, outputEl);
        return;
      }
      rateSummaryEl.classList.add("is-loading");
      rateEl.textContent = dateEl.value ? "正在获取指定日期的参考汇率…" : "正在获取最新参考汇率…";
      fetchUnitRate(base, quote, key).then(function (data) {
        if (currentRequest !== requestId) return;
        rateSummaryEl.classList.remove("is-loading");
        if (data.error) {
          rateEl.textContent = "暂时无法更新参考汇率";
          showError(data.error, true);
          return;
        }
        applyConversion(data, amount, outputEl);
      }).catch(function (error) {
        if (currentRequest === requestId) {
          rateSummaryEl.classList.remove("is-loading");
          if (error.name === "AbortError") return;
          rateEl.textContent = "暂时无法更新参考汇率";
          showError(error.name === "TimeoutError" ? "汇率请求超时" : "网络错误", true);
        }
      });
    }

    function amountSide(input) { return input === fromAmountEl ? "from" : "to"; }
    // 金额输入统一处理：定位活跃侧 → 清洗格式化 → 换算。输入法组字期间只定位、不改写 value（改写会打断组字并清空）。
    function handleAmountInput(input, isComposing) {
      activeSide = amountSide(input);
      if (isComposing) return;
      formatAmountWhileTyping(input);
      convert();
    }
    [fromAmountEl, toAmountEl].forEach(function (input) {
      input.addEventListener("pointerdown", function () {
        // 已在安全位置时抢先无滚动聚焦，保留默认点击的光标定位和选择行为。
        if (document.activeElement !== input && amountInputIsKeyboardSafe(input)) input.focus({ preventScroll: true });
      });
      input.addEventListener("focus", function () {
        activeSide = amountSide(input);
        rememberAmountKeyboardViewport(input);
      });
      input.addEventListener("input", function (e) { handleAmountInput(input, e.isComposing); });
      // 逐字输入/组字的非法字符（字母、符号）拦在门外，不进入输入框；已有内容与光标保持不动。
      input.addEventListener("beforeinput", function (e) {
        if ((e.inputType === "insertText" || e.inputType === "insertCompositionText") && e.data && /[^0-9.]/.test(e.data)) {
          e.preventDefault();
        }
      });
      // compositionstart 无法取消（见 W3C UI Events 规范），只能等组字落定后清洗一次，兜住期间放进来的内容。
      input.addEventListener("compositionend", function () { handleAmountInput(input, false); });
      input.addEventListener("blur", function () {
        var amount = parseAmount(input.value);
        if (isFinite(amount)) input.value = formatEditableAmount(amount);
      });
    });
    // 整张金额卡片都是输入热区；货币选择控件维持自己的点击语义。
    document.querySelectorAll(".currency-field").forEach(function (field) {
      field.addEventListener("click", function (event) {
        // 直接点数字时交给浏览器定位插入光标，避免二次 focus 把光标送到首位。
        if (event.target.closest(".money-input, .combobox")) return;
        // 从被点的这张卡内部取它自己的金额输入框：data-amount-side 挂在祖先 .field-group 上，
        // 读 field.dataset 会恒为 undefined，导致两侧都落到「换算为」。
        var input = field.querySelector(".money-input");
        if (!input) return;
        activeSide = amountSide(input);
        input.focus({ preventScroll: true });
        // 程序化 focus 会把光标留在首位；显式移到末尾，符合「点空白处接着往后输入」的预期。
        var end = input.value.length;
        input.setSelectionRange(end, end);
      });
    });
    // 同步某字段的 combobox 显示。
    function syncDisplay(box) {
      var code = box.dataset.value;
      box.querySelector(".combo-input").value = displayText(code);
      syncComboFlag(box);
    }
    function applyPair(from, to, remember, source) {
      fromBox.dataset.value = from;
      toBox.dataset.value = to;
      syncDisplay(fromBox);
      syncDisplay(toBox);
      syncSymbols();
      syncHeroPair();
      activePairSource = source || "";
      syncQuickPairs();
      activeSide = "from";
      // 收藏/最近面板的重排（含 animateSavedPairsUpdate 的两次强制 layout + innerHTML 重建 +
      // 380ms height transition）推迟到下一帧，让浏览器先把同步产生的视觉变化（combo / aria-pressed /
      // 标题 / 币种符号）渲染出去，避免点 pair-chip 时把重活压在 click handler 同步段里拉高 INP。
      var deferredSaved = remember
        ? function () { rememberCurrentPair(); }
        : function () { renderSavedPairs(); };
      requestAnimationFrame(deferredSaved);
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
      if (chip) applyPair(chip.dataset.from, chip.dataset.to, true, pairChipSource(chip));
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
      activePairSource = "";
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
      activePairSource = "quick";
      syncQuickPairs();
      renderSavedPairs();
      syncHistory();
      clearError();
      convert();
      fromAmountEl.focus({ preventScroll: true });
    });
    rateRetryEl.addEventListener("click", function () {
      clearError();
      convert();
    });

    dateEl.addEventListener("change", function () { syncHeroPair(); convert(); });
    favoriteBtn.addEventListener("click", function () {
      var store = readPairStore(), pair = currentPair(), id = pairId(pair.from, pair.to);
      var exists = store.favorites.some(function (item) { return pairId(item.from, item.to) === id; });
      store.favorites = exists ? store.favorites.filter(function (item) { return pairId(item.from, item.to) !== id; }) : [pair].concat(store.favorites).slice(0, 6);
      writePairStore(store);
      renderSavedPairs();
    });

    historyToggleEl.addEventListener("click", function () {
      var opening = !historyEl.classList.contains("is-open");
      if (opening) {
        historyEl.hidden = false;
        historyContentEl.inert = false;
        requestAnimationFrame(function () { historyEl.classList.add("is-open"); });
      } else {
        historyEl.classList.remove("is-open");
        historyContentEl.inert = true;
        historyRequestId++;
        if (historyRequestController) historyRequestController.abort();
        if (window.CurrencyHistoryRenderer) window.CurrencyHistoryRenderer.suspend();
        var floatingTooltip = $("history-tooltip");
        if (floatingTooltip) floatingTooltip.classList.remove("is-visible");
        setTimeout(function () { if (!historyEl.classList.contains("is-open")) historyEl.hidden = true; }, 400);
      }
      historyEl.setAttribute("aria-hidden", opening ? "false" : "true");
      historyToggleEl.setAttribute("aria-expanded", opening ? "true" : "false");
      if (opening) loadHistory("draw");
    });
    document.querySelectorAll(".history-range").forEach(function (button) {
      button.addEventListener("click", function () {
        historyRange = button.dataset.range;
        document.querySelectorAll(".history-range").forEach(function (item) { item.setAttribute("aria-pressed", item === button ? "true" : "false"); });
        loadHistory("morph");
      });
    });

    syncComboFlag(fromBox);
    syncComboFlag(toBox);
    syncHeroPair();
    restoreRateSnapshot();
    preloadAllRates();
    convert();
    loadCurrencies();
    renderSavedPairs();

`;
