# Full deploy: Render API first, then Vercel (you paste API URL if auto-detect fails)
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'deploy-render.ps1')

Write-Host ''
Write-Host 'Enter your Render API URL (https://....onrender.com):'
$api = Read-Host
if (-not $api) { throw 'API URL required for Vercel build' }

$env:VITE_API_URL = $api.TrimEnd('/')
& (Join-Path $PSScriptRoot 'deploy-vercel.ps1') -ApiUrl $env:VITE_API_URL
