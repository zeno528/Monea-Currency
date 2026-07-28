import {
  CORS_HEADERS,
  UPSTREAM,
  handleConvert,
  handleCurrencies,
  handleHistory,
  handleLatest,
  json,
  today,
  warmBaseCache,
} from "./server/api";
import { HOME_HTML } from "./ui/home";

interface Env {
  SELF: Fetcher;
}

export default {
  async fetch(request: Request, _env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }
    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, { Allow: "GET, OPTIONS" });
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case "/":
          return new Response(HOME_HTML, {
            // 页面脚本与样式均内嵌在 HTML 中；不缓存入口文档，确保普通刷新即可取得
            // 最新客户端逻辑。汇率 API 仍按各自策略缓存，不影响换算性能。
            headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store", ...CORS_HEADERS },
          });
        case "/convert":
          return await handleConvert(url, ctx);
        case "/history":
          return await handleHistory(url, ctx);
        case "/latest":
          return await handleLatest(url, ctx);
        case "/currencies":
          return await handleCurrencies(ctx);
        case "/health":
          return json({ status: "ok", upstream: UPSTREAM, time: today() });
        case "/api":
          return json({
            name: "Monea Currency",
            endpoints: {
              convert: "/convert?from=USD&to=CNY&amount=100",
              history: "/history?from=USD&to=CNY&range=1M",
              latest: "/latest?base=USD",
              currencies: "/currencies",
              health: "/health",
            },
            source: UPSTREAM,
            cache: "live fresh=5m, no-swr, sie=24h (CDN edge)",
          });
        default:
          return json({ error: "Not found", see: "/api" }, 404);
      }
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },

  // 每 3 小时预热 10 个常用 base 的全量汇率到 CDN 边沿，
  // 走 SELF service binding → 自身 fetch handler → 按 live-rate 策略 Cache-Control 落 CDN；
  // 长尾币种继续按需缓存，避免为低频选择制造大量无效回源。
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await warmBaseCache(env, ctx);
  },
};
