# Deploy FastAPI to Render via CLI (run from repo root)
# Prereqs: render login, payment method on Render (free tier), backend/.env filled

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$Render = Join-Path $Root '.tools\render-v2\render.exe'

if (-not (Test-Path $Render)) {
  Write-Host 'Render CLI missing. Run: scripts/setup-cli.ps1'
  exit 1
}

. (Join-Path $PSScriptRoot 'load-dotenv.ps1') -Path (Join-Path $Root 'backend\.env')

foreach ($k in @('SUPABASE_URL', 'SUPABASE_ANON_KEY')) {
  if (-not (Get-Item "env:$k" -ErrorAction SilentlyContinue)) {
    throw "Missing $k in backend/.env"
  }
}

if (-not $env:CORS_ORIGINS) { $env:CORS_ORIGINS = 'http://localhost:5173' }

& $Render workspace set tea-d9oruacs728c73fpn1gg --confirm | Out-Null

Write-Host 'Validating render.yaml...'
& $Render blueprints validate (Join-Path $Root 'render.yaml') -o text --confirm
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Blueprint validation warning (continuing). If need_payment_info, add billing or create service manually.'
}

$existing = & $Render services -o json --confirm | ConvertFrom-Json
$svc = $existing | Where-Object { $_.service.name -eq 'travel-itinerary-api' } | Select-Object -First 1

if ($svc) {
  $id = $svc.service.id
  Write-Host "Service exists ($id). Triggering deploy..."
  & $Render deploys create $id --confirm --wait -o text
} else {
  Write-Host 'Creating web service travel-itinerary-api...'
  & $Render services create `
    --name travel-itinerary-api `
    --type web_service `
    --repo https://github.com/rokar0028/travel-itinerary-planner `
    --branch main `
    --runtime python `
    --root-directory backend `
    --build-command 'pip install -r requirements.txt' `
    --start-command 'uvicorn app.main:app --host 0.0.0.0 --port $PORT' `
    --health-check-path /health `
    --region singapore `
    --plan free `
    --env-var "SUPABASE_URL=$env:SUPABASE_URL" `
    --env-var "SUPABASE_ANON_KEY=$env:SUPABASE_ANON_KEY" `
    --env-var "CORS_ORIGINS=$env:CORS_ORIGINS" `
    -o json --confirm
}

Write-Host 'Done. Find URL: render services -o json | findstr onrender'
