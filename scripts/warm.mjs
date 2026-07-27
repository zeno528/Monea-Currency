// 预热 Worker CDN 边沿：拉 165 个 base 的 /latest 端点。
// 与 cron 预热（src/server/api.ts warmBaseCache）走同一条 fetch handler 路径，
// 区别仅在 cron 由 SELF service binding 内部触发、本脚本由外部 HTTP 触发——
// 两条路都会让响应按 live-rate 策略写入 CDN 边沿（cache.enabled: true 自动按
// Cache-Control 头落），跨 DC 共享。
//
// 用法：
//   pnpm warm                                  // 预热本地 wrangler dev (默认 http://localhost:8787)
//   WORKER_URL=https://monea.example.com pnpm warm   // 预热线上
//   CONCURRENCY=30 pnpm warm                   // 自定义并发（默认 20）
//
// 退出码：全部成功 → 0；任一 base 失败 → 1。

import process from "node:process";

const url = (process.env.WORKER_URL ?? "http://localhost:8787").replace(/\/$/, "");
const concurrency = Number.parseInt(process.env.CONCURRENCY ?? "20", 10);
if (!Number.isFinite(concurrency) || concurrency < 1) {
  console.error(`Invalid CONCURRENCY: ${process.env.CONCURRENCY}`);
  process.exit(2);
}

const t0 = Date.now();

// 从 frankfurter 拿当前最新 base 列表——避免与 src/server/api.ts 的硬编码列表漂移。
// 单次额外请求的开销（<1s）远小于脚本可能因漏改硬编码而预热不全的风险。
const currenciesResp = await fetch("https://api.frankfurter.dev/v2/currencies");
if (!currenciesResp.ok) {
  console.error(`Failed to fetch currency list from Frankfurter: ${currenciesResp.status}`);
  process.exit(1);
}
const currencies = await currenciesResp.json();
const bases = currencies.map((c) => c.iso_code).sort();

console.log(`Warming ${bases.length} bases against ${url} (concurrency=${concurrency})`);

const queue = [...bases];
const stats = { ok: 0, fail: 0, totalMs: 0 };
const failed = [];

// 限流 worker：从共享队列里抢 base 直到空。失败只记日志不抛——个别 base 失败不影响其他。
async function worker() {
  while (queue.length) {
    const base = queue.shift();
    if (!base) return;
    const start = Date.now();
    try {
      const resp = await fetch(`${url}/latest?base=${base}`, {
        headers: { "X-Monea-Cache-Warm": "1" },
      });
      if (resp.ok) {
        stats.ok++;
        // 排空 body 让连接可复用；同时让上游 / Workers Cache 走完序列化。
        await resp.text();
      } else {
        stats.fail++;
        failed.push(base);
        console.error(`  ✗ ${base}: ${resp.status}`);
      }
    } catch (error) {
      stats.fail++;
      failed.push(base);
      console.error(`  ✗ ${base}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      stats.totalMs += Date.now() - start;
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const wallMs = Date.now() - t0;
const avgMs = (stats.totalMs / bases.length).toFixed(0);
const summary = `✓ ${stats.ok}/${bases.length} warmed in ${wallMs}ms (avg ${avgMs}ms/req${stats.fail ? `, ${stats.fail} failed` : ""})`;
if (stats.fail) {
  console.error(`\n${summary}`);
  console.error(`Failed bases: ${failed.join(", ")}`);
  process.exit(1);
}
console.log(summary);
process.exit(0);
