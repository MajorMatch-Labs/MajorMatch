# HƯỚNG DẪN CÀI ĐẶT VÀ THIẾT LẬP MÔI TRƯỜNG PHÁT TRIỂN (SETUP & INSTALLATION GUIDE)

## TÊN DỰ ÁN: MAJORMATCH
### Hướng dẫn Cài đặt Cục bộ trên Môi trường Phân tán: Vercel CLI, Termux Ubuntu và Private HPC Node
**Mã tài liệu:** MM-DOC-04-SETUP  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. YÊU CẦU TIỀN ĐỀ HỆ THỐNG (PREREQUISITES)

### 1.1. Thiết bị Tầng 3: Private HPC Node (Máy chủ GPU chuyên dụng)
* **Hệ điều hành:** Linux (Ubuntu 22.04 LTS) hoặc Windows 11 64-bit đã kích hoạt WSL 2.
* **Phần cứng:** CPU đa nhân, NVIDIA CUDA GPU (Tối thiểu 6GB VRAM, khuyến nghị 8GB+ VRAM), RAM 16GB+.
* **Công cụ cài đặt bắt buộc:**
  * NVIDIA GPU Driver: Phiên bản Game Ready / Studio / Data Center Driver $\ge 550.x$.
  * Docker Engine / Docker Desktop (kích hoạt GPU Acceleration qua NVIDIA Container Toolkit).
  * Ollama.
  * Python 3.11.x 64-bit & `pip` / `virtualenv`.
  * Git.

### 1.2. Thiết bị Tầng 2: Edge Gateway Node (Thiết bị biên Linux)
* **Hệ điều hành:** Ubuntu 22.04 LTS (triển khai trên ARM64 SBC như Raspberry Pi, thiết bị Linux nhúng hoặc máy chủ gateway chuyên dụng).
* **Yêu cầu tối thiểu:** RAM tối thiểu 2GB, bộ nhớ trong trống tối thiểu 10GB.

### 1.3. Thiết bị Tầng 1: Môi trường Phát triển Frontend
* **Node.js:** Phiên bản LTS 20.x hoặc 18.x.
* **Package Manager:** `pnpm` (khuyến nghị) hoặc `npm` phiên bản $\ge 9.x$.

---

## 2. THIẾT LẬP CHI TIẾT TẦNG 3: PRIVATE HPC COMPUTE NODE

### 2.1. Cài đặt và Tải Mô hình Trí tuệ Nhân tạo với Ollama
1. Khởi chạy terminal PowerShell với quyền Administrator:
   ```powershell
   # Kiểm tra driver GPU và CUDA support
   nvidia-smi
   ```
2. Khởi động dịch vụ Ollama và tải mô hình Qwen 2.5 7B Instruct lượng tử hóa:
   ```powershell
   # Tải bản Q4_K_M tối ưu cho môi trường GPU VRAM >= 8GB (~5.2GB dung lượng tải)
   ollama run qwen2.5:7b-instruct-q4_k_m
   ```
3. Kiểm tra kiểm thử API Ollama cục bộ:
   ```powershell
   curl http://localhost:11434/api/tags
   ```

### 2.2. Khởi tạo Cụm Dịch vụ Docker Compose
Hệ thống sử dụng tệp `docker-compose.yml` để đóng gói backend FastAPI và cơ sở dữ liệu vector ChromaDB:

```yaml
# Đường dẫn: /docker-compose.yml
version: '3.8'

services:
  # Dịch vụ Cơ sở dữ liệu Vector ChromaDB
  chromadb:
    image: chromadb/chroma:0.5.5
    container_name: majormatch-chromadb
    restart: unless-stopped
    ports:
      - "8001:8000"
    volumes:
      - chromadata:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - PERSIST_DIRECTORY=/chroma/chroma
      - ANONYMIZED_TELEMETRY=FALSE
    networks:
      - majormatch-net

  # Dịch vụ Backend FastAPI Core Engine
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: majormatch-backend
    restart: unless-stopped
    ports:
      - "8000:8000"
    depends_on:
      - chromadb
    volumes:
      - ./backend:/app
      - ephemeral_data:/tmp/majormatch_ephemeral
    environment:
      - ENVIRONMENT=production
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
      - CHROMADB_HOST=chromadb
      - CHROMADB_PORT=8000
      - EPHEMERAL_STORAGE_PATH=/tmp/majormatch_ephemeral
      - MAX_CONCURRENT_LLM_TASKS=1
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - majormatch-net

networks:
  majormatch-net:
    driver: bridge

volumes:
  chromadata:
    driver: local
  ephemeral_data:
    driver: local
```

Khởi chạy cụm container:
```powershell
docker compose up -d
docker compose ps
```

---

## 3. THIẾT LẬP CHI TIẾT TẦNG 2: EDGE GATEWAY

### 3.1. Thiết lập Môi trường Ubuntu Linux
Trên thiết bị Edge Gateway (Ubuntu Linux / Termux PRoot), thực thi các lệnh sau:
```bash
# 1. Cập nhật gói phần mềm của Termux
pkg update -y && pkg upgrade -y

# 2. Cài đặt các gói công cụ nền tảng và proot-distro
pkg install proot-distro git curl wget sqlite -y

# 3. Cài đặt hệ điều hành Ubuntu 22.04 LTS
proot-distro install ubuntu

# 4. Đăng nhập vào không gian Ubuntu
proot-distro login ubuntu
```

### 3.2. Cài đặt Nginx và Tạo Cơ sở dữ liệu Cache SQLite
Bên trong không gian Ubuntu PRoot:
```bash
# Cập nhật repository và cài đặt Nginx
apt update && apt install nginx sqlite3 -y

# Tạo cấu trúc thư mục lưu trữ ứng dụng và cache
mkdir -p /var/data/majormatch /etc/nginx/sites-available /etc/nginx/sites-enabled

# Khởi tạo CSDL SQLite cache.db
sqlite3 /var/data/majormatch/cache.db <<EOF
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS cached_curricula (
    curriculum_id TEXT PRIMARY KEY,
    school_code TEXT NOT NULL,
    major_id TEXT NOT NULL,
    major_name TEXT NOT NULL,
    total_credits INTEGER NOT NULL,
    curriculum_tree TEXT NOT NULL,
    checksum_sha256 TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
EOF
```

### 3.3. Cài đặt và Xác thực Cloudflare Tunnel CLI (`cloudflared`)
Tải bản nhị phân `cloudflared` dành cho kiến trúc ARM64:
```bash
# Tải và cấp quyền thực thi cho cloudflared
curl -L --output /usr/local/bin/cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
chmod +x /usr/local/bin/cloudflared

# Kiểm tra phiên bản
cloudflared --version
```

---

## 4. THIẾT LẬP CHI TIẾT TẦNG 1: FRONTEND NEXT.JS 14

### 4.1. Cài đặt Thư viện và Môi trường
Tại thư mục `frontend/` trên máy tính phát triển:
```bash
# Cài đặt toàn bộ dependencies với pnpm
pnpm install

# Kiểm tra bản dựng TypeScript
pnpm run build
```

### 4.2. Khởi chạy Server Phát triển Cục bộ
```bash
pnpm run dev
# Giao diện ứng dụng chạy tại địa chỉ: http://localhost:3000
```

---

## 5. BẢNG KIỂM TRA TÍCH HỢP TỔNG THỂ (VERIFICATION SMOKE TEST)

Thực hiện kiểm tra từng nấc để xác nhận toàn bộ hệ thống liên kết thành công:

| Bước | Lệnh Kiểm thử | Kết quả Kỳ vọng |
| :---: | :--- | :--- |
| **1** | `curl http://localhost:11434/api/tags` | Trả về JSON danh sách model có chứa `qwen2.5:7b-instruct-q4_k_m` |
| **2** | `curl http://localhost:8001/api/v1/heartbeat` | Trả về `{"nanosecond heartbeat": ...}` từ ChromaDB |
| **3** | `curl http://localhost:8000/api/v1/health` | Trả về HTTP `200` với trạng thái `status: healthy` từ FastAPI |
| **4** | `curl -I http://192.168.1.45/` (IP của Edge Gateway) | Nginx trả về header `Server: nginx` |
| **5** | Mở trình duyệt truy cập `http://localhost:3000` | Trang chủ MajorMatch hiển thị mượt mà không có lỗi Console |
