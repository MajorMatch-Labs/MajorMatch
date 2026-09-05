# TÀI LIỆU AN TOÀN VÀ KIẾN TRÚC MẠNG (SECURITY & NETWORK SPECIFICATION)

## TÊN DỰ ÁN: MAJORMATCH
### Chiến lược Bảo mật Zero-Trust, Phân vùng Mạng Hybrid Cloud và Phòng thủ Chiều sâu
**Mã tài liệu:** MM-DOC-02-SEC  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. SƠ ĐỒ PHÂN VÙNG MẠNG VÀ RANH GIỚI BẢO MẬT (NETWORK TOPOLOGY & ZONES)

Hệ thống MajorMatch phân tách không gian mạng thành 4 vùng độc lập theo mô hình bảo mật Defense-in-Depth (Phòng thủ theo chiều sâu):

```text
========================================================================================================================
                                     SƠ ĐỒ PHÂN VÙNG MẠNG VÀ AN NINH HỆ THỐNG MAJORMATCH
========================================================================================================================

 [ VÙNG 1: INTERNET CÔNG CỘNG (UNTRUSTED ZONE) ]
  - Khách truy cập đại chúng, người dùng cuối từ máy tính / điện thoại di động
  - Các công cụ quét mạng, bot tự động trên Internet
                            │
                            │ HTTPS (Port 443) - TLS 1.3
                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VÙNG 2: EDGE PERIMETER & PAAS ZONE (SEMI-TRUSTED CLOUD EDGE)                                                         │
│                                                                                                                      │
│  ┌──────────────────────────────────────────────────┐      ┌──────────────────────────────────────────────────────┐  │
│  │ Vercel Serverless Hosting (Edge PoP)             │      │ Cloudflare Global Anycast Edge Network               │  │
│  │ - Web Application Firewall (WAF) Cơ bản          │      │ - DDoS Mitigation L3/L4/L7 (Chặn tấn công botnet)    │  │
│  │ - Chứng chỉ SSL/TLS tự động (Let's Encrypt)      │      │ - SSL/TLS Termination & Strict Origin Enforcement    │  │
│  │ - Next.js Reverse Proxy Route Handler            │      │ - Cloudflare Tunnel Edge Ingress                     │  │
│  └──────────────────────────────────────────────────┘      └──────────────────────────┬───────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────┘
                                                                                        │
                                                                                        │ Outbound-only Encrypted Tunnel
                                                                                        │ (QUIC / WireGuard over UDP/TCP)
                                                                                        │ Hoàn toàn không mở cổng Router!
                                                                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VÙNG 3: EDGE CONTROL PLANE GATEWAY (TRUSTED DMZ ZONE - Thiết bị Vsmart Joy 3)                                        │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Ubuntu Termux / PRoot Sandbox                                                                                  │  │
│  │  ├── `cloudflared` Daemon (Chỉ chấp nhận luồng từ Cloudflare ID định trước)                                    │  │
│  │  ├── Nginx Web Server & Traffic Shaper:                                                                        │  │
│  │  │   + Xác thực HTTP Header bí mật (`X-MajorMatch-Origin-Secret`)                                              │  │
│  │  │   + Chặn đứng tất cả HTTP Methods ngoại trừ `POST`, `GET`, `OPTIONS`                                        │  │
│  │  │   + Token Bucket Rate Limiting: 10 requests/phút trên mỗi IP                                                │  │
│  │  │   + Hàng đợi đệm chống sốc tải GPU: Giới hạn tối đa 5 requests (`burst=5 nodelay`)                          │  │
│  │  └── iptables Firewall: Chặn mọi kết nối Inbound trực tiếp từ bên ngoài ngoại trừ localhost                     │  │
│  └────────────────────────────────────────────────────────────────────────────────────┬───────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────┘
                                                                                        │
                                                                                        │ Mạng LAN Nội bộ Cách ly
                                                                                        │ Subnet: 192.168.1.0/24
                                                                                        │ (Chỉ cho phép IP Joy 3 gọi vào)
                                                                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ VÙNG 4: PRIVATE SECURE HPC ZONE (HIGH-SECURITY ISOLATED ZONE - Laptop Legion i9/RTX 4060)                            │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Windows Defender Firewall / Linux UFW: Chỉ mở duy nhất cổng 8000 cho IP tĩnh của Joy 3 (192.168.1.45)           │  │
│  │                                                                                                                │  │
│  │ Docker Isolated Virtual Bridge Network (`majormatch-net`):                                                     │  │
│  │  ├── FastAPI Container (Chạy dưới tài nguyên hạn chế, non-root user `appuser:1001`)                            │  │
│  │  ├── ChromaDB Container (Cổng 8000 nội bộ bridge, không bind ra mạng ngoài)                                    │  │
│  │  └── Ollama AI Service (Chỉ lắng nghe trên 127.0.0.1:11434 nội bộ host)                                        │  │
│  │                                                                                                                │  │
│  │ Lưu trữ tạm RAM-disk (`tmpfs`): Dữ liệu PDF được bóc tách và xóa sạch khỏi bộ nhớ sau khi phân tích             │  │
│  │ Zero External Data Leakage: Không tích hợp bất kỳ Public AI API nào (OpenAI/Anthropic)                          │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. NGUYÊN TẮC BẢO MẬT DỮ LIỆU CỐT LÕI (CONFIDENTIAL DATA ISOLATION)

### 2.1. Phân loại dữ liệu (Data Classification Policy)
Hệ thống thiết lập 3 cấp độ phân loại dữ liệu nghiêm ngặt:
1. **Public Data (Dữ liệu công khai):** Khung chương trình đào tạo đại học, mô tả chuyên ngành, danh mục kỹ năng chuẩn, giao diện đồ họa. Được phép lưu trữ cache tại Vercel Edge và SQLite trên Joy 3.
2. **Internal Analytical Data (Dữ liệu phân tích nội bộ):** Vector kỹ năng, điểm số Cosine Similarity, ma trận trọng số. Chỉ lưu thông trong phiên làm việc giữa Backend và Client.
3. **Confidential / Sensitive Data (Dữ liệu nhạy cảm cá nhân):**
   * File PDF bảng điểm học tập, CV cá nhân.
   * Điểm trung bình tích lũy GPA, danh sách môn đã rớt hoặc đã qua.
   * Danh tính sinh viên (MSSV, Họ tên, Khóa học).
   * **Chính sách bất khả xâm phạm:** Dữ liệu này **tuyệt đối không bao giờ được lưu trữ trên Public Cloud**, không được ghi vào cơ sở dữ liệu vĩnh viễn trên máy chủ, và không được gửi tới bất kỳ dịch vụ phân tích AI bên thứ ba nào.

### 2.2. Cơ chế khử định danh tự động (PII Redaction Pipeline)
Ngay sau khi tệp PDF được nạp vào bộ nhớ RAM của Private Node, một pipeline lọc thực thể tự động được kích hoạt:
* **Họ và tên:** Nhận diện và thay thế bằng chuỗi giả danh `[STUDENT_ANONYMOUS]`.
* **Mã số sinh viên (MSSV):** Khớp định dạng `\b[0-9]{7,10}\b` và xóa bỏ.
* **Số điện thoại & Email:** Áp dụng regex khử sạch thông tin liên hệ.
* **Địa chỉ & Quê quán:** Cắt bỏ toàn bộ các dòng chứa thông tin hành chính.
* **Kết quả:** Đầu vào của thuật toán Vector hóa và prompt gửi vào LLM chỉ còn lại tập dữ liệu thuần túy về học thuật: `{course_code, credits, grade_point}`.

---

## 3. PHÂN TÍCH MÔ HÌNH ĐE DỌA (STRIDE THREAT MODELING)

| Tác nhân đe dọa (STRIDE) | Nguy cơ cụ thể đối với MajorMatch | Mức độ | Biện pháp phòng thủ & Giảm thiểu |
| :--- | :--- | :---: | :--- |
| **S - Spoofing (Giả mạo)** | Kẻ tấn công giả mạo là Vercel gửi yêu cầu rác vào Edge Gateway | Trung bình | Cấu hình Header bí mật `X-MajorMatch-Origin-Secret` được kiểm tra nghiêm ngặt tại tầng Nginx trên Joy 3; các request thiếu header bị drop ngay lập tức với mã lỗi `403 Forbidden`. |
| **T - Tampering (Sửa đổi dữ liệu)** | Bị chặn bắt gói tin và thay đổi điểm số trên đường truyền | Thấp | Bắt buộc mã hóa toàn trình TLS 1.3 từ Client đến Cloudflare, và đường hầm mã hóa mTLS của Cloudflare Tunnel từ Internet về Joy 3. |
| **R - Repudiation (Chối bỏ)** | Người dùng phủ nhận việc đã tải tài liệu hoặc spam hệ thống | Thấp | Nginx ghi log định danh ẩn danh (`hashed_client_ip`, `timestamp`, `endpoint`, `status_code`) vào file log cục bộ phục vụ phân tích kiểm toán. |
| **I - Information Disclosure (Lộ lọt thông tin)** | Lộ bảng điểm và thông tin cá nhân của sinh viên ra ngoài | **Nghiêm trọng** | Thực thi chính sách RAM-disk Ephemeral (`tmpfs`); toàn bộ file nhị phân PDF bị hủy sau khi parse; loại bỏ hoàn toàn các dịch vụ AI SaaS công cộng. |
| **D - Denial of Service (Từ chối dịch vụ)** | Kẻ xấu spam hàng nghìn yêu cầu làm cạn kiệt VRAM GPU RTX 4060 | **Nghiêm trọng** | Triển khai Token Bucket Rate Limiting (10 req/phút/IP) và hàng đợi kết nối tối đa 5 slot trên Nginx; FastAPI áp dụng Semaphore giới hạn 1 tác vụ LLM đồng thời. |
| **E - Elevation of Privilege (Leo thang đặc quyền)** | Khai thác lỗ hổng trong thư viện đọc PDF để chiếm quyền kiểm soát máy tính | Cao | Chạy dịch vụ FastAPI trong Docker container với user không có quyền quản trị (`non-root user`), kích hoạt chế độ chỉ đọc `read-only root filesystem` cho container. |

---

## 4. CẤU HÌNH KIỂM SOÁT LƯU LƯỢNG & PHÒNG CHỐNG QUÁ TẢI (GATEWAY TRAFFIC SHAPING)

Tệp cấu hình Nginx thực tế triển khai trên Vsmart Joy 3 áp dụng giải thuật Token Bucket và bảo vệ GPU:

```nginx
# Định nghĩa vùng giới hạn lưu lượng dựa trên địa chỉ IP nhị phân (tiết kiệm RAM trên Joy 3)
limit_req_zone $binary_remote_addr zone=ai_inference_zone:10m rate=10r/m;
limit_conn_zone $binary_remote_addr zone=addr_conn_zone:10m;

# Thiết lập upstream trỏ về Private Compute Node
upstream private_gpu_backend {
    server 192.168.1.50:8000 max_fails=2 fail_timeout=10s;
    keepalive 16;
}

server {
    listen 127.0.0.1:80;
    server_name api.majormatch.local;

    client_max_body_size 10M;

    # Xác thực Header bí mật từ Public PaaS
    if ($http_x_majormatch_origin_secret != "MM_SEC_PROD_998244353") {
        return 403 '{"error": "Forbidden: Invalid Origin Secret"}';
    }

    # Endpoint tiếp nhận tệp bảng điểm và tính toán AI
    location /api/v1/ {
        # Áp dụng Rate Limiting: 10 req/phút, cho phép hàng đợi đệm tối đa 5 requests
        limit_req zone=ai_inference_zone burst=5 nodelay;
        limit_conn addr_conn_zone 2;

        proxy_pass http://private_gpu_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # Thiết lập Timeout bảo vệ GPU
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 60s;
    }

    # Endpoint Chatbot Streaming (Server-Sent Events)
    location /api/v1/chat/stream {
        limit_req zone=ai_inference_zone burst=3 nodelay;

        proxy_pass http://private_gpu_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        
        # Tắt bộ đệm để hỗ trợ streaming phản hồi từng chữ
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding on;
    }
}
```

---

## 5. QUY TRÌNH QUẢN TRỊ NỘI BỘ VÀ HARDENING HỆ THỐNG

### 5.1. Quản trị từ xa an toàn (Secure Administration via Tailscale VPN)
* Hoàn toàn đóng cổng SSH (Port 22) đối với toàn bộ các giao diện mạng công cộng và Wi-Fi.
* Quản trị viên chỉ có thể kết nối SSH vào Joy 3 và Laptop Legion thông qua mạng riêng ảo **Tailscale VPN (Mesh WireGuard)** với tính năng xác thực 2 yếu tố (2FA).

### 5.2. An toàn tệp tin tải lên (File Ingestion Hardening)
1. **Kiểm tra Magic Bytes:** Đọc 4 byte đầu tiên của tệp tin tải lên, bắt buộc phải là `%PDF` (`0x25 0x50 0x44 0x46`). Từ chối mọi tệp tin có extension `.pdf` nhưng nội dung thực tế là script hoặc file thực thi (`.exe`, `.sh`).
2. **Giới hạn kích thước tệp:** Nginx và FastAPI từ chối xử lý ngay lập tức nếu dung lượng vượt quá **10MB** (HTTP `413 Payload Too Large`).
3. **Phân vùng bộ nhớ RAM tạm thời:** Tệp tin chỉ tồn tại trong thư mục `tmpfs` của Linux/WSL2 với quyền hạn đọc ghi `0600` (chỉ user nội bộ của process đọc được).
