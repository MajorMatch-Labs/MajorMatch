# QUY CHUẨN ĐỒNG BỘ PUSH CODE & TÊN NHÁNH 1-1 GIỮA REPO CHA VÀ REPO CON
**Dự án**: MajorMatch  
**Tổ chức**: MajorMatch-Labs  
**Tài liệu**: Quy chuẩn kỹ thuật Git & Đồng bộ Multi-repository

---

## 1. MÔ HÌNH KIẾN TRÚC KHO CHỨA (MULTI-REPO ARCHITECTURE)
Dự án MajorMatch sử dụng mô hình **Monorepo kết hợp Child Standalone Repositories**:
* **Repo cha (Monorepo Source of Truth)**: `https://github.com/MajorMatch-Labs/MajorMatch` (`origin`)
* **Repo con 1 (Client Web 2.0)**: `https://github.com/MajorMatch-Labs/majormatch-client` (`client-remote`)
* **Repo con 2 (Backend AI/HPC Engine)**: `https://github.com/MajorMatch-Labs/majormatch-backend-hpc` (`backend-remote`)
* **Repo con 3 (Cloud Infra & Gateway)**: `https://github.com/MajorMatch-Labs/MajorMatch-Cloud-Infra` (`infra-remote`)

---

## 2. NGUYÊN TẮC ÁNH XẠ NHÁNH 1 - 1 (EXACT 1-TO-1 BRANCH SYNC)
Khi làm việc trên nhánh bất kỳ ở repo cha:
1. **Tên nhánh phải khớp nhau chính xác**:
   - Nếu ở repo cha đang đứng tại nhánh: `feat/client-vanhoang-w4-dropzone`
   - Thì khi đẩy sang repo con `majormatch-client`, nhánh đích bắt buộc phải là: `feat/client-vanhoang-w4-dropzone`.
2. **Nghiêm cấm đẩy đè chéo nhánh**:
   - Không bao giờ đẩy nhánh feature của repo cha vào nhánh `main` của repo con khi chưa có Pull Request được duyệt.
   - Nhánh `main` của repo con chỉ nhận code từ `main` của repo cha hoặc sau khi merge Pull Request trên repo con.

---

## 3. CÁC LỆNH GIT CHUẨN ĐỂ ĐỒNG BỘ

### Cấu hình Remote trên máy (chỉ làm 1 lần):
```bash
git remote add client-remote https://github.com/MajorMatch-Labs/majormatch-client.git
git remote add backend-remote https://github.com/MajorMatch-Labs/majormatch-backend-hpc.git
git remote add infra-remote https://github.com/MajorMatch-Labs/MajorMatch-Cloud-Infra.git
```

### Đẩy code từ Repo cha sang Repo con theo đúng nhánh:
```powershell
# 1. Xác định nhánh hiện tại đang đứng
$branch = git branch --show-current

# 2. Đẩy lên nhánh tương ứng của repo cha
git push origin $branch

# 3. Đẩy thư mục client sang đúng nhánh tương ứng của repo con client
git subtree push --prefix=client client-remote $branch

# 4. Đẩy thư mục backend-hpc sang đúng nhánh tương ứng của repo con backend (nếu có sửa backend)
git subtree push --prefix=backend-hpc backend-remote $branch
```

---

## 4. BẢO VỆ DANH TÍNH TÁC GIẢ & AN TOÀN DỮ LIỆU
1. **Author Email**: Mỗi thành viên phải cấu hình đúng email GitHub của mình trên máy cá nhân (`git config user.email "your-email@example.com"`). Mọi commit giữ nguyên danh tính người viết để hệ thống chấm tự động ghi nhận điểm số.
2. **Cấm file nhạy cảm**: Không bao giờ commit file định dạng `.docx`, file chứa API keys, file `.env.local` lên bất kỳ kho chứa nào.
3. **Cấm force push bừa bãi**: Tuyệt đối không dùng cờ `--force` trên các nhánh dùng chung (`main`, `developer/*`) để không làm mất lịch sử merge của nhóm.
