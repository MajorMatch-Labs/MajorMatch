# ====================================================================

# QUY TẮC ĐỒNG BỘ PUSH CODE & ĐỒNG BỘ NHÁNH 1-1 CHO AGENT (AGENTIC RULES)

# ====================================================================

Mọi AI Agent làm việc trên dự án MajorMatch (cả repo cha `MajorMatch` và repo con `majormatch-client`) bắt buộc phải tuân thủ nghiêm ngặt các điều khoản tự động hóa sau:

---

## 1. BẢNG ÁNH XẠ DANH TÍNH TÁC GIẢ & MODULE (AUTHOR MAPPING)

Khi thực hiện commit hoặc tạo nhánh cho bất kỳ tính năng nào, Agent **BẮT BUỘC** sử dụng đúng thông tin tác giả và email tương ứng để bảo toàn điểm số hoạt động (Contribution Graph) trên GitHub:

| Thành viên    | Module phụ trách | Thư mục mã nguồn                | Author Name         | Email GitHub chính xác     | Tiền tố nhánh (Branch Prefix) |
| :------------ | :--------------- | :------------------------------ | :------------------ | :------------------------- | :---------------------------- |
| **Văn Hoàng** | `ingestion`      | `client/src/modules/ingestion/` | `Vcoch27`           | `hoangtungmy123@gmail.com` | `feat/vanhoang-w<tuần>-...`   |
| **Ánh Vy**    | `analytics`      | `client/src/modules/analytics/` | `Nguyen Thi Anh Vy` | `anhvydn2005@gmail.com`    | `feat/anhvy-w<tuần>-...`      |
| **Long Nhật** | `advisor` & Core | `client/src/modules/advisor/`   | `NhatPrv`           | `torikun2005@gmail.com`    | `feat/longnhat-w<tuần>-...`   |

---

## 2. NGUYÊN TẮC ĐỒNG BỘ 1 - 1 GIỮA REPO CHA VÀ REPO CON

1. **Ánh xạ kho chứa**:
   - Repo cha (Monorepo): `https://github.com/MajorMatch-Labs/MajorMatch` (`origin`)
   - Repo con (Client Web 2.0): `https://github.com/MajorMatch-Labs/majormatch-client` (`client-remote`) tương ứng thư mục `client/`.
2. **Cùng tên nhánh tuyệt đối (Exact Branch Matching)**:
   - Khi code trên nhánh `<branch-name>` ở repo cha, khi đồng bộ sang repo con phải đẩy vào **đúng nhánh `<branch-name>` trên repo con**, không được đổi tên nhánh.
3. **Nghiêm cấm Push chéo nhánh**:
   - Nhánh feature của thành viên nào chỉ được đẩy vào nhánh feature đó trên cả 2 repo.
   - **Tuyệt đối KHÔNG ĐƯỢC** đẩy nhánh feature đè trực tiếp vào nhánh `main` của repo con.
4. **Quy tắc hợp nhất nhánh `main`**:
   - Nhánh `main` của repo con chỉ nhận code sau khi mở Pull Request trên GitHub và được Tech Lead merge.

---

## 3. QUY TRÌNH TỰ ĐỘNG HÓA CHO AGENT KHI COMMIT & PUSH

Khi người dùng yêu cầu commit/push (hoặc dùng câu lệnh ngắn như _"sync 2 bên"_, _"push 1-1"_):

### Bước 1: Xác định thành viên & nhánh

- Nhận diện module vừa chỉnh sửa (`ingestion` -> Hoàng, `analytics` -> Vy, `advisor`/core -> Nhật).
- Tạo nhánh mới theo chuẩn: `<loại>/<tên>-w<tuần>-<tính-năng>` (nếu đang ở nhánh khác):
  ```bash
  git checkout -b <tên-nhánh>
  ```

### Bước 2: Cập nhật minh chứng AI (Bắt buộc theo Rubric Vibe Coding)

- Đảm bảo nhật ký tại `client/docs/ai-evidence/<module>/w<tuần>-prompt-log.md`, module ingestion/analytics/advisor. Tác giả giữ danh tính thành viên; review phần người khác thêm Co-authored-by.

### Bước 3: Commit chuẩn Conventional Commits tiếng Anh

- Thực hiện commit với đúng cờ `--author` của thành viên phụ trách:
  ```bash
  git add <các-file-chỉnh-sửa>
  git commit -m "<type>(<scope>): <mô-tả-tiếng-Anh>" --author="<Author Name> <<Email>>"
  ```

### Bước 4: Push đồng bộ 1-1 lên cả 2 repository

1. Đẩy client subtree trước:
   ```bash
   git subtree push --prefix=client client-remote <tên-nhánh>
   ```
2. Sau khi client thành công, đẩy repo cha:
   ```bash
   git push origin <tên-nhánh>
   ```
   _(Hoặc chạy script `.\sync-push.ps1`)._

### Bước 5: Cung cấp link mở Pull Request

- Luôn in ra đường dẫn mở Pull Request trên GitHub repo `majormatch-client`:
  `https://github.com/MajorMatch-Labs/majormatch-client/pull/new/<tên-nhánh>`

---

## 4. ĐIỀU KHOẢN AN TOÀN & BẢO MẬT

1. **Tuyệt đối cấm commit file `.docx`** vào bất kỳ nhánh nào của bất kỳ repository nào.
2. **Không sử dụng `--force`** khi push lên các nhánh dùng chung (`main`, `developer/*`).
3. **Cấm code giả lập rỗng**: Không để lại `// TODO: implement later` trong các file mã nguồn hoàn thiện.
