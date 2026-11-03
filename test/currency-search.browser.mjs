const task = await taskSpace('monea-currency-search-regression');
const page = task.page('p1');
await page.goto('http://localhost:8790/');

async function checkArrowBounds() {
  await page.evaluate(() => {
    document.querySelectorAll('.combobox').forEach((box) => {
      const input = box.querySelector('.combo-input').getBoundingClientRect();
      const arrow = box.querySelector('.combo-arrow').getBoundingClientRect();
      const field = box.closest('.currency-field').getBoundingClientRect();
      if (arrow.left < input.left || Math.abs(arrow.right - field.right + 1) > 1 || arrow.top < input.top || arrow.bottom > input.bottom) throw Error('Arrow hit area does not reach the card inner edge');
      const arrowIcon = box.querySelector('.combo-arrow svg').getBoundingClientRect();
      const calculatorIcon = box.closest('.currency-field').querySelector('.calculator-trigger svg').getBoundingClientRect();
      if (Math.abs((arrowIcon.left + arrowIcon.right - calculatorIcon.left - calculatorIcon.right) / 2) > 0.5) throw Error('Arrow and calculator icons are not aligned');
    });
  });
}
await checkArrowBounds();
const inputCorner = await page.evaluate(() => {
  const rect = document.querySelector('[data-field="from"] .combo-input').getBoundingClientRect();
  return { x: rect.left + 6, y: rect.top + 6 };
});
await page.mouse.click(inputCorner.x, inputCorner.y);
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (!box.classList.contains('open') || box.querySelector('input').value !== '' || box.dataset.value !== 'USD') throw Error('Opening search changed the selected currency or did not clear the display');
  const list = box.querySelector('.combo-scroll');
  const first = list.querySelector('.combo-item');
  const padding = parseFloat(getComputedStyle(list).paddingTop) + parseFloat(getComputedStyle(list).paddingBottom);
  const rows = (list.clientHeight - padding) / first.offsetHeight;
  if (Math.abs(rows - Math.round(rows)) > 0.02) throw Error('Visible currency rows have uneven edge spacing');
  if (Math.round(rows) !== 6) throw Error('Expected six visible currencies when space permits');
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
await page.click('[data-field="from"] .combo-input');
await page.press('[data-field="from"] .combo-input', 'Enter');
await page.evaluate(() => {
  if (document.querySelector('[data-field="from"]').dataset.value !== 'EUR') throw Error('Enter changed the selected currency after reopening');
});
await page.click('[data-field="to"] .combo-input');
await page.fill('[data-field="to"] .combo-input', 'JPY');
await page.click('.converter-title');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="to"]');
  if (box.classList.contains('open') || box.dataset.value !== 'CNY' || !box.querySelector('input').value.includes('CNY')) throw Error('Clicking outside did not restore the selected currency');
});
await page.evaluate(() => {
  const field = document.querySelector('[data-field="from"]').closest('.currency-field');
  Object.assign(field.style, { position: 'fixed', top: '20px', left: '20px', width: '300px', zIndex: '100' });
});
await page.click('[data-field="from"] .combo-arrow');
await page.waitForFunction(() => {
  const box = document.querySelector('[data-field="from"]');
  const field = box.closest('.currency-field').getBoundingClientRect();
  const panel = box.querySelector('.combo-panel').getBoundingClientRect();
  return Math.abs(panel.left - field.left) < 1 && Math.abs(panel.right - field.right) < 1 && Math.abs(panel.top - field.bottom - 6) < 1;
});
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (box.classList.contains('open-up')) throw Error('Menu should open down when space is available');
  if (box.querySelector('.combo-item').getBoundingClientRect().height > 45) throw Error('Currency row is too tall');
  const field = box.closest('.currency-field');
  field.style.top = (innerHeight - field.offsetHeight - 20) + 'px';
  window.dispatchEvent(new Event('resize'));
  const panel = box.querySelector('.combo-panel').getBoundingClientRect();
  const rect = field.getBoundingClientRect();
  if (!box.classList.contains('open-up') || panel.top < 0 || Math.abs(panel.bottom - rect.top + 6) > 1 || Math.abs(panel.left - rect.left) > 1 || Math.abs(panel.right - rect.right) > 1) throw Error('Menu did not align above the field');
});
await page.click('[data-field="from"] .combo-arrow');
await page.evaluate(() => {
  const box = document.querySelector('[data-field="from"]');
  if (!box.classList.contains('open-up') || !box.querySelector('.combo-item')) throw Error('Closing menu lost its direction or contents before fading out');
});
await page.evaluate(() => document.querySelector('[data-field="from"]').closest('.currency-field').removeAttribute('style'));
await page.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await checkArrowBounds();
await page.click('[data-field="to"] .combo-arrow');
const rightEdge = await page.evaluate(() => {
  const rect = document.querySelector('[data-field="to"] .combo-arrow').getBoundingClientRect();
  return { x: rect.right - 2, y: (rect.top + rect.bottom) / 2 };
});
await page.mouse.click(rightEdge.x, rightEdge.y);
await page.evaluate(() => {
  if (document.querySelector('[data-field="to"]').classList.contains('open')) throw Error('Clicking the card edge did not close the menu');
});
await page.mouse.click(rightEdge.x, rightEdge.y);
await page.evaluate(() => {
  const box = document.querySelector('[data-field="to"]');
  if (!box.classList.contains('open') || box.querySelector('input').value !== '' || document.documentElement.scrollWidth > document.documentElement.clientWidth) throw Error('Mobile search failed');
  const field = box.closest('.currency-field').getBoundingClientRect();
  const panel = box.querySelector('.combo-panel').getBoundingClientRect();
  if (Math.abs(panel.left - field.left) > 1 || Math.abs(panel.right - field.right) > 1) throw Error('Mobile menu does not match the field width');
});
await task.finish({ keep: [] });
console.log('Currency search browser regression passed');
