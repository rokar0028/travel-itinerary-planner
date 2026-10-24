# Re-create deploy after setting CORS_ORIGINS in backend/.env to your Vercel URL
param([Parameter(Mandatory)][string]$VercelUrl)

$ErrorActionPreference = 'Stop'
$Root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $Root 'backend\.env'
$content = Get-Content $envFile -Raw
if ($content -match '(?m)^CORS_ORIGINS=.*$') {
  $content = $content -replace '(?m)^CORS_ORIGINS=.*$', "CORS_ORIGINS=$VercelUrl"
} else {
  $content += "`nCORS_ORIGINS=$VercelUrl"
}
Set-Content -Path $envFile -Value $content.TrimEnd() -NoNewline
Write-Host "Updated backend/.env CORS_ORIGINS. Run scripts/deploy-render.ps1 to redeploy."
