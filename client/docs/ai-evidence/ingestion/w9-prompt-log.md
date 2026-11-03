# Chương 9 — Ingestion

Ngày 03/11/2026. Owner chuyên môn: Văn Hoàng. Actor soạn: Codex theo yêu cầu hiện tại; chưa có owner review mới. Commit sử dụng danh tính Git đang cấu hình Vcoch27, Author = Committer. PR/merge có thể dùng connector đang xác thực NhatPrv; đó là actor của thao tác GitHub, không phải ba tác giả luân phiên.

Yêu cầu thực tế: hoàn thiện chương 9 của roadmap, gồm specification, API guide và lịch sử cải tiến prompt. Nguồn đọc: validator, scoring, upload hook, store/API caller và nhật ký tuần 2/6/7/8. Phản biện: dấu `%PDF` không bảo đảm tài liệu an toàn; scoring có fallback 3; save false chưa được UI xử lý đầy đủ.

Đầu ra: [specification](../../ingestion/specification.md), [integration](../../ingestion/api-integration.md), [prompt evolution](../../ingestion/prompt-evolution.md). Các prompt đề xuất tương lai được ghi là đề xuất, không tạo vòng phản biện giả dưới tên người khác. Ảnh guest upload dùng dữ liệu trống/tổng hợp, API bị chặn, không gửi PDF thật.

Kết quả kiểm tra và cách dùng: [delivery record](../../advisor/chapter-9-delivery.md). Không đánh dấu owner đã bảo vệ hay tự chấm điểm CLO.
