# 预热 Worker CDN 边沿：拉 165 个 base 的 /latest 端点。
# PowerShell 7 包装层：自动设好 env var，免去手动 $env:WORKER_URL = '...' 那一步。
#
# 用法：
#   pwsh scripts/warm.ps1                                          # 预热本地 wrangler dev
#   pwsh scripts/warm.ps1 -WorkerUrl 'https://monea-currency.ekko1697.workers.dev'   # 预热线上
#   pwsh scripts/warm.ps1 -Concurrency 30                         # 自定义并发

[CmdletBinding()]
param(
  [string]$WorkerUrl,
  [int]$Concurrency = 20
)

# PowerShell 5.1 的 .ps1 关联经常是 powershell.exe（Windows PowerShell 5.1），
# 不支持 $env:VAR = '...'; cmd 这种 PS7 写法。本脚本要求 PowerShell 7+。
if ($PSVersionTable.PSVersion.Major -lt 7) {
  Write-Error "Need PowerShell 7+. Run: pwsh scripts/warm.ps1"
  exit 2
}

if ($WorkerUrl) {
  $env:WORKER_URL = $WorkerUrl
}

if ($PSBoundParameters.ContainsKey('Concurrency')) {
  $env:CONCURRENCY = "$Concurrency"
}

pnpm warm
exit $LASTEXITCODE
