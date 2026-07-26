  (function () {
    var historyVisual = null;
    var historyAnimationId = 0;
    var historyInteractionController = null;

    function renderHistory(points, from, to, animation, range) {
      if (!points || points.length < 2) { setHistoryLoading("该时间范围暂无可用参考数据"); return; }
      var animationId = ++historyAnimationId;
      var mode = animation === "morph" && historyVisual && historyVisual.positions.length > 1 ? "morph" : "draw";
      var width = 640, height = 210, inset = { top: 20, right: 16, bottom: 30, left: 58 };
      var values = points.map(function (point) { return Number(point.rate); }).filter(function (value) { return isFinite(value); });
      if (values.length < 2) { setHistoryLoading("该时间范围暂无可用参考数据"); return; }
      historyEl.classList.remove("is-loading", "is-updating");
      historyEl.setAttribute("aria-busy", "false");
      var rangeMin = Math.min.apply(null, values), rangeMax = Math.max.apply(null, values);
      var min = rangeMin, max = rangeMax, span = max - min || Math.max(max * 0.02, 0.01);
      min -= span * 0.12; max += span * 0.12;
      var innerWidth = width - inset.left - inset.right, innerHeight = height - inset.top - inset.bottom;
      var path = points.map(function (point, index) {
        var x = inset.left + innerWidth * index / (points.length - 1);
        var y = inset.top + (max - Number(point.rate)) / (max - min) * innerHeight;
        return (index ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2);
      }).join(" ");
      var positions = points.map(function (point, index) {
        return { x: inset.left + innerWidth * index / (points.length - 1), y: inset.top + (max - Number(point.rate)) / (max - min) * innerHeight };
      });
      var latest = points[points.length - 1];
      var latestRate = Number(latest.rate).toFixed(4);
      var dateIndexes = [0, Math.round((points.length - 1) / 3), Math.round((points.length - 1) * 2 / 3), points.length - 1].filter(function (index, position, list) { return list.indexOf(index) === position; });
      var dateLabels = dateIndexes.map(function (index, position) {
        var dateParts = points[index].date.split("-");
        var label = range === "1D" || range === "1W"
          ? Number(dateParts[1]) + "月" + Number(dateParts[2]) + "日"
          : range === "2Y" || range === "5Y"
            ? dateParts[0] + "年" + Number(dateParts[1]) + "月"
            : Number(dateParts[1]) + "月";
        var anchor = position === 0 ? "start" : (position === dateIndexes.length - 1 ? "end" : "middle");
        var x = inset.left + innerWidth * index / (points.length - 1);
        return '<text x="' + x.toFixed(2) + '" y="' + (height - 8) + '" fill="#86868b" font-size="11" text-anchor="' + anchor + '">' + label + '</text>';
      }).join("");
      var gridLines = [0, 0.5, 1].map(function (ratio) {
        var y = inset.top + innerHeight * ratio;
        return '<line x1="16" y1="' + y.toFixed(2) + '" x2="' + (width - 16) + '" y2="' + y.toFixed(2) + '" stroke="rgba(0,0,0,.09)"/>';
      }).join("");
      var axisLabels = [max, (min + max) / 2, min].map(function (value, index) {
        var y = inset.top + innerHeight * index / 2;
        return '<text x="8" y="' + (y - 6).toFixed(2) + '" fill="#86868b" font-size="10.5">' + value.toFixed(4) + '</text>';
      }).join("");
      var areaPath = path + "L " + positions[positions.length - 1].x.toFixed(2) + " " + (height - inset.bottom) + "L " + positions[0].x.toFixed(2) + " " + (height - inset.bottom) + "Z";
      var latestPosition = positions[positions.length - 1];
      historyQuoteEl.innerHTML = '<span class="history-quote-label">1 ' + from + ' =</span><strong class="history-quote-value">' + latestRate + " " + to + "</strong>";
      historyNoteEl.textContent = "参考区间 " + rangeMin.toFixed(4) + "–" + rangeMax.toFixed(4) + " · " + points[0].date + " 至 " + latest.date;
      historyQuoteEl.hidden = false;
      historyNoteEl.hidden = false;
      var oldTooltip = $("history-tooltip");
      if (oldTooltip) oldTooltip.remove();
      document.body.insertAdjacentHTML("beforeend", '<div id="history-tooltip" class="chart-tooltip" role="status"></div>');
      historyChartEl.innerHTML = '<svg id="history-svg" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + from + " 到 " + to + ' 的参考汇率走势。桌面端移动鼠标查看价格；触屏设备点按曲线查看，点按空白处取消。"><defs><linearGradient id="history-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0071e3" stop-opacity=".20"/><stop offset="100%" stop-color="#0071e3" stop-opacity="0"/></linearGradient><clipPath id="history-area-clip"><rect id="history-area-reveal" x="' + inset.left + '" y="' + inset.top + '" width="' + innerWidth + '" height="' + innerHeight + '"/></clipPath></defs>' + gridLines + axisLabels + '<path id="history-area" d="' + areaPath + '" fill="url(#history-area-gradient)" clip-path="url(#history-area-clip)"/><path id="history-line" d="' + path + '" fill="none" stroke="#0071e3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle id="history-latest-dot" cx="' + latestPosition.x.toFixed(2) + '" cy="' + latestPosition.y.toFixed(2) + '" r="4.5" fill="#0071e3" stroke="#fff" stroke-width="2"/><g id="history-cursor" class="chart-cursor" hidden><line id="history-cursor-line" y1="' + inset.top + '" y2="' + (height - inset.bottom) + '" stroke="#0071e3" stroke-width="1" stroke-dasharray="3 3"/><circle id="history-cursor-dot" r="5" fill="#fff" stroke="#0071e3" stroke-width="3"/></g>' + dateLabels + '</svg>';
      var svg = $("history-svg"), line = $("history-line"), area = $("history-area"), areaReveal = $("history-area-reveal"), latestDot = $("history-latest-dot"), tooltip = $("history-tooltip"), cursor = $("history-cursor"), cursorLine = $("history-cursor-line"), cursorDot = $("history-cursor-dot");
      var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      function pathFromPositions(list) {
        return list.map(function (position, index) { return (index ? "L" : "M") + position.x.toFixed(2) + " " + position.y.toFixed(2); }).join(" ");
      }
      function areaPathFromPositions(list) {
        return pathFromPositions(list) + "L " + list[list.length - 1].x.toFixed(2) + " " + (height - inset.bottom) + "L " + list[0].x.toFixed(2) + " " + (height - inset.bottom) + "Z";
      }
      function resamplePositions(source, count) {
        return Array.from({ length: count }, function (_, index) {
          var position = count === 1 ? 0 : index / (count - 1) * (source.length - 1);
          var low = Math.floor(position), high = Math.min(source.length - 1, Math.ceil(position)), progress = position - low;
          return { x: source[low].x + (source[high].x - source[low].x) * progress, y: source[low].y + (source[high].y - source[low].y) * progress };
        });
      }
      function animateCurve(fromPositions, toPositions) {
        var startedAt;
        line.setAttribute("d", pathFromPositions(fromPositions));
        area.setAttribute("d", areaPathFromPositions(fromPositions));
        latestDot.setAttribute("cx", fromPositions[fromPositions.length - 1].x.toFixed(2));
        latestDot.setAttribute("cy", fromPositions[fromPositions.length - 1].y.toFixed(2));
        function frame(now) {
          if (!startedAt) startedAt = now;
          var progress = Math.min(1, (now - startedAt) / 680);
          var eased = 1 - Math.pow(1 - progress, 4);
          var current = toPositions.map(function (position, index) {
            return { x: fromPositions[index].x + (position.x - fromPositions[index].x) * eased, y: fromPositions[index].y + (position.y - fromPositions[index].y) * eased };
          });
          if (animationId !== historyAnimationId) return;
          line.setAttribute("d", pathFromPositions(current));
          area.setAttribute("d", areaPathFromPositions(current));
          latestDot.setAttribute("cx", current[current.length - 1].x.toFixed(2));
          latestDot.setAttribute("cy", current[current.length - 1].y.toFixed(2));
          historyVisual = { positions: current };
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }
      if (!reduceMotion && mode === "morph" && historyVisual && historyVisual.positions.length > 1) {
        animateCurve(resamplePositions(historyVisual.positions, positions.length), positions);
      } else if (!reduceMotion && mode === "draw") {
        // 从左端进入；先提交隐藏帧，避免浏览器合并起止状态。
        historyVisual = null;
        line.setAttribute("d", pathFromPositions(positions));
        var lineLength = line.getTotalLength();
        var drawDuration = 1050;
        line.style.transition = "none";
        line.style.strokeDasharray = String(lineLength);
        line.style.strokeDashoffset = String(lineLength);
            areaReveal.setAttribute("width", "0");
            latestDot.style.opacity = "0";
        line.getBoundingClientRect();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            line.style.transition = "stroke-dashoffset " + drawDuration + "ms cubic-bezier(0.22, 1, 0.36, 1)";
            line.style.strokeDashoffset = "0";
            var areaStartedAt;
            function revealArea(now) {
              if (animationId !== historyAnimationId) return;
              if (!areaStartedAt) areaStartedAt = now;
              var progress = Math.min(1, (now - areaStartedAt) / drawDuration);
              var eased = 1 - Math.pow(1 - progress, 4);
              areaReveal.setAttribute("width", String(innerWidth * eased));
              if (progress < 1) requestAnimationFrame(revealArea);
            }
            requestAnimationFrame(revealArea);
            window.setTimeout(function () {
              if (animationId !== historyAnimationId) return;
              latestDot.style.transition = "opacity 160ms ease-out";
              latestDot.style.opacity = "1";
              historyVisual = { positions: positions };
            }, drawDuration - 120);
          });
        });
      } else {
        historyVisual = { positions: positions };
      }
      var activeIndex = points.length - 1;
      var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      var tapStart = null;
      if (historyInteractionController) historyInteractionController.abort();
      historyInteractionController = new AbortController();
      var listenerOptions = { signal: historyInteractionController.signal };
      function placeTooltip(clientX, clientY) {
        tooltip.style.left = clientX + "px";
        tooltip.style.top = clientY + "px";
        tooltip.classList.remove("is-left");
        var tooltipWidth = tooltip.offsetWidth;
        if (clientX + tooltipWidth + 20 > window.innerWidth) tooltip.classList.add("is-left");
      }
      function showPoint(index, clientX, clientY) {
        activeIndex = Math.max(0, Math.min(points.length - 1, index));
        var point = points[activeIndex];
        var x = inset.left + innerWidth * activeIndex / (points.length - 1);
        var y = inset.top + (max - Number(point.rate)) / (max - min) * innerHeight;
        cursor.removeAttribute("hidden");
        cursorLine.setAttribute("x1", x); cursorLine.setAttribute("x2", x);
        cursorDot.setAttribute("cx", x); cursorDot.setAttribute("cy", y);
        tooltip.innerHTML = '<strong class="chart-tooltip-rate">' + Number(point.rate).toFixed(4) + " " + to + '</strong><span class="chart-tooltip-meta">1 ' + from + " · 参考日期 " + point.date + "</span>";
        tooltip.classList.add("is-visible");
        if (clientX === undefined || clientY === undefined) {
          var svgRect = svg.getBoundingClientRect();
          clientX = svgRect.left + x / width * svgRect.width;
          clientY = svgRect.top + y / height * svgRect.height;
        }
        placeTooltip(clientX, clientY);
      }
      function hidePoint() { cursor.setAttribute("hidden", ""); tooltip.classList.remove("is-visible"); }
      function pointFromEvent(event) {
        var rect = svg.getBoundingClientRect();
        return { rect: rect, x: (event.clientX - rect.left) / rect.width * width, y: (event.clientY - rect.top) / rect.height * height };
      }
      function pointIndexAt(position) {
        return Math.round((position.x - inset.left) / innerWidth * (points.length - 1));
      }
      function hitsCurve(position) {
        if (position.x < inset.left || position.x > width - inset.right || position.y < inset.top || position.y > height - inset.bottom) return false;
        var relativeIndex = (position.x - inset.left) / innerWidth * (points.length - 1);
        var low = Math.max(0, Math.floor(relativeIndex)), high = Math.min(points.length - 1, Math.ceil(relativeIndex));
        var progress = relativeIndex - low;
        var curveY = positions[low].y + (positions[high].y - positions[low].y) * progress;
        var hitRadius = Math.max(12, 22 / position.rect.height * height);
        return Math.abs(position.y - curveY) <= hitRadius;
      }
      if (finePointer) {
        svg.addEventListener("pointermove", function (event) {
          var position = pointFromEvent(event);
          if (position.x < inset.left || position.x > width - inset.right || position.y < inset.top || position.y > height - inset.bottom) {
            hidePoint();
            return;
          }
          showPoint(pointIndexAt(position), event.clientX, event.clientY);
        }, listenerOptions);
        svg.addEventListener("pointerleave", hidePoint, listenerOptions);
      } else {
        historyChartEl.addEventListener("pointerdown", function (event) {
          tapStart = { x: event.clientX, y: event.clientY };
        }, listenerOptions);
        historyChartEl.addEventListener("pointerup", function (event) {
          if (!tapStart) return;
          var moved = Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y) > 10;
          tapStart = null;
          if (moved) return;
          var position = pointFromEvent(event);
          if (!hitsCurve(position)) {
            hidePoint();
            return;
          }
          showPoint(pointIndexAt(position), event.clientX, event.clientY);
        }, listenerOptions);
        historyChartEl.addEventListener("pointercancel", function () { tapStart = null; }, listenerOptions);
      }
    }

    window.CurrencyHistoryRenderer = {
      render: renderHistory,
      suspend: function () {
        historyAnimationId++;
        if (historyInteractionController) historyInteractionController.abort();
        historyInteractionController = null;
      }
    };
  })();
