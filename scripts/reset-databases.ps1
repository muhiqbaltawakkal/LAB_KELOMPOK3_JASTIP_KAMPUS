$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$expected = @("services", "mobile", "scripts")
foreach ($name in $expected) {
  if (-not (Test-Path -LiteralPath (Join-Path $repoRoot $name))) {
    throw "Folder repository tidak valid: $repoRoot"
  }
}

$ports = @(3001, 3002, 3003, 3004, 8080)
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Push-Location $repoRoot
  try { docker compose down --volumes --remove-orphans } finally { Pop-Location }
}

$databaseFiles = @(
  "services/catalog-service/catalog.db",
  "services/order-service/order.db",
  "services/payment-service/payment.db",
  "services/tracking-service/tracking.db"
)
foreach ($relative in $databaseFiles) {
  $target = [IO.Path]::GetFullPath((Join-Path $repoRoot $relative))
  if (-not $target.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Target reset di luar repository: $target" }
  Remove-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
}

$uploadDir = [IO.Path]::GetFullPath((Join-Path $repoRoot "services/catalog-service/uploads"))
if (-not $uploadDir.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Target upload di luar repository" }
if (Test-Path -LiteralPath $uploadDir) { Remove-Item -LiteralPath $uploadDir -Recurse -Force }

Write-Host "Reset selesai: database dan seluruh foto upload telah dihapus."
Write-Host "Jalankan scripts/start-local.ps1 untuk membuat schema kosong dan menyalakan service."
