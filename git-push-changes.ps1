# Git: add, commit, push - AI shop módosítások
# Futtasd: PowerShell-ben (Cursoron kívül), a projekt mappájából: .\git-push-changes.ps1

Set-Location $PSScriptRoot

Write-Host "Staging changes..." -ForegroundColor Cyan
git add -A

Write-Host "Status:" -ForegroundColor Cyan
git status

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m "Sync: retry on ECONNRESET/socket hang up; AI shop készlet, kategóriák, kizárt list"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPushing to origin main..." -ForegroundColor Cyan
    git push origin main
    Write-Host "`nDone." -ForegroundColor Green
} else {
    Write-Host "`nNo commit (maybe nothing to commit or already committed). Trying push anyway..." -ForegroundColor Yellow
    git push origin main
}
