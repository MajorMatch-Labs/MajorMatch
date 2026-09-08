# Script tu dong day nhanh hien tai len ca 2 repository (MajorMatch & majormatch-client)
$currentBranch = (git branch --show-current).Trim()

if (-not $currentBranch) {
    Write-Host "[ERROR] Khong xac dinh duoc nhanh Git hien tai!" -ForegroundColor Red
    exit 1
}

Write-Host ">>> Dang day nhanh '$currentBranch' len repo lon (MajorMatch)..." -ForegroundColor Cyan
git push origin $currentBranch

Write-Host ">>> Dang trich xuat folder client va day len repo nho (majormatch-client)..." -ForegroundColor Cyan
git subtree push --prefix=client client-remote $currentBranch

Write-Host ">>> [SUCCESS] Dong bo hoan tat len ca 2 repository cho nhanh: $currentBranch" -ForegroundColor Green
