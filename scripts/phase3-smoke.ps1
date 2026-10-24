# Phase 3 API smoke (guest + engine checks). Auth/save still needs browser + email.
param(
  [string]$ApiUrl = 'https://travel-itinerary-api-vb27.onrender.com'
)

$ErrorActionPreference = 'Stop'
$ApiUrl = $ApiUrl.TrimEnd('/')

function Test-Generate($label, $bodyPath) {
  Write-Host "Generate $label..."
  $raw = curl.exe -s -X POST "$ApiUrl/api/itinerary/generate" `
    -H 'Content-Type: application/json' --data-binary "@$bodyPath"
  $gen = $raw | ConvertFrom-Json
  $ok = $gen.itinerary.Count -ge 1 -and $gen.itinerary[0].morning.Length -gt 30
  Write-Host "  engine=$($gen.engine) days=$($gen.itinerary.Count) ok=$ok"
  if (-not $ok) { throw "Failed: $label" }
}

$dir = $PSScriptRoot
Test-Generate 'Goa' (Join-Path $dir 'verify-generate-body.json')

Test-Generate 'Jaipur' (Join-Path $dir 'phase3-jaipur.json')

$mumbai = Join-Path $dir 'phase3-mumbai.json'
$raw = curl.exe -s -X POST "$ApiUrl/api/itinerary/generate" -H 'Content-Type: application/json' --data-binary "@$mumbai"
$gen = $raw | ConvertFrom-Json
Write-Host "Generate Mumbai (template or llm)..."
Write-Host "  engine=$($gen.engine) days=$($gen.itinerary.Count)"

Write-Host ''
Write-Host 'Phase 3 API smoke OK. In browser (incognito): magic link -> Save trip -> My trips.'
Write-Host 'Supabase redirects: scripts/supabase-auth-urls.md'
