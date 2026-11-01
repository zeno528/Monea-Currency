const task = await taskSpace('monea-currency-search-regression');
const page = task.page('p1');
await page.goto('http://localhost:8790/');

await page.click('[data-field="from"] .combo-input');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (!box.classList.contains('open') || box.querySelector('input').value !== '' || box.dataset.value !== 'USD') throw Error('Opening search changed the selected currency or did not clear the display');
});
await page.fill('[data-field="from"] .combo-input', 'EUR');
await page.press('[data-field="from"] .combo-input', 'Escape');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (box.classList.contains('open') || box.dataset.value !== 'USD' || !box.querySelector('input').value.includes('USD')) throw Error('Escape did not restore the selected currency');
});
await page.click('[data-field="from"] .combo-arrow');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (!box.classList.contains('open') || box.querySelector('input').value !== '') throw Error('Arrow did not open an empty search');
});
await page.click('[data-field="from"] .combo-arrow');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (box.classList.contains('open') || !box.querySelector('input').value.includes('USD')) throw Error('Arrow did not restore the selected currency');
});
await page.click('[data-field="from"] .combo-input');
await page.fill('[data-field="from"] .combo-input', 'EUR');
await page.click('[data-field="from"] .combo-item[data-code="EUR"]');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (box.dataset.value !== 'EUR' || !box.querySelector('input').value.includes('EUR') || box.classList.contains('open')) throw Error('Choosing a currency failed');
});
await page.click('[data-field="to"] .combo-input');
await page.fill('[data-field="to"] .combo-input', 'JPY');
await page.click('.converter-title');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="to"]');
  if (box.classList.contains('open') || box.dataset.value !== 'CNY' || !box.querySelector('input').value.includes('CNY')) throw Error('Clicking outside did not restore the selected currency');
});
await page.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await page.click('[data-field="to"] .combo-arrow');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="to"]');
  if (!box.classList.contains('open') || box.querySelector('input').value !== '' || document.documentElement.scrollWidth > document.documentElement.clientWidth) throw Error('Mobile search failed');
});
await task.finish({ keep: [] });
console.log('Currency search browser regression passed');
