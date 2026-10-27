# Ingestion — bổ sung minh chứng chương 7

Owner: Văn Hoàng (`Vcoch27`). Thực hiện: Codex theo yêu cầu trong phiên ngày 27/10/2026; commit bằng danh tính xác thực Vcoch27. Baseline `0154bcf`. Không thay thế nhật ký kỹ năng môn học tuần 7 cũ.

## Review và refactor

Trong baseline, `FileDropzone.handleFile` tự gọi `validateTranscriptFileAdvanced` rồi `uploadTranscript` gọi lại cùng validator. Đoạn await validation nằm ngoài try/catch của component nên lỗi đọc file có thể thoát khỏi xử lý lỗi UI. Logic xác thực, điều phối và error state nằm cùng markup.

Đã tách `src/modules/ingestion/hooks/useFileUpload.ts`. Hook gọi service một lần, giữ khóa qua giai đoạn validation/upload, bắt lỗi `unknown`; view dùng trạng thái pending và reset giá trị file input để chọn lại cùng tệp. Quy tắc giới hạn PDF/MIME/magic bytes giữ ở service/utilities.

## Kiểm chứng

`tests/unit/ingestionUploadService.test.ts`: 3 ca đạt — validator gọi một lần trước handoff, file không hợp lệ không gọi store action, lỗi đọc async được truyền tới error boundary. Toàn suite sau refactor: 63 test đạt; typecheck đạt. Test này kiểm chứng service, chưa phải hook/component hoặc kiểm tra thao tác double-drop trên browser.

Tham chiếu AC: ING-UI-AC-01/02 và các trạng thái invalid/error/retry trong PRD Ingestion; không coi đây là xác nhận toàn bộ UI đáp ứng PRD. Bước sau: kiểm thử hook và thay đổi tài khoản giữa upload; refactor `useRiasecSurvey` khi làm tiếp chương 7.

Minh chứng tổng hợp và giới hạn: [W7_REFACTOR_REVIEW.md](../W7_REFACTOR_REVIEW.md). Review PR bởi con người/bot: chờ phản hồi thật.
