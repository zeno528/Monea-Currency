import { HOME_CLIENT } from "./client";
import { HOME_MARKUP } from "./markup";
import { HOME_STYLES } from "./styles";

export const HOME_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>汇率换算 · Monea Currency</title>
<link rel="icon" href="/currency-logo.svg" type="image/svg+xml">
<style>
${HOME_STYLES}</style>
${HOME_MARKUP}  <script>
window.__HISTORY_CLIENT_URL = "/history-client.js?v=20260727-historyux2";
${HOME_CLIENT}  </script>
</body>
</html>`;

