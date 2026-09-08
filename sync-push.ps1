# Script tự động đẩy nhánh hiện tại lên cả 2 repository (MajorMatch & majormatch-client)
$currentBranch = (git branch --show-current).Trim()

if (-not $currentBranch) {
    Write-Host "Không xác định được nhánh Git hiện tại!" -ForegroundColor Red
    exit 1
}

Write-Host "Đang đẩy nhánh '$currentBranch' lên repo lớn (MajorMatch)..." -ForegroundColor Cyan
git push origin $currentBranch

Write-Host "Đang trích xuất thư mục client và đẩy lên repo nhỏ (majormatch-client)..." -ForegroundColor Cyan
git subtree push --prefix=client client-remote $currentBranch

Write-Host "Đồng bộ hoàn tất lên cả 2 repository cho nhánh: $currentBranch" -ForegroundColor Green
