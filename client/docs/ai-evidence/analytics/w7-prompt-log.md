# NHẬT KÝ SỬ DỤNG AI - TUẦN 7 (MODULE ANALYTICS)
## PHỤ TRÁCH: NGUYỄN THỊ ÁNH VY (`anhvydn2005@gmail.com`)
* **Chủ đề tuần 7**: Trực quan hóa Kỹ năng Học kỳ & Đánh dấu Bù đắp Khoảng trống Năng lực (Visual Milestone Skill Badges)
* **Mục tiêu**: Thiết kế component `MilestoneSkillBadges.tsx` hiển thị dải huy hiệu kỹ năng cho từng giai đoạn lộ trình học tập, liên kết trực quan với dữ liệu `missing_skills` từ module Analytics để sinh viên nhận diện ngay môn học/kỳ học nào giúp bù đắp kỹ năng còn thiếu.

---

### 1. Prompt 1: Thiết kế component hiển thị dải kỹ năng theo phong cách Glassmorphism
* **Người thực hiện**: Nguyễn Thị Ánh Vy
* **Mục đích**: Xây dựng giao diện hiển thị danh sách kỹ năng đầu ra của học kỳ đẹp mắt, ăn khớp với Design System Slate/Indigo/Cyan của hệ thống MajorMatch.
* **Nội dung Prompt gửi AI**:
  ```text
  Em đang hoàn thiện module Analytics cho MajorMatch. Em muốn tạo một React component tên là MilestoneSkillBadges.tsx nhận vào props:
  - skills: string[] (danh sách kỹ năng của học kỳ)
  - semesterTitle?: string
  Component cần:
  1. Phong cách Sleek Dark Mode, glassmorphism với background slate-900/60, viền border slate-800/80.
  2. Đọc missing_skills từ Zustand useProfileStore.
  3. Nếu kỹ năng nào trùng với missing_skills, hiển thị badge nổi bật màu indigo/emerald với icon CheckCircle2 và nhãn "Bù đắp Gap", có hiệu ứng ring nhẹ.
  4. Nếu là kỹ năng thông thường, hiển thị dạng tag #skill màu slate-300 tối giản.
  ```
* **Đánh giá phản hồi của AI**:
  - *Điểm tốt*: Code sạch, responsive tốt, sử dụng Tailwind CSS linh hoạt.
  - *Điểm hạn chế phát hiện*: AI so sánh chuỗi kỹ năng phân biệt hoa thường (`===`), dẫn đến nếu dữ liệu trả về "pytorch" và "PyTorch" thì không khớp.
* **Điều chỉnh thực tế (Human-in-the-loop)**:
  - Ánh Vy đã bọc dữ liệu trong `useMemo` và chuẩn hóa `s.toLowerCase().trim()` thông qua cấu trúc `Set` để tối ưu hóa hiệu năng tìm kiếm $O(1)$.

---

### 2. Prompt 2: Nâng cấp InteractiveTask với hiệu ứng phát sáng cho kỹ năng bù đắp Gap
* **Người thực hiện**: Nguyễn Thị Ánh Vy
* **Mục đích**: Khi sinh viên xem danh sách môn học hoặc đồ án trong từng kỳ, các tag kỹ năng đạt được cũng được highlight nếu môn đó bù đắp kỹ năng còn thiếu.
* **Nội dung Prompt gửi AI**:
  ```text
  Trong InteractiveTask.tsx, khi render mảng skills: string[], hãy giúp em kiểm tra xem kỹ năng đó có nằm trong missing_skills của sinh viên không. Nếu có, thêm viền nổi bật và nhãn nhỏ '✓ Gap'.
  ```
* **Kết quả**: Giao diện hiển thị trực quan, sinh viên có thể thấy rõ ngay giá trị thực tế của từng môn học được đề xuất.
