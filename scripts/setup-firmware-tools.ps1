# Run only when preparing this project's local firmware tools. No system install.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$taskRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $taskRoot
$lock = Get-Content -Raw firmware/toolchain-lock.json | ConvertFrom-Json
New-Item -ItemType Directory -Force .local/tools | Out-Null
foreach ($item in $lock.archives) {
  $archive = Join-Path $taskRoot ('.local/tools/' + $item.name + '.zip')
  $destination = Join-Path $taskRoot ('.local/tools/' + $item.name)
  if (-not (Test-Path -LiteralPath $archive)) { Invoke-WebRequest $item.url -OutFile $archive }
  if ((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash -ne $item.sha256) { throw ('Archive hash mismatch: ' + $item.name) }
  if (-not (Test-Path -LiteralPath $destination)) { Expand-Archive -LiteralPath $archive -DestinationPath $destination }
}
if (-not (Test-Path -LiteralPath .local/pico-sdk)) {
  git clone --depth 1 --branch $lock.sdk.tag $lock.sdk.url .local/pico-sdk
  if ($LASTEXITCODE -ne 0) { throw 'SDK clone failed' }
}
$sdkCommit = git -C .local/pico-sdk rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $sdkCommit -ne $lock.sdk.commit) { throw 'Existing SDK does not match the pinned commit; no checkout changed' }
git -C .local/pico-sdk submodule update --init lib/tinyusb
if ($LASTEXITCODE -ne 0) { throw 'TinyUSB setup failed' }
Write-Output 'Local tools prepared. Run scripts/build-firmware-check.ps1.'
