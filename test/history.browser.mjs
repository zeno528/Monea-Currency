const task = await taskSpace("monea-history-regression");
const page = task.page("p1");
await page.cdp("Page.addScriptToEvaluateOnNewDocument", { source: `
  const originalGet = Storage.prototype.getItem;
  const originalSet = Storage.prototype.setItem;
  Storage.prototype.getItem = function (key) { return key === 'monea-currency:history:v1' ? null : originalGet.call(this, key); };
  Storage.prototype.setItem = function (key, value) { if (key !== 'monea-currency:history:v1') originalSet.call(this, key, value); };
  const originalFetch = window.fetch;
  window.historyRequests = [];
  window.fetch = function (url, options) {
    if (!String(url).startsWith('/history?')) return originalFetch.apply(this, arguments);
    const parsed = new URL(url, location.href);
    window.historyRequests.push(parsed.searchParams.get('range'));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(new Response(JSON.stringify({points: [{date: '2026-10-01', rate: 1}, {date: '2026-10-02', rate: 2}]}), {status: 200})), 1200);
      options.signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, {once: true});
    });
  };
` });
await page.goto("http://localhost:8787/");
await page.waitForFunction(() => window.historyRequests.length === 4);
await page.click("#history-toggle");
await page.waitForSelector("#history-svg");
await page.click('[data-range="6M"]');
await page.waitForFunction(() => !document.querySelector("#history").classList.contains("is-updating"));
await page.click('[data-range="1W"]');
await page.waitForFunction(() => !document.querySelector("#history").classList.contains("is-updating"));
await page.evaluate(() => {
  const requests = window.historyRequests.slice().sort().join(",");
  if (requests !== "1M,1W,1Y,6M") throw Error("Unexpected or duplicate history requests: " + requests);
});
await task.finish({ keep: [] });
console.log("History prefetch regression passed");
