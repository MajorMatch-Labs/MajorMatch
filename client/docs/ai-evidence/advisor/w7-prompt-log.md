# NHẬT KÝ SỬ DỤNG AI - TUẦN 7 (MODULE ADVISOR & CORE ARCHITECTURE)
## PHỤ TRÁCH: ĐẶNG LONG NHẬT (`torikun2005@gmail.com`)
* **Chủ đề tuần 7**: Tích hợp Kỹ năng Học kỳ vào Cây Lộ trình Tương tác & Đồng bộ Hợp đồng Dữ liệu RAG
* **Mục tiêu**: Nâng cấp `MilestoneTree.tsx` hiển thị dải kỹ năng chuẩn đầu ra của từng giai đoạn học kỳ và gắn danh sách `target_skills` cho từng môn học đề xuất; đồng bộ hợp đồng dữ liệu giữa FastAPI Backend và Next.js Client.

---

### 1. Prompt 1: Nâng cấp MilestoneTree hiển thị dải kỹ năng chuẩn đầu ra từng giai đoạn
* **Người thực hiện**: Đặng Long Nhật
* **Mục đích**: Tích hợp danh mục `milestone_skills` và `target_skills` vào cây lộ trình SVG timeline, đảm bảo sinh viên và giảng viên có thể kiểm tra trực tiếp danh sách kỹ năng rèn luyện được sau mỗi giai đoạn.
* **Nội dung Prompt gửi AI**:
  ```text
  Em đang hoàn thiện tính năng Roadmap Cố vấn trong MilestoneTree.tsx.
  Em muốn nâng cấp giao diện để:
  1. Ở mỗi học kỳ (Giai đoạn 1, 2, 3), bên dưới tiêu đề học kỳ hiển thị thêm một box dải kỹ năng chuẩn đầu ra (milestone_skills) với icon Sparkles và danh sách tag #skill nền slate-800 viền border slate-700.
  2. Với từng môn học được đề xuất (recommended_courses), truyền thuộc tính skills={course.target_skills} sang InteractiveTask để render danh sách kỹ năng mà môn học đó cung cấp.
  3. Giữ nguyên tính năng Live % Job Readiness và tương tác hoàn thành môn học.
  ```
* **Đánh giá phản hồi của AI**:
  - *Điểm tốt*: Bố cục hợp lý, gắn đúng props cho `InteractiveTask`.
  - *Điểm hạn chế phát hiện*: AI quên xử lý trường hợp `milestone_skills` bị undefined hoặc mảng rỗng trong trường hợp dữ liệu cũ.
* **Điều chỉnh thực tế (Human-in-the-loop)**:
  - Nhật đã bổ sung kiểm tra an toàn `sem.milestone_skills && sem.milestone_skills.length > 0` trước khi render box kỹ năng giai đoạn.

---

### 2. Prompt 2: Đồng bộ Pydantic Schemas Backend với Client
* **Người thực hiện**: Đặng Long Nhật
* **Mục đích**: Đảm bảo cả hai tầng Client và Backend HPC sử dụng chung một chuẩn dữ liệu DTO.
* **Nội dung Prompt gửi AI**:
  ```text
  Hãy cập nhật RecommendedCourse và SemesterMilestone trong schemas.py của FastAPI backend:
  - Thêm target_skills: List[str] vào RecommendedCourse.
  - Thêm milestone_skills: List[str] vào SemesterMilestone.
  - Cập nhật hàm fallback roadmap trong rag_service.py trả về đầy đủ các trường này.
  ```
* **Kết quả**: Kiểm thử `npm run build` trên Client và import Pydantic trên Backend đều đạt 100% không có lỗi type safety.
