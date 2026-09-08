# ====================================================================
# QUY TẮC ĐỒNG BỘ PUSH CODE & ĐỒNG BỘ NHÁNH 1-1 GIỮA REPO CHA VÀ REPO CON
# ====================================================================

## 1. NGUYÊN TẮC ÁNH XẠ 1 - 1 (1-TO-1 BRANCH & REPO MAPPING)
Dự án được cấu trúc theo mô hình Monorepo (Repo cha) chứa các Subtree/Modules tương ứng với các Repo độc lập (Repo con). Mọi thao tác push code phải tuân thủ đúng ánh xạ sau:

| Thư mục trên Repo cha (`MajorMatch`) | Repo con tương ứng trên GitHub Organization | Remote Alias cục bộ |
| :--- | :--- | :--- |
| `client/` | `https://github.com/MajorMatch-Labs/majormatch-client` | `client-remote` |
| `backend-hpc/` | `https://github.com/MajorMatch-Labs/majormatch-backend-hpc` | `backend-remote` |
| `gateway-infra/` | `https://github.com/MajorMatch-Labs/MajorMatch-Cloud-Infra` | `infra-remote` |

---

## 2. QUY TẮC ĐỒNG BỘ TÊN NHÁNH (EXACT BRANCH MATCHING)
1. **Cùng tên nhánh tuyệt đối**: Khi code trên nhánh `<branch-name>` ở repo cha, khi đồng bộ sang repo con phải đẩy vào **đúng nhánh `<branch-name>` trên repo con**, không được đổi tên nhánh.
2. **Nghiêm cấm Push chéo nhánh**:
   - Đang làm việc trên nhánh feature (ví dụ: `feat/vanhoang-w4-dropzone`) thì **chỉ được đẩy vào nhánh `feat/vanhoang-w4-dropzone` trên repo con**.
   - **Tuyệt đối KHÔNG ĐƯỢC** đẩy nhánh feature của repo to đè vào nhánh `main` của repo con.
3. **Quy tắc hợp nhất nhánh `main`**:
   - Nhánh `main` của repo con chỉ được nhận code khi:
     - Nhánh feature trên repo con được mở Pull Request và được Tech Lead merge vào `main`.
     - HOẶC nhánh `main` trên repo to đã merge feature đó hoàn chỉnh và được đồng bộ sang `main` của repo con.

---

## 3. QUY TRÌNH PUSH TỪ REPO CHA SANG REPO CON
Khi thực hiện commit và push từ repo cha:

### Bước 1: Commit trên nhánh hiện tại của repo cha
```bash
git checkout -b <tên-nhánh> # (Nếu là nhánh mới)
git add .
git commit -m "<loại-commit>(<phạm-vi>): <mô-tả-tiếng-Anh>"
```

### Bước 2: Đẩy lên repo cha
```bash
git push origin <tên-nhánh>
```

### Bước 3: Đẩy phần thư mục tương ứng sang đúng nhánh trên repo con
* **Nếu sửa code trong thư mục `client/`**:
  ```bash
  git subtree push --prefix=client client-remote <tên-nhánh>
  ```
* **Nếu sửa code trong thư mục `backend-hpc/`**:
  ```bash
  git subtree push --prefix=backend-hpc backend-remote <tên-nhánh>
  ```

*(Hoặc chạy script `.\sync-push.ps1` để tự động đẩy đúng nhánh hiện tại).*

---

## 4. BẢO TOÀN DANH TÍNH TÁC GIẢ (AUTHOR INTEGRITY)
- Mọi commit phải bảo toàn `user.name` và `user.email` của thành viên viết mã.
- Bất kể ai chạy lệnh push hay merge, GitHub sẽ ghi nhận điểm đóng góp cho người viết commit. Không dùng các công cụ viết lại lịch sử (như rebase author) làm sai lệch người thực hiện.

---

## 5. ĐIỀU KHOẢN AN TOÀN & BẢO MẬT
- **Tuyệt đối cấm commit file `.docx`** vào bất kỳ nhánh nào của bất kỳ repository nào.
- **Không sử dụng `--force`** khi push lên các nhánh chung (`main`, `developer/*`) để tránh làm mất commit hoặc PR đã merge của các thành viên khác.
