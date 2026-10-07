# NHẬT KÝ SỬ DỤNG AI - TUẦN 7 (MODULE INGESTION)
## PHỤ TRÁCH: NGUYỄN VĂN HOÀNG (`hoangtungmy123@gmail.com`)
* **Chủ đề tuần 7**: Chuẩn hóa Kỹ năng Học phần theo từng Giai đoạn Đào tạo (Curriculum-to-Skill Mapping)
* **Mục tiêu**: Bổ sung schema `target_skills` và `milestone_skills` vào hợp đồng dữ liệu, xây dựng tiện ích phân loại kỹ năng đầu ra của từng môn học phục vụ hiển thị trên cây lộ trình.

---

### 1. Prompt 1: Thiết kế cấu trúc ánh xạ môn học sang kỹ năng đầu ra
* **Người thực hiện**: Nguyễn Văn Hoàng
* **Mục đích**: Ánh xạ toàn bộ mã môn học trong khung chương trình CNTT sang các kỹ năng cụ thể và phân nhóm theo miền nghiệp vụ (AI, Data, Infra, Software, Foundation).
* **Nội dung Prompt gửi AI**:
  ```text
  Em đang xây dựng module Ingestion cho hệ thống MajorMatch. Trong phần lộ trình học tập, sinh viên cần biết rõ từng môn học trong từng giai đoạn (kỳ học) mang lại những kỹ năng (target skills) cụ thể nào. Hãy giúp em viết một utility TypeScript tên là curriculumSkillMapper.ts gồm:
  1. Record CURRICULUM_SKILL_CATALOG ánh xạ các môn cốt lõi (MATH101, PHYS101, CS101, CS201-205, CS308, CS402, CS415, CS420, CS499) sang danh sách kỹ năng chuẩn.
  2. Hàm getSkillsForCourse(courseCode: string): string[] hỗ trợ normalize chữ hoa/thường và khoảng trắng.
  3. Hàm categorizeSkill(skill: string): SkillCategory để phân loại kỹ năng phục vụ đổi màu badge giao diện.
  Yêu cầu TypeScript strict, không dùng any.
  ```
* **Đánh giá phản hồi của AI**:
  - *Điểm tốt*: AI đã viết hàm chuẩn hóa chuỗi và định nghĩa enum phân loại rõ ràng.
  - *Điểm hạn chế phát hiện*: AI ban đầu để một số mã môn bị thiếu các kỹ năng chuyên sâu (ví dụ CS402 chỉ ghi "AI" chung chung mà không ghi rõ "PyTorch", "Neural Networks", "Deep Learning").
* **Điều chỉnh thực tế (Human-in-the-loop)**:
  - Hoàng đã bổ sung chi tiết danh mục kỹ năng thực tế khớp với giáo trình Khoa Khoa học máy tính VKU và chuẩn O*NET.

---

### 2. Prompt 2: Viết Unit Test cho bộ ánh xạ kỹ năng
* **Người thực hiện**: Nguyễn Văn Hoàng
* **Mục đích**: Đảm bảo $100\%$ các trường hợp truy vấn mã môn học đều trả về mảng kỹ năng an toàn, không sinh ngoại lệ.
* **Nội dung Prompt gửi AI**:
  ```text
  Hãy viết một bộ unit test Jest cho curriculumSkillMapper.ts kiểm tra:
  - Khối môn đại cương (MATH101, CS101)
  - Khối môn chuyên ngành theo giai đoạn (CS402, CS415, CS420)
  - Xử lý chuỗi input có khoảng trắng hoặc chữ thường
  - Mã môn không tồn tại trả về mảng rỗng
  - Phân loại danh mục kỹ năng (ai, data, infra, foundation, software)
  ```
* **Kết quả**: Bộ test `curriculumSkillMapper.test.ts` đã chạy kiểm thử đạt độ bao phủ cao.
