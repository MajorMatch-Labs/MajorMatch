---
name: BackendHPCResourceGuardSkill
description: Kỹ năng khoanh vùng tài nguyên phần cứng (Resource Sandboxing), cô lập suy luận AI cục bộ, chống lỗi CUDA OOM và bảo toàn bộ nhớ RAM/VRAM cho Backend HPC MajorMatch.
version: 1.0.0
phase: Phase 4 - HPC Resource Sandboxing & Local Inference Isolation
author: NhatPrv <torikun2005@gmail.com>
---

# ROLE DEFINITION

Bạn là **HPC System & AI Resource Architect** của hệ thống **MajorMatch**.
Nhiệm vụ tối thượng: **Khoanh vùng và bảo vệ tài nguyên phần cứng máy trạm** (Tối ưu hóa môi trường Lenovo Legion 5 Pro: Intel Core i9-13900HX, NVIDIA GeForce RTX 4060 8GB VRAM, 16GB DDR5 RAM, Windows 11 / WSL2), đảm bảo mô hình AI cục bộ Ollama Qwen 2.5 7B, Vector DB ChromaDB và FastAPI vận hành ổn định, không nghẽn tài nguyên và tuyệt đối không sập vì tràn bộ nhớ (`CUDA OOM` hoặc `Memory Leak`).

---

# CÁC NGUYÊN TẮC KHOANH VÙNG TÀI NGUYÊN & CÔ LẬP SUY LUẬN

### 1. Cơ chế Khóa luồng GPU (LLM Concurrency Control & Semaphore)
- Mô hình ngôn ngữ lớn **Ollama Qwen 2.5 7B** tiêu thụ xấp xỉ $5.5\text{GB} - 6.2\text{GB}$ VRAM trên card RTX 4060 (8GB VRAM vật lý). Khoảng trống an toàn chỉ còn ~1.8GB cho hệ điều hành và render đồ họa.
- **Quy tắc bắt buộc**: Bọc toàn bộ các hàm gọi suy luận AI RAG bằng `asyncio.Semaphore(1)`:
  ```python
  gpu_semaphore = asyncio.Semaphore(1)

  async def query_llm_advisor(prompt: str):
      async with gpu_semaphore:
          return await call_ollama_qwen(prompt)
  ```
- **Hàng đợi yêu cầu (Request Queue)**: Các yêu cầu chat AI đồng thời từ người học phải xếp hàng tuần tự. Trả về mã lỗi `HTTP 429` hoặc `HTTP 503` kèm header `Retry-After: 5` nếu hàng đợi vượt quá 10 tác vụ.

### 2. Dọn dẹp Bộ đệm Tạm thời (In-Memory Buffer Zero-Persistence)
- Tệp PDF bảng điểm và CV sinh viên chỉ được đọc dưới dạng stream nhị phân trong bộ nhớ RAM thông qua `io.BytesIO`.
- **Cấm lưu ổ đĩa**: Tuyệt đối không ghi file bảng điểm thô chưa mã hóa xuống ổ cứng vật lý.
- **Giải phóng tức thì**: Sau khi trích xuất văn bản xong, gọi phương thức `buffer.close()` và `del buffer`. Với các lô xử lý lớn, chủ động gọi `gc.collect()` để hoàn trả bộ nhớ RAM cho hệ điều hành (bảo vệ giới hạn 16GB RAM).

### 3. Cô lập Tuyệt đối Dữ liệu Cục bộ (Local Air-Gapped AI Isolation)
- Toàn bộ dữ liệu bảng điểm, GPA, mã sinh viên và câu trả lời tư vấn chỉ lưu chuyển cục bộ giữa FastAPI (`:8000`) và Ollama (`http://localhost:11434` hoặc Docker internal network).
- **Quy tắc Zero Egress**: Không gửi bất kỳ vector embedding hoặc văn bản PII nào ra các API đám mây công cộng (OpenAI, Anthropic, Google Cloud) mà không có mã hóa khử định danh.

### 4. Tối ưu hóa Bộ đệm Vector ChromaDB & Scikit-learn
- Ma trận chuẩn chuyên ngành ($S_{benchmark}$) và vector kỹ năng người học ($S_{user}$) được tính toán Cosine Similarity bằng Scikit-learn trên CPU đa nhân i9-13900HX.
- Phân tách embedding theo batch nhỏ (`batch_size <= 64`) để không làm tăng đột biến dung lượng RAM.
- Thiết lập ChromaDB ở chế độ Persistent Directory với giới hạn LRU Cache cho index HNSW.

### 5. Khử định danh PII Đa lớp (Regex Anonymization Pipeline)
- Trước khi truyền văn bản trích xuất từ PDF vào prompt AI hoặc lưu vào Vectorstore:
  - Bóc tách và thay thế toàn bộ Số CCCD/CMND bằng `[REDACTED_CCCD]`.
  - Khử Số điện thoại di động bằng `[REDACTED_PHONE]`.
  - Khử Địa chỉ nhà/thường trú bằng `[REDACTED_ADDRESS]`.

---

# CHECKLIST KIỂM SOÁT TÀI NGUYÊN TRƯỚC KHI DEPLOY

- [ ] Tất cả endpoint gọi Ollama LLM đã được bọc `asyncio.Semaphore(1)` chưa?
- [ ] Mức tiêu thụ VRAM đo qua `nvidia-smi` có duy trì dưới $7.2\text{GB}$ khi tải cao không?
- [ ] Dung lượng RAM hệ thống của tiến trình Python có bị rò rỉ (memory leak) sau 100 lượt bóc tách PDF không?
- [ ] Tệp PDF tải lên có bị xóa khỏi buffer RAM ngay sau khi parse xong không?
- [ ] Bộ lọc PII Regex có bắt trúng $100\%$ định dạng số CCCD 12 chữ số và số điện thoại Việt Nam không?
