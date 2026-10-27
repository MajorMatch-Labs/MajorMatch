# Analytics — bổ sung minh chứng chương 7

Owner: Ánh Vy (`anhvy0904`). Thực hiện: Codex trong phiên của người yêu cầu ngày 27/10/2026; chưa có xác nhận review của Ánh Vy. Baseline `0154bcf`. Không gán tác giả commit cho owner khi owner chưa thực hiện phần việc đó.

## Review và refactor

`RadarTransformer.transform` gọi `toFixed` trước khi xác thực kiểu dữ liệu thực tế của API. Một chuỗi số có thể làm crash; null/NaN có thể bị biến thành zero. Hàm summary có nhánh tính toán riêng nên cùng dữ liệu lỗi có thể tạo hai cách diễn giải.

Đã dùng boundary chung `validAxes` cho chart và summary. Chỉ hai điểm số finite numeric mới được dùng; điểm zero thật vẫn hợp lệ. `useRadarMetrics` tính hasValidData từ dữ liệu sau lọc và trả số trục bị loại; component báo khi biểu đồ là dữ liệu một phần. Không đổi ngưỡng surplus/match/gap hoặc công thức sẵn có.

## Kiểm chứng

`tests/unit/radarInvalidEvidence.test.ts`: 2 ca mới; kiểm tra null, NaN, Infinity, chuỗi, phần tử null và zero hợp lệ. Trên baseline: cả 2 ca thất bại. Trên refactor: đạt; các test radar sẵn có vẫn đạt. Toàn suite: 63 test đạt; typecheck đạt.

Tham chiếu quy tắc missing evidence trong `AGENTS.md` và PRD Analytics. Chưa kiểm tra trực quan thông báo một phần trên trình duyệt hoặc đo accessibility trong phiên này. Số 0 tổng hợp ở trạng thái hoàn toàn rỗng là hành vi tương thích cũ, không phải khẳng định người học không có năng lực; không dùng để tự duyệt chính sách chấm readiness.

Minh chứng tổng hợp: [W7_REFACTOR_REVIEW.md](../W7_REFACTOR_REVIEW.md). Bước sau: component tests, bảng số liệu thay thế, reduced motion. Review PR bởi owner/bot: chờ phản hồi thật.
