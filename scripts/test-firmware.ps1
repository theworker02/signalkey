$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$zig = $env:SIGNALKEY_ZIG
if (-not $zig) { $zig = Join-Path $taskRoot '.local/tools/zig/zig-x86_64-windows-0.15.2/zig.exe' }
if (-not (Test-Path -LiteralPath $zig)) { throw 'Set SIGNALKEY_ZIG to a Zig 0.15.2 executable.' }
$env:ZIG_GLOBAL_CACHE_DIR = Join-Path $taskRoot '.local/zig-cache'
$env:ZIG_LOCAL_CACHE_DIR = Join-Path $taskRoot '.local/zig-cache-local'
$compilerVersion = & $zig version
if ($LASTEXITCODE -ne 0) { throw 'Compiler version failed' }
foreach ($testName in @('protocol','button','session')) {
  & $zig cc -std=c11 -Wall -Wextra -Werror -Ifirmware "firmware/${testName}_test.c" -o ".local/${testName}-test.exe"
  if ($LASTEXITCODE -ne 0) { throw "$testName compile failed" }
  if ($testName -eq 'protocol') {
    $fixture = Get-Content -Raw packages/protocol/golden.json | ConvertFrom-Json
    & ".local/${testName}-test.exe" $fixture.heartbeat
  } else { & ".local/${testName}-test.exe" }
  if ($LASTEXITCODE -ne 0) { throw "$testName test failed" }
}
@{ date = (Get-Date).ToUniversalTime().ToString('o'); compiler = "Zig $compilerVersion cc"; protocol = 'PASS'; gestures = 'PASS'; sessionGate = 'PASS'; armFirmwareBuild = 'See arm-firmware-build.json for separate ARM evidence'; physicalHardware = 'NOT TESTED' } | ConvertTo-Json | Set-Content -Encoding utf8 docs/evidence/native-firmware-tests.json
