Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker Desktop is not running."
}

if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
if (-not (Test-Path "frontend/.env")) { Copy-Item "frontend/.env.example" "frontend/.env" }

Write-Host "Starting Supabase..."
npx supabase start --ignore-health-check
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Applying migrations..."
npx supabase db reset --yes
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$status = npx supabase status -o env 2>&1
if ($status -match 'SUPABASE_ANON_KEY="([^"]+)"') {
    $anon = $Matches[1]
} elseif ($status -match 'SUPABASE_PUBLISHABLE_KEY="([^"]+)"') {
    $anon = $Matches[1]
} else {
    $anon = (Select-String -InputObject ($status -join "`n") -Pattern 'Publishable.*?(\S+)' | ForEach-Object { $_.Matches[0].Groups[1].Value })
}

if ($anon) {
    (Get-Content "frontend/.env") -replace 'VITE_SUPABASE_ANON_KEY=.*', "VITE_SUPABASE_ANON_KEY=$anon" | Set-Content "frontend/.env"
    Write-Host "Updated frontend/.env with Supabase key"
}

Write-Host ""
Write-Host "Starting frontend..."
Write-Host "  App:    http://localhost:5173"
Write-Host "  API:    http://localhost:54321"
Write-Host "  Studio: http://localhost:54323"
Write-Host ""

docker compose up @args
