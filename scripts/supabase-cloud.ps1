# Supabase Cloud へ DB を反映する（PowerShell 実行ポリシー対策: npx.cmd を使用）

Set-Location $PSScriptRoot\..

Write-Host "Supabase にログインします（ブラウザが開きます）..."
& npx.cmd supabase login

Write-Host "プロジェクトとリンクします..."
& npx.cmd supabase link --project-ref dloxnxmdkzxjwedglqkq

Write-Host "マイグレーションを適用します..."
& npx.cmd supabase db push

Write-Host "完了"
