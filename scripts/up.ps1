# Research Compass — start full dev stack (Windows)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Install Docker Desktop and restart your terminal."
}

$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker Desktop is not running. Start Docker Desktop and try again."
}

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

if (-not (Test-Path "frontend/.env")) {
    Copy-Item "frontend/.env.example" "frontend/.env"
    Write-Host "Created frontend/.env from frontend/.env.example"
}

Write-Host ""
Write-Host "Starting Research Compass (Supabase + Frontend)..."
Write-Host "  App:    http://localhost:5173"
Write-Host "  API:    http://localhost:54321"
Write-Host "  Studio: http://localhost:54323"
Write-Host ""

docker compose up @args
