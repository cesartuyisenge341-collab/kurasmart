$ErrorActionPreference = 'Stop'

$mobilePath = Join-Path $PSScriptRoot 'mobile'
if (-not (Test-Path (Join-Path $mobilePath 'package.json'))) {
    throw "Expo app was not found at $mobilePath"
}

Set-Location $mobilePath
npm start
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
