# TÀI LIỆU CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT CONFIGURATION SPECIFICATION)

## TÊN DỰ ÁN: MAJORMATCH
### Ma trận Cấu hình Biến Môi trường, Quản trị Khóa Bí mật và Thiết lập Đa tầng
**Mã tài liệu:** MM-DOC-04-ENV  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. MA TRẬN TỔNG HỢP BIẾN MÔI TRƯỜNG (CROSS-TIER CONFIGURATION MATRIX)

```text
========================================================================================================================
                              MA TRẬN BIẾN MÔI TRƯỜNG HYBRID CLOUD MAJORMATCH
========================================================================================================================

 [ TẦNG 1: PUBLIC PAAS (Vercel) ]
  ├── .env.production / Vercel Secrets
  ├── Biến: NEXT_PUBLIC_API_GATEWAY_URL, ORIGIN_SECRET_TOKEN, NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB
  └── Phạm vi: Trình duyệt Client & Next.js Edge Runtime
                            │
                            ▼
 [ TẦNG 2: EDGE GATEWAY (Linux Edge Node) ]
  ├── /root/.cloudflared/config.yml & /etc/nginx/sites-available/majormatch.conf
  ├── Biến: TUNNEL_ID, CREDENTIALS_FILE, ORIGIN_SECRET, BACKEND_LAN_IP, CACHE_DB_PATH
  └── Phạm vi: Nginx Reverse Proxy & Cloudflare Tunnel Daemon
                            │
                            ▼
 [ TẦNG 3: PRIVATE HPC COMPUTE NODE (GPU Server) ]
  ├── backend/.env.production
  ├── Biến: OLLAMA_BASE_URL, CHROMADB_HOST, EMBEDDING_MODEL, EPHEMERAL_STORAGE_PATH
  └── Phạm vi: FastAPI Container & Ollama AI Subsystem
========================================================================================================================
```

---

## 2. CHI TIẾT CẤU HÌNH TẦNG 1: FRONTEND NEXT.JS 14 (`frontend/.env.example`)

Tệp tin mẫu cấu hình biến môi trường tại thư mục Frontend:

```ini
# =============================================================================
# MAJORMATCH FRONTEND ENVIRONMENT CONFIGURATION TEMPLATE
# Sao chép tệp này thành .env.local (phát triển) hoặc khai báo trên Vercel (sản xuất)
# =============================================================================

# Môi trường chạy ứng dụng: 'development' | 'production' | 'test'
NODE_ENV=production

# Đường dẫn URL công khai của trang Web
NEXT_PUBLIC_SITE_URL=https://majormatch.vn

# Đường dẫn API Ingress trỏ về Edge Gateway (Cloudflare Tunnel Hostname)
# Chú ý: Tuyệt đối KHÔNG trỏ trực tiếp về IP mạng LAN của máy tính
NEXT_PUBLIC_API_GATEWAY_URL=https://api.majormatch.vn

# Mã Token bí mật dùng để xác thực giữa Vercel Route Handlers và Edge Gateway
ORIGIN_SECRET_TOKEN=MM_SEC_PROD_998244353

# Giới hạn dung lượng tệp PDF tải lên tối đa (tính theo Megabytes)
NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB=10

# Bật/tắt chế độ Debug trạng thái Zustand trên Console trình duyệt
NEXT_PUBLIC_ENABLE_STORE_LOGS=false
```

---

## 3. CHI TIẾT CẤU HÌNH TẦNG 2: EDGE CONTROL PLANE

### 3.1. Cấu hình Cloudflare Tunnel (`/root/.cloudflared/config.yml`)
```yaml
# Định danh UUID của Tunnel được tạo từ lệnh: cloudflared tunnel create
tunnel: 4e9c71a2-8b3d-4c81-a9e0-112233445566

# Đường dẫn tệp chứa khóa chứng thực của Tunnel
credentials-file: /root/.cloudflared/4e9c71a2-8b3d-4c81-a9e0-112233445566.json

# Cấu hình định tuyến lưu lượng vào các dịch vụ nội bộ
ingress:
  - hostname: api.majormatch.vn
    service: http://127.0.0.1:80
    originRequest:
      connectTimeout: 5s
      noTLSVerify: true
  - service: http_status:404
```

### 3.2. Cấu hình Tham số Nginx và SQLite
* **Tệp cơ sở dữ liệu SQLite Cache:** `/var/data/majormatch/cache.db`
* **Thời gian sống của bộ đệm kết quả ML (TTL):** 604,800 giây (7 ngày).
* **Tốc độ giới hạn lưu lượng (Rate Limit):** `rate=10r/m` với bộ đệm `burst=5`.

---

## 4. CHI TIẾT CẤU HÌNH TẦNG 3: PRIVATE BACKEND (`backend/.env.example`)

Tệp tin cấu hình biến môi trường cho dịch vụ FastAPI:

```ini
# =============================================================================
# MAJORMATCH BACKEND ENVIRONMENT CONFIGURATION TEMPLATE
# Sao chép tệp này thành .env hoặc nạp qua Docker Compose
# =============================================================================

# Môi trường hệ thống: 'development' | 'production'
ENVIRONMENT=production

# Thiết lập máy chủ ASGI Uvicorn
HOST=0.0.0.0
PORT=8000
WORKERS=2

# Đường dẫn kết nối dịch vụ Ollama cục bộ trên Host
OLLAMA_BASE_URL=http://192.168.1.50:11434
OLLAMA_MODEL_NAME=qwen2.5:7b-instruct-q4_k_m
OLLAMA_REQUEST_TIMEOUT_SECONDS=90

# Cấu hình kết nối Cơ sở dữ liệu Vector ChromaDB
CHROMADB_HOST=chromadb
CHROMADB_PORT=8000
CHROMADB_COLLECTION_COURSES=curriculum_courses
CHROMADB_COLLECTION_BENCHMARKS=industry_skill_benchmarks

# Tên mô hình Text Embedding phục vụ Vector hóa RAG
EMBEDDING_MODEL_NAME=BAAI/bge-m3

# Đường dẫn phân vùng RAM-disk lưu trữ tệp PDF tạm thời
EPHEMERAL_STORAGE_PATH=/tmp/majormatch_ephemeral

# Số lượng tác vụ suy luận LLM tối đa xử lý đồng thời trên GPU máy chủ (Compute Node)
# ĐẶT BẰNG 1 để chống tràn VRAM (Out Of Memory)
MAX_CONCURRENT_LLM_TASKS=1

# Danh sách tên miền được phép gọi CORS
CORS_ORIGINS=["https://majormatch.vn", "https://api.majormatch.vn", "http://localhost:3000"]

# Mức độ chi tiết của hệ thống ghi log: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR'
LOG_LEVEL=INFO
```

---

## 5. QUY TẮC QUẢN TRỊ AN TOÀN KHÓA BÍ MẬT (SECRETS MANAGEMENT POLICY)

1. **Tuyệt đối không đưa tệp nhạy cảm vào Git:**
   Thêm các mẫu sau vào `.gitignore` tại tất cả các kho lưu trữ mã nguồn:
   ```gitignore
   .env
   .env.local
   .env.production
   *.json
   !package.json
   !tsconfig.json
   /root/.cloudflared/
   *.db
   *.db-wal
   *.db-shm
   ```
2. **Quy trình sinh khóa bí mật ngẫu nhiên mạnh:**
   Khi tạo mới giá trị cho `ORIGIN_SECRET_TOKEN`, bắt buộc sử dụng bộ tạo số ngẫu nhiên chuẩn mật mã học:
   ```bash
   # Tạo chuỗi Hex ngẫu nhiên 32 bytes (256 bits)
   openssl rand -hex 32
   ```
3. **Phân tách ranh giới môi trường:**
   Khóa bí mật dùng cho môi trường kiểm thử cục bộ (`development`) tuyệt đối không được tái sử dụng trên môi trường sản xuất (`production`).
