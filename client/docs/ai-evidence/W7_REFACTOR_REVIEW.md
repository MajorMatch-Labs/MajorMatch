# Chương 7: Codex local review và refactor có kiểm chứng

Ngày: 27/10/2026. Baseline: MajorMatch `0154bcf13229ea35699d31cef4e2e2b4d2b61dae`. Nhánh: `codex/w7-team-review-refactor`.

Người yêu cầu: thành viên nhóm trong phiên Codex. Công cụ thực hiện review và sửa: Codex trong workspace local. GitHub CLI xác thực: `Vcoch27`. Module owners giữ nguyên; chưa có xác nhận review của Ánh Vy/Long Nhật và chưa có phản hồi GitHub Codex bot tại thời điểm lập tài liệu. Không đại diện những phần chờ này thành đóng góp hoặc phê duyệt đã xảy ra.

## Yêu cầu thực tế của phiên

Người dùng yêu cầu thực hiện chương 7 bằng ChatGPT/Codex Code Review, chia việc cho ingestion/analytics/advisor, tạo commit nhỏ, giữ bản client có bằng chứng backend/database ở monorepo, hướng dẫn kết nối tổ chức và chuẩn bị chương 8/9. Codex diễn giải mục tiêu thành review hiện trạng, refactor có ích, regression tests và hồ sơ truy vết. Không chép lại nhật ký cũ thành minh chứng mới.

## Phát hiện và thay đổi

| ID | Phát hiện từ mã baseline | Cách xử lý | Minh chứng theo module |
|---|---|---|---|
| W7-ING-01 | `FileDropzone` gọi full PDF validation rồi service gọi lại; lỗi đọc bất đồng bộ nằm ngoài `try`; logic điều phối lẫn trong view | Tách `useFileUpload`; service là nơi validation một lần; hook bắt lỗi, giữ khóa khi đang kiểm tra/upload; reset input để chọn lại cùng file | [Ingestion](ingestion/w7-refactor-review.md) |
| W7-ANA-01 | Adapter gọi `.toFixed` trên dữ liệu API chưa kiểm tra; null/NaN bị dùng như điểm 0 hoặc gây lỗi; chart và summary không cùng boundary | Dùng một bộ lọc finite numeric evidence; giữ zero thật; thống nhất chart/summary; báo khi chỉ một phần trục hợp lệ | [Analytics](analytics/w7-refactor-review.md) |
| W7-ADV-01 | Controller SSE dùng chung parser/timer/controller; signal bên ngoài thay thế signal nội bộ; cleanup request cũ có thể dọn state request mới | Cô lập session; gắn external abort vào controller nội bộ; terminal callback một lần; hủy/release reader; bỏ phản hồi muộn | [Advisor](advisor/w7-refactor-review.md) |
| W7-CORE-01 | `tsc --noEmit` thất bại vì global Vitest thiếu kiểu và fixture môn học sai contract; localStorage polyfill khởi tạo sau store | Khai báo Vitest globals, sửa fixture theo DTO; chuyển test storage sang `setupFiles` chạy trước imports | `tsconfig.json`, `vitest.config.ts`, `tests/setup.ts`, `tests/integration/profileStore.test.ts` |

## Kiểm chứng đã thực hiện

- Cài dependency bằng `npm ci --no-audit --no-fund`; không đổi lockfile.
- Chạy hai test mới của Analytics và Advisor trên implementation baseline: **2 suites, 8 test thất bại**. Phát hiện gồm crash `.toFixed`, trục không hợp lệ lọt qua, reader chưa được cancel, manual abort khi dùng external signal không dừng, cleanup/request muộn và lỗi/timeout.
- Khôi phục implementation mới sau phép đối chiếu; chạy `npm test`: **12 suites, 63 test đạt**.
- Chạy `npx tsc --noEmit`: **đạt** sau khi sửa test fixtures và kiểu Vitest.
- `npm run build`: đã chạy thành công; xem phần bàn giao PR để đối chiếu commit cuối và kết quả build cuối cùng.
- Chưa chạy UI/E2E trên trình duyệt, chưa gọi model/EC2 thật, chưa kiểm chứng SQLite bằng thao tác live trong phiên này. Test dùng dữ liệu tổng hợp.

## Phản biện kết quả AI trong phiên

AI ban đầu dùng matcher `toHaveBeenCalledExactlyOnceWith` không có trong Vitest của repo; lần test đầu tiên bắt lỗi này. Đã thay bằng hai assertion tương thích. Typecheck tiếp tục phát hiện mock validation chưa đủ discriminated union; đã sửa mock theo đúng `FileValidationResult`, không nới kiểu production để làm test qua. Đây là lỗi và điều chỉnh của công cụ trong phiên, không gán thành nhận xét của con người.

## Bàn giao và điểm chưa đóng

1. Giữ nhật ký tuần 7 cũ (kỹ năng môn học) như lịch sử; tài liệu này bổ sung minh chứng đúng chương Refactoring & AI Code Review.
2. Tài khoản Codex hiện chưa liệt kê tổ chức MajorMatch-Labs; thực hiện [hướng dẫn cấp quyền](../05-testing-and-rules/CODEX_GITHUB_REVIEW.md). Chỉ lưu review bot sau khi phản hồi thật xuất hiện.
3. Hai module owners còn lại kiểm tra diff/test và ghi quyết định thật trên PR; mã do phiên này chuẩn bị không tự động tạo đóng góp Git cho họ.
4. Theo [kế hoạch chương 8–9](../../tasks/TEAM_DELIVERY_PLAN.md): bổ sung E2E/component testing, CI, kiểm chứng lưu trữ thật và báo cáo.
5. `npm ci` cảnh báo dependency Next.js cũ và Recharts 2.x hết duy trì; cần task nâng cấp có advisory chính thức và regression checks. Không tuyên bố production đã an toàn chỉ vì test/build qua.
