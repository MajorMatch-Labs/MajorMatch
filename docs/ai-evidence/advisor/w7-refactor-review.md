# Advisor/Core — bổ sung minh chứng chương 7

Owner: Long Nhật (`NhatPrv`). Thực hiện: Codex trong phiên của người yêu cầu ngày 27/10/2026; chưa có xác nhận review của Long Nhật. Baseline `0154bcf`. Commit thực tế giữ danh tính người đang xác thực, không gán lại owner.

## Review và refactor

SSE controller cũ dùng chung parser/controller/timer. Request cũ có thể chạy `finally` sau khi request mới bắt đầu và xóa controller của request mới. Khi có `options.signal`, fetch dùng signal bên ngoài nên `abort()`/timeout nội bộ không hủy được kết nối đó. Reader không được cancel/release sau `[DONE]`, và event lỗi chưa được xử lý thành thất bại.

Đã tạo session riêng cho mỗi request với parser/timer/reader/controller riêng. External signal được nối vào controller nội bộ; callback terminal chạy một lần, phản hồi muộn bị bỏ qua, cleanup chỉ dọn session của nó. Hủy reader khi kết thúc/dừng; backend event có `error` kết thúc bằng error.

Core bổ sung: khai báo kiểu Vitest globals và sửa fixture điểm học phần đúng DTO. Chuyển localStorage test setup chạy trước import store để middleware thực sự có storage, thay cho polyfill beforeAll quá muộn.

## Kiểm chứng

`tests/unit/sseStreamController.test.ts`: 6 ca cho token UTF-8 bị chia chunk + DONE, dừng khi có external signal, signal đã abort, request bị thay thế/phản hồi muộn, timeout một lần và event lỗi. Trên controller baseline: 6 ca thất bại. Trên refactor: đạt. Toàn suite: 63 test đạt; typecheck đạt; không có cảnh báo thiếu storage như lần chạy trước.

Phạm vi liên quan PRD Advisor: streaming cancellation, recovery và stale request. Chưa kiểm thử model thật, ngữ cảnh user thay đổi trong component hay trường hợp server đóng stream sớm mà không có DONE. Những phần này thuộc chương 8; không tuyên bố toàn luồng chat đã được chứng nhận.

Minh chứng tổng hợp: [W7_REFACTOR_REVIEW.md](../W7_REFACTOR_REVIEW.md). Review PR bởi owner/bot: chờ phản hồi thật.
