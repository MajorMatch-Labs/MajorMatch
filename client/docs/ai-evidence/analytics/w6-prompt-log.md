# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Nguyễn Thị Ánh Vy (`Nguyen Thi Anh Vy <anhvydn2005@gmail.com>`) — Module Analytics  
> **Tuần thực hiện**: Tuần 6 - Chương 6 (AI Lập trình: Code Generation & Tối ưu hóa Hiệu năng)  
> **Module liên quan**: analytics  

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Sử dụng AI Code Generation để tối ưu hóa hiệu năng hiển thị biểu đồ mạng nhện Recharts Radar (`RadarComparison.tsx`) bằng các kỹ thuật `useMemo` và `React.memo`; xây dựng Custom Tooltip hiển thị độ lệch delta theo thời gian thực; và bổ sung bộ lọc tương tác đa danh mục trong `SkillBreakdown.tsx`.
* **Công cụ AI sử dụng**: Claude 3.5 Sonnet & ChatGPT-4o.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Biểu đồ Recharts Radar của tôi bị giật lag và render lại liên tục mỗi khi chuyển ngành học. Hãy tối ưu code component RadarComparison.
```
* **Kết quả nhận được từ AI**:
  * AI chỉ bọc đơn giản component bằng `React.memo(RadarComparison)`.
  * Không phân tích nguyên nhân sâu xa: Mảng đối tượng dữ liệu `data` từ trang cha được tạo mới ở mỗi chu kỳ render (new object reference), khiến `React.memo` mặc định (so sánh nông `===`) bị vô hiệu hóa hoàn toàn.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * Không giải quyết được hiện tượng giật lag khi đổi ngành học vì tham chiếu mảng luôn khác nhau.
  * Chưa memoize tầng tính toán chuyển đổi dữ liệu (`RadarTransformer.transform`).

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Bạn là React Performance Specialist. Tôi có component RadarComparison nhận vào mảng `data: RadarAxisItem[]` và `majorName: string`.
Hãy tối ưu hiệu năng toàn diện theo 3 tầng:
1. Viết custom hook `useRadarMetrics(rawAxes, skillGap)` sử dụng `useMemo` để tính toán `transformedData` và `readinessSummary`, ngăn tính toán lại trừ khi nội dung mảng thay đổi.
2. Viết Custom Comparator function `areRadarPropsEqual(prevProps, nextProps)` cho `React.memo`: kiểm tra sâu giá trị các trục `axis_name`, `user_score`, `benchmark_score` thay vì chỉ so sánh tham chiếu con trỏ.
3. Thiết kế component `RadarTooltip.tsx` hiển thị nhãn độ lệch Delta (+/-) có màu sắc tương ứng (Xanh vượt trội / Đỏ thiếu hụt) và cấu hình animation mượt mà trong `radarConfig.ts`.
4. Viết unit test chứng minh tính tinh khiết (purity) của transformer.
```
* **Kết quả sau khi cải tiến**:
  * AI cung cấp giải pháp tối ưu 3 tầng hoàn chỉnh, triệt tiêu $100\%$ các lần re-render dư thừa khi click chuyển ngành học.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do sinh viên tự chỉnh sửa lại bằng tay**:
  * Hiện thực hàm so sánh sâu tùy biến trong `RadarComparison.tsx`:
  ```typescript
  function areRadarPropsEqual(prev: RadarComparisonProps, next: RadarComparisonProps): boolean {
    if (prev.majorName !== next.majorName) return false;
    if (prev.data === next.data) return true;
    if (prev.data.length !== next.data.length) return false;
    return prev.data.every((item, idx) => {
      const nextItem = next.data[idx];
      return (
        item.axis_name === nextItem.axis_name &&
        item.user_score === nextItem.user_score &&
        item.benchmark_score === nextItem.benchmark_score
      );
    });
  }
  export const RadarComparison = memo(BaseRadarComparison, areRadarPropsEqual);
  ```
  * Tinh chỉnh thời gian chuyển động `animationDuration: 750ms` với `animationEasing: 'ease-out'` tạo cảm giác giao diện mượt mà và cao cấp.
* **Bài học kinh nghiệm rút ra**: `React.memo` chỉ thực sự phát huy tác dụng khi kết hợp chặt chẽ với hàm so sánh props tùy biến và cấu trúc dữ liệu bất biến (Immutability).
