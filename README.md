# Monea Currency

<p align="center">
  <img src="docs/screenshots/preview.png" alt="Monea Currency 网站预览" width="800" />
</p>

> 全球货币，轻松换算。

一个部署在 Cloudflare Workers 上的汇率换算工具，提供简洁的网页界面与 JSON API。

## 功能

- 覆盖多种货币，支持搜索与快捷换算
- 提供 `/convert`、`/history`、`/latest`、`/currencies` 和 `/health` API
- 最新汇率使用 currencyapi 的 USD 基准快照，每小时刷新一次并显示精确更新时间；任意货币对从同一份快照派生
- 历史走势、指定日期查询与小时源故障降级使用 Frankfurter 的日度参考数据
- 使用 Cloudflare 边缘缓存：最新汇率 1 小时 fresh、5 分钟 SWR；货币目录与指定历史日期最长 24 小时；上游短暂异常时回退最近一次成功结果

## 本地运行

```bash
pnpm install
pnpm dev
```

本地小时级数据需要在未提交的 `.dev.vars` 中设置：

```text
CURRENCYAPI_KEY=你的_currencyapi_密钥
```

部署：

```bash
pnpm deploy
```

生产环境使用 Cloudflare Secret 保存密钥：

```bash
pnpm exec wrangler secret put CURRENCYAPI_KEY
```

## API 示例

```text
GET /convert?from=USD&to=CNY&amount=100
GET /history?from=USD&to=CNY&range=1M
GET /latest?base=USD
GET /currencies
GET /health
```

`/latest` 在小时源可用时返回精确更新时间；未配置密钥、小时源故障或货币未覆盖时会降级为 Frankfurter 的数据日期：

```json
{
  "base": "USD",
  "updatedAt": "2026-07-28T03:15:00Z",
  "source": "currencyapi",
  "rates": {
    "CNY": { "rate": 7.2, "date": "2026-07-28", "updatedAt": "2026-07-28T03:15:00Z" }
  }
}
```

所有端点仅接受 `GET`（`OPTIONS` 用于 CORS 预检）。`amount` 必须是非负十进制数。

## 测试

```bash
pnpm test
```

测试使用 Cloudflare Workers 的 Vitest 集成，在本地 `workerd` 运行。

## 致谢

最新汇率由 [currencyapi](https://currencyapi.com/) 提供，历史参考数据由开源项目 [Frankfurter](https://frankfurter.dev/) 提供。两者均非实时交易报价；使用前请按各自的套餐和许可条件确认用途。
