# 🎙️ KỊCH BẢN THUYẾT TRÌNH SIÊU CHI TIẾT DỰ ÁN MAJORMATCH
**Hệ sinh thái Định lượng Năng lực & Cá nhân hóa Lộ trình Đại học (Hybrid Cloud Multi-tier & Explainable AI)**

---

## 📑 MỤC LỤC TỔNG QUAN
1. [Giới thiệu Dự án & Tuyên ngôn Sứ mệnh](#1-giới-thiệu-dự-án--tuyên-ngôn-sứ-mệnh)
2. [Kiến trúc Hệ thống Phân tầng (Hybrid Cloud Multi-tier)](#2-kiến-trúc-hệ-thống-phân-tầng-hybrid-cloud-multi-tier)
3. [Quy trình Khởi chạy & Vận hành Đa Node (HPC ➔ Joy 3 ➔ EC2 ➔ Client)](#3-quy-trình-khởi-chạy--vận-hành-đa-node-hpc--joy-3--ec2--client)
4. [Mô hình Làm việc & Phối hợp Nhóm (Collaboration Workflow)](#4-mô-hình-làm-việc--phối-hợp-nhóm-collaboration-workflow)
5. [Tính Minh bạch Dữ liệu & An ninh Khử định danh (Zero-SaaS-Leakage)](#5-tính-minh-bạch-dữ-liệu--an-ninh-khử-định-danh-zero-saas-leakage)
6. [Các Chức năng Đặc biệt & Đột phá Kỹ thuật](#6-các-chức-năng-đặc-biệt--đột-phá-kỹ-thuật)
7. [Khả năng Ứng dụng Thực tế & Tác động Xã hội](#7-khả-năng-ứng-dụng-thực-tế--tác-động-xã-hội)
8. [Điểm yếu Hiện tại & Hướng Cải tiến](#8-điểm-yếu-hiện-tại--hướng-cải-tiến)
9. [Lộ trình Phát triển Tương lai (Future Roadmap)](#9-lộ-trình-phát-triển-tương-lai-future-roadmap)
10. [PHƯƠNG ÁN A: Kịch bản Thuyết trình Nhóm 4 Người (10 - 12 Phút)](#10-phương-án-a-kịch-bản-thuyết-trình-nhóm-4-người-10---12-phút)
11. [PHƯƠNG ÁN B: Kịch bản Cô đọng cho 1 Người Thuyết trình Nhanh (3 - 5 Phút)](#11-phương-án-b-kịch-bản-cô-đọng-cho-1-người-thuyết-trình-nhanh-3---5-phút)

---

## 1. GIỚI THIỆU DỰ ÁN & TUYÊN NGÔN SỨ MỆNH

### 1.1. Bối cảnh thực tế & Bài toán nhức nhối (Pain Points)
- **Tình trạng chọn ngành cảm tính:** Tại các trường Đại học công nghệ (tiêu biểu như Trường ĐH CNTT & Truyền thông Việt - Hàn - VKU), sinh viên sau giai đoạn đại cương (năm 1, năm 2) phải đối mặt với quyết định sống còn: *chọn chuyên ngành hẹp* (AI/Data Science, Kỹ thuật Phần mềm, DevOps/Cloud, An toàn thông tin, Data Analytics). Phần lớn sinh viên chọn theo xu hướng đám đông hoặc truyền miệng mà không hiểu rõ năng lực cốt lõi của mình.
- **Thiếu công cụ đo lường định lượng:** Bảng điểm học tập tích lũy chỉ là những con số GPA khô khan; CV xin việc chỉ là các gạch đầu dòng liệt kê. Chưa có công cụ nào giúp sinh viên "đo đạc" chính xác khoảng cách giữa bộ kỹ năng hiện tại với chuẩn đầu ra của ngành.
- **Lộ trình học tập cứng nhắc:** Các chương trình khung đào tạo thường mang tính tổng quát, thiếu tính thích ứng cá nhân hóa cho từng hoàn cảnh sinh viên (môn đã học điểm cao, môn còn thiếu, kỹ năng tự học ngoài trường).
- **Rủi ro rò rỉ dữ liệu học bạ:** Các công cụ AI công cộng (như ChatGPT, Claude) tiềm ẩn rủi ro lộ lọt thông tin cá nhân (PII) và điểm số học bạ nhạy cảm khi sinh viên tải tài liệu lên.

### 1.2. Giải pháp MajorMatch
**MajorMatch** ra đời như một hệ sinh thái EdTech tiên phong giải quyết trọn vẹn chuỗi bài toán trên:
- **Định lượng hóa năng lực học tập:** Tự động trích xuất bảng điểm PDF / CV bằng Regex + Computer Vision Parsing, vector hóa trong không gian 128 chiều và tính toán độ tương đồng toán học **Cosine Similarity**.
- **Tích hợp trắc nghiệm tâm lý nghề nghiệp:** Kết hợp mô hình tâm lý học trắc nghiệm **Holland Code (RIASEC)** chuẩn quốc tế để đối chiếu giữa "Kỹ năng học thuật" và "Thiên hướng tính cách".
- **Bóc tách minh bạch Explainable AI (XAI):** Giải thích rõ ràng 3 nhân tố cấu thành điểm số đề xuất (Học phần 40%, RIASEC 35%, Kỹ năng CV 25%) kèm bằng chứng học thuật thuyết phục.
- **Sinh lộ trình thích ứng bằng RAG & Local LLM:** Sử dụng cơ sở dữ liệu vector **ChromaDB** kết hợp mô hình ngôn ngữ lớn **Qwen 2.5 7B** chạy trên GPU nội bộ, đề xuất lộ trình 3 giai đoạn bảo đảm 100% tính hợp lệ của môn tiên quyết.
- **Không gian Web 2.0 Dynamic Tracking:** Tương tác trực tiếp trên checklist môn học/đồ án, thanh chỉ số sẵn sàng việc làm (% Job Readiness) và biểu đồ Radar Chart tự động nhảy tiến độ tức thời (< 16ms) mà không cần reload trang.

---

## 2. KIẾN TRÚC HỆ THỐNG PHÂN TẦNG (HYBRID CLOUD MULTI-TIER)

Hệ thống được thiết kế theo mô hình **Hybrid Cloud 4 phân tầng** nhằm tối ưu hóa chi phí đám mây, bảo đảm an ninh dữ liệu nội bộ và tận dụng tối đa năng lực phần cứng máy trạm GPU sẵn có:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG 1: CLIENT PRESENTATION                     │
│  - Công nghệ: Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand │
│  - Giao diện: Web 2.0 Dynamic State, Radar Chart Recharts co giãn      │
│  - Người dùng truy cập: Trình duyệt máy tính / Thiết bị di động        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TẦNG 2: AWS EC2 CLOUD GATEWAY & EDGE                 │
│  - Địa chỉ: https://majormatch.vanhoang.online (AWS Singapore EC2)     │
│  - Nhiệm vụ: Nginx Reverse Proxy, Rate Limiting, SSL Offloading        │
│  - CSDL Bền vững: SQLite WAL Mode (Lưu người dùng, lộ trình, profile)  │
│  - Dự phòng nóng: Local Skill Engine fallback khi HPC gián đoạn        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mạng ảo bảo mật WireGuard (Tailscale Mesh VPN)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  TẦNG 3: JOY 3 EDGE NODE & DISPATCHER                  │
│  - Thiết bị: SBC / Joy 3 Android Termux chạy Ubuntu 22.04 PRoot        │
│  - IP Tailscale: 100.71.182.24 (Port SSH: 8022, HTTP Proxy: 18080)     │
│  - Nhiệm vụ: Cổng biên điều phối, in log request AI streaming thời gian│
│    thực, cân bằng tải và giám sát độ trễ mạng nội bộ                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Subnet VPN Nội bộ Tailscale
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               TẦNG 4: PRIVATE HPC GPU COMPUTE NODE (AI ENGINE)         │
│  - Thiết bị: Máy trạm Legion RTX 4060 GPU (8GB VRAM), AMD Ryzen 7     │
│  - IP Tailscale: 100.123.107.114 (FastAPI Port: 8000, Ollama: 11434)   │
│  - Trọng trách nặng:                                                   │
│    + Bóc tách PDF đa tầng (pdfplumber layout, text, pypdf)             │
│    + ML Engine: Vector hóa 128D, Cosine Similarity, Radar 6 trục, XAI  │
│    + RAG Pipeline: ChromaDB (HNSW index, bge-m3 embeddings)            │
│    + LLM Core: Ollama Qwen 2.5 7B Instruct (CUDA acceleration)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. QUY TRÌNH KHỞI CHẠY & VẬN HÀNH ĐA NODE (HPC ➔ JOY 3 ➔ EC2 ➔ CLIENT)

Để toàn bộ hệ thống hoạt động đồng bộ từ máy cá nhân của từng thành viên, quy trình vận hành được tiêu chuẩn hóa theo Runbook sau:

### Bước 1: Khởi động Trạm Tính toán AI (Node HPC GPU - Lenovo Legion)
Khi máy HPC bật, từ máy cá nhân kết nối vào HPC qua mạng Tailscale:
```powershell
# 1. SSH vào máy tính Legion qua Tailscale
ssh Lenovo@100.123.107.114
# Nhập 'yes' khi hỏi fingerprint. Nhập mật khẩu: 160205

# 2. Khởi chạy dịch vụ Ollama quản lý mô hình Qwen 2.5
ollama serve

# 3. Mở thêm 1 terminal SSH vào HPC và khởi chạy FastAPI Backend
cd C:\mydata\selfproject\AIO_project\backend-hpc
.\.venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Kiểm tra nhanh:* `curl.exe http://localhost:8000/api/v1/health` ➔ Trả về `gpu_status: NVIDIA CUDA GPU`.

---

### Bước 2: Khởi động Trạm Điều phối & Giám sát Log (Joy 3 Edge Node)
Thiết bị Joy 3 giữ vai trò trạm gác cổng mạng và hiển thị luồng stream token:
```bash
# 1. SSH vào Joy 3 qua mạng Tailscale
ssh -p 8022 root@100.71.182.24
# Nhập mật khẩu: 123456

# 2. Đăng nhập môi trường Ubuntu proot
proot-distro login ubuntu

# 3. Chạy script điều phối và kênh theo dõi log
python3 /root/joy3_edge_dispatcher.py
```
*Tác dụng:* Cửa sổ terminal này sẽ in log toàn bộ các request phân tích bảng điểm và luồng stream văn bản từ HPC gửi về Client theo thời gian thực.

---

### Bước 3: Kiểm tra Cổng Đám mây AWS EC2 (Cloud Gateway)
Cổng EC2 chạy dịch vụ systemd tự động, sẵn sàng tiếp nhận request từ internet:
```bash
# Kiểm tra dịch vụ trên EC2
curl -s https://majormatch.vanhoang.online/api/v1/health
```
*Kết quả:* Trả về JSON xác nhận Gateway Node trực tuyến và kết nối thông suốt với HPC Node.

---

### Bước 4: Khởi chạy Client trên máy cá nhân của từng thành viên
Bất kỳ thành viên nào trong nhóm chỉ cần clone source code về máy cá nhân là có thể phát triển và thử nghiệm trực tiếp:
```powershell
# 1. Di chuyển vào thư mục client
cd client

# 2. Cài đặt dependencies (lần đầu)
npm install

# 3. Chạy máy chủ phát triển cục bộ
npm run dev
```
*Truy cập:* Mở trình duyệt tại `http://localhost:3000`. Toàn bộ tác vụ tính toán nặng và sinh lộ trình AI sẽ được gửi ngầm qua Tailscale đến máy tính HPC để GPU xử lý!

---

## 4. MÔ HÌNH LÀM VIỆC & PHỐI HỢP NHÓM (COLLABORATION WORKFLOW)

Nhóm 4 người áp dụng quy trình công nghệ chuẩn doanh nghiệp phần mềm:

### 4.1. Cơ chế mạng lưới ảo Tailscale Mesh
- Thay vì phải mở port modem (Port Forwarding) tiềm ẩn nguy cơ bảo mật, cả 4 thành viên cùng kết nối vào một mạng riêng ảo **Tailscale**.
- Bất kể thành viên ở trường, ở quán cà phê hay ở nhà, máy tính của mỗi người đều có thể giao tiếp trực tiếp với Node HPC (IP `100.123.107.114`) và Node Joy 3 (IP `100.71.182.24`) với độ trễ cực thấp.

### 4.2. Quy chuẩn Git & Phân chia Module (Code Ownership)
Tuân thủ nghiêm ngặt quy định tại file `AGENTS.md`:
- **Branching Strategy:** Mỗi tính năng được phát triển trên nhánh riêng biệt `feat/ten-tinh-nang`.
- **Commit Messages:** 100% commit tuân thủ quy chuẩn **Conventional Commits** bằng tiếng Anh (`feat(ingestion): ...`, `fix(auth): ...`, `refactor(analytics): ...`).
- **Phân định quyền sở hữu thư mục (Code Ownership):**
  - **Văn Hoàng:** Chịu trách nhiệm thư mục `client/src/modules/ingestion` và hạ tầng Cloud EC2 / CSDL WAL.
  - **Ánh Vy:** Chịu trách nhiệm thư mục `client/src/modules/analytics`, thiết kế ma trận nghề nghiệp và UI/UX.
  - **Long Nhật:** Chịu trách nhiệm thư mục `backend-hpc/` (Core ML, RAG, XAI Engine) và kiến trúc `client/src/stores/`.
  - **Thành viên thứ 4:** Chịu trách nhiệm cấu hình hạ tầng mạng Tailscale, thiết bị biên Joy 3 và quản trị máy trạm HPC GPU.

---

## 5. TÍNH MINH BẠCH DỮ LIỆU & AN NINH KHỬ ĐỊNH DANH (ZERO-SAAS-LEAKAGE)

Dữ liệu học bạ và điểm số là tài sản thông tin nhạy cảm của học sinh, sinh viên. MajorMatch thiết kế chính sách an ninh theo nguyên tắc **Privacy-by-Design**:

1. **Khử định danh tự động 100% (PII De-identification):**
   - Trước khi bảng điểm hoặc CV được phân tích, các thông tin định danh cá nhân nhạy cảm như *Số CCCD, Số điện thoại cá nhân, Địa chỉ nhà riêng, Tên cha mẹ* đều được thuật toán Regex lọc sạch tại tầng Ingestion.
   - Hệ thống chỉ lưu trữ và chuyển vào mô hình tính toán: Mã sinh viên (để liên kết hồ sơ), Danh sách mã môn học và Điểm số hệ 4.
2. **Nguyên tắc "Zero-SaaS-Leakage":**
   - Tuyệt đối không gửi bảng điểm hoặc CV của sinh viên lên OpenAI, Google Cloud hay bất kỳ bên thứ ba nào.
   - Toàn bộ vector embeddings và mô hình ngôn ngữ lớn Qwen 2.5 được chạy cục bộ (on-premise) bên trong máy trạm riêng, bảo vệ quyền riêng tư học đường.
3. **Lưu trữ phân tầng bền vững (Polyglot Persistence):**
   - Dữ liệu tài khoản, phân tích và lộ trình được lưu trữ có cấu trúc trong SQLite ở chế độ **WAL (Write-Ahead Logging)** trên EC2, ngăn ngừa tình trạng hỏng dữ liệu khi mất điện đột ngột.
   - Vector cơ sở dữ liệu tri thức môn học được lưu trữ riêng biệt trên **ChromaDB HNSW collections**.

---

## 6. CÁC CHỨC NĂNG ĐẶC BIỆT & ĐỘT PHÁ KỸ THUẬT

1. **Bộ bóc tách PDF linh hoạt đa tầng (Multi-tier Parser):**
   - Đọc hoàn hảo cả bảng điểm chuẩn trường VKU lẫn các tệp PDF in trực tiếp từ **Google Chrome Print** nhờ cơ chế quét mã nhận dạng `%PDF` trong 1024 bytes đầu tiên và fallback 3 tầng (`pdfplumber` layout $\rightarrow$ text $\rightarrow$ `pypdf`).
   - Tự động nhận diện kỹ năng công nghệ trong CV sinh viên dù không có bảng điểm môn học.
2. **Tính toán khoảng cách kỹ năng (Skill Gap) bằng Cosine Similarity:**
   - Vector hóa năng lực học tập và kỹ năng vào không gian 128 chiều.
   - So sánh góc vector giữa sinh viên và hồ sơ chuyên ngành chuẩn mực để tính toán tỷ lệ tương thích chính xác đến từng dấu phẩy thập phân.
3. **Tính năng Explainable AI (XAI) - Bóc tách Lý do Đề xuất:**
   - Phá bỏ cơ chế "hộp đen" (Black-box) của AI truyền thống.
   - Bóc tách minh bạch tỷ trọng đóng góp của 3 nhân tố:
     - **Điểm số & Học phần nền tảng (40%):** Chỉ rõ các môn học cụ thể sinh viên đạt điểm cao liên quan đến ngành.
     - **Thiên hướng tâm lý nghề nghiệp RIASEC (35%):** Đối chiếu đặc tính tư duy cá nhân với môi trường làm việc thực tế.
     - **Kỹ năng thực chiến từ CV & Dự án (25%):** Nêu bật các công nghệ đã tích lũy (Python, Docker, SQL,...).
4. **Không gian làm việc Lộ trình tương tác Web 2.0 (Dynamic State):**
   - Cây lộ trình chia làm 3 giai đoạn (Nền tảng $\rightarrow$ Chuyên sâu $\rightarrow$ Thực chiến/Đồ án).
   - Khi sinh viên tích chọn hoàn thành môn học hoặc đồ án, thanh điểm sẵn sàng việc làm (% Job Readiness) và biểu đồ Radar tự động tăng điểm tức thời (< 16ms) nhờ Zustand Reactive Store.
5. **Cổng bảo mật Quản trị viên (Admin Security Gate):**
   - Phân quyền tài khoản chặt chẽ: Tài khoản admin chuẩn được cấp sẵn, hệ thống chặn tuyệt đối sinh viên đăng ký tài khoản mạo danh Admin.
   - Trang quản trị `/admin` có cổng nhập mật mã bảo mật (`admin123`) ngăn sinh viên truy cập trái phép.

---

## 7. KHẢ NĂNG ỨNG DỤNG THỰC TẾ & TÁC ĐỘNG XÃ HỘI

- **Đối với Sinh viên:**
  - Tiết kiệm 1 - 2 năm học lãng phí do chọn nhầm chuyên ngành không phù hợp với sở trường.
  - Có ngay bản kế hoạch học tập từng kỳ rõ ràng, biết chính xác mình cần học thêm kỹ năng gì để xin được việc làm.
- **Đối với Nhà trường & Cố vấn học tập (CVHT):**
  - Cung cấp công cụ trợ lý đắc lực cho các buổi tư vấn chuyên ngành thường niên.
  - Cố vấn học tập chỉ cần nhìn vào biểu đồ Radar và phân rã kỹ năng của sinh viên là có thể đưa ra lời khuyên chính xác trong vòng 1 phút thay vì phải đọc thủ công từng trang bảng điểm.
- **Đối với Doanh nghiệp tuyển dụng:**
  - Định chuẩn bộ kỹ năng sinh viên sát với nhu cầu thực tế của thị trường CNTT miền Trung và cả nước.

---

## 8. ĐIỂM YẾU HIỆN TẠI & HƯỚNG CẢI TIẾN

Dù đã đạt được các kết quả kỹ thuật nổi bật, dự án vẫn còn một số điểm cần tiếp tục hoàn thiện:
1. **Phụ thuộc vào máy trạm HPC cá nhân:**
   - *Hạn chế:* Hiện tại GPU RTX 4060 nằm trên máy tính cá nhân của thành viên, cần mở máy và kết nối mạng Tailscale liên tục. Nếu máy HPC tắt, hệ thống trên Cloud phải chuyển sang chế độ tính toán fallback dự phòng.
   - *Hướng cải tiến:* Trong tương lai sẽ đóng gói toàn bộ GPU worker lên cloud instance chuyên dụng (như RunPod / AWS G4dn) hoặc cụm máy chủ trường VKU.
2. **Thời gian suy luận LLM:**
   - *Hạn chế:* Sinh lộ trình dài qua mô hình 7B tham số trên GPU tiêu dùng mất khoảng 8 - 15 giây.
   - *Hướng cải tiến:* Áp dụng công nghệ tăng tốc **vLLM** kết hợp lượng tử hóa 4-bit (AWQ / GGUF) để rút ngắn thời gian sinh xuống dưới 3 giây.
3. **Phạm vi chương trình đào tạo:**
   - *Hạn chế:* Hiện ma trận môn học mới phủ 5 chuyên ngành mũi nhọn của Khoa Khoa học Máy tính & Kỹ thuật Máy tính VKU.
   - *Hướng cải tiến:* Mở rộng sang khối ngành Kinh tế số, Quản trị Logistics và Thiết kế Vi mạch.

---

## 9. LỘ TRÌNH PHÁT TRIỂN TƯƠNG LAI (FUTURE ROADMAP)

- **Giai đoạn 1 (Quý 4/2026):** Tích hợp cổng API tuyển dụng trực tiếp (TopCV, VietnamWorks, LinkedIn) để tự động cập nhật trọng số kỹ năng "hot" của thị trường theo từng tuần.
- **Giai đoạn 2 (Quý 1/2027):** Tính năng **AI Mock Interview** - Cho phép sinh viên sau khi hoàn thành lộ trình được phỏng vấn thử bằng giọng nói (Voice-to-Text) với trợ lý AI mô phỏng nhà tuyển dụng.
- **Giai đoạn 3 (Quý 2/2027):** Đề xuất triển khai thí điểm chính thức vào hệ thống Portal Sinh viên của Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn.

---

## 10. PHƯƠNG ÁN A: KỊCH BẢN THUYẾT TRÌNH NHÓM 4 NGƯỜI (10 - 12 PHÚT)

*Phân công nhân sự:*
- **Người 1 (Đặng Long Nhật - Trưởng nhóm / Tech Lead):** Giới thiệu bài toán, tổng quan giải pháp, kiến trúc hệ thống và tính năng XAI.
- **Người 2 (Nguyễn Văn Hoàng - Ingestion & Cloud Platform):** Trình bày module bóc tách bảng điểm PDF, xử lý file Chrome, an ninh PII và hạ tầng AWS EC2.
- **Người 3 (Võ Thị Ánh Vy - Data Analytics & Product UX):** Trình bày ma trận trắc nghiệm Holland RIASEC, biểu đồ Radar Chart và trải nghiệm tương tác Web 2.0.
- **Người 4 (Thành viên thứ 4 - Hạ tầng Mạng & HPC AI):** Trình bày mạng lưới Tailscale, trạm biên Joy 3, GPU HPC và demo trực tiếp hệ thống.

---

### [00:00 - 02:30] NGƯỜI 1 (ĐẶNG LONG NHẬT) - MỞ ĐẦU & TỔNG QUAN HỆ THỐNG
*(Mở slide trang bìa và chuyển sang slide Bối cảnh)*

> **Lời thoại Người 1:**
> "Kính thưa quý thầy cô trong hội đồng và toàn thể các bạn sinh viên, em tên là **Đặng Long Nhật**, đại diện cho nhóm nghiên cứu dự án **MajorMatch**.
>
> Thưa thầy cô, mỗi năm tại trường VKU cũng như các trường đại học công nghệ, hàng ngàn sinh viên bước vào học kỳ phân chuyên ngành với một tâm lý chung: **hoang mang và cảm tính**. Rất nhiều bạn chọn ngành chỉ vì 'nghe nói ngành này đang hot', để rồi đến năm 3, năm 4 nhận ra mình không đủ đam mê hoặc thiếu hụt nền tảng nghiêm trọng.
>
> Xuất phát từ nỗi trăn trở đó, nhóm chúng em đã phát triển **MajorMatch** - một hệ sinh thái AI kết hợp giữa **học bạ thực tế**, **trắc nghiệm tâm lý nghề nghiệp RIASEC** và công nghệ **Explainable AI** để mang đến câu trả lời khoa học, định lượng và chính xác cho câu hỏi: *'Tôi thực sự phù hợp với chuyên ngành nào?'*
>
> *(Chuyển sang slide Kiến trúc hệ thống)*
>
> Để giải quyết bài toán này một cách tối ưu về chi phí và an toàn dữ liệu, nhóm em xây dựng hệ thống theo kiến trúc **Hybrid Cloud Multi-tier 4 phân tầng**:
> - Tầng 1 là giao diện Client Web 2.0 viết bằng Next.js 14 và Zustand Store.
> - Tầng 2 là Cổng điều phối AWS EC2 tại Singapore kết hợp CSDL SQLite bền vững.
> - Tầng 3 là thiết bị biên Joy 3 đóng vai trò giám sát, điều phối và in log theo thời gian thực.
> - Và Tầng 4 là máy trạm HPC sở hữu GPU RTX 4060 riêng biệt đảm nhận toàn bộ tác vụ AI nặng.
>
> Tiếp theo, xin mời bạn **Văn Hoàng** sẽ trình bày về giải pháp bóc tách dữ liệu và an ninh thông tin của dự án."

---

### [02:30 - 05:00] NGƯỜI 2 (NGUYỄN VĂN HOÀNG) - INGESTION, CHROME PDF & BẢO MẬT PII
*(Chuyển sang slide Module Ingestion & Giao diện Upload)*

> **Lời thoại Người 2:**
> "Xin chào quý thầy cô, em là **Nguyễn Văn Hoàng**, phụ trách module Ingestion và hạ tầng Cloud của dự án.
>
> Thưa thầy cô, một trong những thách thức lớn nhất khi người dùng tải bảng điểm lên hệ thống là sự đa dạng về định dạng. Rất nhiều sinh viên in bảng điểm trực tiếp từ trình duyệt **Google Chrome Print**. Trình duyệt này tự động chèn các byte đặc biệt hoặc metadata ở đầu tệp, khiến các thư viện đọc PDF thông thường báo lỗi sai cấu trúc.
>
> Nhóm chúng em đã giải quyết triệt để vấn đề này bằng hai cải tiến kỹ thuật:
> 1. Tại Client, thuật toán quét chuỗi nhận dạng nhị phân `%PDF` trong **1024 bytes đầu tiên** tuân thủ theo tiêu chuẩn quốc tế ISO 32000-1.
> 2. Tại Backend, em xây dựng cơ chế **dự phòng 3 tầng**: sử dụng `pdfplumber` với chế độ phân tích layout, chuyển tiếp sang plain-text, và cuối cùng là `pypdf`. Nhờ đó, 100% các file PDF bảng điểm hay thậm chí CV xuất từ Chrome đều được bóc tách chính xác điểm số, mã môn học và danh mục kỹ năng.
>
> *(Chuyển sang slide Bảo mật Zero-SaaS-Leakage)*
>
> Về tính minh bạch và an toàn dữ liệu: Nhóm chúng em áp dụng nguyên tắc **Zero-SaaS-Leakage**. Toàn bộ thông tin cá nhân nhạy cảm như CMND, số điện thoại, địa chỉ nhà được thuật toán Regex **khử định danh tự động 100%** ngay khi tiếp nhận. Dữ liệu bảng điểm tuyệt đối không gửi lên các dịch vụ đám mây công cộng bên ngoài mà được lưu trữ và mã hóa an toàn trên cụm máy chủ riêng.
>
> Tiếp sau đây, xin kính mời bạn **Ánh Vy** sẽ trình bày về phương pháp phân tích năng lực và trải nghiệm giao diện người dùng."

---

### [05:00 - 07:30] NGƯỜI 3 (VÕ THỊ ÁNH VY) - ĐỊNH LƯỢNG NĂNG LỰC, RADAR CHART & WEB 2.0
*(Chuyển sang slide Biểu đồ Radar và Phân tích Năng lực)*

> **Lời thoại Người 3:**
> "Kính chào quý thầy cô và các bạn, em là **Võ Thị Ánh Vy**, phụ trách phần phân tích dữ liệu chuyên môn và trải nghiệm người dùng.
>
> Thưa thầy cô, điểm khác biệt lớn nhất của MajorMatch so với các bài trắc nghiệm thông thường trên mạng là sự kết hợp giữa **Năng lực học thuật khách quan** và **Thiên hướng tâm lý chủ quan**:
> - Chúng em xây dựng ma trận đối sánh giữa 6 nhóm tính cách **RIASEC** (Thực tế, Nghiên cứu, Nghệ thuật, Xã hội, Quản lý, Nghiệp vụ) với các chuyên ngành đào tạo trọng điểm.
> - Sau khi vector hóa năng lực của sinh viên vào không gian 128 chiều, hệ thống sử dụng thuật toán **Cosine Similarity** để đo khoảng cách kỹ năng (Skill Gap) và xuất ra biểu đồ **Radar Chart 6 trục mạng nhện**.
>
> *(Chỉ vào biểu đồ Radar trên slide/màn hình demo)*
>
> Quý thầy cô có thể thấy trên biểu đồ: Lớp màu xanh đại diện cho năng lực hiện tại của sinh viên, đối chiếu trực tiếp với lớp viền màu cam là chuẩn mực yêu cầu của chuyên ngành. Kèm theo đó là danh sách phân rã rõ ràng: Kỹ năng nào sinh viên đã thuần thục (*Mastered*), kỹ năng nào đang phát triển (*Developing*), và kỹ năng nào còn thiếu hụt (*Missing*) cần phải bồi đắp.
>
> Đặc biệt, với công nghệ **Web 2.0 Dynamic State Tracking**, khi sinh viên bước vào lộ trình học tập và tích chọn hoàn thành một môn học hoặc đồ án, thanh chỉ số % Sẵn sàng việc làm và các trục Radar sẽ tự động co giãn và cập nhật tức thời mà không cần reload trang.
>
> Tiếp theo, xin mời bạn **[Tên bạn thứ 4]** sẽ trình bày về giải pháp hạ tầng phân tán và demo thực tế hệ thống."

---

### [07:30 - 10:00] NGƯỜI 4 (THÀNH VIÊN THỨ 4) - HẠ TẦNG TAILSCALE, JOY 3, HPC & LIVE DEMO
*(Chuyển sang màn hình thao tác hoặc slide Hạ tầng Mạng)*

> **Lời thoại Người 4:**
> "Kính chào thầy cô, em là **[Tên thành viên thứ 4]**, phụ trách cấu hình mạng lưới liên kết thiết bị và vận hành trạm tính toán GPU.
>
> Thưa thầy cô, để 4 thành viên trong nhóm dù ở các vị trí địa lý khác nhau vẫn có thể làm việc và gọi được mô hình AI cục bộ, nhóm em đã thiết lập mạng lưới ảo **Tailscale Mesh VPN**. 
> - Nhờ công nghệ mã hóa WireGuard, chiếc máy tính cá nhân của bạn Nhật đóng vai trò trạm tính toán **HPC GPU RTX 4060** có thể phục vụ cho cả nhóm một cách an toàn mà không cần mở cổng modem.
> - Đồng thời, nhóm em tận dụng một thiết bị di động cũ **Vsmart Joy 3** cài hệ điều hành Ubuntu PRoot để làm **Trạm điều phối biên (Edge Dispatcher)**. Joy 3 liên tục kiểm tra tình trạng kết nối mạng, cân bằng tải và in log luồng truyền token theo thời gian thực.
>
> *(Tiến hành Demo trực tiếp trên màn hình)*
>
> Bây giờ, em xin phép demo nhanh luồng hoạt động:
> 1. Đầu tiên, em tải lên một file bảng điểm PDF in từ Google Chrome. Chỉ sau 2 giây, hệ thống đã khử định danh PII và bóc tách thành công toàn bộ điểm GPA, số tín chỉ và các môn đã học.
> 2. Hệ thống chuyển ngay sang màn hình Kết quả: Đề xuất Top 5 chuyên ngành phù hợp nhất kèm biểu đồ Radar 6 trục.
> 3. Và đây là tính năng đột phá mới nhất của nhóm: **Thẻ Explainable AI (XAI)**. Hệ thống không chỉ đưa ra con số 85% hay 90% một cách bí ẩn, mà bóc tách chi tiết: Điểm môn học đóng góp 40% (kèm bằng chứng môn Lập trình mạng 3.8/4.0), RIASEC đóng góp 35% (kèm thiên hướng Nghiên cứu đạt 4.8/5.0), và Kỹ năng CV đóng góp 25%.
> 4. Cuối cùng, khi bấm **'Sinh Lộ trình Học tập'**, mô hình Qwen 2.5 7B trên máy HPC lập tức tạo ra cây lộ trình 3 giai đoạn hoàn toàn phù hợp với những môn sinh viên còn thiếu.
>
> Để tổng kết bài thuyết trình, em xin nhường lại lời cho bạn Long Nhật."

---

### [10:00 - 11:30] NGƯỜI 1 (ĐẶNG LONG NHẬT) - TỔNG KẾT & LỜI CẢM ƠN
*(Chuyển sang slide Hướng phát triển & Lời cảm ơn)*

> **Lời thoại Người 1:**
> "Kính thưa quý thầy cô, tóm lại, **MajorMatch** không chỉ dừng lại ở một đồ án môn học, mà là một sản phẩm hoàn thiện có khả năng ứng dụng thực tế rất cao cho công tác tư vấn tuyển sinh và cố vấn học tập tại trường VKU.
>
> Trong tương lai, nhóm chúng em hướng tới việc kết nối dữ liệu tuyển dụng thực tế từ thị trường việc làm và tích hợp tính năng phỏng vấn thử AI bằng giọng nói (AI Mock Interview).
>
> Nhóm chúng em xin chân thành cảm ơn quý thầy cô trong hội đồng đã chú ý lắng nghe. Chúng em rất mong nhận được những câu hỏi và ý kiến đóng góp quý báu từ thầy cô để hoàn thiện dự án hơn nữa. Xin trân trọng cảm ơn!"

---

## 11. PHƯƠNG ÁN B: KỊCH BẢN CÔ ĐỌNG CHO 1 NGƯỜI THUYẾT TRÌNH NHANH (3 - 5 PHÚT)

*Dành cho trường hợp báo cáo tiến độ, thuyết trình Elevator Pitch hoặc khi chỉ định 1 thành viên đại diện trình bày súc tích.*

---

### [00:00 - 01:00] ĐẶT VẤN ĐỀ & GIẢI PHÁP MAJORMATCH

> "Kính chào quý thầy cô và các bạn, em là **[Tên bạn]**, đại diện nhóm phát triển dự án **MajorMatch - Hệ sinh thái định lượng năng lực và cá nhân hóa lộ trình đại học**.
>
> Hiện nay, phần lớn sinh viên chọn chuyên ngành hẹp theo cảm tính và xu hướng đám đông mà không hề biết năng lực thực tế của mình đang ở đâu. Để giải quyết triệt để vấn đề này, MajorMatch mang đến giải pháp **kết hợp giữa phân tích học bạ khách quan, trắc nghiệm tâm lý nghề nghiệp RIASEC và trí tuệ nhân tạo giải thích được (Explainable AI)**. 
> Sinh viên chỉ cần tải lên bảng điểm hoặc CV, hệ thống sẽ đo lường chính xác khoảng cách kỹ năng (Skill Gap) và sinh ra một lộ trình học tập cá nhân hóa bảo đảm đầy đủ các điều kiện môn tiên quyết."

---

### [01:00 - 02:30] ĐỘT PHÁ CÔNG NGHỆ & TÍNH NĂNG NỔI BẬT

> "Về mặt công nghệ, dự án của chúng em sở hữu 4 điểm đột phá nổi bật:
>
> **Thứ nhất là Kiến trúc Hybrid Cloud bảo mật:** Để tránh rò rỉ dữ liệu học bạ nhạy cảm (Zero-SaaS-Leakage), toàn bộ mô hình AI lớn **Qwen 2.5 7B** và cơ sở dữ liệu vector **ChromaDB** được chúng em triển khai hoàn toàn khép kín trên máy trạm GPU nội bộ (HPC), kết nối với cổng Cloud AWS EC2 qua mạng ảo bảo mật **Tailscale**. Thậm chí, nhóm còn tận dụng một thiết bị di động cũ **Joy 3** làm cổng biên điều phối và giám sát log thời gian thực.
>
> **Thứ hai là Bộ bóc tách PDF linh hoạt:** Hệ thống đọc và khử định danh PII tự động cho cả bảng điểm trường và tệp PDF in từ Google Chrome theo chuẩn ISO 32000-1 với cơ chế fallback 3 tầng.
>
> **Thứ ba là Tính năng Explainable AI (XAI) - Bóc tách lý do đề xuất:** Hệ thống xóa bỏ hoàn toàn 'hộp đen' AI. Với mỗi ngành gợi ý, MajorMatch bóc tách minh bạch tỷ trọng đóng góp của 3 nhân tố: *40% từ kết quả môn học cụ thể, 35% từ bài trắc nghiệm tâm lý RIASEC, và 25% từ các kỹ năng công nghệ thực chiến bóc tách trong CV*.
>
> **Và thứ tư là Không gian Lộ trình tương tác Web 2.0:** Sinh viên có thể tương tác trực tiếp trên cây lộ trình 3 giai đoạn. Khi tích chọn môn đã hoàn thành, chỉ số sẵn sàng việc làm (% Job Readiness) và biểu đồ Radar 6 trục sẽ tự động co giãn và cập nhật tức thời (< 16ms) mà không cần reload trang."

---

### [02:30 - 04:00] DEMO NHANH & GIÁ TRỊ ỨNG DỤNG

> *(Thao tác lướt nhanh trên màn hình máy tính)*
>
> "Như thầy cô đang thấy trên màn hình:
> - Chỉ sau một cú nhấp chuột tải file PDF, hệ thống lập tức xuất ra **Bảng xếp hạng 5 chuyên ngành phù hợp nhất** cùng **Biểu đồ Radar đa tầng** đối chiếu năng lực hiện tại với chuẩn ngành.
> - Thẻ **Explainable AI** bên dưới chỉ rõ bằng chứng vì sao sinh viên này lại phù hợp với ngành *Khoa học Dữ liệu & Trí tuệ Nhân tạo* nhờ điểm Toán 3.8 và thiên hướng Nghiên cứu vượt trội.
> - Bấm nút **'Sinh Lộ trình'**, mô hình Qwen 2.5 trên máy HPC sẽ tự động xây dựng cây lộ trình 3 giai đoạn, chỉ rõ từng môn học, chứng chỉ và đồ án thực chiến cần làm để bù đắp các kỹ năng còn thiếu.
>
> Sản phẩm hiện đã được đóng gói hoàn thiện và chạy thực tế trên tên miền chính thức `majormatch.vanhoang.online`."

---

### [04:00 - 04:30] KẾT LUẬN & ĐỊNH HƯỚNG

> "Tóm lại, MajorMatch không chỉ là một công cụ định hướng nghề nghiệp, mà là một giải pháp chuyển đổi số thiết thực hỗ trợ đắc lực cho công tác cố vấn học tập tại các trường đại học. Trong thời gian tới, nhóm hướng tới việc kết nối dữ liệu tuyển dụng thực tế từ các doanh nghiệp và tích hợp tính năng phỏng vấn thử bằng giọng nói với AI.
>
> Em xin chân thành cảm ơn quý thầy cô và các bạn đã lắng nghe. Em xin sẵn sàng nhận câu hỏi từ hội đồng!"

---

## 🎯 BẢNG GỢI Ý CÂU HỎI THƯỜNG GẶP (Q&A CHEAT SHEET CHO NHÓM)

| Câu hỏi của Giám khảo / Hội đồng | Ý trả lời cốt lõi nên nêu | Thành viên phụ trách trả lời tốt nhất |
| :--- | :--- | :--- |
| **1. Tại sao không dùng luôn API GPT-4 cho nhanh mà phải dựng HPC và Ollama riêng?** | Để bảo đảm nguyên tắc **Zero-SaaS-Leakage**. Điểm số và học bạ là dữ liệu nhạy cảm theo quy định bảo vệ dữ liệu cá nhân (Nghị định 13/2023). Dùng Local LLM giúp bảo mật 100%, không tốn chi phí token định kỳ và hoàn toàn làm chủ hệ thống. | **Long Nhật** |
| **2. Làm sao đảm bảo mô hình gợi ý đúng chuyên ngành mà không bị ảo giác (hallucination)?** | Nhóm dùng thuật toán định lượng **Cosine Similarity toán học** trên không gian 128D kết hợp ma trận RIASEC để xếp hạng, chứ không để LLM tự đoán mò. LLM chỉ đóng vai trò sinh văn bản lộ trình dựa trên dữ liệu chuẩn RAG từ ChromaDB. Kèm theo tính năng **XAI** giải trình rõ ràng bằng chứng điểm số. | **Long Nhật / Ánh Vy** |
| **3. Nếu máy HPC ở nhà bị mất điện hoặc mất mạng thì trang web có chết không?** | Hệ thống có cơ chế **Fallback nóng trên AWS EC2**. Cổng EC2 đã được tích hợp sẵn engine tính toán cục bộ và CSDL SQLite cache. Nếu HPC mất kết nối, hệ thống sẽ tự động chuyển sang chế độ dự phòng trong vòng 3 giây để người dùng vẫn xem được kết quả. | **Văn Hoàng / Thành viên 4** |
| **4. Cơ sở khoa học của biểu đồ Radar 6 trục là gì?** | 6 trục được chuẩn hóa theo thang điểm 10 từ 2 nguồn: 50% từ điểm số các học phần nền tảng tương ứng và 50% từ trọng số điểm khảo sát tâm lý RIASEC chuẩn của nhà tâm lý học John L. Holland. | **Ánh Vy** |
| **5. PDF in từ Chrome khác gì PDF bình thường mà phải xử lý riêng?** | Chrome Print PDF thường có ký tự BOM, metadata và cấu trúc luồng nhị phân lệch so với offset 0. Nhóm áp dụng chuẩn ISO 32000-1 quét trong 1024 bytes đầu và dùng cơ chế fallback 3 tầng (`pdfplumber` $\rightarrow$ `pypdf`) để đọc sạch 100%. | **Văn Hoàng** |
