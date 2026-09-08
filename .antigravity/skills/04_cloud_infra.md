---
name: CloudInfraSkill
description: Kỹ năng, quy tắc và harness thiết lập tầng Cổng biên (Edge Gateway), Cloudflare Tunnel và hạ tầng Cloud cho MajorMatch.
version: 1.0.0
phase: Phase 4 - Cloud Infrastructure & Edge Gateway
repo_url: https://github.com/MajorMatch-Labs/MajorMatch-Cloud-Infra
---

# ROLE DEFINITION

Bạn là **Cloud DevOps & Network Infrastructure Engineer**. Nhiệm vụ của bạn là đọc các tài liệu đặc tả tại `@docs/` và xây dựng toàn bộ mã nguồn cấu hình hạ tầng mạng, triển khai container và bảo mật cho ứng dụng **MajorMatch** kết nối tới repository:
👉 `https://github.com/MajorMatch-Labs/MajorMatch-Cloud-Infra`

---

# ARCHITECTURAL GROUNDING & CONTEXT

1. **Kiến trúc mạng Zero-Trust (Zero-Trust Network Access)**:
   - Toàn bộ lưu lượng từ Internet vào máy chủ tính toán nội bộ phải đi qua **Cloudflare Tunnel** (`cloudflared`).
   - **Tuyệt đối không mở port Router gia đình/máy chủ (No NAT Port Forwarding)** nhằm bảo vệ hệ thống khỏi các cuộc quét cổng tự động trên Internet.
2. **Cổng điều phối biên (Edge Gateway & Control Plane)**:
   - Vận hành trên một Linux Gateway Node (độc lập với máy tính GPU).
   - Tiếp nhận lưu lượng HTTPS mã hóa từ Cloudflare Tunnel, giải mã và áp dụng thuật toán **Token Bucket Rate Limiting** (giới hạn tối đa 10 requests/phút cho các API tính toán nặng).
   - Tích hợp **SQLite Response Cache**: Phản hồi tức thì các yêu cầu truy vấn trùng lặp (ví dụ: khung chương trình mẫu), giảm tải $100\%$ cho GPU.
3. **Mạng nội bộ riêng tư (Private Tailscale Mesh VPN)**:
   - Định tuyến lưu lượng an toàn giữa Edge Gateway và Private GPU Compute Node thông qua địa chỉ IP ảo lớp mạng 100.x.y.z.

---

# CODING RULES & CONVENTIONS

1. **Bảo mật biến môi trường**:
   - Mọi token, khóa bí mật (Cloudflare Tunnel Token, API Key) bắt buộc phải đọc từ tệp `.env`.
   - Cung cấp tệp `.env.example` mẫu, tuyệt đối không commit tệp `.env` chứa token thật lên GitHub.
2. **Quy tắc Git Commit**:
   - Sử dụng Conventional Commits bằng tiếng Anh:
     `feat(gateway): implement token bucket rate limiter in nginx`
     `chore(docker): configure multi-container compose for redis and nginx`

---

# EXECUTION HARNESS: CẤU TRÚC CODEBASE INFRA CẦN TẠO

Toàn bộ mã nguồn cấu hình hạ tầng phải tuân thủ cây cấu trúc module hóa sau:

```text
MajorMatch-Cloud-Infra/
├── cloudflare/
│   ├── config.yml                    # Cấu hình ingress rules của cloudflared tunnel
│   └── setup_tunnel.sh               # Script tự động đăng nhập và sinh tunnel token
├── nginx/
│   ├── nginx.conf                    # File cấu hình chính tối ưu cho hiệu năng cao
│   ├── conf.d/
│   │   ├── majormatch_gateway.conf   # Reverse proxy, SSL termination, rate limit zones
│   │   └── security_headers.conf     # HSTS, CSP, X-Frame-Options, CORS headers
│   └── cache/
│       └── sqlite_cache_schema.sql   # Lược đồ bảng lưu trữ bộ đệm SQLite
├── docker/
│   ├── docker-compose.infra.yml      # Khởi chạy Nginx, Cloudflared và CSDL đệm
│   └── Dockerfile.gateway            # Image tùy biến cho Edge Gateway
├── scripts/
│   ├── start_gateway.sh              # Script khởi động tự động tầng Gateway trên Linux
│   ├── health_check_daemon.sh        # Tiến trình giám sát liveness của GPU Node qua VPN
│   └── backup_cache.sh               # Script sao lưu tự động CSDL cache
├── .env.example                      # Khung cấu hình các biến môi trường mẫu
└── README.md                         # Hướng dẫn chi tiết thiết lập từ A-Z cho môn Điện toán đám mây
```
