# Script tu dong day nhanh hien tai len ca 3 repository (MajorMatch, majormatch-client, majormatch-backend-hpc)
$currentBranch = (git branch --show-current).Trim()

if (-not $currentBranch) {
    Write-Host "[ERROR] Khong xac dinh duoc nhanh Git hien tai!" -ForegroundColor Red
    exit 1
}

Write-Host ">>> [1/3] Dang day nhanh '$currentBranch' len repo lon (MajorMatch)..." -ForegroundColor Cyan
git push origin $currentBranch

Write-Host ">>> [2/3] Dang trich xuat folder client va day len repo nho (majormatch-client)..." -ForegroundColor Cyan
try {
    git subtree push --prefix=client client-remote $currentBranch
} catch {
    Write-Host ">>> Bo qua client hoac chua co commit moi trong client." -ForegroundColor Yellow
}

Write-Host ">>> [3/3] Dang trich xuat folder backend-hpc va day len repo nho (majormatch-backend-hpc)..." -ForegroundColor Cyan
try {
    git subtree push --prefix=backend-hpc backend-remote $currentBranch
} catch {
    Write-Host ">>> Bo qua backend-hpc hoac chua co commit moi trong backend-hpc." -ForegroundColor Yellow
}

Write-Host ">>> [SUCCESS] Dong bo hoan tat len ca 3 repository cho nhanh: $currentBranch" -ForegroundColor Green
