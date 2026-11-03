# Kịch bản demo và hỏi đáp

Thời lượng gợi ý 10–12 phút, phân vai chuyên môn để nhóm luyện tập: Văn Hoàng trình bày đầu vào; Ánh Vy giải thích kết quả và UX; Long Nhật giải thích kiến trúc, SSE và kiểm chứng. Phân vai thuyết trình không phải lịch sử commit.

## Chuẩn bị

1. Dùng repo/lockfile đang nộp, Node 20.19+ nhánh 20, 22.12+ nhánh 22 hoặc 24. `npm ci`, `npx playwright install chromium` nếu thiếu browser, chạy test/typecheck/build.
2. Mở UI local. Dùng DEMO khi chưa có backend test; thông báo ngay đây là dữ liệu tổng hợp. Không tạo tài khoản thật trong browser quay video nếu chưa được đồng ý.
3. Với luồng live, đặt backend URL trước build, kiểm tra health gồm model, chuẩn bị PDF tổng hợp và tài khoản test. Không tự mở tunnel hoặc thay config EC2 trong buổi bảo vệ.

## Luồng nói và thao tác

| Phút | Thao tác | Nội dung cần hiểu |
|---|---|---|
| 0–1 | Trang chủ, nêu người học tổng hợp | Bài toán hỗ trợ lựa chọn, không khẳng định AI quyết định ngành đúng |
| 1–3 | `/upload`, giải thích auth và validation | MIME/10 MiB/magic bytes thuộc client; parse PDF và lưu DB thuộc backend |
| 3–5 | `/result?demo=1`, giữ nhãn DEMO | Đọc radar cùng bảng; giải thích user/benchmark/delta và dữ liệu thiếu |
| 5–6 | `/roadmap` khi có roadmap hợp lệ | Checklist mô phỏng, không phải chứng chỉ hay phép đo năng lực thật; không bịa roadmap để che trạng thái thiếu |
| 6–8 | `/chat` hoặc E2E mock có nhãn | Token SSE, Stop, đổi context, EOF thiếu DONE giữ interrupted; phân biệt mock với model thật |
| 8–10 | Report test và Lighthouse | Unit/component/browser có phạm vi riêng; localhost lab không phải production/field |
| 10–12 | Sơ đồ và hạn chế | Client-only nộp có link backend/database; autoscaling/security/AI efficacy còn việc phải làm |

Nếu backend/model không chạy, trình diễn DEMO và báo cáo E2E mock đúng nhãn. Không nói model thật đã trả câu trả lời trong khi chỉ đang phát fixture.

## Câu hỏi thường gặp

**Tại sao client không có database?** Client là subtree. Gateway Python trong monorepo lưu SQLite; trình duyệt gọi HTTP. localStorage phục vụ UI và có thể giữ dữ liệu cache riêng.

**Làm sao biết dữ liệu lưu thật?** Đối chiếu POST/GET API và đọc bản ghi server bằng quyền phù hợp, thử lại trong phiên mới. Một reload browser chưa đủ.

**Vì sao tự host model?** Là lựa chọn tận dụng compute cục bộ và kiểm soát đường xử lý; chưa có đo lường để khẳng định riêng lựa chọn đó đảm bảo mọi dữ liệu đều riêng tư hoặc luôn ổn định.

**Có Cloudflare Tunnel chưa?** Repo có template; đường thực tế phải kiểm tra deployment. Script Joy3 mô tả reverse SSH. Không gọi DNS Cloudflare hay một file YAML là bằng chứng tunnel đang hoạt động.

**77 test có nghĩa mọi chức năng đúng?** Không. Đây là tập ca cụ thể; model accuracy, backend auth, DB restore và một số UI states chưa được kiểm chứng live.

**CLO và đóng góp cá nhân chứng minh bằng gì?** File nguồn, diff/PR, test results, prompt thật và review của người thực hiện. Tên owner trong tài liệu không tự sinh đóng góp Git của người đó.
