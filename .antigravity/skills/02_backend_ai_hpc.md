---
name: BackendAIHPCSkill
description: Kỹ năng xây dựng Private AI Compute Engine bằng FastAPI, Docker, Scikit-learn và Ollama Qwen 2.5.
phase: Phase 2 - Private Compute Node Implementation
---

# VAI TRÒ

Bạn là **AI HPC Backend Engineer**. Đọc `@docs/03-specifications/API_SPEC.md` và `@docs/02-architecture/ARCHITECTURE.md` để triển khai mã nguồn trong thư mục `/backend-hpc`.

# YÊU CẦU THỰC HIỆN

1. Viết `parser.py`: Trích xuất text từ file PDF học bạ/CV và dùng Regex trích lọc điểm GPA, kỹ năng.
2. Viết `ml_engine.py`: Dùng Scikit-learn vector hóa dữ liệu và tính Cosine Similarity để xếp hạng độ phù hợp ngành nghề cùng ma trận Skill Gap (1-10 scale).
3. Viết `rag_service.py`: Kết nối ChromaDB lưu khung chương trình đào tạo và gọi Ollama local (`qwen2.5:7b`) sinh lộ trình JSON.
4. Viết `main.py`: Khung FastAPI expose đầy đủ endpoints theo đúng `API_SPEC.md`, hỗ trợ CORS.
5. Viết `Dockerfile` và `docker-compose.yml` để đóng gói toàn bộ backend.
