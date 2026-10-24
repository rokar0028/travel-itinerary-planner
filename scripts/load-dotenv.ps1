param([Parameter(Mandatory)][string]$Path)

if (-not (Test-Path $Path)) {
  throw "Env file not found: $Path"
}

Get-Content $Path | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { return }
  $key = $line.Substring(0, $idx).Trim()
  $val = $line.Substring($idx + 1).Trim()
  Set-Item -Path "env:$key" -Value $val
}
