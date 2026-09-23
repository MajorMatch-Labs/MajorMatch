# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Thị Ánh Vy (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`) — Module Analytics  
> **Tuần thực hiện**: Tuần 1 - Chương 1 (Tổng quan AI trong SDLC & Foundation Models)  
> **Module liên quan**: analytics & Design System  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Nghiên cứu và thiết lập bộ Design Tokens (bảng màu HSL, typography, hiệu ứng kính mờ glassmorphism và Sleek Dark Mode) trong `tailwind.config.ts` để định hình phong cách giao diện AI-Native hiện đại, tạo ấn tượng trực quan cao cấp (Rich Aesthetics) cho người dùng ngay từ cái nhìn đầu tiên.
* **Công cụ AI sử dụng**: Claude 3.5 Sonnet & ChatGPT-4o.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Tạo bảng màu và cấu hình Tailwind CSS cho web app hướng nghiệp có AI nhìn cho đẹp và hiện đại.
```
* **Kết quả nhận được từ AI**:
  * AI đưa ra cấu hình Tailwind thông thường với các màu mặc định: `blue-500`, `gray-800`, `green-500`.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Giao diện sử dụng các màu mặc định trông rất phổ thông (generic MVP), không tạo được cảm giác công nghệ cao (Deep Tech / AI-Native).
  * Chưa có các biến số màu chuyên dụng cho 6 trục Holland RIASEC và các trạng thái độ lệch kỹ năng (Vượt trội, Đạt chuẩn, Thiếu hụt).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là Lead UI/UX Designer & Design System Architect. Tôi đang phát triển sản phẩm MajorMatch (Nền tảng AI Định hướng Chuyên ngành Công nghệ).
Hãy xây dựng cấu hình `tailwind.config.ts` đạt chuẩn thẩm mỹ cao cấp (Rich Aesthetics):
1. Hệ màu Dark Mode cao cấp: nền chính Slate 950/900, điểm nhấn Neon Indigo/Violet, viền mờ border-white/10.
2. Bộ màu đặc thù cho 6 trục Holland RIASEC (R: Đỏ cam, I: Xanh dương tri thức, A: Tím nghệ thuật, S: Xanh ngọc xã hội, E: Vàng cam quản lý, C: Xanh xám tổ chức).
3. 3 màu trạng thái trực quan cho phân tích khoảng cách kỹ năng (Surplus: Emerald, Match: Indigo, Gap: Rose).
4. Cấu hình font chữ Inter / Outfit và hiệu ứng blur backdrop-glassmorphism.
```
* **Kết quả sau khi cải tiến**:
  * AI cung cấp cấu hình `tailwind.config.ts` chuẩn xác với các design tokens có ngữ nghĩa (`colors.brand`, `colors.riasec`, `colors.gap`).

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Tinh chỉnh lại các mã màu trong `client/tailwind.config.ts` để đảm bảo độ tương phản (WCAG AA Contrast) khi hiển thị trên nền tối:
  ```typescript
  // client/tailwind.config.ts
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        card: 'rgba(17, 24, 39, 0.75)',
        brand: {
          primary: '#6366F1', // Indigo Neon
          secondary: '#8B5CF6', // Violet
          accent: '#06B6D4', // Cyan
        },
        riasec: {
          realistic: '#EF4444',
          investigative: '#3B82F6',
          artistic: '#EC4899',
          social: '#10B981',
          enterprising: '#F59E0B',
          conventional: '#6B7280',
        }
      }
    }
  }
  ```
* **Bài học kinh nghiệm rút ra**: Đưa các yêu cầu thẩm mỹ cụ thể kèm ngữ cảnh sử dụng (biểu đồ radar, thẻ ngành) giúp AI sinh mã CSS chính xác và tránh được các màu sắc đơn điệu mặc định.
