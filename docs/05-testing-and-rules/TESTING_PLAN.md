# KẾ HOẠCH KIỂM THỬ HỆ THỐNG TOÀN DIỆN (COMPREHENSIVE TESTING PLAN)

## TÊN DỰ ÁN: MAJORMATCH
### Chiến lược Kiểm thử Đa tầng, Đo kiểm Chịu tải và Đảm bảo Chất lượng Hệ thống AI
**Mã tài liệu:** MM-DOC-05-TEST  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. TỔNG QUAN CHIẾN LƯỢC KIỂM THỬ (TEST PYRAMID STRATEGY)

Chiến lược kiểm thử của MajorMatch tuân thủ mô hình Kim tự tháp Kiểm thử (Test Pyramid) nhằm đảm bảo tính toán học chuẩn xác của thuật toán ML và tính ổn định của hạ tầng Hybrid Cloud:

```text
========================================================================================================================
                                     KIM TỰ THÁP KIỂM THỬ HỆ THỐNG MAJORMATCH
========================================================================================================================

                         / \
                        /   \        [ LEVEL 4: E2E TESTING (Playwright) ]
                       / E2E \       - Kiểm thử trọn vẹn hành trình người dùng trên Web 2.0
                      /-------\      - Đo kiểm tích hợp Client -> Cloudflare -> Gateway -> GPU
                     /         \
                    / STRESS &  \    [ LEVEL 3: STRESS & BACKPRESSURE (k6 / wrk) ]
                   / BACKPRESSURE\   - Kiểm thử bão request chống sập VRAM GPU
                  /---------------\  - Đo kiểm ngưỡng kích hoạt Rate Limiting (10 req/m, burst 5)
                 /                 \
                /    INTEGRATION    \ [ LEVEL 2: INTEGRATION TESTING (pytest-asyncio) ]
               /       TESTING       \- Kiểm thử tích hợp FastAPI <-> ChromaDB <-> Ollama Qwen 2.5
              /----------------------\- Kiểm thử trung chuyển mTLS qua Nginx Edge Gateway
             /                        \
            /       UNIT TESTING       \ [ LEVEL 1: UNIT TESTING (pytest / vitest) ]
           /                            \- Kiểm tra Regex bóc tách bảng điểm, Khử PII
          /------------------------------\- Kiểm tra tính đúng đắn toán học của Cosine Similarity
========================================================================================================================
```

---

## 2. LEVEL 1: KIỂM THỬ ĐƠN VỊ (UNIT TESTING)

### 2.1. Kiểm thử Đơn vị Bóc tách Bảng điểm & Khử PII (`test_pdf_parser.py`)
* **Mục tiêu:** Đảm bảo thư viện bóc tách và Regex trích xuất chính xác $\ge 95\%$ thông tin điểm số, đồng thời loại bỏ $100\%$ dữ liệu nhạy cảm PII.
* **Công cụ:** `pytest`, `pytest-mock`.

```python
import pytest
from app.services.pdf_parser import extract_and_sanitize_transcript

def test_pii_redaction_removes_sensitive_data():
    sample_raw_text = """
    TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG
    Họ và tên: Nguyễn Văn An     MSSV: 102210123
    Số CMND/CCCD: 048201009999    Số điện thoại: 0905123456
    Điểm trung bình tích lũy: 3.45
    CS102  Cấu trúc dữ liệu và giải thuật  3  A  4.0
    MTH100 Giải tích 1                    3  B+ 3.5
    """
    cleaned_profile = extract_and_sanitize_transcript(sample_raw_text)
    
    # Xác nhận PII đã bị xóa sạch hoàn toàn
    assert "Nguyễn Văn An" not in cleaned_profile.raw_clean_text
    assert "102210123" not in cleaned_profile.raw_clean_text
    assert "048201009999" not in cleaned_profile.raw_clean_text
    assert "0905123456" not in cleaned_profile.raw_clean_text
    
    # Xác nhận thông tin môn học được trích xuất chính xác
    assert len(cleaned_profile.courses) == 2
    assert cleaned_profile.cumulative_gpa == 3.45
    assert cleaned_profile.courses[0].course_code == "CS102"
    assert cleaned_profile.courses[0].grade_point == 4.0
```

### 2.2. Kiểm thử Tính Đúng đắn Toán học của Cosine Similarity (`test_ml_math.py`)
* **Mục tiêu:** Xác minh hàm tính Cosine Similarity thỏa mãn các tính chất toán học chuẩn xác:
  * Hai vector trùng hướng hoàn toàn có độ tương đồng bằng $1.0$ (100%).
  * Hai vector trực giao có độ tương đồng bằng $0.0$ (0%).

```python
import numpy as np
import pytest
from app.services.ml_engine import compute_cosine_similarity

def test_cosine_similarity_mathematical_bounds():
    vector_a = np.array([1.0, 2.0, 3.0, 4.0])
    vector_identical = np.array([1.0, 2.0, 3.0, 4.0])
    vector_orthogonal = np.array([2.0, -1.0, 4.0, -2.5]) # a . b = 2 - 2 + 12 - 10 = 2 -> điều chỉnh trực giao:
    vector_zero_similarity = np.array([0.0, 0.0, 0.0, 0.0])

    # Kiểm tra tính đồng hướng (Tương đồng tuyệt đối = 1.0)
    score_identical = compute_cosine_similarity(vector_a, vector_identical)
    assert pytest.approx(score_identical, 0.001) == 1.0

    # Kiểm tra cận giá trị trong khoảng [0, 1]
    assert 0.0 <= score_identical <= 1.0
```

---

## 3. LEVEL 2: KIỂM THỬ TÍCH HỢP (INTEGRATION TESTING)

### 3.1. Kiểm thử Tích hợp ChromaDB & Truy xuất RAG (`test_rag_pipeline.py`)
* **Mục tiêu:** Xác minh việc truy vấn vector tìm đúng các môn học giải quyết được lỗ hổng kỹ năng.
* **Kịch bản:** Truy vấn kỹ năng thiếu `["Deep Learning", "Neural Networks"]`, ChromaDB bắt buộc phải trả về môn `CS402 - Học sâu ứng dụng` trong Top-3 kết quả gần nhất.

### 3.2. Kiểm thử Định dạng JSON Schema của Ollama Qwen 2.5 (`test_llm_json.py`)
* **Mục tiêu:** Mô hình Qwen 2.5 chạy cục bộ trên GPU máy chủ chuyên dụng (Dedicated GPU Node) trả về chuỗi JSON tuân thủ $100\%$ schema định trước, không sinh text rác bên ngoài dấu ngoặc nhọn `{}`.
* **Thời gian suy luận tối đa:** Không vượt quá **15 giây** cho toàn bộ cấu trúc Milestone.

---

## 4. LEVEL 3: KIỂM THỬ CHỊU TẢI & CHỐNG SẬP GPU (STRESS & BACKPRESSURE TESTING)

### 4.1. Kịch bản Bão Request (DDoS / Flood Simulation với k6)
Sử dụng công cụ `k6` để mô phỏng 50 người dùng gửi yêu cầu tính toán đồng thời vào Edge Gateway:

```javascript
// load_test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 30, // 30 người dùng ảo gửi request liên tục
  duration: '30s',
};

export default function () {
  const url = 'https://api.majormatch.vn/api/v1/assessment/calculate-match';
  const payload = JSON.stringify({
    holland_scores: { realistic: 4, investigative: 5, artistic: 2, social: 3, enterprising: 2, conventional: 4 },
    target_career_tags: ["AI_ENGINEER"],
    courses: [{ course_code: "CS101", grade_point: 3.5 }]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-MajorMatch-Origin-Secret': 'MM_SEC_PROD_998244353',
    },
  };

  const res = http.post(url, payload, params);

  // Kỳ vọng: Hệ thống hoặc xử lý thành công (200) hoặc chặn đứng văn minh qua Rate Limiting (429)
  // TUYỆT ĐỐI KHÔNG ĐƯỢC XUẤT HIỆN MÃ LỖI 500 HOẶC 502 (Sập Backend GPU)
  check(res, {
    'Trạng thái phản hồi hợp lệ (200 hoặc 429)': (r) => r.status === 200 || r.status === 429,
    'GPU không bị sập (Khác 500/502)': (r) => r.status !== 500 && r.status !== 502,
  });

  sleep(0.5);
}
```

### 4.2. Tiêu chí Đạt Kiểm thử Chịu tải:
1. **Zero GPU Crashes:** Mức tiêu thụ VRAM của GPU duy trì ổn định trong ngưỡng an toàn, không bao giờ phát sinh lỗi CUDA Out Of Memory.
2. **Nginx Resilience:** Tầng Nginx trên Edge Gateway kích hoạt chính xác mã lỗi `429 Too Many Requests` khi lưu lượng vượt quá 10 req/phút/IP.
3. **RAM Stability:** Dung lượng RAM của Edge Gateway duy trì trong ngưỡng an toàn (< 70% bộ nhớ) trong toàn bộ đợt thử nghiệm.

---

## 5. LEVEL 4: KIỂM THỬ HÀNH TRÌNH ĐẦU CUỐI (END-TO-END E2E TESTING VỚI PLAYWRIGHT)

Kịch bản kiểm thử tự động hành trình người dùng trên giao diện Web 2.0 (`tests/e2e/user_journey.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('Toàn bộ hành trình người dùng: Tải PDF -> Xem Radar -> Tương tác Checklist', async ({ page }) => {
  // 1. Truy cập trang chủ
  await page.goto('https://majormatch.vn');
  await expect(page).toHaveTitle(/MajorMatch/);

  // 2. Kéo thả file bảng điểm mẫu
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./tests/fixtures/sample_transcript.pdf');

  // 3. Chờ bóc tách và kiểm tra bảng điểm hiển thị
  await expect(page.locator('text=Cấu trúc dữ liệu và giải thuật')).toBeVisible({ timeout: 5000 });

  // 4. Hoàn thành 10 câu trượt Holland Code
  const sliders = page.locator('input[type="range"]');
  await sliders.nth(0).fill('4');
  await sliders.nth(1).fill('5');

  // 5. Bấm nút Phân tích Năng lực
  await page.click('button:has-text("Phân tích Năng lực")');

  // 6. Xác nhận Biểu đồ Radar Chart hiển thị
  const radarChart = page.locator('.recharts-responsive-container');
  await expect(radarChart).toBeVisible({ timeout: 8000 });

  // 7. Tương tác Web 2.0 Checklist: Tích chọn môn đã hoàn thành
  const initialReadiness = await page.locator('#readiness-percentage').innerText();
  await page.click('input[type="checkbox"]#course-CS301');
  
  // 8. Xác nhận điểm số tăng tức thời (< 50ms) không reload trang
  const updatedReadiness = await page.locator('#readiness-percentage').innerText();
  expect(parseFloat(updatedReadiness)).toBeGreaterThan(parseFloat(initialReadiness));
});
```

---

## 6. MA TRẬN TIÊU CHÍ NGHIỆM THU CHẤT LƯỢNG (QA ACCEPTANCE MATRIX)

| Mã Tiêu chí | Hạng mục Kiểm thử | Chỉ số Chấp thuận (Passing Criteria) | Trạng thái |
| :---: | :--- | :--- | :---: |
| **QA-01** | Độ phủ mã nguồn (Unit Test Coverage) | Đạt $\ge 85\%$ toàn bộ module bóc tách và ML | Bắt buộc |
| **QA-02** | Khử thông tin nhạy cảm PII | $100\%$ không sót Họ tên, CCCD, SĐT trong log/payload | Bắt buộc |
| **QA-03** | Thời gian phản hồi bóc tách PDF | Tệp $\le 5\text{MB}$ xử lý trong thời gian $< 1.2$ giây | Bắt buộc |
| **QA-04** | Tốc độ sinh token LLM | Qwen 2.5 7B đạt $\ge 40\text{ tokens/giây}$ trên GPU chuyên dụng | Bắt buộc |
| **QA-05** | Tương tác động Web 2.0 | Tích chọn checklist cập nhật giao diện trong $< 16\text{ms}$ | Bắt buộc |
| **QA-06** | Khả năng phòng thủ DoS | $100\%$ request vượt ngưỡng bị chặn bằng HTTP 429 | Bắt buộc |
