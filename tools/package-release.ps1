param(
  [string]$OutputDir = "dist",
  [string]$ZipName = "dolmenwood.zip"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $root

if (-not (Test-Path "module.json")) {
  throw "module.json not found in repository root."
}

$module = Get-Content "module.json" -Raw | ConvertFrom-Json
$moduleId = [string]$module.id
$version = [string]$module.version

if ([string]::IsNullOrWhiteSpace($moduleId)) {
  throw "module.json id is empty."
}

if ([string]::IsNullOrWhiteSpace($version)) {
  throw "module.json version is empty."
}

$outRoot = Join-Path $root $OutputDir
$stagingModuleDir = Join-Path $outRoot $moduleId

if (Test-Path $outRoot) {
  Remove-Item -Recurse -Force $outRoot
}

New-Item -ItemType Directory -Path $stagingModuleDir -Force | Out-Null

$runtimePaths = @(
  "module.json",
  "scripts",
  "styles",
  "templates",
  "lang",
  "src/components",
  "README.md"
)

foreach ($path in $runtimePaths) {
  if (-not (Test-Path $path)) {
    Write-Warning "Skipping missing path: $path"
    continue
  }

  $destination = Join-Path $stagingModuleDir $path
  $destinationParent = Split-Path $destination -Parent

  if (-not (Test-Path $destinationParent)) {
    New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
  }

  Copy-Item -Path $path -Destination $destination -Recurse -Force
}

$latestZipPath = Join-Path $outRoot $ZipName
$versionedZipPath = Join-Path $outRoot "$moduleId-v$version.zip"

if (Test-Path $latestZipPath) {
  Remove-Item -Force $latestZipPath
}

if (Test-Path $versionedZipPath) {
  Remove-Item -Force $versionedZipPath
}

Compress-Archive -Path $stagingModuleDir -DestinationPath $latestZipPath -Force
Copy-Item -Path $latestZipPath -Destination $versionedZipPath -Force
Copy-Item -Path "module.json" -Destination (Join-Path $outRoot "module.json") -Force

Write-Host ""
Write-Host "Package created:"
Write-Host "  $latestZipPath"
Write-Host "  $versionedZipPath"
Write-Host "  $(Join-Path $outRoot "module.json")"
