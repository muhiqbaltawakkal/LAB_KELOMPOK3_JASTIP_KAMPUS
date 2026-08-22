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

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker Desktop wajib untuk reset PostgreSQL." }
Push-Location $repoRoot
try { docker compose down --volumes --remove-orphans } finally { Pop-Location }

$uploadDir = [IO.Path]::GetFullPath((Join-Path $repoRoot "services/catalog-service/uploads"))
if (-not $uploadDir.StartsWith($repoRoot, [StringComparison]::OrdinalIgnoreCase)) { throw "Target upload di luar repository" }
if (Test-Path -LiteralPath $uploadDir) { Remove-Item -LiteralPath $uploadDir -Recurse -Force }

Write-Host "Reset selesai: volume PostgreSQL, Redis, dan seluruh foto upload telah dihapus."
Write-Host "Jalankan scripts/start-local.ps1 untuk membuat schema kosong dan menyalakan service."
