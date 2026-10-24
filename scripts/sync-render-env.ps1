# Push env vars from backend/.env to Render service (requires RENDER_API_KEY)
param(
  [string]$ServiceId = 'srv-dbeispnb9u1s739sbhsg',
  [string[]]$Keys = @('SUPABASE_URL', 'SUPABASE_ANON_KEY', 'CORS_ORIGINS')
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'load-dotenv.ps1') -Path (Join-Path $Root 'backend\.env')

if (-not $env:RENDER_API_KEY) {
  Write-Warning 'RENDER_API_KEY not set. Add at https://dashboard.render.com/u/settings#api-keys'
  return
}

$headers = @{
  Authorization = "Bearer $($env:RENDER_API_KEY)"
  Accept        = 'application/json'
}

$base = "https://api.render.com/v1/services/$ServiceId/env-vars"
$existing = Invoke-RestMethod -Uri $base -Headers $headers -Method Get

foreach ($key in $Keys) {
  $value = (Get-Item "env:$key" -ErrorAction SilentlyContinue).Value
  if (-not $value) {
    Write-Warning "Skip $key (not in backend/.env)"
    continue
  }
  $match = @($existing) | Where-Object { $_.envVar.key -eq $key } | Select-Object -First 1
  if ($match) {
    $id = $match.envVar.id
    Invoke-RestMethod -Uri "$base/$id" -Headers $headers -Method Delete | Out-Null
  }
  $body = @{ key = $key; value = $value } | ConvertTo-Json
  Invoke-RestMethod -Uri $base -Headers $headers -Method Post -Body $body -ContentType 'application/json' | Out-Null
  Write-Host "Render env updated: $key"
}

Write-Host 'Trigger redeploy: scripts/deploy-render.ps1'
