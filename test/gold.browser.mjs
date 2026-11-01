const task = await taskSpace('monea-gold-grams-regression');
const page = task.page('p1');
await page.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `
  const originalFetch = window.fetch;
  window.fetch = function (input, options) {
    const url = new URL(String(input), location.href);
    if (url.pathname === '/latest') return Promise.resolve(Response.json({base:'EUR',rates:{CNY:{rate:10,date:'2026-10-30'},XAU:{rate:1/3110.34768,date:'2026-10-30'}}}));
    if (url.pathname === '/convert') {
      const from = url.searchParams.get('from'), to = url.searchParams.get('to');
      const rate = from === to ? 1 : from === 'XAU' ? 31103.4768 : 1/31103.4768;
      return Promise.resolve(Response.json({from,to,rate,date:'2026-10-30'}));
    }
    if (url.pathname === '/history') {
      const from = url.searchParams.get('from'), to = url.searchParams.get('to');
      const rate = from === to ? 1 : from === 'XAU' ? 31103.4768 : 1/31103.4768;
      return Promise.resolve(Response.json({points:[{date:'2026-10-29',rate},{date:'2026-10-30',rate}]}));
    }
    return originalFetch.apply(this, arguments);
  };
` });
await page.goto('http://localhost:8790/');
await page.click('.quick-pairs [data-from="XAU"][data-to="CNY"]');
await page.evaluate(() => {
  if (document.querySelector('.quick-pairs [data-from="XAU"]').getAttribute('aria-pressed') !== 'true') throw Error('Gold quick pair was not selected');
});
await page.fill('#from-amount', '1');
await page.waitForFunction(() => document.querySelector('#to-amount').value === '1,000');
await page.evaluate(() => {
  if (!document.querySelector('#result-rate').textContent.includes('1 XAU（克） = 1000 CNY')) throw Error('Gold per gram rate is incorrect');
  if (!document.querySelector('label[for="from-amount"]').textContent.includes('克')) throw Error('Gold input unit is missing');
  const link = document.querySelector('#result-rate a');
  if (!link || link.hidden || link.href !== 'https://www.sge.com.cn/sjzx/quotation_daily_new') throw Error('SGE official data link is missing');
  if (!document.querySelector('#result-rate').textContent.includes('Frankfurter')) throw Error('Gold quote source is missing');
});
await page.click('#history-toggle');
await page.waitForFunction(() => document.querySelector('#history-quote')?.textContent.includes('1000.0000 CNY'), undefined, {timeout:15000});
await page.click('#swap');
await page.fill('#from-amount', '1');
await page.waitForFunction(() => document.querySelector('#to-amount').value === '0.001');
await page.waitForFunction(() => document.querySelector('#history-quote')?.textContent.includes('0.00100000 XAU（克）'), undefined, {timeout:15000});
await page.fill('input[aria-label="从货币"]', 'XAU');
await page.click('.combo-item[data-code="XAU"]');
await page.fill('#from-amount', '1');
await page.waitForFunction(() => document.querySelector('#to-amount').value === '1');
await page.click('#reset');
await page.waitForFunction(() => document.querySelector('#result-rate a')?.hidden === true);
await task.finish({keep:[]});
console.log('Gold gram conversion browser regression passed');
