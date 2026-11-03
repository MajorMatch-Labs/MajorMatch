# Chương 9 — Analytics

Ngày 03/11/2026. Owner chuyên môn: Ánh Vy. Actor soạn/đo: Codex trong phiên người yêu cầu; chưa có review mới của Ánh Vy.

Yêu cầu thực tế: catalogue thiết kế và báo cáo đo UX/Lighthouse. Codex đối chiếu DESIGN, token prototype, component production và transformer; tách phạm vi prototype khỏi production. Phát hiện: ngưỡng chart/summary khác nhau, simulation có thể thay baseline; vì vậy tài liệu không xác nhận readiness đã được kiểm định.

Đo thật: Lighthouse 13.6.0, trang chủ local production, một lượt mobile và một lượt desktop; version/throttling/timestamp và raw hashes trong JSON. Performance quan sát là 96/100 mobile, 100/100 desktop. Audit console error do favicon 404 được giữ trong báo cáo. Không diễn giải score tự động thành đánh giá toàn diện về người dùng hoặc WCAG.

Đầu ra: [catalogue](../../analytics/design-system-catalogue.md), [Lighthouse](../../analytics/lighthouse-report.md), [QA handover](../../analytics/qa-handover.md). Tham khảo phương pháp CLI chính thức được dẫn trong report. Minh chứng và trạng thái bàn giao: [delivery record](../../advisor/chapter-9-delivery.md).
