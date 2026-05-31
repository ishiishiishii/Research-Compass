# Research Compass — stop dev stack
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

docker compose down @args
npx supabase stop 2>$null

Write-Host "Research Compass stopped."
