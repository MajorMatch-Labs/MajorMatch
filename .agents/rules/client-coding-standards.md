# ====================================================================

# QUY CHUẨN KỸ THUẬT & LẬP TRÌNH CLIENT WEB 2.0 (CODING STANDARDS)

# ====================================================================

Bộ quy tắc kỹ thuật dành cho AI Agent khi sinh mã nguồn, tái cấu trúc hoặc tối ưu hóa ứng dụng MajorMatch Client.

---

## 1. NGUYÊN TẮC KIẾN TRÚC & CÔNG NGHỆ

1. **Framework**: Next.js 14 (App Router). Tách biệt rõ ràng Server Components và Client Components (`"use client"`).
2. **Ngôn ngữ**: TypeScript ở chế độ nghiêm ngặt (`strict: true`). Tuyệt đối cấm sử dụng `any`. Mọi props và API payloads phải được định kiểu tường minh trong `src/types/`.
3. **Quản lý trạng thái (State Management)**: Sử dụng **Zustand** (`useProfileStore.ts`). Tuân thủ mẫu Atomic Selectors (ví dụ: `useProfileStore((state) => state.profile)`) để tránh re-render toàn bộ cây component không cần thiết.
4. **Trực quan hóa dữ liệu (Recharts)**:
   - Luôn bọc biểu đồ trong `<ResponsiveContainer width="100%" height="100%">` với thẻ cha có chiều cao cố định hoặc min-height rõ ràng.
   - Đảm bảo hiển thị hoàn hảo trên viewport di động (375px) và hỗ trợ bảng dữ liệu thay thế (Accessibility).
5. **Giao diện & Thiết kế**:
   - Áp dụng phong cách Dark Mode Glassmorphism hiện đại (kết hợp `backdrop-blur`, viền mờ `border-slate-800`, dải chuyển màu nhẹ nhàng).
   - Không sử dụng inline styles (`style={{ ... }}`), toàn bộ styling phải thông qua các utility classes của Tailwind CSS.

---

## 2. NGUYÊN TẮC WEB 2.0 & TRẢI NGHIỆM NGƯỜI DÙNG (UX)

1. **Dynamic Interactive State (Zero Page Reload)**:
   - Khi người dùng tích chọn checkbox môn học hoặc điều chỉnh thanh trượt khảo sát, các chỉ số (% Job Readiness, điểm Holland) phải tự động tính toán lại tức thì phía Client mà không tải lại trang.
2. **Trạng thái hệ thống rõ ràng (System Visibility)**:
   - Mọi tác vụ bất đồng bộ phải có đủ 4 trạng thái UI: `Empty`, `Loading / Skeleton`, `Error / Validation Alert`, `Success`.
3. **Fault-Tolerant Mock Fallback**:
   - Khi Backend AI hoặc Gateway chưa sẵn sàng, Client phải tự động chuyển sang cơ chế dữ liệu giả lập (`mockData.ts`) để đảm bảo ứng dụng luôn demo trơn tru khi chấm điểm.

---

## 3. TIÊU CHUẨN VIẾT CODE SẠCH

1. **Cấm code giả lập rỗng**: Tuyệt đối không để lại chú thích `// TODO: implement later` hoặc các hàm trả về rỗng trong mã nguồn hoàn thiện.
2. **Khả năng tiếp cận (Accessibility - WCAG 2.1 AA)**:
   - Các nút bấm, vùng kéo thả file, slider phải điều hướng được bằng bàn phím (`Tab`, `Enter`, `Space`).
   - Các thông báo lỗi phải có thuộc tính `role="alert"` để trình đọc màn hình nhận diện được.
