# Nhật ký AI và bài học kiểm chứng Ingestion

Owner: Văn Hoàng. Tổng hợp chương 9 ngày 03/11/2026 bằng Codex. Tài liệu phân biệt lịch sử được ghi trong repo với công việc thực hiện ở phiên này.

| Bằng chứng đã có | Prompt/mục tiêu được ghi | Điều chỉnh được ghi nhận | Giới hạn nguồn |
|---|---|---|---|
| [Tuần 2](../ai-evidence/ingestion/w2-prompt-log.md) | Đầu ra có cấu trúc cho đầu vào hồ sơ | Xem các vòng prompt và phản biện trong file gốc | Nhật ký là lời ghi của tác giả; không phải replay của phiên hôm nay |
| [Tuần 6](../ai-evidence/ingestion/w6-prompt-log.md) | Thuật toán khảo sát và validation file | Code scoring và magic-byte validator có trong repo | Không coi utility thay đáp án thiếu bằng 3 là bằng chứng khảo sát hoàn tất |
| [Refactor tuần 7](../ai-evidence/ingestion/w7-refactor-review.md) | Tách orchestration và kiểm tra upload | Hook + 3 service tests; loại gọi validation trùng | Chưa có E2E upload live |
| [Tuần 8](../ai-evidence/ingestion/w8-prompt-log.md) | Sinh unit tests cho PDF boundary | Đối chiếu `tests/unit/fileValidation.test.ts` | Kết quả lịch sử phải phân biệt với lần chạy mới |

## Phiên chương 9 thực tế

Yêu cầu của người dùng: hoàn thiện chương 9, chia phần việc cho ba module, commit và merge. Codex đọc validator, scoring, hook, store và API service rồi soạn specification/integration guide. Phát hiện cần phản biện: magic-byte check chỉ tìm `%PDF` trong 1024 bytes đầu; utility scoring dùng fallback 3; boolean save chưa được caller kiểm tra đầy đủ.

Quyết định: mô tả đúng ba điểm trên thay vì viết “PDF luôn hợp lệ”, “đã khử định danh hoàn toàn” hoặc “đã lưu server”. Không thêm vài vòng prompt giả định rồi gán thành trải nghiệm của Văn Hoàng. Chủ module cần review nội dung trước khi dùng làm lời thuyết trình cá nhân.

Một prompt dùng được cho lần cải tiến tiếp theo: “Đọc caller của saveRiasecSurvey; viết test tái hiện HTTP 500 trả false nhưng UI báo saved; sửa caller để nhãn saved chỉ xuất hiện khi server xác nhận. Dùng dữ liệu tổng hợp và ghi red/green thật.” Đây là **đề xuất tương lai**, chưa thực hiện trong task tài liệu.

Kiểm chứng phiên này và nguồn kết quả: [delivery record](../advisor/chapter-9-delivery.md). Không tự chấm điểm CLO hoặc khai báo owner đã duyệt.
