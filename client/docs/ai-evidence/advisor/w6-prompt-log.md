# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Long Nhật (`NhatPrv <torikun2005@gmail.com>`) — Tech Lead & Module Advisor  
> **Tuần thực hiện**: Tuần 6 - Chương 6 (AI Lập trình: Code Generation & Streaming SSE)  
> **Module liên quan**: advisor & Core Architecture  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Sử dụng AI Code Generation để hiện thực hóa kiến trúc nhận và giải mã luồng dữ liệu thời gian thực Server-Sent Events (SSE) cho Trợ lý Cố vấn AI (`StreamingChatBox.tsx`); xây dựng bộ điều khiển luồng `SseStreamController` có khả năng ngắt kết nối an toàn (AbortController) và bảo vệ timeout tự động; hiện thực giải thuật cuộn thông minh (Smart Auto-Scroll); và hiển thị định dạng Markdown an toàn.
* **Công cụ AI sử dụng**: Gemini 1.5 Pro & Claude 3.5 Sonnet.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Viết component chat nhận streaming từ API FastAPI bằng SSE và hiển thị chữ chạy từng từ trong Next.js 14.
```
* **Kết quả nhận được từ AI**:
  * AI viết một hàm dùng `res.body.getReader()`, đọc từng chunk rồi trực tiếp gọi `JSON.parse(chunk)` và cộng dồn chuỗi văn bản.
  * Tự động gọi `scrollIntoView()` sau mỗi lần nhận chunk.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * **Lỗi vỡ chunk mạng (TCP Fragmentation)**: Các gói tin SSE thường bị chia cắt ngẫu nhiên qua mạng internet. Việc gọi `JSON.parse` trực tiếp trên từng chunk sẽ gây crash ngay khi một dòng JSON bị cắt đôi qua 2 chunks.
  * **Lỗi cuộn cưỡng bức (Forced Scroll Lock)**: Luôn tự động cuộn xuống đáy khiến người dùng bị giật màn hình và không thể cuộn lên xem lại các câu trả lời trước đó trong khi bot đang tiếp tục gõ chữ.
  * **Thiếu cơ chế ngắt luồng (No Cancellation)**: Không có nút Dừng sinh phản hồi (Stop Generating) và không có Idle Timeout bảo vệ VRAM máy chủ khi mạng bị ngắt bất ngờ.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là Senior Frontend Architect chuyên sâu về Web Streaming Protocols. Hãy thiết kế tầng xử lý SSE hoàn chỉnh cho Next.js 14:
1. Viết lớp `SseLineBufferParser` trong `sseParser.ts`:
   - Quản lý bộ đệm dòng (line buffer), chỉ phát ra sự kiện khi gặp cặp ký tự xuống dòng liên tiếp (\n\n hoặc \r\n\r\n).
   - Tách biệt các trường `event:`, `data:`, `id:`, và tự động bỏ qua comment heartbeat (`:keepalive`).
   - Hàm `extractTokenPayload(event)` bóc tách an toàn token text và cờ kết thúc `[DONE]` hoặc `{"done": true}`.
2. Viết lớp `SseStreamController` trong `sseStreamController.ts`:
   - Tích hợp AbortController cho phép hủy stream bất kỳ lúc nào qua hàm `abort()`.
   - Cài đặt Idle Timeout Guard 15 giây: tự động hủy kết nối nếu server không gửi token mới quá 15s.
3. Cập nhật `StreamingChatBox.tsx`:
   - Smart Auto-scroll: Nhận diện cử chỉ cuộn chuột của người dùng, tạm dừng tự động cuộn nếu người dùng đã cuộn lên trên 60px.
   - Nút 'Dừng phản hồi' chuyển đổi mượt mà với nút Send.
4. Viết unit tests kiểm thử các trường hợp chunk bị cắt đôi tại ranh giới ký tự.
```
* **Kết quả sau khi cải tiến**:
  * AI cung cấp kiến trúc streaming đạt chuẩn công nghiệp, giải mã ổn định $100\%$ các gói tin phân mảnh và mang lại trải nghiệm người dùng mượt mà tương đương ChatGPT/Claude UI.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Hiện thực thuật toán Smart Auto-scroll trong `StreamingChatBox.tsx`:
  ```typescript
  const handleContainerScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    setUserScrolledUp(!isAtBottom);
  };

  const scrollToBottom = useCallback((force = false) => {
    if (force || !userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [userScrolledUp]);
  ```
  * Xây dựng bộ test [sseParser.test.ts](../../tests/unit/sseParser.test.ts) xác thực tính năng ghép chunk bị chia cắt ở ranh giới chuỗi.
* **Bài học kinh nghiệm rút ra**: Xử lý dữ liệu Streaming thời gian thực luôn đòi hỏi bộ đệm dòng (Line Buffer Parser) và xử lý bất đồng bộ chặt chẽ để đảm bảo ứng dụng không bao giờ bị crash do các biến động trễ gói tin trên đường truyền mạng.
