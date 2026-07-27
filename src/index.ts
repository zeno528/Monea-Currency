import {
  CORS_HEADERS,
  HOURLY_UPSTREAM,
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

import type { Env } from "./server/api";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
          return await handleConvert(url, env, ctx);
        case "/history":
          return await handleHistory(url, ctx);
        case "/latest":
          return await handleLatest(url, env, ctx);
        case "/currencies":
          return await handleCurrencies(ctx);
        case "/health":
          return json({ status: "ok", upstream: env.CURRENCYAPI_KEY ? HOURLY_UPSTREAM : UPSTREAM, time: today() });
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
            source: env.CURRENCYAPI_KEY ? HOURLY_UPSTREAM : UPSTREAM,
            cache: "fresh=1h, swr=5m, sie=24h (CDN edge)",
          });
        default:
          return json({ error: "Not found", see: "/api" }, 404);
      }
    } catch (err) {
      return json({ error: String(err) }, 500);
    }
  },

  // 每小时预热 USD 基准快照，所有货币对都从同一份小时数据派生。
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await warmBaseCache(env, ctx);
  },
};
