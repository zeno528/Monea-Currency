const task = await taskSpace("monea-calculator-regression");
const page = task.page("p1");
await page.goto("http://localhost:8787/");
await page.snapshot();
await page.click('[data-amount="from-amount"]');
await page.keyboard.type("200");
await page.keyboard.type("+");
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "200") throw Error("Pending formula changed the amount");
});
await page.keyboard.type("10%");
await page.waitForFunction(() => {
  const output = document.querySelector("#to-amount").value;
  return output && !document.querySelector(".rate-summary").classList.contains("is-loading")
    && document.querySelector("#calc-preview").textContent.includes(output);
});
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "220") throw Error("Live percentage did not fill the amount");
});
await page.click('[data-calc-key="clear"]');
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "0" || document.querySelector("#to-amount").value !== "0") throw Error("AC did not reset both amounts");
});
await page.keyboard.type("1/0");
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "1") throw Error("Invalid formula overwrote the last valid amount");
});
await page.keyboard.press("Enter");
await page.waitForFunction(() => !document.querySelector("#calculator").open);
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "1" || document.documentElement.classList.contains("calculator-open")) throw Error("Enter failed to preserve the amount or release the scroll lock");
});
await page.click('[data-amount="from-amount"]');
await page.keyboard.type("900719925474099");
await page.keyboard.type("3");
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "900,719,925,474,099") throw Error("Precision-losing result was filled");
  if (!document.querySelector("#calc-expression").textContent.includes("精度")) throw Error("Precision error is missing");
});
await page.click('[data-calc-key="clear"]');
await page.keyboard.type("1000000000001");
await page.evaluate(() => {
  if (document.querySelector("#from-amount").value !== "1,000,000,000,001") throw Error("The old trillion limit returned");
});
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector("#calculator").open);
await page.click('[data-amount="to-amount"]');
await page.keyboard.type("250");
await page.evaluate(() => {
  if (document.querySelector("#to-amount").value !== "250") throw Error("Reverse live filling failed");
});
await page.keyboard.press("Enter");
await page.waitForFunction(() => !document.querySelector("#calculator").open);
await task.finish({ keep: [] });
console.log("Calculator browser regression passed");
