# MAJORMATCH DEVELOPMENT SKILLS CATALOG (.antigravity/skills)

Tài liệu này tổng hợp toàn bộ danh mục **AI Agent Development Skills** được thiết kế riêng cho quá trình phát triển hệ thống **MajorMatch**. Mỗi giai đoạn (Phase) được nạp các kỹ năng chuyên biệt để bảo đảm chất lượng kiến trúc, trải nghiệm thẩm mỹ cao cấp, và an toàn tài nguyên phần cứng.

---

## 🗺️ BẢN ĐỒ KỸ NĂNG THEO TỪNG GIAI ĐOẠN PHÁT TRIỂN

```text
.antigravity/skills/
├── 01_doc_architect.md                   # [Phase 1] Đặc tả kiến trúc, PRD và tài liệu kỹ thuật
├── 06_ingestion_verification_guard.md     # [Phase 2] Kiểm định đầu vào, Magic Bytes, chống ảo giác
├── 03_frontend_client.md                 # [Phase 3] Triển khai Client Web 2.0 (Next.js, Recharts, Zustand)
├── 05_frontend_anti_slop_design_taste.md # [Phase 3] Thẩm mỹ cao cấp, chống AI Slop, Glassmorphism
├── 02_backend_ai_hpc.md                  # [Phase 4] Private AI Compute Engine (FastAPI, Scikit-learn, Ollama)
├── 07_backend_hpc_resource_guard.md      # [Phase 4] Khoanh vùng tài nguyên VRAM/RAM, cô lập suy luận AI
└── 04_cloud_infra.md                     # [Phase 5] Hạ tầng Cloudflare Tunnel, Edge Gateway, Zero-Trust
```

---

## 📋 CHI TIẾT CÁC GIAI ĐOẠN & KỸ NĂNG NẠP VÀO

| Giai đoạn (Phase) | Kỹ năng nạp (Skill File) | Phụ trách chính | Trọng tâm & Nhiệm vụ cốt lõi |
| :--- | :--- | :--- | :--- |
| **Phase 1: Architecture & Specs** | [`01_doc_architect.md`](01_doc_architect.md) | Toàn đội ngũ | Khởi tạo 10 hồ sơ kỹ thuật, kiến trúc Hybrid Cloud 3 tầng, quy chuẩn Web 2.0. |
| **Phase 2: Ingestion & Verification** | [`06_ingestion_verification_guard.md`](06_ingestion_verification_guard.md) | **Nguyễn Văn Hoàng** | **Chống ảo giác (Anti-Hallucination)**: Đọc Magic Bytes `%PDF-`, PII Redaction, kiểm định Holland RIASEC 10 câu. |
| **Phase 3: Frontend Web 2.0** | [`03_frontend_client.md`](03_frontend_client.md)<br>+ [`05_frontend_anti_slop_design_taste.md`](05_frontend_anti_slop_design_taste.md) | **Nguyễn Thị Ánh Vy** | **Chống "AI Slop"**: Thẩm mỹ cao cấp HSL, vi tương tác xúc giác, Dark Mode sâu, Recharts co giãn không tải lại trang. |
| **Phase 4: Backend AI HPC** | [`02_backend_ai_hpc.md`](02_backend_ai_hpc.md)<br>+ [`07_backend_hpc_resource_guard.md`](07_backend_hpc_resource_guard.md) | **Đặng Long Nhật** | **Khoanh vùng tài nguyên**: `asyncio.Semaphore(1)` cô lập Ollama Qwen 2.5 7B, giải phóng buffer PDF, chống tràn RAM/VRAM trên Legion 5 Pro. |
| **Phase 5: Cloud & Edge Gateway** | [`04_cloud_infra.md`](04_cloud_infra.md) | Toàn đội ngũ | Cổng biên Linux, Cloudflare Tunnel Zero-Trust, Nginx Token Bucket Rate Limiting, SQLite Response Cache. |

---

## 🛠️ HƯỚNG DẪN KÍCH HOẠT KHI PHÁT TRIỂN

Khi AI Agent bước vào một giai đoạn làm việc cụ thể, hãy yêu cầu Agent nạp kỹ năng tương ứng:
- **Khi làm UI/UX**: *"Nạp skill `.antigravity/skills/05_frontend_anti_slop_design_taste.md` và `.antigravity/skills/03_frontend_client.md` để rà soát mã nguồn giao diện, loại bỏ AI Slop và tối ưu hóa vi tương tác."*
- **Khi làm Backend/AI**: *"Nạp skill `.antigravity/skills/07_backend_hpc_resource_guard.md` và `.antigravity/skills/02_backend_ai_hpc.md` để khoanh vùng tài nguyên VRAM/RAM, cô lập mô hình Ollama và bảo vệ an toàn máy tính trạm."*
- **Khi làm Thu nhận dữ liệu**: *"Nạp skill `.antigravity/skills/06_ingestion_verification_guard.md` để kiểm tra toàn vẹn tệp PDF và bảo vệ quyền riêng tư PII."*

---

## 📌 QUY TẮC BẮT BUỘC KHI COMMIT (GIT CONVENTIONS FOR AGENTS)

Mọi thay đổi mã nguồn qua các giai đoạn phát triển bắt buộc tuân thủ nghiêm ngặt:
1. **100% Thông điệp Git Commit bằng Tiếng Anh**: Sử dụng Conventional Commits (`feat(...)`, `fix(...)`, `docs(...)`, `test(...)`, `refactor(...)`, `perf(...)`, `chore(...)`). Tuyệt đối cấm sử dụng tiếng Việt trong tiêu đề hoặc nội dung commit.
2. **Đồng nhất Author == Committer (Chống lỗi 2 avatar)**: Thiết lập đúng danh tính thành viên phụ trách trước khi commit. Cấm tự động gắn trailer `Co-authored-by:` trên các nhánh tính năng cá nhân để đảm bảo hiển thị duy nhất 1 avatar chính chủ trên GitHub.

