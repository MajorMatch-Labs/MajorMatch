# ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (RESTFUL API SPECIFICATION)

## TÊN DỰ ÁN: MAJORMATCH
### Đặc tả Kỹ thuật API, Chuẩn OpenAPI 3.1 và JSON Schema Chi tiết cho Hệ thống Hybrid Cloud
**Mã tài liệu:** MM-DOC-03-API  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. NGUYÊN TẮC THIẾT KẾ VÀ TIÊU CHUẨN KỸ THUẬT CHUNG

* **Kiến trúc giao tiếp:** RESTful API qua giao thức HTTPS (TLS 1.3) và Server-Sent Events (SSE) cho streaming token AI.
* **Định dạng dữ liệu:** Chuẩn dữ liệu trao đổi mặc định là `application/json` (ngoại trừ endpoint tải file nhị phân sử dụng `multipart/form-data`).
* **Múi giờ & Định dạng ngày tháng:** ISO 8601 UTC (`YYYY-MM-DDTHH:mm:ssZ`).
* **Mã lỗi chuẩn hóa:** Tuân thủ đặc tả **RFC 7807 Problem Details for HTTP APIs**.
* **Các Headers bắt buộc:**
  * `X-Request-ID`: Chuỗi UUID duy nhất theo dõi luồng truy vết request (Tracing).
  * `X-MajorMatch-Origin-Secret`: Mã token bí mật xác thực gói tin từ Public PaaS tới Edge Gateway.
  * `Content-Type`: `application/json` hoặc `multipart/form-data`.

---

## 2. DANH MỤC CÁC ENDPOINTS VÀ JSON SCHEMA CHI TIẾT

```text
====================================================================================================
DANH MỤC CÁC ĐIỂM CUỐI (API ENDPOINTS SUMMARY)
====================================================================================================
1. POST /api/v1/profile/upload-transcript  : Tiếp nhận PDF bảng điểm, bóc tách thực thể & lọc PII
2. POST /api/v1/assessment/calculate-match : Tính toán Cosine Similarity, Match Score % & Tọa độ Radar
3. POST /api/v1/roadmap/generate          : RAG ChromaDB & Sinh Lộ trình học tập cá nhân hóa JSON
4. POST /api/v1/chat/stream               : Server-Sent Events (SSE) Streaming Assistant Chatbot
5. GET  /api/v1/curriculum/{major_id}     : Truy vấn khung chương trình đào tạo mẫu (Edge SQLite Cache)
6. GET  /api/v1/health                    : Kiểm tra trạng thái sức khỏe trạm Gateway và GPU Node
====================================================================================================
```

---

### 2.1. Endpoint 1: Bóc tách Bảng điểm PDF (`POST /api/v1/profile/upload-transcript`)

* **Mục đích:** Tiếp nhận tệp PDF bảng điểm hoặc CV, kiểm tra tính hợp lệ, khử định danh PII và trích xuất danh sách môn học kèm điểm số.
* **Content-Type:** `multipart/form-data`
* **Rate Limit:** 10 requests / phút / IP.

#### Cấu trúc Yêu cầu (Request Payload):
* `file`: Binary file (.pdf), dung lượng $\le 10\text{MB}$.
* `document_type`: Chuỗi enum (`"transcript"` hoặc `"cv"`).

#### JSON Schema cho Phản hồi Thành công (`HTTP 200 OK`):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TranscriptParsingResponse",
  "type": "object",
  "required": [
    "request_id",
    "status",
    "parsing_duration_ms",
    "profile_data"
  ],
  "properties": {
    "request_id": { "type": "string", "format": "uuid" },
    "status": { "type": "string", "enum": ["success"] },
    "parsing_duration_ms": { "type": "number", "minimum": 0 },
    "profile_data": {
      "type": "object",
      "required": ["cumulative_gpa", "total_credits", "courses", "detected_skills"],
      "properties": {
        "cumulative_gpa": { "type": "number", "minimum": 0.0, "maximum": 4.0 },
        "total_credits": { "type": "integer", "minimum": 0 },
        "courses": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["course_code", "course_name", "credits", "grade_letter", "grade_point"],
            "properties": {
              "course_code": { "type": "string", "example": "CS102" },
              "course_name": { "type": "string", "example": "Cấu trúc dữ liệu và giải thuật" },
              "credits": { "type": "integer", "minimum": 1, "maximum": 6 },
              "grade_letter": { "type": "string", "enum": ["A+", "A", "B+", "B", "C+", "C", "D+", "D", "F"] },
              "grade_point": { "type": "number", "minimum": 0.0, "maximum": 4.0 }
            }
          }
        },
        "detected_skills": {
          "type": "array",
          "items": { "type": "string" },
          "example": ["Data Structures", "Algorithms", "C++", "Problem Solving"]
        }
      }
    }
  }
}
```

---

### 2.2. Endpoint 2: Tính toán Năng lực & Khoảng cách Kỹ năng (`POST /api/v1/assessment/calculate-match`)

* **Mục đích:** Nhận dữ liệu khảo sát Holland Code, danh sách môn đã học và danh mục ngành quan tâm để tính Cosine Similarity, % phù hợp và tọa độ biểu đồ Radar.
* **Content-Type:** `application/json`

#### JSON Schema cho Yêu cầu Đầu vào (Request Body):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CalculateMatchRequest",
  "type": "object",
  "required": ["holland_scores", "target_career_tags", "courses"],
  "properties": {
    "holland_scores": {
      "type": "object",
      "required": ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"],
      "properties": {
        "realistic": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "investigative": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "artistic": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "social": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "enterprising": { "type": "number", "minimum": 1.0, "maximum": 5.0 },
        "conventional": { "type": "number", "minimum": 1.0, "maximum": 5.0 }
      }
    },
    "target_career_tags": {
      "type": "array",
      "minItems": 1,
      "maxItems": 5,
      "items": { "type": "string" },
      "example": ["AI_ENGINEER", "DATA_SCIENTIST", "BACKEND_DEVELOPER"]
    },
    "courses": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["course_code", "grade_point"],
        "properties": {
          "course_code": { "type": "string" },
          "grade_point": { "type": "number", "minimum": 0.0, "maximum": 4.0 }
        }
      }
    }
  }
}
```

#### JSON Schema cho Phản hồi Thành công (`HTTP 200 OK`):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CalculateMatchResponse",
  "type": "object",
  "required": ["top_matches", "radar_chart_data", "skill_breakdown"],
  "properties": {
    "top_matches": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["major_id", "major_name", "match_percentage", "rank"],
        "properties": {
          "major_id": { "type": "string" },
          "major_name": { "type": "string" },
          "match_percentage": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
          "rank": { "type": "integer", "minimum": 1 }
        }
      }
    },
    "radar_chart_data": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["axis_name", "user_score", "benchmark_score"],
        "properties": {
          "axis_name": { "type": "string", "example": "Core Technical" },
          "user_score": { "type": "number", "minimum": 0.0, "maximum": 10.0 },
          "benchmark_score": { "type": "number", "minimum": 0.0, "maximum": 10.0 }
        }
      }
    },
    "skill_breakdown": {
      "type": "object",
      "required": ["mastered_skills", "developing_skills", "missing_skills"],
      "properties": {
        "mastered_skills": { "type": "array", "items": { "type": "string" } },
        "developing_skills": { "type": "array", "items": { "type": "string" } },
        "missing_skills": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

---

### 2.3. Endpoint 3: Sinh Lộ trình Học tập Cá nhân hóa (`POST /api/v1/roadmap/generate`)

* **Mục đích:** Dùng RAG truy xuất khung môn học tại ChromaDB và gọi mô hình Qwen 2.5 7B sinh cấu trúc cây Milestone theo từng học kỳ.
* **Content-Type:** `application/json`

#### JSON Schema cho Yêu cầu Đầu vào (Request Body):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RoadmapGenerationRequest",
  "type": "object",
  "required": ["target_major_id", "missing_skills", "completed_course_codes", "current_semester"],
  "properties": {
    "target_major_id": { "type": "string", "example": "CS_DATA_AI" },
    "missing_skills": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["Deep Learning", "Docker", "Machine Learning Pipeline"]
    },
    "completed_course_codes": {
      "type": "array",
      "items": { "type": "string" },
      "example": ["CS101", "CS102", "MTH100"]
    },
    "current_semester": { "type": "integer", "minimum": 1, "maximum": 10, "example": 4 }
  }
}
```

#### JSON Schema cho Phản hồi Thành công (`HTTP 200 OK`):
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RoadmapGenerationResponse",
  "type": "object",
  "required": ["target_major", "job_readiness_percentage", "semesters"],
  "properties": {
    "target_major": { "type": "string" },
    "job_readiness_percentage": { "type": "number", "minimum": 0.0, "maximum": 100.0 },
    "semesters": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["semester_number", "semester_title", "recommended_courses", "certifications", "practical_project"],
        "properties": {
          "semester_number": { "type": "integer" },
          "semester_title": { "type": "string" },
          "recommended_courses": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["course_code", "course_name", "credits", "rationale", "prerequisites_satisfied"],
              "properties": {
                "course_code": { "type": "string" },
                "course_name": { "type": "string" },
                "credits": { "type": "integer" },
                "rationale": { "type": "string" },
                "prerequisites_satisfied": { "type": "boolean" }
              }
            }
          },
          "certifications": { "type": "array", "items": { "type": "string" } },
          "practical_project": {
            "type": "object",
            "required": ["project_title", "description", "target_skills"],
            "properties": {
              "project_title": { "type": "string" },
              "description": { "type": "string" },
              "target_skills": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    }
  }
}
```

---

### 2.4. Endpoint 4: Streaming Trợ lý Ảo AI (`POST /api/v1/chat/stream`)

* **Mục đích:** Kênh tương tác thời gian thực với mô hình Qwen 2.5 7B, phục vụ giải thích chi tiết lộ trình và tư vấn môn học.
* **Giao thức phản hồi:** `text/event-stream` (Server-Sent Events)

#### Cấu trúc Gói tin Yêu cầu (Request Body JSON):
```json
{
  "conversation_id": "8f3b2d10-482a-4a8e-9912-88ef11029c11",
  "message": "Tại sao em nên học môn Giải thuật nâng cao trước khi học Khai phá dữ liệu?",
  "context": {
    "target_major": "Data Science",
    "current_gpa": 3.42,
    "missing_skills": ["Data Mining", "Graph Algorithms"]
  }
}
```

#### Định dạng Gói tin Stream Trả về (SSE Protocol):
```text
event: message
data: {"token": "Chào ", "done": false}

event: message
data: {"token": "bạn, ", "done": false}

event: message
data: {"token": "môn Giải thuật nâng cao là điều kiện tiên quyết...", "done": false}

event: message
data: {"token": "", "done": true, "tokens_per_second": 48.2}
```

---

### 2.5. Endpoint 5: Tra cứu Khung Chương trình Chuẩn (`GET /api/v1/curriculum/{major_id}`)

* **Mục đích:** Phục vụ dữ liệu tĩnh về cây chương trình đào tạo của từng ngành, được xử lý và trả về từ cache SQLite trên Edge Gateway.
* **Query Parameters:** `school_code` (string, ví dụ: `"DUT"`, `"HUST"`).
* **Thời gian phản hồi:** $\le 15\text{ms}$.

---

### 2.6. Endpoint 6: Kiểm tra Tình trạng Hệ thống (`GET /api/v1/health`)

* **Mục đích:** Monitoring sức khỏe trạm tính toán, dung lượng RAM và VRAM GPU.
* **JSON Schema Phản hồi (`HTTP 200 OK`):**
```json
{
  "status": "healthy",
  "gateway_node": {
    "device": "Linux Edge Gateway Node",
    "os": "Ubuntu 22.04 LTS",
    "sqlite_cache_size_kb": 1420
  },
  "private_compute_node": {
    "device": "Private HPC Compute Node",
    "gpu_status": "NVIDIA CUDA GPU",
    "vram_used_mb": 5214,
    "vram_total_mb": 8188,
    "ollama_status": "online",
    "active_model": "qwen2.5:7b-instruct-q4_k_m"
  }
}
```

---

## 3. CHUẨN ĐỊNH DẠNG BÁO LỖI HỆ THỐNG (RFC 7807 ERROR SPECIFICATION)

Mọi mã trạng thái lỗi HTTP ($4xx, 5xx$) bắt buộc phải trả về cấu trúc đối tượng JSON theo chuẩn sau:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "ProblemDetails",
  "type": "object",
  "required": ["type", "title", "status", "detail", "instance"],
  "properties": {
    "type": { "type": "string", "example": "https://majormatch.vn/errors/rate-limit-exceeded" },
    "title": { "type": "string", "example": "Too Many Requests" },
    "status": { "type": "integer", "example": 429 },
    "detail": { "type": "string", "example": "Vượt quá giới hạn 10 requests/phút. Vui lòng thử lại sau 32 giây." },
    "instance": { "type": "string", "example": "/api/v1/assessment/calculate-match" },
    "timestamp": { "type": "string", "format": "date-time" },
    "retry_after_seconds": { "type": "integer", "example": 32 }
  }
}
```
