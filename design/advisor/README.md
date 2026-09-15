# advisor UI design
Owner: Long Nhật. PRD: [prd-advisor-ui.md](../../tasks/advisor/prd-advisor-ui.md).
Branch: `feat/longnhat-w4-advisor-ui-design`. Git Author: `NhatPrv <torikun2005@gmail.com>`.

---

## 1. Deliverables Overview (Week 4 Task 2)
Tất cả các sản phẩm thiết kế của module Advisor/Core được lưu trữ trong thư mục này:

1. **Đặc tả thiết kế chi tiết:** [design-spec.md](design-spec.md)
   * Ánh xạ đầy đủ story/AC (`ADV-UI-AC-01..08`, `XUI-AC-01..06`).
   * Bảng quyết định có điều kiện cho 10 câu hỏi mở của PRD.
   * Đặc tả Đồ thị tiên quyết (DAG), Mô phỏng thuận nghịch (Reversible Simulation), và Máy trạng thái SSE Chat.
2. **Prototype tương tác hoàn chỉnh:** [prototype/](prototype/)
   * `index.html`: Cấu trúc ngữ nghĩa Semantic HTML5 hỗ trợ WCAG 2.1 AA.
   * `style.css`: Kế thừa chuẩn [tokens.css](../shared/tokens.css).
   * `app.js`: Động cơ mô phỏng tương tác, tính toán điểm từ baseline bất biến, mở khóa tiên quyết, Modal Cascade Reset, và giả lập luồng SSE token tiếng Việt kèm nút Dừng.
3. **Ảnh chụp màn hình thực tế:** [screenshots/](screenshots/)
   * `01-roadmap-desktop-baseline.png`: Giao diện lộ trình chuẩn trên Desktop (1120px).
   * `02-roadmap-simulation-cascade.png`: Kịch bản mô phỏng hoàn thành môn và Modal cảnh báo Cascade Reset.
   * `03-chat-streaming-and-stop.png`: Trạng thái sinh token SSE, nút Dừng và trích dẫn căn cứ.
   * `04-mobile-375px-flow.png`: Giao diện đáp ứng mượt mà trên màn hình di động (375px).
   * `05-error-and-interrupted-states.png`: Các trạng thái lỗi: Thiếu ngữ cảnh, Lỗi chu trình DAG, Gián đoạn kết nối EOF và Rate Limit 429.
4. **Báo cáo đánh giá & Kiểm thử trung thực:** [review.md](review.md)
   * Đánh giá 3 trụ cột chất lượng (Frictionless, Quality Craft, Trustworthy Building).
   * Bảng kiểm chứng trung thực: Công khai rõ các tính năng đã kiểm tra và các tính năng nằm ngoài phạm vi.

---

## 2. Hướng dẫn chạy Prototype cục bộ
Từ thư mục gốc của dự án (Monorepo), chạy lệnh sau để khởi chạy máy chủ tĩnh phục vụ prototype:

```bash
python -m http.server 4173 --bind 127.0.0.1 --directory client
```

Mở trình duyệt và truy cập vào đường dẫn:
```
http://localhost:4173/design/advisor/prototype/
```

* Nhấn nút **"Bảng điều khiển Reviewer"** ở góc phải thanh tiêu đề để mở bảng điều khiển State Inspector, cho phép chuyển đổi nhanh giữa các kịch bản kiểm thử:
  * Kịch bản chuẩn (Hợp lệ)
  * Thiếu ngữ cảnh phân tích (ADV-UI-AC-01)
  * Lỗi chu trình DAG (ADV-UI-AC-02)
  * Stream token tiếng Việt (ADV-UI-AC-05)
  * Lỗi ngắt kết nối EOF before done (ADV-UI-AC-07)
  * Lỗi quá tải HTTP 429 (ADV-UI-AC-07)
  * Chế độ xem di động 375px (ADV-UI-AC-08)

---

## 3. Checklist hoàn thành nhiệm vụ
- [x] Spec maps screen/state → PRD story/AC → fixture → screenshot/check.
- [x] Explicit conditional decision variants and live-integration exclusions.
- [x] Source runs using design/README.md instructions.
- [x] Actual screenshots and review, with no fabricated pass claims.
- [x] Correct author/coauthors; matching client/monorepo branches and paired PRs.
