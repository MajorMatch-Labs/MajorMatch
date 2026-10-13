# Sử dụng Codex Code Review với GitHub cho `client`

Hướng dẫn này cấu hình review pull request của phần `client` theo [tài liệu GitHub của Codex](https://learn.chatgpt.com/docs/third-party/github). Codex đọc diff và các `AGENTS.md` áp dụng cho file thay đổi. Quy tắc dành riêng cho client nằm trong [`client/AGENTS.md`](../../AGENTS.md) ở mục `Code Review Rules`.

## 1. Kết nối và bật review

Thực hiện một lần trong tài khoản Codex có quyền cấu hình repo:

1. Kết nối GitHub với Codex và cấp quyền cho repository MajorMatch.
2. Mở **Codex Settings → Code review**.
3. Chọn repository MajorMatch và bật **Automatic review** nếu muốn Codex tự review PR theo sự kiện đã chọn.
4. Trong **Personal preferences**, bật Automatic review và chọn **Review trigger** phù hợp. Cài đặt này quyết định PR nào được tự động review.
5. Nếu dùng Security Review và tính năng có sẵn trong tài khoản, bật **Auto security review** riêng. Đây là review bảo mật bổ sung.

Việc thêm `AGENTS.md` vào repo không tự kết nối GitHub, không tự bật review trong tài khoản và không tạo quy tắc bảo vệ nhánh. Nếu chưa bật tự động, có thể yêu cầu review thủ công bằng comment PR `@codex review`.

## 2. Một case hoàn chỉnh: ngăn kết quả cũ bị dùng sau khi đổi hồ sơ

Ví dụ thay đổi cần làm: khi người học cập nhật câu trả lời hoặc ngành đã chọn, kết quả phân tích cũ phải được đánh dấu cũ; phản hồi chat đang chạy cho hồ sơ trước không được ghi đè hồ sơ mới. Đây là ví dụ quy trình, không phải khẳng định chức năng hiện đã được triển khai.

### A. Tạo nhánh và làm thay đổi

Từ repo MajorMatch, tạo nhánh feature có cùng tên dùng cho client standalone và monorepo, ví dụ:

```powershell
git switch main
git pull --ff-only origin main
git switch -c fix/client-stale-profile-results
```

Thực hiện thay đổi trong `client/`. Trước khi mở PR, tự kiểm tra diff và chạy các kiểm tra phù hợp với phần vừa sửa. Ghi rõ kiểm tra nào đã chạy và kết quả; không ghi “đã pass” nếu chưa chạy.

```powershell
git diff --check
git diff -- client/
```

### B. Đẩy nhánh theo quy ước của repo

Client được quản lý như subtree đồng bộ với remote client riêng. Theo quy ước trong `AGENTS.md`, đẩy phần `client` trước, sau đó đẩy cùng tên nhánh lên `origin`:

```powershell
# Từ thư mục gốc MajorMatch: tách nội dung client/ thành commit gốc của client
git subtree split --prefix=client -b client-split-fix-client-stale-profile-results
git push client-remote client-split-fix-client-stale-profile-results:fix/client-stale-profile-results

# Đẩy nhánh monorepo cùng tên
git push -u origin fix/client-stale-profile-results
```

Nếu repo client standalone đã có nhánh tương ứng, đồng bộ theo hướng dẫn của nhóm thay vì ghi đè lịch sử. Không force-push nếu chưa xử lý nguyên nhân lệch nhánh.

### C. Mở PR và gọi Codex

Mở pull request từ `fix/client-stale-profile-results` vào `main` trên GitHub. Mô tả PR nên nêu vấn đề, hành vi mong muốn, phạm vi file và bằng chứng kiểm tra. Sau đó thêm comment:

```text
@codex review for stale profile state, old analysis/roadmap results, and streaming responses that could update a changed profile
```

Codex sẽ áp dụng các quy tắc review trong `client/AGENTS.md` với file client. Review tập trung vào lỗi nghiêm trọng P0/P1 theo tài liệu; nó không thay thế CI, kiểm thử, bảo vệ nhánh hay phê duyệt của nhóm.

### D. Xử lý kết quả và hoàn tất

Đọc nhận xét trên PR và kiểm tra từng phát hiện trong code. Nếu đúng, sửa trên cùng nhánh, chạy lại kiểm tra liên quan, rồi push cập nhật. Nếu cần review lại, comment `@codex review` lần nữa. Nếu phát hiện không áp dụng, phản hồi bằng lý do và bằng chứng cụ thể.

Chỉ merge khi các review bắt buộc và CI của nhóm đạt yêu cầu, đồng thời người có thẩm quyền đã duyệt. Không coi việc Codex không tìm thấy lỗi là bằng chứng tính năng đúng trong mọi trường hợp.

## 3. Review bảo mật tùy chọn

Với PR đụng tới upload PDF, API proxy, xác thực hoặc log, có thể yêu cầu:

```text
@codex security review
```

Security Review là luồng riêng và có thể yêu cầu quyền/tính năng phù hợp. Với MajorMatch, đặc biệt xem xét việc lộ PDF hoặc thông tin hồ sơ qua URL, log, ảnh chụp, lỗi trả về và dữ liệu demo.

## 4. Nếu Codex không phản hồi

- Xác nhận repository MajorMatch đã được kết nối với Codex và Code Review đã bật cho repo.
- Với review thủ công, dùng đúng comment `@codex review` trong pull request.
- Với review tự động, kiểm tra Automatic review ở cả cài đặt repository và Personal preferences, cùng điều kiện Review trigger.
- Nếu vẫn chưa chạy, kiểm tra quyền GitHub và trạng thái tích hợp trong Codex Settings.
