$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$lock = Get-Content -Raw firmware/toolchain-lock.json | ConvertFrom-Json
$env:PICO_SDK_PATH = (Resolve-Path .local/pico-sdk).Path
$sdkCommit = git -C .local/pico-sdk rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $sdkCommit -ne $lock.sdk.commit) { throw 'Pico SDK commit does not match toolchain-lock.json' }
$tinyCommit = git -C .local/pico-sdk/lib/tinyusb rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $tinyCommit -ne $lock.sdk.tinyusbCommit) { throw 'TinyUSB commit mismatch' }
git -C .local/pico-sdk diff --quiet
if ($LASTEXITCODE -ne 0) { throw 'Pico SDK has modified tracked files' }
git -C .local/pico-sdk/lib/tinyusb diff --quiet
if ($LASTEXITCODE -ne 0) { throw 'TinyUSB has modified tracked files' }
foreach ($item in $lock.archives) {
  $archive = Join-Path $taskRoot ('.local/tools/' + $item.name + '.zip')
  if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $item.sha256) { throw ('Tool archive mismatch: ' + $item.name) }
}
$taskArm = (Resolve-Path .local/tools/arm).Path
$taskNinja = (Resolve-Path .local/tools/ninja/ninja.exe).Path
$taskPio = (Resolve-Path .local/tools/pico-tools/pioasm).Path
cmake -S firmware -B .local/firmware-check -G Ninja "-DCMAKE_MAKE_PROGRAM=$taskNinja" "-DPICO_TOOLCHAIN_PATH=$taskArm" "-Dpioasm_DIR=$taskPio" -DPICO_BOARD=pico -DSIGNALKEY_BUILD_CHECK=ON -DCMAKE_BUILD_TYPE=Release
if ($LASTEXITCODE -ne 0) { throw 'ARM configuration failed' }
cmake --build .local/firmware-check --parallel 4
if ($LASTEXITCODE -ne 0) { throw 'ARM build failed' }
$size = & "$taskArm/bin/arm-none-eabi-size.exe" .local/firmware-check/signalkey.elf
if ($LASTEXITCODE -ne 0) { throw 'Size inspection failed' }
$compiler = & "$taskArm/bin/arm-none-eabi-gcc.exe" -dumpfullversion
$sourceHashes = @(Get-ChildItem -LiteralPath firmware -File | Where-Object Extension -In @('.c','.h','.pio','.txt') | ForEach-Object { @{name=$_.Name;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash} })
@{date=(Get-Date).ToUniversalTime().ToString('o');result='PASS';mode='ARM compile and link check; invalid USB IDs 0:0; do not flash';sdkCommit=$sdkCommit;tinyusbCommit=$tinyCommit;compiler=$compiler;size=$size;elfSha256=(Get-FileHash .local/firmware-check/signalkey.elf -Algorithm SHA256).Hash;sourceHashes=$sourceHashes;hardwareTested=$false;uf2Generated=$false} | ConvertTo-Json -Depth 6 | Set-Content -Encoding utf8 docs/evidence/arm-firmware-build.json
$size
