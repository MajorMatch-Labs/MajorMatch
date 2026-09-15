# ====================================================================

# QUY TẮC ĐỒNG BỘ PUSH CODE & ĐỒNG BỘ NHÁNH 1-1 CHO AGENT (AGENTIC RULES)

# ====================================================================

Mọi AI Agent làm việc trên repository `majormatch-client` bắt buộc phải tuân thủ nghiêm ngặt các điều khoản tự động hóa sau:

---

## 1. BẢNG ÁNH XẠ DANH TÍNH TÁC GIẢ & MODULE (AUTHOR MAPPING)

Khi thực hiện commit hoặc tạo nhánh cho bất kỳ tính năng nào, Agent **BẮT BUỘC** sử dụng đúng thông tin tác giả và email tương ứng để bảo toàn điểm số hoạt động (Contribution Graph) trên GitHub:

| Thành viên    | Module phụ trách | Thư mục mã nguồn         | Author Name         | Email GitHub chính xác     | Tiền tố nhánh (Branch Prefix) |
| :------------ | :--------------- | :----------------------- | :------------------ | :------------------------- | :---------------------------- |
| **Văn Hoàng** | `ingestion`      | `src/modules/ingestion/` | `Vcoch27`           | `hoangtungmy123@gmail.com` | `feat/vanhoang-w<tuần>-...`   |
| **Ánh Vy**    | `analytics`      | `src/modules/analytics/` | `Nguyen Thi Anh Vy` | `anhvydn2005@gmail.com`    | `feat/anhvy-w<tuần>-...`      |
| **Long Nhật** | `advisor` & Core | `src/modules/advisor/`   | `NhatPrv`           | `torikun2005@gmail.com`    | `feat/longnhat-w<tuần>-...`   |

---

## 2. NGUYÊN TẮC ÁNH XẠ NHÁNH & PULL REQUEST

1. **Cùng tên nhánh tuyệt đối (Exact Branch Matching)**:
   - Mọi công việc phải được thực hiện trên nhánh tính năng có định dạng: `<loại>/<tên>-w<tuần>-<tính-năng>`.
2. **Nghiêm cấm Push trực tiếp vào `main`**:
   - Nhánh `main` của repo chỉ nhận code thông qua Pull Request sau khi được Tech Lead (Long Nhật) review và merge.
3. **Minh chứng AI (Bắt buộc theo Rubric Vibe Coding CLO2 & CLO3)**:
   - Mỗi tuần làm việc có nhật ký tại `docs/ai-evidence/<module>/w<tuần>-prompt-log.md`, với module ingestion/analytics/advisor. Tên tác giả vẫn theo bảng danh tính, không dùng tên module làm Git Author.
4. **Thứ tự đồng bộ Week 4**: Client subtree trước, repo cha sau; cùng tên nhánh. Người review sửa tài liệu module khác giữ Author của mình và thêm `Co-authored-by` của chủ module. Không sửa lịch sử commit cũ.

---

## 3. TIÊU CHUẨN COMMIT TIẾNG ANH (CONVENTIONAL COMMITS)

- Mọi commit phải viết bằng tiếng Anh theo chuẩn Conventional Commits:
  ```bash
  git commit -m "<type>(<scope>): <short description in English>" --author="<Name> <<email>>"
  ```
- Các loại hợp lệ: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

---

## 4. ĐIỀU KHOẢN AN TOÀN & BẢO MẬT

1. **Tuyệt đối cấm commit file `.docx`** vào bất kỳ nhánh nào của repository.
2. **Cấm commit file chứa API keys nhạy cảm** (`.env.local`).
3. **Cấm code giả lập rỗng**: Không sử dụng `// TODO: implement later`. Mọi component phải có logic hoặc mock data hoàn chỉnh.
