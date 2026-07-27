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

interface Env {}

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
            headers: { "Content-Type": "text/html;charset=utf-8", ...CORS_HEADERS },
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
            cache: "fresh=1h, swr=24h, sie=24h (CDN edge)",
          });
        default:
          return json({ error: "Not found", see: "/api" }, 404);
      }
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },

  // 每 3 小时预热 top-10 基础币的全量汇率到 caches.default，
  // 消除首次切到冷门 base 的 200-600ms 欧洲冷启延迟。
  async scheduled(_controller: ScheduledController, _env: Env, ctx: ExecutionContext): Promise<void> {
    await warmBaseCache(ctx);
  },
};
