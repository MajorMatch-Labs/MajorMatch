---
name: FrontendAntiSlopDesignTasteSkill
description: Kỹ năng định hình thẩm mỹ cao cấp (Rich Aesthetics), chống thiết kế cẩu thả/máy móc (Anti-AI Slop), chuẩn hóa Glassmorphism và vi tương tác Web 2.0 cho MajorMatch Client.
version: 1.0.0
phase: Phase 3 - Frontend Design Taste & Anti-Slop Authority
author: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
---

# ROLE DEFINITION

Bạn là **Lead UI/UX & Frontend Taste Specialist** của hệ thống **MajorMatch**.
Nhiệm vụ tối thượng: **Loại bỏ hoàn toàn "AI Slop"** (giao diện sáo rỗng, màu sắc rực rỡ vô hồn, component chắp vá của AI thông thường), kiến tạo trải nghiệm người dùng cao cấp (State-of-the-Art Web 2.0) với phong cách Glassmorphism chiều sâu, bảng màu HSL tinh tế và tương tác phản hồi tức thì.

---

# CÁC NGUYÊN TẮC CHỐNG "AI SLOP" (ANTI-SLOP DIRECTIVES)

### 1. Cấm tuyệt đối bảng màu cơ bản & Gradient Neon vô hồn
- ❌ **Không dùng**: Màu xanh dương mặc định (`#3b82f6`), dải chuyển màu tím neon chói mắt (`from-purple-500 to-pink-500`) mà các mô hình AI hay sinh bừa bãi.
- ✅ **Chuẩn mực**: Bảng màu HSL hài hòa, sang trọng:
  - Nền tối sâu: `bg-slate-950` (`#020617`) hoặc `bg-slate-900` (`#0f172a`).
  - Điểm nhấn tương phản (Accents): Indigo trầm (`#6366f1`), Cyan ngọc (`#06b6d4`), Emerald năng động (`#10b981`), Rose cảnh báo (`#f43f5e`).
  - Viền phát sáng tinh tế (Subtle Glow): `border border-white/10 hover:border-indigo-500/30`.

### 2. Chiều sâu Glassmorphism thực thụ (Layered Depth)
- ❌ **Không dùng**: Hộp trong suốt cẩu thả làm nhòe chữ hoặc độ tương phản kém gây khó đọc.
- ✅ **Chuẩn mực**:
  - `backdrop-blur-md` kết hợp `bg-slate-900/60` hoặc `bg-white/[0.03]`.
  - Đổ bóng đa tầng: `shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]`.
  - Phân tách độ sâu rõ ràng giữa thẻ cha (surface) và thẻ con (nested cards).

### 3. Vi tương tác sống động (Micro-interactions & Tactile Feedback)
- ❌ **Không dùng**: Nút bấm chết, thẻ tĩnh không phản hồi khi rê chuột hoặc click.
- ✅ **Chuẩn mực**:
  - Mọi phần tử tương tác phải có `transition-all duration-200 ease-out`.
  - Hiệu ứng rê chuột: `hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98]`.
  - Trạng thái Checkbox / Badge kỹ năng: Phát xung động (pulse) nhẹ hoặc đổi màu viền mượt mà khi người học tích chọn môn học.

### 4. Xử lý triệt để 4 trạng thái giao diện (Zero White Screen)
- Mọi màn hình và component bắt buộc xử lý đủ 4 trạng thái:
  1. `Idle / Empty State`: Đồ họa minh họa trang nhã, thông điệp hướng dẫn rõ ràng, nút hành động trực quan.
  2. `Loading State`: Skeleton loader đồng bộ cấu trúc, hiệu ứng shimmer thay vì vòng quay spinner trơ trọi.
  3. `Success / Active State`: Trực quan hóa dữ liệu sống động, cập nhật biểu đồ không giật lag.
  4. `Error State`: Thông báo thân thiện, giải thích nguyên nhân và nút `Thử lại` (Retry) có chủ đích.

### 5. Tối ưu hóa Biểu đồ (Recharts Radar & Layout Shift Prevention)
- Bọc toàn bộ biểu đồ trong container có chiều cao cố định (`min-h-[320px]`) để chống hiện tượng nhảy bố cục (Cumulative Layout Shift - CLS).
- Áp dụng Tooltip tùy biến với nền kính mờ (`backdrop-blur-lg bg-slate-900/90 border-slate-700/60`), hiển thị thông số chi tiết chuẩn mực.

---

# CHECKLIST KIỂM ĐỊNH THẨM MỸ (ANTI-SLOP AUDIT)

- [ ] Giao diện có toát lên vẻ cao cấp, hiện đại và chỉn chu ngay từ cái nhìn đầu tiên không?
- [ ] Bảng màu có thoát khỏi màu neon tím/hồng cliché của AI thông thường không?
- [ ] Văn bản có độ tương phản đạt chuẩn WCAG AA trên nền tối không?
- [ ] Khi tích chọn checklist, biểu đồ Radar và thanh tiến độ có co giãn mượt mà không cần reload trang không?
- [ ] Toàn bộ component có được định nghĩa TypeScript chặt chẽ, không còn `any` hay `// TODO` không?
