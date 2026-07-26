# Monea Currency

<p align="center">
  <img src="docs/screenshots/preview.png" alt="Monea Currency 网站预览" width="800" />
</p>

> 全球货币，轻松换算。

一个部署在 Cloudflare Workers 上的汇率换算工具，提供简洁的网页界面与 JSON API。

## 功能

- 覆盖多种货币，支持搜索与快捷换算
- 提供 `/convert`、`/latest`、`/currencies` 和 `/health` API
- 使用 Cloudflare 边缘缓存，缓存时长为 1 小时
- 无需 API Key

## 本地运行

```bash
pnpm install
pnpm dev
```

部署：

```bash
pnpm deploy
```

## API 示例

```text
GET /convert?from=USD&to=CNY&amount=100
GET /latest?base=USD
GET /currencies
GET /health
```

## 致谢

汇率数据由开源项目 [Frankfurter](https://frankfurter.dev/) 提供。感谢其维护免费的货币数据 API 与公开数据来源。
