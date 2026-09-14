$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$checks = @()
foreach ($taskScript in @('typecheck','test')) {
  $taskLog = & npm.cmd run $taskScript 2>&1
  $taskCode = $LASTEXITCODE
  $checks += @{ command="npm run $taskScript"; exitCode=$taskCode; output=($taskLog -join "`n") }
  $taskLog | Write-Output
  if ($taskCode -ne 0) { throw "Verification failed: $taskScript" }
}
$taskExe = 'release/0.1.0-alpha.2-integration/SignalKey-win32-x64/SignalKey.exe'
$taskSignature = Get-AuthenticodeSignature -LiteralPath $taskExe
@{date=(Get-Date).ToUniversalTime().ToString('o'); os=[System.Environment]::OSVersion.VersionString;node=(& node --version); npm=(& npm.cmd --version); checks=$checks; signature=$taskSignature.Status.ToString();physicalHardware=$false;cleanMachine=$false} | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 docs/evidence/integration-checks.json
