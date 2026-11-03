# Bàn giao chương 9

Ngày 03/11/2026. Mã nguồn đối chiếu: monorepo `108c6ff`; client trước tài liệu `336b43757266e6963c44d4c21b532c6b89dd560f`. Phạm vi thay đổi: docs, ảnh minh họa tổng hợp, slide và scripts tạo/kiểm tra báo cáo. Task này không sửa mã ứng dụng, scoring, auth hoặc hạ tầng production.

## Bộ đầu ra

| Phần phụ trách chuyên môn | Tài liệu và artefact | Nhóm commit có ý nghĩa |
|---|---|---|
| Văn Hoàng — Ingestion | [Specification](../ingestion/specification.md), [API guide](../ingestion/api-integration.md), [Prompt evolution](../ingestion/prompt-evolution.md), [log chương 9](../ai-evidence/ingestion/w9-prompt-log.md) | Đặc tả/ảnh; tích hợp API; tiến hóa prompt |
| Ánh Vy — Analytics | [Catalogue](../analytics/design-system-catalogue.md), [Lighthouse](../analytics/lighthouse-report.md), [QA handover](../analytics/qa-handover.md), [log chương 9](../ai-evidence/analytics/w9-prompt-log.md) | Catalogue/ảnh; phép đo và script; QA |
| Long Nhật — Advisor/Core | [Final report](final-technical-report.md), [slide](presentation/majormatch-defense.pptx), [demo](demo-and-defense.md), [Rubric](rubric-evidence.md), [log chương 9](../ai-evidence/advisor/w9-prompt-log.md) | Báo cáo; thuyết trình; chuyển giao/kiểm tra |

Actor soạn và chạy kiểm tra: Codex theo yêu cầu của người dùng. Danh tính commit dùng cấu hình Git hiện tại `Vcoch27 <142958796+Vcoch27@users.noreply.github.com>`, Author = Committer. Connector GitHub đang xác thực `NhatPrv` có quyền repo và được dùng cho thao tác PR/merge khi CLI không có phiên đăng nhập. Tên actor của các thao tác này không được luân phiên để giả lập ba tác giả. Chưa có owner review/sign-off mới được ghi nhận; phân công chuyên môn và phân vai nói không thay minh chứng đóng góp cá nhân.

## Kiểm chứng mới trong phiên

| Kiểm tra | Kết quả thực tế |
|---|---|
| `npm test` | 14 files, 77 tests đạt |
| `npx tsc --noEmit` | Exit 0 |
| Playwright lần đầu | Không khởi chạy được vì thiếu Chromium headless shell v1248 |
| Khôi phục môi trường | `npx playwright install chromium`, không đổi test để che lỗi |
| `npm run test:e2e` sau cài browser | 8 lần chạy đạt trên Chromium desktop/mobile |
| `npm run build` | Exit 0, các route production build thành công |
| Lighthouse | 2 quan sát thật: mobile/desktop trên trang chủ production local, JSON và giới hạn có trong report |
| PowerPoint | 11 slide; package/layout/font policy/import đạt; không có findings layout; đã xem PNG từng slide |
| Ảnh minh họa | `/upload` guest và `/result?demo=1`, production local, viewport 1280×900, mọi API bị chặn; dữ liệu tổng hợp |

PPTX cuối có SHA-256 `c1d440fb1939913bc4067310356e16e59d881a03f808ed33947c1f03315f74aa`, 56664 bytes; xem [receipt rút gọn](presentation/validation.json). Finalizer kiểm tra cấu trúc/import không chứng minh Office render giống hệt; chưa mở thử bằng PowerPoint thật.

Script [verify-delivery.mjs](../../scripts/reporting/verify-delivery.mjs) kiểm tra các file, liên kết local, số cấu hình đo và nội dung slide. Nó không kiểm chứng mọi external URL, mọi công thức, mọi phát biểu nghiệp vụ hoặc chất lượng bài bảo vệ. Chạy trước commit/PR, đọc kết quả thật thay vì coi sự tồn tại của script là pass.

## Ranh giới chưa được kiểm chứng

Chưa có model inference, live upload, DB persistence/backup restore, field performance, user research hoặc toàn bộ WCAG được chạy trong chương 9. Lighthouse accessibility 100 ở trang chủ không xác nhận toàn app. 77 test không phải coverage 100%. Các lỗi false save, fallback định danh/GPA, simulation và dependency cũ được nêu trong báo cáo, chưa được sửa bởi task tài liệu.

## Bằng chứng xuất bản

Đợt bàn giao dùng nhánh `codex/chapter-9-delivery` ở cả hai repository; xuất subtree client trước, monorepo sau, đối chiếu tree rồi mới merge theo yêu cầu người dùng. Trạng thái cuối và SHA merge phải đọc từ PR thực trên GitHub. Không điền trước “đã merge”, review owner hoặc deployment thành công vào hồ sơ khi chưa có phản hồi xác nhận.

Một bộ chỉ tài liệu chương 9 không thể tự hoàn thành yêu cầu cá nhân còn thiếu của các tuần trước. Nhóm nên mở report/slide, luyện demo và bổ sung nhận xét thực của người trình bày trước khi nộp.
