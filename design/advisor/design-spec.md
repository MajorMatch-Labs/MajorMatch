# ĐẶC TẢ THIẾT KẾ GIAO DIỆN MODULE ADVISOR/CORE (UI DESIGN SPECIFICATION)
## DỰ ÁN: MAJORMATCH — HỆ THỐNG ĐỊNH HƯỚNG CHUYÊN NGÀNH & CỐ VẤN HỌC TẬP
**Tuần:** Week 4 / Task 2 — UI Design  
**Tác giả / Phụ trách:** Long Nhật (`NhatPrv <torikun2005@gmail.com>`) — Tech Lead / Advisor & Client Core  
**Nhánh làm việc:** `feat/longnhat-w4-advisor-ui-design`  
**Căn cứ tài liệu:** [PRD Advisor UI](../../tasks/advisor/prd-advisor-ui.md), [DESIGN.md](../../DESIGN.md), [DESIGN-GUARDRAILS.md](../../DESIGN-GUARDRAILS.md), [tokens.css](../shared/tokens.css)

---

## 1. TỔNG QUAN THIẾT KẾ & ĐỊNH HƯỚNG SẢN PHẨM (DESIGN DIRECTION)

Thiết kế giao diện module **Advisor/Core** tập trung giải quyết câu hỏi cốt lõi của sinh viên đại học:
> **"Hành động khả thi tiếp theo tôi nên thực hiện là gì, và môn học nào bắt buộc phải hoàn thành trước?"**

Giao diện từ bỏ các hiệu ứng bóng bẩy giả tạo (không sử dụng glassmorphism lạm dụng, không dùng thanh phần trăm ảo, không đưa ra cam kết "100% có việc làm"), tuân thủ nghiêm ngặt bảng mã màu và kích thước quy chuẩn từ `client/design/shared/tokens.css`.

### 1.1. Hệ thống Design Tokens kế thừa
* **Màu nền chính:** `--mm-bg: #0b0f19` (Dark Slate).
* **Bề mặt nội dung (Surface):** `--mm-surface: #111827`, viền `--mm-border: #64748b`.
* **Bề mặt nâng cao (Raised):** `--mm-raised: #1e293b`.
* **Màu nhấn thương hiệu (Brand Accent):** `--mm-brand: #a5b4fc` (Indigo 300).
* **Màu tương tác chính (Primary Button):** `--mm-primary: #4338ca` (Indigo 700), chữ `--mm-on-primary: #ffffff`.
* **Màu trạng thái ngữ nghĩa:** Thành công `--mm-success: #6ee7b7`, Cảnh báo `--mm-warning: #fcd34d`, Lỗi `--mm-error: #fda4af`.
* **Chiều cao điều khiển tương tác (Controls):** `--mm-control-height: 44px` (Đảm bảo chuẩn cảm ứng di động và WCAG 2.1).
* **Bán kính bo góc:** Điều khiển `8px`, Thẻ nội dung `12px`.
* **Khổ rộng hiển thị tối đa:** `--mm-content: 1120px`.

---

## 2. BẢNG ÁNH XẠ TRUY VẾT YÊU CẦU & KỊCH BẢN CHẤP NHẬN (TRACEABILITY MATRIX)

Toàn bộ các màn hình và trạng thái thiết kế trong prototype được ánh xạ 1-1 tới các Story và Acceptance Criteria trong PRD:

| Mã AC / Story | Tên kịch bản PRD | Thành phần giao diện (UI Component) | Trạng thái thể hiện trong Prototype | Kiểm tra tương tác |
| :--- | :--- | :--- | :--- | :--- |
| **ADV-UI-AC-01** / `LN-W4-US-01` | Chặn truy cập trực tiếp không có ngữ cảnh | `#state-context-missing` (Card Warning) | Khi mở trực tiếp không qua phân tích, hiển thị thông báo chặn và nút quay lại, không tự ý nạp mock vào store cá nhân. | State Switcher: `missing-context` |
| **ADV-UI-AC-02** / `LN-W4-US-02` | Khóa mô phỏng khi DAG bị lỗi / vòng lặp | `#state-dag-error` (Card Error) | Phát hiện chu trình tiên quyết hoặc mã môn lạ, vô hiệu hóa toàn bộ checkbox mô phỏng. | State Switcher: `dag-error` |
| **ADV-UI-AC-03** / `LN-W4-US-02` | Hủy môn tiên quyết & Đặt lại dây chuyền (Cascade Reset) | `#modal-cascade-reset` | Khi bỏ chọn môn tiên quyết (ví dụ `CS201`), hiển thị Modal cảnh báo xác nhận nguyên tử (Atomic Reset), hủy chọn `CS301` và `CS401`. | Bỏ chọn môn `CS201` khi đã tích `CS301` |
| **ADV-UI-AC-04** / `LN-W4-US-03` | Tính toán mô phỏng thuận nghịch (Reversible Simulation) | `.readiness-card`, `#simulated-score`, `#bar-simulated` | Điểm gốc (Baseline) 45% được bảo lưu bất biến. Tích chọn môn tăng tiến độ mô phỏng; bỏ chọn hoàn trả chính xác 100% về 45%. | Tích chọn `CS201` -> +15% -> 60%, bỏ chọn -> về lại 45% |
| **ADV-UI-AC-05** / `LN-W4-US-05` | Stream token tiếng Việt qua SSE | `.chat-messages`, `.typing-caret` | Phản hồi từ mô hình hiển thị từng token tiếng Việt chuẩn xác (xử lý tốt ký tự UTF-8 có dấu), kèm trích dẫn căn cứ. | Nút `Stream token tiếng Việt` |
| **ADV-UI-AC-06** / `LN-W4-US-05` | Nút Dừng (Stop) ngắt luồng phản hồi | `#btn-chat-stop`, `.message-stopped-badge` | Khi đang stream, nút "Dừng" hiển thị nổi bật. Nhấn dừng sẽ ngắt ngay tiến trình, giữ nguyên phần chữ đã sinh kèm nhãn `[Đã dừng bởi người dùng]`. | Nhấn nút "Dừng" khi đang stream |
| **ADV-UI-AC-07** / `LN-W4-US-05` | Xử lý gián đoạn kết nối (EOF) & Lỗi 429 | `#chat-error-alert`, `#btn-chat-retry` | Khi mất kết nối giữa chừng hoặc lỗi quá tải HTTP 429, hiển thị thanh cảnh báo lỗi kèm nút "Thử lại" thủ công, không tự động POST ngầm. | Nút `Lỗi ngắt kết nối EOF` và `Lỗi quá tải 429` |
| **ADV-UI-AC-08** / Toàn bộ | Trải nghiệm di động 375px & Khả năng tiếp cận | `body.preview-mobile`, Semantic HTML, ARIA live region | Cột xếp chồng 1 cột, không tràn ngang, các nút tối thiểu 44px, hỗ trợ trình đọc màn hình với `#a11y-live-region`. | Nút `Màn hình di động (375px)` |
| **XUI-AC-01..06** | Nhãn nguồn gốc & Khử danh tính | `#global-provenance`, `.context-snapshot-box` | Nhãn phân biệt rõ ràng: `DEMO PROTOTYPE` + `TÍNH TOÁN DẪN XUẤT`. Ngữ cảnh gửi đi công khai không chứa tên, MSSV, PDF. | Kiểm tra hộp "Ngữ cảnh chuyển giao bảo mật" |

---

## 3. CHI TIẾT CÁC PHÂN HỆ THIẾT KẾ

### 3.1. Phân hệ 1: Lộ trình cá nhân hóa & Đồ thị tiên quyết (Prerequisite DAG)
* **Khái niệm:** Lộ trình 4 học kỳ (Kỳ 5 đến Kỳ 8) thuộc chuyên ngành `CS_DATA_AI`.
* **Cấu trúc Đồ thị tiên quyết (Directed Acyclic Graph):**
  ```mermaid
  graph LR
    CS101["CS101 (Đã hoàn thành)"] --> CS201["CS201 (Kỳ 5 - Đủ ĐK)"]
    CALC["Toán Giải tích (Đã đạt)"] --> MATH205["MATH205 (Kỳ 5 - Đủ ĐK)"]
    CS201 --> CS301["CS301 (Kỳ 6 - Bị khóa)"]
    MATH205 --> CS301
    CS301 --> CS401["CS401 (Kỳ 7/8 - Bị khóa)"]
  ```
* **Quy tắc hiển thị trạng thái:**
  1. **Đủ điều kiện đăng ký (Eligible):** Thẻ có viền xám tiêu chuẩn, checkbox khả dụng, nhãn xanh lá *"Đủ điều kiện đăng ký"*.
  2. **Bị khóa tiên quyết (Locked):** Thẻ bị làm mờ nhẹ (opacity 0.85), checkbox bị vô hiệu hóa (`disabled`), nhãn đỏ nhạt *"Bị khóa tiên quyết"*, hiển thị rõ ràng bằng chữ danh sách môn cần học trước.
  3. **Đã mô phỏng (Simulated):** Thẻ có nền ánh xanh nhạt, viền xanh lá `--mm-success`, đánh dấu môn học được tính vào dự báo.
* **Cơ chế Mở khóa Động (Dynamic Unlock):** Khi người dùng tích chọn cả `CS201` và `MATH205`, hệ thống ngay lập tức kích hoạt mở khóa môn `CS301` mà không tải lại trang, đồng thời phát âm báo hỗ trợ tiếp cận (ARIA announcement).

### 3.2. Phân hệ 2: Khung mô phỏng hoàn thành môn học thuận nghịch (Reversible Simulation Engine)
* **Nguyên tắc bảo toàn điểm gốc (Baseline Immutability):**
  * Điểm gốc `Baseline Match: 64%`, `Baseline Readiness: 45%` và 3 trục radar năng lực cơ sở (`ML: 55%`, `Data: 70%`, `Math: 60%`) được lưu trữ bất biến.
  * Chỉ số mô phỏng hiển thị bằng công thức:  
    $$\text{Simulated Readiness} = \min\left(100, \text{Baseline} + \sum_{i \in \text{SimulatedSet}} \text{Weight}_i\right)$$
* **Hoàn trả chính xác 100% (Exact Reversal):**
  * Tích chọn `CS201` (+15%) -> Điểm tăng lên 60%.
  * Tích chọn `MATH205` (+10%) -> Điểm tăng lên 70%.
  * Bỏ chọn hoặc nhấn nút "Đặt lại về điểm gốc ban đầu (Reset)" -> Điểm trở về chính xác 45%, không bị lệch do làm tròn.
* **Cảnh báo không cam kết việc làm:** Dưới thanh tiến độ luôn có dòng ghi chú bắt buộc: *"Chỉ số dẫn xuất hỗ trợ lập kế hoạch học tập • Không phải tỷ lệ cơ hội việc làm thực tế"*.

### 3.3. Phân hệ 3: Cố vấn trực tiếp & Điều khiển luồng SSE (Streaming State Machine)
* **Bảo mật ngữ cảnh (Scoped Snapshot):**
  * Hộp thông tin ngữ cảnh công khai cho người dùng biết chính xác những gì được gửi đi: Mã ngành, danh sách môn thiếu, học kỳ hiện tại.
  * Xác nhận bảo mật: Tuyệt đối không gửi họ tên sinh viên, mã số sinh viên, tệp PDF bảng điểm hay toàn bộ bộ nhớ Client.
* **Máy trạng thái luồng SSE (State Machine):**
  1. `Idle (Sẵn sàng)`: Chấm trạng thái màu xám, nút "Gửi" hiển thị.
  2. `Connecting (Đang kết nối)`: Chấm trạng thái màu vàng nhấp nháy.
  3. `Streaming (Đang sinh token)`: Chấm trạng thái màu xanh lá nhấp nháy, con trỏ gõ chữ (`typing-caret`), nút "Gửi" ẩn đi, thay bằng nút **"Dừng"** (`#btn-chat-stop`).
  4. `Stopped (Đã dừng bởi người dùng)`: Chấm trạng thái màu đỏ, bảo lưu phần văn bản đã nhận kèm huy hiệu `[Đã dừng phản hồi bởi người dùng]`.
  5. `Interrupted (Mất kết nối đột ngột - EOF before done)`: Xuất hiện hộp cảnh báo lỗi màu đỏ kèm nút "Thử lại".
  6. `Rate-Limited (HTTP 429)`: Cảnh báo quá tải yêu cầu, đề xuất thời gian chờ (15 giây).
* **Trích dẫn có căn cứ (Grounded Citation):** Mọi câu trả lời của trợ lý AI đều kết thúc bằng thẻ căn cứ điều khoản chương trình đào tạo cụ thể (ví dụ: *Căn cứ: Khung CTĐT KNTT-2024 Điều 4.2*).

---

## 4. BẢNG ĐIỀU KIỆN QUYẾT ĐỊNH CHO 10 CÂU HỎI MỞ (CONDITIONAL DECISION VARIANTS)

| STT | Câu hỏi trong PRD | Quyết định thiết kế thể hiện trong Prototype | Lý do kỹ thuật & Ranh giới an toàn |
| :--- | :--- | :--- | :--- |
| **Q1** | Thuật ngữ "Job Readiness" hay "Planning Progress"? | Sử dụng thuật ngữ **"Tiến độ chuẩn bị học tập (Planning Readiness Indicator)"** kèm ghi chú giải thích. | Tránh ngộ nhận pháp lý cho sinh viên rằng đạt 100% là trường cam kết có việc làm. |
| **Q2** | Cơ quan phê duyệt công thức và trọng số môn học? | Trọng số tạm thời gắn cố định theo số tín chỉ (`+15%`, `+10%`, `+20%`), gắn nhãn DEMO FORMULA. | Chờ Hội đồng Khoa học phê duyệt chính thức trước khi đưa vào sản phẩm thực. |
| **Q3** | Đồ án và chứng chỉ có được mô phỏng không? | Đồ án tốt nghiệp (`CS401`) được đưa vào DAG; chứng chỉ ngoài được tách riêng và không tính vào mẫu số readiness. | Bảo đảm mẫu số tính toán chỉ dựa trên các học phần có tín chỉ chính thức. |
| **Q4** | Phiên bản CTĐT nào là căn cứ tiên quyết? | Sử dụng phiên bản **KNTT-2024-v2.1** hiển thị trên huy hiệu đầu trang. | Tránh xung đột mã môn giữa các khóa sinh viên khác nhau. |
| **Q5** | Bỏ chọn môn tiên quyết: Tự động reset hay hỏi xác nhận? | **Hiển thị Modal cảnh báo xác nhận nguyên tử (Atomic Reset Dialog).** | Giúp sinh viên hiểu rõ hệ quả khi hủy một môn nền tảng mà không làm mất trạng thái đột ngột. |
| **Q6** | Có cho phép chat chung khi chưa có lộ trình không? | **Chặn và hướng dẫn tạo lộ trình trước.** | Tránh việc AI trả lời chung chung, ảo giác ngoài chuyên môn. |
| **Q7** | Cơ chế đảm bảo tính lũy nghiệm (Idempotency) khi chat? | Khi stream bị đứt, nút "Thử lại" tạo một yêu cầu (attempt) mới hoàn toàn, không tự động POST ngầm. | Chống gửi trùng lặp câu hỏi và tràn tài nguyên GPU server. |
| **Q8** | Thời gian timeout kết nối và idle của chat? | Quy chuẩn timeout 15 giây, hiển thị thông báo lỗi thân thiện nếu quá thời gian. | Phù hợp với năng lực suy luận của GPU RTX 4060 cục bộ. |
| **Q9** | Lưu trữ lịch sử chat cục bộ (Persistence)? | Mặc định **chỉ lưu trong bộ nhớ RAM phiên làm việc (In-memory)**. Khi F5 sẽ làm mới. | Bảo vệ dữ liệu cá nhân sinh viên trên máy tính công cộng. |
| **Q10**| Tiêu chí đánh giá thành công của UI Advisor? | Đo lường bằng tỷ lệ sinh viên xác định đúng môn học tiếp theo cần đăng ký trong $\le 3$ lần tương tác. | Trực tiếp bám sát mục tiêu giảm tải tư vấn học vụ. |

---

## 5. THIẾT KẾ TRẢI NGHIỆM ĐA THIẾT BỊ & KHẢ NĂNG TIẾP CẬN (ACCESSIBILITY & RESPONSIVE)

### 5.1. Bố cục đáp ứng (Responsive Reflow)
* **Desktop ( $\ge 1120\text{px}$ ):** Bố cục 2 cột song song (Cột trái: Lộ trình & Mô phỏng chiếm 58%; Cột phải: Khung Cố vấn Chat chiếm 42%).
* **Mobile Viewport ( $375\text{px}$ ):**
  * Tự động co về 1 cột duy nhất theo trình tự quyết định tự nhiên: Thẻ chuyên ngành $\rightarrow$ Thanh chỉ số $\rightarrow$ Học kỳ 5 (ưu tiên hành động ngay) $\rightarrow$ Các học kỳ sau $\rightarrow$ Khung chat cố vấn.
  * Chiều cao khung chat giảm xuống $520\text{px}$, vùng soạn thảo ghim thuận tiện tầm tay ngón cái.
  * Tuyệt đối không xuất hiện thanh cuộn ngang trang (`overflow-x: hidden`).

### 5.2. Tiêu chuẩn tiếp cận WCAG 2.1 AA
* **Độ tương phản màu sắc (Contrast Ratio):**
  * Văn bản thông thường trên nền tối: `#f8fafc` trên `#111827` đạt tỷ lệ **14.2:1** (vượt xa chuẩn 4.5:1 của WCAG AA).
  * Văn bản phụ (Muted): `#b8c3d4` trên `#111827` đạt tỷ lệ **8.6:1**.
  * Màu thương hiệu Indigo: `#a5b4fc` trên `#111827` đạt tỷ lệ **9.1:1**.
* **Điều hướng bàn phím:** Toàn bộ checkbox môn học, nút bấm, ô nhập chat đều có thể truy cập qua phím `Tab`, kích hoạt bằng `Enter` / `Space`, và có viền chỉ thị tiêu điểm rõ ràng (`outline: 2px solid #c7d2fe`).
* **Hỗ trợ trình đọc màn hình:** Vùng `aria-live="polite"` tự động thông báo khi có môn học được mở khóa hoặc khi điểm số thay đổi.
* **Giảm thiểu chuyển động (Reduced Motion):** Hỗ trợ đầy đủ truy vấn `@media (prefers-reduced-motion: reduce)`, triệt tiêu toàn bộ hiệu ứng nhấp nháy và chuyển cảnh khi người dùng có thiết lập nhạy cảm thị giác.
