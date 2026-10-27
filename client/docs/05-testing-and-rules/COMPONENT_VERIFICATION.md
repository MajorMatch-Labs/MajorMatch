# Kiểm chứng Analytics và Advisor

Baseline: monorepo `c18e4cee03ff3511f524d7d4ef876187123dc65b`, ngày 27/10/2026. Nhánh: `codex/analytics-advisor-verification`.

Người thực hiện: Codex theo yêu cầu của người dùng; GitHub CLI xác thực `Vcoch27`. Owners để review: Analytics — Ánh Vy; Advisor/Core — Long Nhật. Việc review/xác nhận của hai owners chưa được thực hiện trong phiên này.

## Kết quả triển khai

| Module | Hành vi mới | Bằng chứng |
|---|---|---|
| Analytics | Bảng số liệu có caption/header thay thế biểu đồ; giữ zero thật và bỏ trục không hợp lệ; tôn trọng thay đổi reduced motion | [5 component tests](../../tests/components/analytics/RadarComparison.test.tsx), [nhật ký module](../ai-evidence/analytics/component-verification.md) |
| Advisor | Token/status/completion chỉ cập nhật đúng tài khoản, phiên, ngành và dữ liệu học tập; Stop vô hiệu hóa callback cũ; history muộn không ghi đè phiên mới | [7 component tests](../../tests/components/advisor/StreamingChatBox.test.tsx), [nhật ký module](../ai-evidence/advisor/context-verification.md) |
| Advisor transport | EOF khi chưa có DONE là interrupted; external abort hủy reader đang chờ | [8 lifecycle tests](../../tests/unit/sseStreamController.test.ts), gồm 2 ca bổ sung |
| Browser | Bảng radar hoạt động trong chế độ reduced motion; stream mock đóng sớm giữ partial text và không lưu assistant như câu trả lời hoàn chỉnh | [E2E](../../tests/e2e/analytics-advisor.spec.ts), desktop 1280×800 và mobile 375×812 |

Không đổi chính sách chấm readiness/ranking. API lỗi hiển thị lỗi; không ghi “đã kích hoạt phản hồi ngoại tuyến” khi chưa có phản hồi đó.

## Cách chạy

Dùng Node 20.19+, 22.12+ hoặc 24 (phù hợp jsdom 27). Phiên này chạy Node 24.20.0. jsdom 30 yêu cầu Node mới hơn môi trường Node 20 của dự án, nên chọn nhánh 27 tương thích và khóa dependency bằng package-lock. React Testing Library được dùng với môi trường jsdom theo từng file, không chuyển các unit tests Node sang trình duyệt.

```powershell
npm ci
npm test
npx tsc --noEmit
npm run test:e2e
npm run build
```

Máy mới cần cài browser Playwright theo phiên bản trong lockfile (`npx playwright install chromium`) nếu runtime báo thiếu executable. Báo cáo browser nằm ở `playwright-report/index.html`, các trace/ảnh lỗi nằm trong `test-results/`; chúng được gitignore.

Nguồn cách cấu hình: [React Testing Library setup](https://testing-library.com/docs/react-testing-library/setup/), [Vitest 2 environment](https://v2.vitest.dev/guide/environment). Đối chiếu ngày 27/10/2026; tài liệu Vitest 2 được dùng vì repo đang chạy 2.1.9.

## Kết quả thực thi và giới hạn

- `npm test`: **14 files, 77 tests đạt** (baseline trước phiên: 63 tests).
- `npx tsc --noEmit`: **đạt**.
- `npm run test:e2e`: **8 tests đạt**: 2 kịch bản mới × 2 viewport và 2 kịch bản cũ × 2 viewport.
- Lần E2E đầu: 6 đạt, 2 ca điều hướng cũ thất bại ở timeout 5 giây. Next dev biên dịch route trong khoảng thời gian đó. Đã đổi thời hạn assertion điều hướng thành 30 giây, khớp với ca báo cáo mẫu; lần chạy lại cả 8 đạt. Không thêm sleep hoặc bỏ assertion.
- `npm run build`: **đạt**, production build tạo thành công toàn bộ route hiện có.
- Component tests giả lập Recharts renderer và SSE controller để kiểm tra boundary/callback cố ý đến muộn. Chúng không chứng minh layout SVG hay transport thật.
- Browser tests chạy ứng dụng thật; test chat chặn toàn bộ `/api/**`, dùng tài khoản và token tổng hợp, không kết nối EC2/model thật. Test radar dùng báo cáo DEMO.
- Chưa kiểm chứng SQLite, xác thực backend thực, browser khác Chromium hoặc toàn bộ tiêu chí WCAG. Đây là một phần chương 8, chưa hoàn tất toàn bộ lộ trình.

Các phụ thuộc Next.js/Recharts cũ và các vấn đề xác thực/history backend cần task riêng theo kế hoạch nhóm; các kiểm tra trên không xác nhận production đã an toàn hoặc model online.
