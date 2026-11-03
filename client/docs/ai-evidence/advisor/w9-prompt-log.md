# Chương 9 — Advisor/Core

Ngày 03/11/2026. Owner chuyên môn: Long Nhật. Actor soạn báo cáo/slide: Codex theo yêu cầu người dùng. Chưa có owner sign-off mới; không coi tên owner là tác giả mọi commit.

Yêu cầu thực tế: báo cáo tổng thể, kiến trúc, ánh xạ Rubric, slide và hướng bàn giao. Codex đọc source, các kết quả kiểm tra và backend ở monorepo; báo cáo ghi rõ client-only scope, database server khác cache browser, template Cloudflare khác runtime đang dùng, và chưa có bằng chứng autoscaling/model efficacy.

Bộ slide có 11 trang, nguồn JSON và notes. Các điểm Lighthouse lấy từ JSON thực, không gõ score mục tiêu. PPTX được xuất và kiểm tra bằng công cụ presentation, rồi xem ảnh từng slide; kết quả ở delivery record. Phần phân vai trình bày cho ba thành viên là đề xuất luyện tập, không giả lập họ đã review hoặc tạo commit.

Sự cố môi trường thực tế: Playwright thiếu browser executable khi chạy lần đầu; cài Chromium đúng version rồi chạy lại. Finalizer slide cần biến runtime module path cho tiến trình import; bổ sung vào builder thay vì tắt kiểm tra import. Đây là thao tác của agent, không gán thành phát hiện cá nhân của Long Nhật.

Đầu ra chính: [report](../../advisor/final-technical-report.md), [demo](../../advisor/demo-and-defense.md), [Rubric evidence](../../advisor/rubric-evidence.md), [slide](../../advisor/presentation/README.md). Trạng thái kiểm chứng/publication: [delivery record](../../advisor/chapter-9-delivery.md).
