# TÀI LIỆU KIẾN TRÚC HỆ THỐNG TOÀN DIỆN (SYSTEM ARCHITECTURE DOCUMENT)

## TÊN DỰ ÁN: MAJORMATCH

### Kiến trúc Hybrid Cloud Multi-tier và Mô hình Xử lý Trí tuệ Nhân tạo Phân tán

**Mã tài liệu:** MM-DOC-02-ARCH  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026

---

## 1. SƠ ĐỒ TOPOLOGY KIẾN TRÚC HỆ THỐNG TỔNG THỂ (SYSTEM TOPOLOGY)

Hệ thống MajorMatch được thiết kế theo cấu trúc Hybrid Cloud 3 tầng tách biệt vật lý và chức năng:

```text
========================================================================================================================
                                     TOPOLOGY KIẾN TRÚC HỆ THỐNG HYBRID CLOUD MAJORMATCH
========================================================================================================================

 [ CLIENT TIER: BROWSER / MOBILE DEVICE ]
        │  ▲
        │  │  HTTPS / WSS / SSE (TLS 1.3 - Port 443)
        ▼  │
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 1: PUBLIC PAAS TIER (Triển khai trên Vercel Global Edge Network)                                                │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Next.js 14 App Router (Node.js Serverless & Edge Runtime)                                                      │  │
│  │  ├── Presentation Layer: React 18, Tailwind CSS, Heroicons, Radix UI Components                                │  │
│  │  ├── Visualization Engine: Recharts (Multi-layer Radar Chart, Progress Bars, Milestone SVG Tree)               │  │
│  │  ├── Client State Store: Zustand (Dynamic State Tracking, Offline-first Course Checklist)                      │  │
│  │  └── API Route Proxy: Next.js Route Handlers (`/api/proxy/*`) xác thực mTLS Token & chuyển tiếp luồng          │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────┘
                                                           │
                                                           │ Kênh kết nối bảo mật Cloudflare Anycast Network
                                                           │ Giao thức: Encrypted WireGuard / mTLS Outbound Tunnel
                                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 2: EDGE CONTROL PLANE & GATEWAY TIER (Linux Edge Gateway / SBC Node - Ubuntu 22.04 LTS)                         │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────┐      ┌──────────────────────────────────────────────────────┐  │
│  │ Cloudflared Daemon (`cloudflared tunnel run`)    │      │ SQLite Response Cache Engine (`cache.db`)            │  │
│  │ - Nhận gói tin từ Cloudflare Edge                │      │ - Bảng `curricula`: Khung chương trình mẫu           │  │
│  │ - Chuyển tiếp cục bộ tới Nginx (127.0.0.1:80)     │      │ - Bảng `profile_hash_cache`: Bộ đệm kết quả ML      │  │
│  └──────────────────────────┬───────────────────────┘      └──────────────────────────▲───────────────────────────┘  │
│                             │ HTTP Loopback                                           │ Read/Write Query             │
│                             ▼                                                         │ (< 15ms latency)             │
│  ┌────────────────────────────────────────────────────────────────────────────────────┴───────────────────────────┐  │
│  │ Nginx High-Performance Reverse Proxy & Traffic Shaper                                                          │  │
│  │  ├── Ingress Security: Kiểm tra X-Secret-Header, Whitelist HTTP Methods (POST, GET, OPTIONS)                   │  │
│  │  ├── Traffic Control: Token Bucket Rate Limiting (`limit_req_zone`: 10 requests/phút/IP)                       │  │
│  │  ├── GPU Backpressure Protection: Hàng đợi đệm kết nối tối đa 5 requests (`burst=5 nodelay`)                   │  │
│  │  └── Upstream Proxy Pass: Forward tới Private Compute Node qua mạng LAN nội bộ (192.168.1.50:8000)             │  │
│  └──────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┘
                                                              │
                                                              │ Mạng LAN Nội bộ (Wi-Fi 5GHz 866Mbps / Cáp Ethernet Cat6)
                                                              │ Subnet: 192.168.1.0/24 (HTTP RESTful API)
                                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TẦNG 3: PRIVATE HPC COMPUTE NODE (Dedicated GPU Workstation / Server: CUDA GPU >= 6GB VRAM, Docker)                  │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Docker Engine Container Subsystem                                                                              │  │
│  │                                                                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ Container 1: `majormatch-backend` (Python 3.11 - FastAPI / Uvicorn ASGI Server - Port 8000)              │  │  │
│  │  │  ├── Document Parsing Engine: `pdfplumber`, Regex Parser, PII Redaction Sanitizer                        │  │  │
│  │  │  ├── Mathematical ML Core: Scikit-learn, NumPy (Cosine Similarity, Skill Space Vectorization)            │  │  │
│  │  │  ├── RAG Orchestration Layer: LangChain / LlamaIndex Core, Context Builder, Prompt Assembly              │  │  │
│  │  │  └── Stream Controller: Server-Sent Events (SSE) generator cho giao diện chat thời gian thực             │  │  │
│  │  └──────────────────────────┬─────────────────────────────────────────────────────┬─────────────────────────┘  │  │
│  │                             │ Internal TCP (Port 8000)                            │ Local IPC / HTTP           │  │
│  │                             ▼                                                     ▼ (Port 11434)               │  │
│  │  ┌──────────────────────────────────────────────────────┐      ┌──────────────────────────────────────────┐    │  │
│  │  │ Container 2: `chromadb-vectorstore` (Port 8000)      │      │ Native Host Service: Ollama Core Engine  │    │  │
│  │  │ - Embedding Model: `bge-m3` đa ngữ (Vietnamese)      │      │ - Model: Qwen 2.5 7B Instruct (Q4_K_M)   │    │  │
│  │  │ - Index Type: HNSW (M=16, ef_construction=64)        │      │ - Hardware Accel: NVIDIA CUDA 12.4 cuBLAS│    │  │
│  │  │ - Lưu trữ: Dữ liệu môn học, điều kiện tiên quyết     │      │ - VRAM Allocation: ~5.2GB / 8GB VRAM     │    │  │
│  │  └──────────────────────────────────────────────────────┘      └──────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Bảo mật Dữ liệu Nội bộ: Phân vùng RAM-disk Ephemeral `/tmp/majormatch_ephemeral/` (Dọn sạch sau mỗi request)   │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. PHÂN TÍCH CHI TIẾT TỪNG PHÂN TẦNG KIẾN TRÚC

### 2.1. Tầng 1: Public PaaS Layer (Giao diện & Trình diễn)

- **Nền tảng:** Vercel Serverless Edge Platform.
- **Công nghệ chủ đạo:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Recharts.
- **Trách nhiệm kiến trúc:**
  1. **Hosting & Content Delivery:** Đảm nhiệm việc phân phối toàn bộ bundle HTML/CSS/JavaScript thông qua mạng lưới Edge CDN toàn cầu, đạt tốc độ tải trang Time To Interactive (TTI) $< 1.5$ giây.
  2. **Quản lý trạng thái tương tác động (Web 2.0 Dynamic State):**
     - Ứng dụng mô hình **Optimistic UI Updates** thông qua thư viện quản lý trạng thái `Zustand`.
     - Khi người dùng tích chọn một môn học trên lộ trình đã hoàn thành, Client tự động tính toán lại trọng số kỹ năng và cập nhật biểu đồ mạng nhện (Radar Chart) cục bộ với độ trễ $< 16\text{ms}$ (tương đương 60 FPS), không phải chờ round-trip về server.
  3. **Tương tác trực tiếp:** Cung cấp giao diện trắc nghiệm Holland Code (10 thanh trượt trực quan), khu vực kéo thả tài liệu PDF và cửa sổ chat trợ lý ảo AI hỗ trợ Server-Sent Events (SSE).

### 2.2. Tầng 2: Edge Control Plane & Gateway Layer (Điều phối & Mạng biên)

- **Thiết bị triển khai:** Linux Edge Gateway (Kiến trúc ARM64 hoặc x86_64, tối thiểu 2GB RAM).
- **Môi trường:** Ubuntu 22.04 LTS.
- **Trách nhiệm kiến trúc:**
  1. **Ingress Controller thông qua Cloudflare Tunnel (`cloudflared`):**
     - Thiết lập kết nối Outbound mTLS an toàn tới trạm PoP gần nhất của Cloudflare.
     - Hoàn toàn không mở cổng inbound trên hạ tầng mạng nội bộ (Không cần Port Forwarding hay DDNS), ẩn giấu toàn bộ dải IP mạng nội bộ trước các công cụ dò quét cổng (Port Scanner).
  2. **Kiểm soát tải & Chống quá tải GPU (Traffic Shaping & Rate Limiting):**
     - Nginx được cấu hình module `ngx_http_limit_req_module` với giải thuật **Token Bucket**.
     - Giới hạn tần suất 10 requests/phút/IP đối với các endpoint suy luận AI nặng (`/api/v1/assessment/*`, `/api/v1/roadmap/*`).
     - Áp dụng chính sách đệm `burst=5 nodelay`. Khi hàng đợi vượt quá 5 requests, Nginx lập tức trả về mã lỗi `HTTP 429 Too Many Requests`, bảo vệ cụm container backend và GPU Backend không bao giờ bị rơi vào trạng thái tràn bộ nhớ (Out Of Memory - OOM).
  3. **Bộ nhớ đệm phản hồi tại biên (Edge Response Caching với SQLite):**
     - Lưu trữ toàn bộ dữ liệu khung chương trình đào tạo chuẩn của các trường đại học (dữ liệu tĩnh ít biến động).
     - Khi người dùng yêu cầu xem khung chương trình hoặc gửi lại bảng điểm đã được băm mã SHA-256 trùng khớp, Gateway trả kết quả trực tiếp từ SQLite trong thời gian $\le 15\text{ms}$, triệt tiêu 100% tải tính toán xuống Tầng 3.

### 2.3. Tầng 3: Private HPC Compute Node (Máy chủ Tính toán Chuyên dụng)

- **Thiết bị triển khai:** Máy chủ GPU nội bộ chuyên dụng (Vi xử lý đa nhân, NVIDIA CUDA GPU với tối thiểu 6GB VRAM, khuyến nghị >= 8GB VRAM GDDR6, 16GB+ RAM).
- **Môi trường ảo hóa:** Docker Engine (Linux / WSL 2 Backend tích hợp NVIDIA Container Toolkit).
- **Trách nhiệm kiến trúc:**
  1. **Backend Microservice (`majormatch-backend`):**
     - Xây dựng trên nền tảng **FastAPI (Python 3.11)** với kiến trúc bất đồng bộ (Asynchronous ASGI).
     - Đảm nhận toàn bộ pipeline bóc tách PDF, khử định danh dữ liệu cá nhân (PII Redaction), vector hóa ma trận kỹ năng và điều phối RAG.
  2. **Vector Database Subsystem (`ChromaDB`):**
     - Lưu trữ dưới dạng nhúng (Embedded Persistent Vector Store) hoặc Docker container độc lập.
     - Sử dụng mô hình Embedding chuyên biệt cho tiếng Việt (`bge-m3` hoặc `keepitreal/vietnamese-bi-encoder`), biểu diễn các môn học, chuẩn kỹ năng và mô tả ngành nghề dưới dạng vector 1024 chiều.
  3. **Local LLM Engine (`Ollama Core`):**
     - Chạy trực tiếp trên Host OS hoặc GPU Passthrough Container với bộ thư viện tăng tốc **NVIDIA CUDA 12.4 cuBLAS**.
     - Nạp mô hình **Qwen 2.5 (7B Instruct)** định dạng lượng tử hóa `Q4_K_M`. Mô hình chiếm dụng ổn định khoảng **5.2GB VRAM**, chừa lại ~2.8GB VRAM cho Context Window (8K tokens) và hệ điều hành.
  4. **Khu vực dữ liệu tạm thời (RAM-disk Ephemeral Storage):**
     - Tệp PDF người dùng tải lên được ghi vào phân vùng bộ nhớ RAM ảo (`/tmp/majormatch_ephemeral/`). Ngay sau khi quá trình trích xuất văn bản hoàn thành, tệp tin nhị phân bị xóa hủy vĩnh viễn (Zero Persistent Storage for raw PDF).

---

## 3. CÁC MẪU THIẾT KẾ KIẾN TRÚC ÁP DỤNG (ARCHITECTURAL PATTERNS)

### 3.1. Hybrid Cloud Edge-to-Core Offloading Pattern

- Tách biệt hoàn toàn giữa **Mặt phẳng Trình diễn (Presentation Plane)** trên Public Cloud và **Mặt phẳng Tính toán Chuyên sâu (Computation Plane)** tại On-Premise.
- Public PaaS chỉ chịu trách nhiệm phân phối tài sản tĩnh và tương tác người dùng; toàn bộ tác vụ tốn kém tài nguyên (CPU-bound parsing, GPU-bound inference) được đẩy về cụm máy chủ nội bộ.

### 3.2. Circuit Breaker & Backpressure Regulation Pattern

- Edge Gateway (Tầng 2) đóng vai trò bộ ngắt mạch tự động (Circuit Breaker). Khi phát hiện Private Node mất kết nối (Heartbeat Timeout > 3s) hoặc phản hồi mã lỗi `500/503`, Gateway lập tức ngắt kết nối và trả về phản hồi fallback thân thiện cho Client thay vì để kết nối bị treo vô hạn (hanging connection).

### 3.3. RAG (Retrieval-Augmented Generation) Contextual Pipeline

- Mô hình Qwen 2.5 không suy luận tự do mà bị ràng buộc nghiêm ngặt bởi ngữ cảnh trích xuất từ ChromaDB:
  ```text
  [Missing Skills Vector] ──> [ChromaDB Vector Search] ──> [Top 5 Môn học phù hợp + Tiên quyết]
                                                                        │
  [Prompt Template + JSON Schema Constraints + Context Môn học] ◄──────┘
                                │
                                ▼
  [Ollama Qwen 2.5 GPU Inference] ──> [Chuỗi JSON Roadmap chuẩn xác]
  ```

---

## 4. RANH GIỚI VÀ GIAO THỨC TÍCH HỢP HỆ THỐNG (SYSTEM BOUNDARIES & PROTOCOLS)

| Điểm kết nối (Interface)                     | Giao thức truyền thông      | Cơ chế bảo mật                         | Định dạng tải trọng (Payload)   |
| :------------------------------------------- | :-------------------------- | :------------------------------------- | :------------------------------ |
| **Client $\leftrightarrow$ Tầng 1 (Vercel)** | HTTPS / WSS (Port 443)      | TLS 1.3, CSP Headers, HSTS             | HTML, CSS, JS, JSON API         |
| **Tầng 1 $\leftrightarrow$ Tầng 2 (Edge Gateway)** | Cloudflare Tunnel (mTLS)    | Cloudflare Edge Token, X-Secret-Header | JSON REST, Multipart Form (PDF) |
| **Tầng 2 $\leftrightarrow$ Tầng 3 (Private Node)**  | HTTP LAN (Port 8000)        | Giới hạn IP nội bộ (192.168.1.50)      | JSON REST, SSE Stream           |
| **FastAPI $\leftrightarrow$ ChromaDB**       | Internal Docker Network     | Container Network Isolation            | Arrow/Protobuf over HTTP        |
| **FastAPI $\leftrightarrow$ Ollama**         | HTTP Localhost (Port 11434) | Loopback Binding (127.0.0.1)           | JSON Request, Stream Chunks     |
