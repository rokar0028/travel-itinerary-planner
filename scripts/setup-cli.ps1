# Download Render CLI v2 into .tools/ (no admin install required)
$ErrorActionPreference = 'Stop'
$dir = Join-Path (Split-Path $PSScriptRoot -Parent) '.tools\render-v2'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$zip = Join-Path $dir '..\render-v2.zip'
Invoke-WebRequest -Uri 'https://github.com/render-oss/cli/releases/download/v2.31.0/cli_2.31.0_windows_amd64.zip' -OutFile $zip
Expand-Archive -Path $zip -DestinationPath $dir -Force
Write-Host "Render CLI: $(Join-Path $dir 'render.exe')"
Write-Host 'Next: .tools\render-v2\render.exe login'
