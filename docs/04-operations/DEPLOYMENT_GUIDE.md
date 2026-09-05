# TÀI LIỆU HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG SẢN XUẤT (PRODUCTION DEPLOYMENT GUIDE)

## TÊN DỰ ÁN: MAJORMATCH
### Quy trình Triển khai Phân tán trên Vercel PaaS, Cloudflare Tunnel Edge Gateway và Private Node
**Mã tài liệu:** MM-DOC-04-DEPLOY  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. TỔNG QUAN QUY TRÌNH TRIỂN KHAI PHÂN TẦNG

Quy trình đưa hệ thống MajorMatch vào vận hành thực tế được thực hiện tuần tự theo chiều từ trong ra ngoài (Core $\to$ Edge $\to$ PaaS):

```text
BƯỚC 1: CẤU HÌNH PRIVATE NODE (Legion i9)
   ├── Cố định IP tĩnh LAN (192.168.1.50) & Chế độ High Performance (Không Sleep)
   ├── Khởi chạy Docker Compose Production Subsystem (FastAPI + ChromaDB)
   └── Kích hoạt Ollama GPU Inference Daemon (CUDA Qwen 2.5 7B)
                            │
                            ▼
BƯỚC 2: CẤU HÌNH EDGE GATEWAY (Vsmart Joy 3)
   ├── Cấu hình Nginx Virtual Host & Kích hoạt Rate Limiting chống sập GPU
   ├── Cấu hình Cloudflare Tunnel Ingress (`config.yml`)
   └── Khởi động tiến trình chạy nền liên tục (Background Daemon)
                            │
                            ▼
BƯỚC 3: TRIỂN KHAI PUBLIC PAAS (Vercel)
   ├── Liên kết GitHub Repository với Vercel Platform
   ├── Cấu hình Environment Variables (Origin Secret, API Gateway URL)
   └── Tự động kích hoạt bản build Production qua Git Webhook
```

---

## 2. BƯỚC 1: TRIỂN KHAI PRIVATE HPC NODE (LAPTOP LEGION)

### 2.1. Thiết lập Nguồn Điện và Mạng Cố định
1. **Cấu hình Nguồn điện Windows 11:**
   * Mở Control Panel $\to$ Power Options $\to$ Chọn chế độ **High Performance**.
   * Chuyển đổi thiết lập `Choose what closing the lid does` sang: **Do nothing** (cho cả pin và sạc) để hệ thống hoạt động liên tục khi đóng màn hình máy tính.
   * Chuyển `Put the computer to sleep` sang: **Never**.
2. **Cố định địa chỉ IP nội bộ:**
   * Truy cập Router Wi-Fi gia đình, thiết lập DHCP Reservation cố định MAC Address của card mạng Legion gắn với địa chỉ IP: `192.168.1.50`.

### 2.2. Khởi chạy Dịch vụ Backend & Vector Database
Sử dụng tệp tin cấu hình sản xuất `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  chromadb:
    image: chromadb/chroma:0.5.5
    container_name: majormatch-prod-chroma
    restart: always
    ports:
      - "8001:8000"
    volumes:
      - C:\majormatch_data\chromadb:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE
      - ANONYMIZED_TELEMETRY=FALSE
    networks:
      - majormatch-prod-net

  backend:
    image: majormatch-backend:latest
    container_name: majormatch-prod-backend
    restart: always
    ports:
      - "8000:8000"
    depends_on:
      - chromadb
    volumes:
      - C:\majormatch_data\ephemeral:/tmp/majormatch_ephemeral
    environment:
      - ENVIRONMENT=production
      - OLLAMA_BASE_URL=http://192.168.1.50:11434
      - CHROMADB_HOST=chromadb
      - CHROMADB_PORT=8000
      - MAX_CONCURRENT_LLM_TASKS=1
    networks:
      - majormatch-prod-net

networks:
  majormatch-prod-net:
    driver: bridge
```

Thực thi khởi chạy chế độ nền:
```powershell
docker compose -f docker-compose.prod.yml up -d
```

---

## 3. BƯỚC 2: TRIỂN KHAI EDGE GATEWAY TRÊN VSMART JOY 3

### 3.1. Cấu hình Nginx Production Virtual Host
Tạo tệp cấu hình `/etc/nginx/sites-available/majormatch.conf` bên trong Ubuntu PRoot:

```nginx
limit_req_zone $binary_remote_addr zone=ai_prod_limit:10m rate=10r/m;

upstream backend_cluster {
    server 192.168.1.50:8000 max_fails=3 fail_timeout=15s;
    keepalive 32;
}

server {
    listen 80 default_server;
    server_name api.majormatch.vn;

    client_max_body_size 10M;

    # Kiểm tra Secret Header ngăn chặn truy cập trái phép trực tiếp
    if ($http_x_majormatch_origin_secret != "MM_SEC_PROD_998244353") {
        return 403 '{"type":"forbidden","title":"Invalid Origin","status":403,"detail":"Access Denied."}';
    }

    # Định tuyến tính toán AI
    location /api/v1/ {
        limit_req zone=ai_prod_limit burst=5 nodelay;

        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }

    # Hỗ trợ SSE Streaming
    location /api/v1/chat/stream {
        limit_req zone=ai_prod_limit burst=3 nodelay;

        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_buffering off;
        proxy_cache off;
    }
}
```

Kích hoạt cấu hình và kiểm tra cú pháp Nginx:
```bash
ln -s /etc/nginx/sites-available/majormatch.conf /etc/nginx/sites-enabled/
nginx -t && nginx -s reload
```

### 3.2. Cấu hình Cloudflare Tunnel Sản xuất
1. Xác thực và tạo Tunnel:
   ```bash
   cloudflared tunnel login
   # Trình duyệt mở đường dẫn xác thực Cloudflare Domain

   cloudflared tunnel create majormatch-prod-tunnel
   # Lệnh sẽ sinh Tunnel ID và file credentials tại: /root/.cloudflared/<TUNNEL_ID>.json
   ```

2. Tạo tệp cấu hình `/root/.cloudflared/config.yml`:
   ```yaml
   tunnel: <TUNNEL_ID>
   credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

   ingress:
     # Định tuyến hostname công khai về Nginx nội bộ trên cổng 80 của Joy 3
     - hostname: api.majormatch.vn
       service: http://127.0.0.1:80
     # Quy tắc Catch-all trả về 404 cho các truy vấn sai hostname
     - service: http_status:404
   ```

3. Định tuyến bản ghi DNS và khởi chạy Tunnel:
   ```bash
   # Gắn subdomain vào Tunnel
   cloudflared tunnel route dns majormatch-prod-tunnel api.majormatch.vn

   # Khởi chạy daemon chạy ngầm bằng nohup
   nohup cloudflared tunnel run majormatch-prod-tunnel > /var/log/cloudflared.log 2>&1 &
   ```

---

## 4. BƯỚC 3: TRIỂN KHAI PUBLIC PAAS TRÊN VERCEL

### 4.1. Cấu hình Biến Môi trường trên Vercel Dashboard
Truy cập vào dự án trên **Vercel Dashboard** $\to$ **Settings** $\to$ **Environment Variables**, thiết lập các biến sau:

| Tên Biến Môi trường | Giá trị Sản xuất (Production Value) | Phạm vi (Scope) |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | `https://majormatch.vn` | Production, Preview |
| `NEXT_PUBLIC_API_GATEWAY_URL` | `https://api.majormatch.vn` | Production |
| `ORIGIN_SECRET_TOKEN` | `MM_SEC_PROD_998244353` | Production (Secret) |

### 4.2. Cấu hình Build & Deploy Tự động (CI/CD)
* **Framework Preset:** Next.js
* **Build Command:** `pnpm build`
* **Output Directory:** `.next`
* **Install Command:** `pnpm install`
* **Cơ chế Triển khai:** Tự động kích hoạt khi có lệnh `git push origin main`. Vercel tiến hành tối ưu hóa hình ảnh, biên dịch TypeScript và phân phối ra toàn cầu trong thời gian dưới 90 giây.

---

## 5. QUY TRÌNH KIỂM THỬ KHỞI ĐỘNG (PRODUCTION SMOKE TESTING)

Sau khi hoàn tất 3 bước trên, thực hiện kiểm thử từ một mạng Internet độc lập (sử dụng 4G/5G điện thoại):
1. **Kiểm tra Ingress Cloudflare Tunnel:**
   ```bash
   curl -I https://api.majormatch.vn
   # Kỳ vọng nhận phản hồi: HTTP/2 403 Forbidden (Do thiếu secret header - chứng minh WAF hoạt động đúng)
   ```
2. **Kiểm tra Luồng Toàn vẹn có Secret Header:**
   ```bash
   curl -H "X-MajorMatch-Origin-Secret: MM_SEC_PROD_998244353" https://api.majormatch.vn/api/v1/health
   # Kỳ vọng nhận JSON: {"status": "healthy", ...}
   ```
3. **Kiểm tra Giao diện Web trên Vercel:**
   * Mở trình duyệt truy cập `https://majormatch.vn`.
   * Thử tải lên một tệp PDF mẫu và xác nhận nhận được biểu đồ Radar Chart và Lộ trình hoàn chỉnh.
