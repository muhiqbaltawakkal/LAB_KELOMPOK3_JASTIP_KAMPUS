$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not $env:JWT_SECRET) {
  $env:JWT_SECRET = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant()
}
if (-not $env:SERVICE_TOKEN) {
  $env:SERVICE_TOKEN = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant()
}
$services = @(
  @{ Name="catalog"; Path="services/catalog-service" },
  @{ Name="order"; Path="services/order-service" },
  @{ Name="payment"; Path="services/payment-service" },
  @{ Name="tracking"; Path="services/tracking-service" }
)
foreach ($service in $services) {
  $working = Join-Path $repoRoot $service.Path
  if (-not (Test-Path (Join-Path $working "node_modules"))) { Push-Location $working; npm install; Pop-Location }
  Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $working -WindowStyle Hidden
}
Start-Sleep -Seconds 2
Start-Process -FilePath "node" -ArgumentList "scripts/local-gateway.mjs" -WorkingDirectory $repoRoot -WindowStyle Hidden
Start-Sleep -Seconds 2
Invoke-RestMethod http://localhost:8080/health | ConvertTo-Json
