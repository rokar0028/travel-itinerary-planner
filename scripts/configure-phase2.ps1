# SUBMISSION_PLAN Phase 2: Vercel env, Render CORS, Supabase auth URLs
param(
  [string]$VercelUrl = 'https://frontend-three-sage-86vb7v4ibz.vercel.app',
  [string]$ApiUrl = 'https://travel-itinerary-api-vb27.onrender.com',
  [string]$SupabaseProjectRef = 'ysvrbkesdwmkmuqlrthd',
  [switch]$SkipDeploy
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$VercelUrl = $VercelUrl.TrimEnd('/')
$ApiUrl = $ApiUrl.TrimEnd('/')

Write-Host '=== Phase 2A: Vercel production env ==='
& (Join-Path $PSScriptRoot 'load-dotenv.ps1') -Path (Join-Path $Root 'frontend\.env.local')

$viteNames = @('VITE_API_URL', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY')
$viteValues = @{
  VITE_API_URL           = $ApiUrl
  VITE_SUPABASE_URL      = $env:VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY = $env:VITE_SUPABASE_ANON_KEY
}
foreach ($name in $viteNames) {
  if (-not $viteValues[$name]) { throw "Missing $name in frontend/.env.local" }
}

Push-Location (Join-Path $Root 'frontend')
$prevEap = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
  foreach ($name in $viteNames) {
    $val = $viteValues[$name]
    npx --yes vercel@latest env rm $name --environment production --yes 2>$null | Out-Null
    $extra = @()
    if ($name -eq 'VITE_SUPABASE_ANON_KEY') {
      $extra = @('--type', 'config')
    }
    npx --yes vercel@latest env add $name --environment production --value $val --yes --force @extra
    if ($LASTEXITCODE -ne 0) {
      throw "vercel env add failed for $name (exit $LASTEXITCODE)"
    }
    Write-Host "  Vercel production: $name"
  }
} finally {
  $ErrorActionPreference = $prevEap
  Pop-Location
}

Write-Host '=== Phase 2B: Render CORS + Supabase keys ==='
& (Join-Path $PSScriptRoot 'update-render-cors.ps1') -VercelUrl $VercelUrl
& (Join-Path $PSScriptRoot 'sync-render-env.ps1')

Write-Host '=== Phase 2C: Supabase Auth URL configuration ==='
$token = $env:SUPABASE_ACCESS_TOKEN
if ($token) {
  $authBody = @{
    site_url         = $VercelUrl
    uri_allow_list   = "$VercelUrl/**,http://localhost:5173/**"
  } | ConvertTo-Json
  $authHeaders = @{
    Authorization = "Bearer $token"
    'Content-Type' = 'application/json'
  }
  try {
    Invoke-RestMethod `
      -Method PATCH `
      -Uri "https://api.supabase.com/v1/projects/$SupabaseProjectRef/config/auth" `
      -Headers $authHeaders `
      -Body $authBody | Out-Null
    Write-Host "  Supabase auth URLs updated (site_url + redirect list)"
  } catch {
    Write-Warning "Supabase API failed: $($_.Exception.Message). Configure manually in dashboard."
  }
} else {
  Write-Host '  Set SUPABASE_ACCESS_TOKEN (dashboard Account > Access Tokens) to auto-apply, or edit:'
  Write-Host "  https://supabase.com/dashboard/project/$SupabaseProjectRef/auth/url-configuration"
  Write-Host "  Site URL: $VercelUrl"
  Write-Host "  Redirect URLs: $VercelUrl/** and http://localhost:5173/**"
}

if (-not $SkipDeploy) {
  Write-Host '=== Redeploy API + frontend ==='
  & (Join-Path $PSScriptRoot 'deploy-render.ps1')
  $env:VITE_API_URL = $ApiUrl
  & (Join-Path $PSScriptRoot 'deploy-vercel.ps1') -ApiUrl $ApiUrl
}

Write-Host '=== Verify ==='
& (Join-Path $PSScriptRoot 'verify-production.ps1') -ApiUrl $ApiUrl -VercelUrl $VercelUrl
Write-Host 'Phase 2 complete. Test magic link on production (Phase 3.2).'
