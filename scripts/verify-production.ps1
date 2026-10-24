# Quick checks for SUBMISSION_PLAN Phase 0–2 (no secrets required)
param(
  [string]$ApiUrl = 'https://travel-itinerary-api-vb27.onrender.com',
  [string]$VercelUrl = 'https://frontend-three-sage-86vb7v4ibz.vercel.app'
)

$ErrorActionPreference = 'Stop'
$ApiUrl = $ApiUrl.TrimEnd('/')
$origin = $VercelUrl.TrimEnd('/')

Write-Host "Health: $ApiUrl/health"
$health = curl.exe -s "$ApiUrl/health" | ConvertFrom-Json
Write-Host "  status=$($health.status) supabase=$($health.supabase)"

Write-Host "CORS preflight (Origin: $origin)"
$headers = curl.exe -s -I -X OPTIONS "$ApiUrl/api/meta" `
  -H "Origin: $origin" `
  -H "Access-Control-Request-Method: GET" 2>&1
$allow = $headers | Select-String 'access-control-allow-origin'
if ($allow) { Write-Host "  OK $allow" } else { Write-Host "  FAIL — set CORS_ORIGINS on Render" }

$body = @{
  destination = 'Goa'
  start_date  = '2026-11-01'
  days        = 2
  budget_inr  = 15000
  style       = 'Balanced'
  interests   = @('Food & street eats')
  group_size  = 2
} | ConvertTo-Json -Compress

$tmp = Join-Path $env:TEMP 'trip-generate-test.json'
[System.IO.File]::WriteAllText($tmp, $body)
Write-Host "Generate Goa (checks curated engine + copy)"
$raw = curl.exe -s -X POST "$ApiUrl/api/itinerary/generate" -H 'Content-Type: application/json' --data-binary "@$tmp"
Remove-Item $tmp -ErrorAction SilentlyContinue
$gen = $raw | ConvertFrom-Json
if ($gen.engine -eq 'curated' -and $gen.itinerary[0].morning.Length -gt 40) {
  Write-Host "  OK engine=curated, rich morning copy"
} else {
  Write-Host "  STALE API — push main to GitHub and redeploy Render (old generator still live)"
  Write-Host "  morning: $($gen.itinerary[0].morning)"
}

Write-Host "Frontend: $VercelUrl"
Write-Host "Done. See SUBMISSION_PLAN.md Phase 3 for auth/save in browser."
