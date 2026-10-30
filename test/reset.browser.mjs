const task = await taskSpace("monea-reset-regression");
const page = task.page("p1");
await page.goto("http://localhost:8787/");
await page.click('.quick-pairs [data-from="EUR"]');
await page.fill('#from-amount', '250');
await page.fill('#rate-date', '2026-10-01');
await page.click('#history-toggle');
const before = await page.evaluate(() => localStorage.getItem('monea-currency:pairs:v1'));
await page.click('#reset');
await page.evaluate((saved) => {
  if (document.querySelector('[data-field="from"]').dataset.value !== 'USD' || document.querySelector('[data-field="to"]').dataset.value !== 'CNY') throw Error('Default pair was not restored');
  if (document.querySelector('#from-amount').value !== '100' || document.querySelector('#rate-date').value !== '') throw Error('Amount or date was not restored');
  if (document.querySelector('.quick-pairs [data-from="USD"]').getAttribute('aria-pressed') !== 'true') throw Error('Default pair is not selected');
  if (localStorage.getItem('monea-currency:pairs:v1') !== saved) throw Error('Saved pairs changed');
  if (document.querySelector('#history-toggle').getAttribute('aria-expanded') !== 'true') throw Error('Chart was closed');
  if (document.activeElement.id !== 'reset') throw Error('Focus left the reset button');
}, before);
await page.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
console.log(await page.screenshot());
await page.evaluate(() => {
  const card = document.querySelector('.converter-card').getBoundingClientRect();
  const reset = document.querySelector('#reset').getBoundingClientRect();
  if (reset.right > card.right || reset.left < card.left) throw Error('Reset button overflows on mobile');
});
await task.finish({ keep: [] });
console.log('Reset browser regression passed');
