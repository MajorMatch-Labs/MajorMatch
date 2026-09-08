# TÀI LIỆU LUỒNG DỮ LIỆU TOÀN DIỆN (DATA FLOW SPECIFICATION)

## TÊN DỰ ÁN: MAJORMATCH
### Phân tích Luồng Dữ liệu End-to-End, Trạng thái Web 2.0 và Cơ chế Suy luận AI Phân tán
**Mã tài liệu:** MM-DOC-02-FLOW  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. TỔNG QUAN CÁC LUỒNG DỮ LIỆU CHÍNH TRONG HỆ THỐNG

Hệ thống MajorMatch vận hành dựa trên 5 luồng dữ liệu cốt lõi, xuyên suốt từ Client qua Edge Gateway tới Private Compute Node:
1. **Luồng 1 (Ingestion Flow):** Tiếp nhận file PDF bảng điểm, khử định danh PII và bóc tách cấu trúc học tập.
2. **Luồng 2 (Skill Gap Quantification Flow):** Khảo sát Holland Code, vector hóa năng lực và tính toán ma trận Cosine Similarity.
3. **Luồng 3 (RAG & Roadmap Generation Flow):** Truy xuất khung môn học từ ChromaDB và sinh lộ trình học tập bằng Qwen 2.5 7B.
4. **Luồng 4 (Web 2.0 Dynamic State Feedback Loop):** Tương tác checklist môn học và tái tính toán giao diện tức thời tại Client.
5. **Luồng 5 (Real-time Streaming Chat Flow):** Hỏi đáp ngữ cảnh chuyên sâu qua giao thức Server-Sent Events (SSE).

---

## 2. CHI TIẾT CÁC LUỒNG DỮ LIỆU END-TO-END

### 2.1. Luồng 1: Tiếp nhận Bảng điểm PDF, Khử PII và Bóc tách Cấu trúc (PDF Ingestion Flow)

```text
CLIENT (Browser)            GATEWAY (Edge Node)       FASTAPI (Private Node)       RAM-DISK EPHEMERAL
      │                           │                            │                            │
      │ 1. POST PDF File          │                            │                            │
      │ (Multipart/form-data)     │                            │                            │
      ├──────────────────────────►│                            │                            │
      │                           │ 2. Proxy Pass (HTTP LAN)   │                            │
      │                           ├───────────────────────────►│                            │
      │                           │                            │ 3. Lưu RAM-disk tạm        │
      │                           │                            ├───────────────────────────►│
      │                           │                            │ 4. Kiểm tra Magic Bytes    │
      │                           │                            │    (%PDF-1.x) & MIME       │
      │                           │                            │ 5. pdfplumber: Trích text  │
      │                           │                            │ 6. Regex Parser: Môn, Điểm │
      │                           │                            │ 7. PII Redaction: Xóa CCCD,│
      │                           │                            │    SĐT, Địa chỉ sinh viên  │
      │                           │                            │ 8. Xóa file PDF gốc        │
      │                           │                            ├───────────────────────────►│ (DELETE)
      │                           │ 9. Trả JSON Profile sạch   │                            │
      │                           │◄───────────────────────────┤                            │
      │ 10. Trả về Client         │                            │                            │
      │◄──────────────────────────┤                            │                            │
```

#### Các bước xử lý chi tiết:
1. **Tiếp nhận & Validate:** Người dùng kéo thả bảng điểm `.pdf` ($\le 10\text{MB}$) tại giao diện Next.js. Trình duyệt đóng gói dạng `multipart/form-data` gửi qua Cloudflare Tunnel về Edge Gateway.
2. **Kiểm tra an toàn:** FastAPI tại Private Node nhận luồng byte, ghi vào phân vùng RAM ảo `/tmp/majormatch_ephemeral/`. Kiểm tra header nhị phân đảm bảo đúng định dạng PDF hợp lệ.
3. **Trích xuất thực thể:** Thư viện `pdfplumber` bóc tách từng khối văn bản theo tọa độ $(x, y)$. Bộ phân tích cú pháp `RegexEngine` trích xuất danh sách môn học, số tín chỉ, điểm số hệ 10 và hệ chữ.
4. **Khử PII (Personally Identifiable Information):** Hệ thống loại bỏ toàn bộ chuỗi ký tự khớp với họ tên, mã số sinh viên, số CCCD, ngày sinh và số điện thoại. Chỉ lưu giữ cấu trúc đối tượng JSON chứa mảng môn học và GPA.
5. **Hủy dữ liệu nhị phân (Zero Data Trace):** File PDF gốc trên RAM-disk bị xóa ngay lập tức (shred / unlink) sau khi bóc tách thành công.

---

### 2.2. Luồng 2: Định lượng Năng lực & Khoảng cách Kỹ năng (Skill Gap Quantification Flow)

```text
CLIENT (Zustand Store)       EDGE GATEWAY (Nginx)        ML ENGINE (Scikit-learn)     SQLITE CACHE (Edge)
      │                               │                           │                           │
      │ 1. POST Holland Scores (RIASEC)                           │                           │
      │    + Target Career Tags       │                           │                           │
      │    + Clean Course List        │                           │                           │
      ├──────────────────────────────►│                           │                           │
      │                               │ 2. Kiểm tra Cache Hash    │                           │
      │                               ├──────────────────────────────────────────────────────►│
      │                               │    (Nếu Hit Cache: Trả ngay trong 15ms)               │
      │                               │ 3. Forward LAN Request    │                           │
      │                               ├──────────────────────────►│                           │
      │                               │                           │ 4. Ánh xạ Môn -> Kỹ năng  │
      │                               │                           │    Vector hóa S_user      │
      │                               │                           │ 5. Nạp S_benchmark ngành  │
      │                               │                           │ 6. Tính Cosine Similarity │
      │                               │                           │ 7. Tính Delta Gap Vector  │
      │                               │                           │ 8. Tính 6 trục Radar Chart│
      │                               │ 9. Trả JSON Kết quả       │                           │
      │                               │◄──────────────────────────┤                           │
      │                               │ 10. Lưu kết quả vào Cache ├──────────────────────────►│
      │ 11. Render Radar Chart        │                           │                           │
      │◄──────────────────────────────┤                           │                           │
```

#### Các bước xử lý chi tiết:
1. **Dữ liệu đầu vào:** Tập hợp điểm 6 nhóm Holland Code (thang điểm 1–5), mảng các nghề nghiệp mục tiêu (`career_tags`), và danh sách môn học kèm điểm số đã làm sạch từ Luồng 1.
2. **Vector hóa không gian kỹ năng:** Thuật toán ánh xạ điểm từng môn học vào ma trận trọng số kỹ năng $W_{ij}$, xây dựng vector năng lực người dùng $S_{user}$ trong không gian 128 chiều.
3. **Tính độ tương đồng Cosine:** Đo góc giữa vector người dùng $S_{user}$ và vector chuẩn của vị trí nghề nghiệp $S_{benchmark}$:
   $$\text{CosineSim}(S_{user}, S_{benchmark}) = \frac{S_{user} \cdot S_{benchmark}}{\|S_{user}\|_2 \|S_{benchmark}\|_2}$$
4. **Phân rã trục biểu đồ:** Tính toán giá trị chuẩn hóa (1–10) trên 6 trục năng lực cốt lõi:
   * **Core Technical (Kỹ thuật nền tảng)**
   * **Domain Specialization (Chuyên môn sâu)**
   * **Algorithmic Thinking (Tư duy thuật toán)**
   * **System Architecture (Kiến trúc hệ thống)**
   * **Industry Tools (Công cụ thực chiến)**
   * **Soft Skills & Professionalism (Kỹ năng mềm & Hội nhập)**
5. **Phản hồi:** Trả về bộ tọa độ JSON phục vụ vẽ biểu đồ Recharts và danh sách vector kỹ năng còn thiếu ($\Delta S$) phục vụ Luồng 3.

---

### 2.3. Luồng 3: RAG Truy xuất Khung Môn học & Sinh Lộ trình (RAG & Roadmap Generation Flow)

```text
FASTAPI BACKEND           CHROMADB VECTORSTORE           OLLAMA ENGINE (GPU)         CLIENT DASHBOARD
      │                            │                              │                          │
      │ 1. Truy vấn Kỹ năng thiếu  │                              │                          │
      │    (Missing Skills Query)  │                              │                          │
      ├───────────────────────────►│                              │                          │
      │ 2. Top-K Môn học tiên quyết│                              │                          │
      │◄───────────────────────────┤                              │                          │
      │                                                           │                          │
      │ 3. Build Prompt với Context môn học + JSON Schema         │                          │
      │ 4. Gửi Prompt qua Localhost (Port 11434)                  │                          │
      ├──────────────────────────────────────────────────────────►│                          │
      │                                                           │ 5. GPU CUDA Qwen 2.5 7B  │
      │                                                           │    Inference (45-55 t/s) │
      │ 6. Nhận chuỗi JSON Lộ trình chuẩn mực                     │                          │
      │◄──────────────────────────────────────────────────────────┤                          │
      │ 7. Validate JSON Schema & Kiểm tra logic môn tiên quyết   │                          │
      │ 8. Trả Payload Lộ trình hoàn chỉnh                        │                          │
      ├─────────────────────────────────────────────────────────────────────────────────────►│
      │                                                                                      │ 9. Vẽ sơ đồ cây
      │                                                                                      │    Milestone Tree
```

#### Các bước xử lý chi tiết:
1. **Truy vấn Vector Database:** Lấy danh sách kỹ năng bị khuyết ($\Delta S > 0$), tạo embedding vector truy vấn vào ChromaDB để tìm các môn học có nội dung bù đắp trực tiếp.
2. **Ràng buộc tiên quyết (Prerequisite Graph Traversal):** Duyệt cây quan hệ môn học: Nếu môn đề xuất $M$ yêu cầu môn tiên quyết $P$, hệ thống kiểm tra xem $P$ đã có trong bảng điểm của sinh viên chưa. Nếu chưa, $P$ bắt buộc phải được xếp vào kỳ học trước $M$.
3. **Sinh nội dung bằng LLM:** Nạp toàn bộ ngữ cảnh vào mô hình Qwen 2.5 7B qua Ollama với thiết lập `format="json"` và `temperature=0.2` (đảm bảo tính tất định, không sáng tạo tùy tiện).
4. **Cấu trúc dữ liệu trả về:** Phân rã lộ trình thành các Milestone theo từng học kỳ kèm mã môn, tên môn, lý do đề xuất, chứng chỉ quốc tế và đề tài đồ án thực chiến.

---

### 2.4. Luồng 4: Vòng lặp Trạng thái Tương tác Web 2.0 (Dynamic State Feedback Loop)

```text
NGƯỜI DÙNG                     REACT COMPONENT                ZUSTAND STORE             RECHARTS RADAR
    │                                │                              │                          │
    │ 1. Tích chọn checkbox:         │                              │                          │
    │    "Đã hoàn thành CS301"       │                              │                          │
    ├───────────────────────────────►│                              │                          │
    │                                │ 2. Dispatch Action:          │                          │
    │                                │    `toggleCourseComplete`    │                          │
    │                                ├─────────────────────────────►│                          │
    │                                │                              │ 3. Tính toán lại cục bộ: │
    │                                │                              │    - Cộng điểm kỹ năng   │
    │                                │                              │    - Tính lại % Matching │
    │                                │                              │    - Cập nhật 6 tọa độ   │
    │                                │ 4. Store State Updated       │                          │
    │                                │◄─────────────────────────────┤                          │
    │                                │ 5. Render lại biểu đồ        │                          │
    │                                ├────────────────────────────────────────────────────────►│
    │ 6. Thấy biểu đồ co giãn tức thì (< 16ms, 60 FPS)                                         │
    │◄─────────────────────────────────────────────────────────────────────────────────────────┤
```

#### Đặc trưng Web 2.0:
* **Zero Network Latency:** Toàn bộ quá trình tính toán lại chỉ số phù hợp khi người dùng hoàn thành một môn học diễn ra hoàn toàn trên Client Runtime thông qua Store trạng thái `Zustand`.
* **Không làm gián đoạn trải nghiệm:** Người dùng không phải chờ tải lại trang, biểu đồ Radar Chart và thanh tiến độ (% Job Readiness) cập nhật động mượt mà với hiệu ứng hoạt họa CSS.

---

### 2.5. Luồng 5: Streaming AI Chatbot Phản hồi Thời gian thực (SSE Stream Flow)

```text
CLIENT (EventSource / Fetch)     GATEWAY (Nginx)            FASTAPI BACKEND           OLLAMA (Qwen 2.5)
      │                                │                            │                         │
      │ 1. POST /api/v1/chat/stream    │                            │                         │
      │    (Question + Context ID)     │                            │                         │
      ├───────────────────────────────►│                            │                         │
      │                                │ 2. Forward SSE Stream      │                         │
      │                                │    (proxy_buffering off)   │                         │
      │                                ├───────────────────────────►│                         │
      │                                │                            │ 3. Query LLM Streaming  │
      │                                │                            ├────────────────────────►│
      │                                │                            │ 4. Token Chunks         │
      │                                │ 5. SSE Event: data: chunk  │◄────────────────────────┤
      │ 6. Nhận Token & Hiển thị chữ   │◄───────────────────────────┤                         │
      │    hiệu ứng gõ (Typewriter)    │                            │                         │
      │◄───────────────────────────────┤                            │                         │
      │    ... (Lặp lại cho tới khi kết thúc stream: data: [DONE])  │                         │
```

#### Cơ chế kỹ thuật:
* **Nginx Configuration:** Thiết lập `proxy_buffering off;` và `proxy_cache off;` trên Nginx tại Edge Gateway, cho phép các gói tin SSE truyền thẳng qua Gateway mà không bị gom cụm làm mất hiệu ứng gõ chữ thời gian thực.
* **Tối ưu trải nghiệm:** Thời gian nhận token đầu tiên (TTFT) đạt mức $\approx 650 - 750\text{ms}$.

---

## 3. VÒNG ĐỜI DỮ LIỆU & QUẢN TRỊ DỮ LIỆU BẢO MẬT (DATA RETENTION POLICY)

| Trạng thái Dữ liệu | Loại Dữ liệu | Vị trí Lưu trữ | Cơ chế Bảo mật | Thời gian Tồn tại (TTL) |
| :--- | :--- | :--- | :--- | :--- |
| **Data in Transit** | File PDF, Tọa độ Radar, Chat Stream | Kênh mạng (Internet / LAN) | TLS 1.3, Cloudflare mTLS | Tức thời theo thời gian truyền |
| **Data in Memory** | Buffer giải nén PDF, Token Stream | RAM Máy tính Private Node / Gateway | Phân vùng RAM ảo cô lập | Tự giải phóng khi hàm kết thúc |
| **Data at Rest (Confidential)** | Danh sách môn học & điểm sau lọc PII | RAM-disk `/tmp/majormatch_ephemeral` | Không ghi đĩa cứng vật lý | Xóa ngay lập tức sau bóc tách |
| **Data at Rest (Public/Cache)** | Khung chương trình đào tạo chuẩn | File `cache.db` (SQLite) trên Edge Gateway | Chỉ đọc, phân quyền 0644 | Lưu trữ vĩnh viễn / Cập nhật định kỳ |
| **Vector Embeddings** | Vector môn học & Tiêu chuẩn ngành | ChromaDB Vector Store | Internal Docker Volume | Lưu trữ cố định cho RAG Engine |
