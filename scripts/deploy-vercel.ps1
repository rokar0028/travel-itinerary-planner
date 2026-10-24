# Deploy React frontend to Vercel (run from repo root)
# Prereqs: npx vercel login  OR  $env:VERCEL_TOKEN set

param(
  [string]$ApiUrl = $env:VITE_API_URL
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$Frontend = Join-Path $Root 'frontend'
$EnvLocal = Join-Path $Frontend '.env.local'

if (Test-Path $EnvLocal) {
  . (Join-Path $PSScriptRoot 'load-dotenv.ps1') -Path $EnvLocal
}

if (-not $ApiUrl) { $ApiUrl = $env:VITE_API_URL }
if (-not $ApiUrl) {
  throw 'Set VITE_API_URL (Render API URL) or pass -ApiUrl https://....onrender.com'
}

foreach ($k in @('VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY')) {
  if (-not (Get-Item "env:$k" -ErrorAction SilentlyContinue)) {
    throw "Missing $k in frontend/.env.local"
  }
}

Push-Location $Frontend
try {
  $vercelArgs = @(
    'vercel@latest', '--prod', '--yes',
    '--build-env', "VITE_API_URL=$ApiUrl",
    '--build-env', "VITE_SUPABASE_URL=$env:VITE_SUPABASE_URL",
    '--build-env', "VITE_SUPABASE_ANON_KEY=$env:VITE_SUPABASE_ANON_KEY"
  )
  if ($env:VERCEL_TOKEN) { $vercelArgs += @('--token', $env:VERCEL_TOKEN) }

  npx @vercelArgs
} finally {
  Pop-Location
}

Write-Host 'After deploy: update Render CORS_ORIGINS with your Vercel URL, then redeploy API.'
