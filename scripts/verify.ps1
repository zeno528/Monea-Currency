#Requires -Version 7.0

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

function Invoke-VerificationStep {
  param(
    [Parameter(Mandatory)]
    [string]$Name,

    [Parameter(Mandatory)]
    [string[]]$CommandArguments
  )

  Write-Host "==> $Name"
  & pnpm @CommandArguments
  $verificationExitCode = $LASTEXITCODE

  if ($verificationExitCode -ne 0) {
    Write-Error "$Name failed with exit code $verificationExitCode."
    exit $verificationExitCode
  }
}

Invoke-VerificationStep -Name 'Wrangler types check' -CommandArguments @(
  'exec', 'wrangler', 'types', '--check'
)
Invoke-VerificationStep -Name 'TypeScript compile check' -CommandArguments @(
  'exec', 'tsc', '--noEmit'
)
Invoke-VerificationStep -Name 'Test suite' -CommandArguments @(
  'test'
)
Invoke-VerificationStep -Name 'Wrangler deploy dry-run' -CommandArguments @(
  'exec', 'wrangler', 'deploy', '--dry-run'
)

Write-Host 'All verification steps passed.'
