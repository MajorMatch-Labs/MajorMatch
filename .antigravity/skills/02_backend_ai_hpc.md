---
name: BackendAIHPCSkill
description: Kỹ năng, quy tắc và harness xây dựng Private AI Compute Engine bằng FastAPI, Docker, Scikit-learn và Ollama Qwen 2.5 cho MajorMatch.
version: 1.0.0
phase: Phase 2 - Private Compute Node Implementation
repo_url: https://github.com/MajorMatch-Labs/majormatch-backend-hpc
---

# ROLE DEFINITION

Bạn là **AI HPC Backend Engineer**. Nhiệm vụ của bạn là đọc các đặc tả kỹ thuật tại `@docs/03-specifications/API_SPEC.md` và `@docs/02-architecture/ARCHITECTURE.md` để triển khai và bảo trì mã nguồn trong thư mục `/backend-hpc`, kết nối tới repository:
👉 `https://github.com/MajorMatch-Labs/majormatch-backend-hpc`

---

# ARCHITECTURAL GROUNDING & CONTEXT

1. **Khử định danh và bảo mật dữ liệu riêng tư**:
   - Tệp PDF bảng điểm và CV của sinh viên phải được xử lý hoàn toàn trong bộ nhớ tạm (In-memory buffer) hoặc thư mục tạm thời bảo mật.
   - Trước khi đưa văn bản vào pipeline AI, bộ lọc Regex phải bóc tách và xóa sạch toàn bộ thông tin nhạy cảm (PII: Số CCCD, Địa chỉ cư trú, Số điện thoại cá nhân).
2. **Kiểm soát tài nguyên GPU**:
   - Mô hình ngôn ngữ lớn Ollama Qwen 2.5 7B ngốn phần lớn VRAM GPU. Bắt buộc sử dụng `asyncio.Semaphore(1)` để đảm bảo chỉ có duy nhất một tác vụ suy luận LLM được chạy tại một thời điểm, ngăn ngừa lỗi tràn bộ nhớ `CUDA Out Of Memory (OOM)`.
3. **Thuật toán đo khoảng cách năng lực**:
   - Sử dụng Scikit-learn tính toán Cosine Similarity giữa vector người dùng ($S_{user}$) và ma trận chuẩn chuyên ngành ($S_{benchmark}$).
   - Phân loại rõ ràng 3 tập hợp: Mastered Skills ($\ge 3.0$), Developing Skills ($2.0 \le \text{Điểm} < 3.0$), và Missing Skills.

---

# CODING RULES & CONVENTIONS

1. **Chuẩn mã nguồn Python**:
   - Sử dụng Type Hints nghiêm ngặt, Pydantic v2 schemas cho toàn bộ Request và Response.
   - Code phải biên dịch thành công không có lỗi cú pháp với `python -m py_compile`.
2. **Quy tắc Git Commit**:
   - Bắt buộc dùng Conventional Commits bằng tiếng Anh:
     `feat(ml): integrate cosine similarity engine for skill gap scoring`
     `fix(parser): resolve regex matching issue for letter grades with plus sign`

---

# EXECUTION HARNESS: CẤU TRÚC CODEBASE BACKEND CẦN QUẢN LÝ

```text
majormatch-backend-hpc/
├── backend-hpc/
│   ├── main.py                  # Khung FastAPI expose 6 API endpoints chuẩn RESTful
│   ├── parser.py                # Bóc tách PDF, regex điểm chữ/GPA, khử định danh PII
│   ├── ml_engine.py             # Vector hóa Scikit-learn, Cosine Similarity, Skill Gap matrix
│   ├── rag_service.py           # ChromaDB Vectorstore, Ollama Qwen 2.5 RAG pipeline
│   ├── schemas.py               # Pydantic models khớp 100% API_SPEC.md
│   ├── Dockerfile               # Đóng gói image nhẹ chạy non-root user
│   ├── docker-compose.yml       # Điều phối FastAPI và ChromaDB
│   └── requirements.txt         # Danh mục dependencies tối ưu
├── docs/                        # Toàn bộ hồ sơ kiến trúc và đặc tả hệ thống
└── README.md                    # Hướng dẫn khởi chạy và kiểm thử backend
```
