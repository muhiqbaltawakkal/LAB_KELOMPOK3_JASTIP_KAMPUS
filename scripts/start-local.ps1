$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker Desktop wajib untuk runtime PostgreSQL dan Redis." }
if (-not $env:JWT_SECRET -or $env:JWT_SECRET.Length -lt 32) { throw "JWT_SECRET minimal 32 karakter wajib diisi." }
if (-not $env:SERVICE_TOKEN -or $env:SERVICE_TOKEN.Length -lt 32) { throw "SERVICE_TOKEN minimal 32 karakter wajib diisi." }
Push-Location $repoRoot
try {
  docker compose up -d --build
  docker compose ps
} finally { Pop-Location }
Write-Host "Gateway: http://localhost:8080 - tunggu semua health check menjadi healthy."
