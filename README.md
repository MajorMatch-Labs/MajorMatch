# MajorMatch

> **Hệ thống phân tích kỹ năng và định hướng học tập thông minh cho học sinh, sinh viên theo kiến trúc Hybrid Cloud Multi-tier & Web 2.0.**

[![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20Cloud-blue.svg)](docs/02-architecture/ARCHITECTURE.md)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](docs/01-overview/PRD.md)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-green.svg)](docs/03-specifications/API_SPEC.md)
[![AI%20Model](https://img.shields.io/badge/LLM-Qwen%202.5%207B-orange.svg)](docs/02-architecture/ARCHITECTURE.md)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

---

## 📌 Tổng quan dự án

**MajorMatch** là nền tảng ứng dụng kết hợp Trí tuệ Nhân tạo (AI), Học máy (Machine Learning) và công nghệ Web 2.0 giúp học sinh, sinh viên giải quyết bài toán định hướng chuyên ngành và nghề nghiệp tương lai:
- **Phân tích định lượng:** Bóc tách bảng điểm học tập (PDF) và bài trắc nghiệm Holland Code (RIASEC), vector hóa năng lực và đo lường khoảng cách kỹ năng (Skill Gap) bằng thuật toán toán học **Cosine Similarity**.
- **Sinh lộ trình thông minh:** Sử dụng kỹ thuật **RAG (ChromaDB)** kết hợp mô hình ngôn ngữ lớn **Qwen 2.5 7B** (tăng tốc GPU nội bộ) để tạo cây lộ trình từng kỳ học có tính đến điều kiện tiên quyết.
- **Bảo mật dữ liệu tuyệt đối (Zero-SaaS-Leakage):** Toàn bộ dữ liệu bảng điểm học bạ, CV và điểm GPA nhạy cảm được xử lý hoàn toàn khép kín trên máy chủ tính toán riêng (Private Node), tuyệt đối không gửi lên các dịch vụ AI công cộng.
- **Không gian làm việc Web 2.0:** Giao diện tương tác động, biểu đồ Radar Chart co giãn và cập nhật tức thời (< 16ms) khi sinh viên tích chọn hoàn thành môn học.

---

## 🏛️ Kiến trúc Hệ thống Phân tầng (Hybrid Cloud Multi-tier)

```text
[ CLIENT BROWSER / MOBILE DEVICE ] (Web 2.0 UI)
                 │ HTTPS (TLS 1.3)
                 ▼
┌─────────────────────────────────────────────────────────┐
│ TẦNG 1: PUBLIC PAAS (Vercel Global Edge Network)        │
│ Next.js 14 App Router, TypeScript, Tailwind, Recharts   │
└────────────────────────────┬────────────────────────────┘
                             │ Cloudflare Tunnel (Encrypted Outbound WireGuard)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ TẦNG 2: EDGE CONTROL PLANE & GATEWAY (Linux Edge Node)  │
│ Ubuntu 22.04, Nginx Rate Limiting (10 req/m),           │
│ SQLite Cache DB (WAL Mode), GPU Backpressure Protection │
└────────────────────────────┬────────────────────────────┘
                             │ Mạng LAN Nội bộ (Subnet 192.168.1.0/24)
                             ▼
┌─────────────────────────────────────────────────────────┐
│ TẦNG 3: PRIVATE HPC COMPUTE NODE (Dedicated GPU Server) │
│ Docker, FastAPI, Scikit-learn, ChromaDB, Ollama Core    │
│ Mô hình: Qwen 2.5 7B Instruct (CUDA, VRAM >= 6GB)       │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Hệ thống Tài liệu Kỹ thuật Chi tiết (`/docs`)

Toàn bộ hồ sơ kiến trúc và đặc tả hệ thống đã được biên soạn đầy đủ tại thư mục `/docs`:

1. **Tổng quan Sản phẩm (01-overview):**
   - [PRD.md](docs/01-overview/PRD.md): Yêu cầu sản phẩm chuẩn mực IEEE 830, User Personas, Functional Requirements (FR) và Non-Functional Requirements (NFR).
   - [PROJECT_ANALYSIS.md](docs/01-overview/PROJECT_ANALYSIS.md): Bóc tách Pain Points, kiến trúc giải pháp, phân tích 5 mô-đun và hồ sơ phần cứng.
2. **Kiến trúc & An ninh (02-architecture):**
   - [ARCHITECTURE.md](docs/02-architecture/ARCHITECTURE.md): Sơ đồ ASCII topology chi tiết, trách nhiệm từng tầng và các mẫu thiết kế.
   - [DATA_FLOW.md](docs/02-architecture/DATA_FLOW.md): Sơ đồ tuần tự cho 5 luồng dữ liệu nghiệp vụ và vòng đời dữ liệu an toàn.
   - [SECURITY_AND_NETWORK.md](docs/02-architecture/SECURITY_AND_NETWORK.md): Phân vùng an ninh 4 lớp, mô hình đe dọa STRIDE và cấu hình Nginx Rate Limiting.
3. **Đặc tả Kỹ thuật (03-specifications):**
   - [API_SPEC.md](docs/03-specifications/API_SPEC.md): Đặc tả RESTful API chuẩn OpenAPI 3.1 và JSON Schema cho toàn bộ 6 endpoints.
   - [DATABASE_SCHEMA.md](docs/03-specifications/DATABASE_SCHEMA.md): Lược đồ Polyglot Persistence (SQLite DDL trên Edge, ChromaDB HNSW Collections, Zustand Store TypeScript).
4. **Vận hành & Triển khai (04-operations):**
   - [SETUP_AND_INSTALL.md](docs/04-operations/SETUP_AND_INSTALL.md): Hướng dẫn cài đặt môi trường phát triển cục bộ và `docker-compose.yml`.
   - [DEPLOYMENT_GUIDE.md](docs/04-operations/DEPLOYMENT_GUIDE.md): Quy trình triển khai sản xuất trên Vercel, Cloudflare Tunnel và Private Compute Node.
   - [ENV_CONFIG.md](docs/04-operations/ENV_CONFIG.md): Bảng ma trận biến môi trường và chính sách quản trị khóa bí mật.
5. **Kiểm thử & Quy chuẩn (05-testing-and-rules):**
   - [TESTING_PLAN.md](docs/05-testing-and-rules/TESTING_PLAN.md): Chiến lược kim tự tháp kiểm thử 4 cấp độ (Unit, Integration, Stress k6, E2E Playwright).
   - [CODING_CONVENTIONS.md](docs/05-testing-and-rules/CODING_CONVENTIONS.md): Quy chuẩn lập trình Python (PEP 8/484), Next.js TypeScript Strict Mode, Docker non-root và Git Conventional Commits.

---

## 🛠️ Công nghệ cốt lõi

| Phân tầng | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend PaaS** | Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Zustand |
| **Edge Gateway** | Ubuntu 22.04 LTS (Linux/SBC), Nginx Reverse Proxy, Cloudflare Tunnel, SQLite WAL |
| **Backend & AI Core** | Python 3.11, FastAPI, Uvicorn, Docker, Docker Compose |
| **Machine Learning** | Scikit-learn, NumPy (Cosine Similarity, Vector Space Modeling) |
| **Vector DB & RAG** | ChromaDB (HNSW Indexing, BAAI/bge-m3 Embedding) |
| **LLM Inference** | Ollama Core, Qwen 2.5 7B Instruct (CUDA Acceleration trên NVIDIA GPU) |

---

## 📄 Bản quyền
Dự án được phát triển theo giấy phép nội bộ nhóm nghiên cứu MajorMatch.
