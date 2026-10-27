# Analytics — component verification

Ngày 27/10/2026. Owner: Ánh Vy; người thực hiện: Codex trong phiên của người yêu cầu (CLI `Vcoch27`). Owner review: đang chờ. Baseline `c18e4ce`.

## Yêu cầu và quyết định thực tế

Người dùng yêu cầu triển khai phần Analytics và Advisor đã đề xuất. Phạm vi Analytics: kiểm thử radar rỗng/một phần, bảng số liệu thay thế, và reduced motion. Đối chiếu PRD Analytics AC02/08 và shared guardrails; không thay đổi thuật toán gợi ý ngành.

Review mã cho thấy biểu đồ chưa có numeric alternative, và animation được bật cố định. Đã bổ sung bảng semantic chứa trục, điểm hiện tại, chuẩn ngành, chênh lệch; caption nêu đúng ngành. SVG được ẩn khỏi accessibility tree để bảng là nguồn số liệu tương đương. Hook `useReducedMotion` đọc và theo dõi media query, gỡ listener khi unmount; render đầu tiên không chạy animation khi chưa biết preference.

## Kiểm chứng thực tế

5 ca component: trạng thái rỗng; zero hợp lệ trong bảng; cảnh báo và loại hàng không hợp lệ; đổi ngành không giữ hàng/cảnh báo cũ; thay đổi media preference và cleanup listener. Tất cả đạt. Recharts được mock ở cấp renderer, không coi đó là kiểm tra thư viện chart.

E2E dùng trang `/result?demo=1` trên Chromium 1280×800 và 375×812, bật reduced motion; xác nhận bảng, tiêu đề cột, có số liệu và nhãn DEMO. Cả 2 lần chạy đạt. Không tuyên bố đã đo tương phản, kiểm tra screen reader thật hoặc đạt WCAG toàn diện.

Kết quả toàn dự án và hướng chạy: [COMPONENT_VERIFICATION.md](../../05-testing-and-rules/COMPONENT_VERIFICATION.md). Chưa có nhận xét/duyệt của Ánh Vy được ghi nhận; tài liệu không giả nhận xét của người khác.
