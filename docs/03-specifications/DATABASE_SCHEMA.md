# LƯỢC ĐỒ CƠ SỞ DỮ LIỆU VÀ LƯU TRỮ PHÂN TÁN (DATABASE & VECTOR SCHEMA)

## TÊN DỰ ÁN: MAJORMATCH
### Thiết kế Lược đồ Dữ liệu Đa tầng (Polyglot Persistence): Edge SQLite, Local ChromaDB và Client State
**Mã tài liệu:** MM-DOC-03-DB  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. TỔNG QUAN CHIẾN LƯỢC LƯU TRỮ ĐA TẦNG (POLYGLOT PERSISTENCE)

Hệ thống MajorMatch không sử dụng một cơ sở dữ liệu quan hệ tập trung cồng kềnh trên Cloud nhằm triệt tiêu nguy cơ rò rỉ dữ liệu nhạy cảm và tối ưu hóa tốc độ truy xuất. Thay vào đó, kiến trúc lưu trữ được chia làm 3 tầng:

```text
========================================================================================================================
                                     CHIẾN LƯỢC LƯU TRỮ DỮ LIỆU ĐA TẦNG MAJORMATCH
========================================================================================================================

 [ TẦNG 1: CLIENT RUNTIME (Zustand Store) ]
  - Lưu trữ: Dynamic State, checklist môn học đã hoàn thành, tọa độ Radar Chart tức thời
  - Vị trí: Bộ nhớ RAM Trình duyệt & `localStorage`
  - Cơ chế: Optimistic State Update (< 16ms)
                            │
                            ▼
 [ TẦNG 2: EDGE GATEWAY (Joy 3 - SQLite Database) ]
  - Lưu trữ: Danh mục môn học tĩnh, khung chương trình đào tạo mẫu, bộ đệm kết quả ML tĩnh
  - Vị trí: Tệp tin cục bộ `/var/data/majormatch/cache.db`
  - Cơ chế: Read-Heavy SQLite WAL Mode (< 15ms latency)
                            │
                            ▼
 [ TẦNG 3: PRIVATE HPC NODE (ChromaDB Vector Store & RAM-disk) ]
  - Lưu trữ Vector: Tri thức đề cương chi tiết môn học, JD chuẩn ngành (1024-dim Embeddings)
  - Lưu trữ Tạm: Bảng điểm PDF và dữ liệu phiên làm việc (`/tmp/majormatch_ephemeral/`)
  - Cơ chế: HNSW Vector Indexing & Ephemeral RAM Memory Cleanup
========================================================================================================================
```

---

## 2. LƯỢC ĐỒ CƠ SỞ DỮ LIỆU SQLITE TẠI EDGE GATEWAY (JOY 3)

Cơ sở dữ liệu SQLite (`cache.db`) đặt tại Vsmart Joy 3 sử dụng chế độ **Write-Ahead Logging (WAL)** để tối ưu hóa khả năng đọc đồng thời từ Nginx.

```sql
-- Kích hoạt chế độ WAL và tối ưu bộ nhớ đệm
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- ============================================================================
-- 1. BẢNG KHUNG CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN (cached_curricula)
-- Lưu trữ cấu trúc đào tạo của từng chuyên ngành theo từng trường đại học
-- ============================================================================
CREATE TABLE IF NOT EXISTS cached_curricula (
    curriculum_id       TEXT PRIMARY KEY,                  -- UUID định danh khung chương trình
    school_code         TEXT NOT NULL,                     -- Mã trường (ví dụ: 'DUT', 'HUST', 'VNU')
    major_id            TEXT NOT NULL,                     -- Mã ngành (ví dụ: 'CS_DATA_AI')
    major_name          TEXT NOT NULL,                     -- Tên chuyên ngành đào tạo
    total_credits       INTEGER NOT NULL,                  -- Tổng số tín chỉ toàn khóa
    curriculum_tree     TEXT NOT NULL,                     -- Chuỗi JSON cấu trúc cây học kỳ & môn học
    checksum_sha256     TEXT NOT NULL,                     -- Mã băm kiểm tra tính toàn vẹn dữ liệu
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_curricula_lookup 
ON cached_curricula (school_code, major_id);

-- ============================================================================
-- 2. BẢNG DANH MỤC MÔN HỌC CHI TIẾT (course_catalog)
-- Danh mục môn học phục vụ tra cứu nhanh và kiểm tra môn tiên quyết
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_catalog (
    course_code         TEXT PRIMARY KEY,                  -- Mã môn học chuẩn hóa (ví dụ: 'CS102')
    course_name         TEXT NOT NULL,                     -- Tên môn học tiếng Việt
    course_name_en      TEXT,                              -- Tên môn học tiếng Anh
    credits             INTEGER NOT NULL CHECK(credits > 0),
    is_core_major       BOOLEAN DEFAULT 1,                 -- 1: Môn cơ sở/chuyên ngành, 0: Đại cương
    prerequisites_json  TEXT NOT NULL DEFAULT '[]',        -- Mảng JSON chứa danh sách mã môn tiên quyết
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_code 
ON course_catalog (course_code);

-- ============================================================================
-- 3. BẢNG BỘ ĐỆM PHÂN TÍCH HỒ SƠ TĨNH (profile_hash_cache)
-- Lưu kết quả tính toán định lượng của các bộ hồ sơ mẫu hoặc trùng lặp mã hash
-- ============================================================================
CREATE TABLE IF NOT EXISTS profile_hash_cache (
    profile_hash        TEXT PRIMARY KEY,                  -- SHA-256(courses + grades + holland_scores)
    match_result_json   TEXT NOT NULL,                     -- Kết quả tính toán ML & Top ngành phù hợp
    radar_coords_json   TEXT NOT NULL,                     -- Tọa độ 6 trục biểu đồ Radar Chart
    hit_count           INTEGER DEFAULT 1,                 -- Số lần truy cập trúng cache
    expires_at          DATETIME NOT NULL,                 -- Thời điểm hết hạn cache (TTL: 7 ngày)
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cache_expiry 
ON profile_hash_cache (expires_at);

-- ============================================================================
-- 4. BẢNG NHẬT KÝ LƯU LƯỢNG MẠNG BIÊN (gateway_audit_logs)
-- Phục vụ giám sát lưu lượng và phát hiện hành vi spam / tấn công
-- ============================================================================
CREATE TABLE IF NOT EXISTS gateway_audit_logs (
    log_id              INTEGER PRIMARY KEY AUTOINCREMENT,
    client_ip_hash      TEXT NOT NULL,                     -- Mã hash ẩn danh IP của client
    request_endpoint    TEXT NOT NULL,                     -- Đường dẫn API được gọi
    http_method         TEXT NOT NULL,                     -- POST / GET
    response_status     INTEGER NOT NULL,                  -- Mã HTTP trả về (200, 429, 500)
    processing_time_ms  REAL NOT NULL,                     -- Thời gian phản hồi tính bằng ms
    timestamp           DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_time 
ON gateway_audit_logs (timestamp);
```

---

## 3. LƯỢC ĐỒ VECTOR DATABASE CHROMADB TẠI PRIVATE HPC NODE

ChromaDB được triển khai cục bộ để phục vụ kỹ thuật RAG (Retrieval-Augmented Generation). Không gian vector sử dụng mô hình embedding `bge-m3` với chiều vector $D = 1024$.

```text
====================================================================================================
CẤU TRÚC VECTOR COLLECTIONS TRONG CHROMADB
====================================================================================================
1. Collection: `curriculum_courses`
   - Nhiệm vụ: Chứa đề cương, kiến thức và chuẩn đầu ra từng môn học của trường đại học.
2. Collection: `industry_skill_benchmarks`
   - Nhiệm vụ: Chứa bản mô tả công việc (JD), kỹ năng yêu cầu thực tế từ các doanh nghiệp công nghệ.
====================================================================================================
```

### 3.1. Chi tiết Collection 1: `curriculum_courses`
* **Embedding Distance Metric:** `Cosine Distance` ($1 - \text{CosineSimilarity}$).
* **Index Configuration (HNSW):**
  * `hnsw:space`: `"cosine"`
  * `hnsw:construction_ef`: `64` (Độ chính xác khi xây dựng đồ thị)
  * `hnsw:M`: `16` (Số liên kết tối đa trên mỗi đỉnh đồ thị)

#### Cấu trúc Siêu dữ liệu (Metadata Schema):
```json
{
  "course_code": { "type": "string", "example": "CS301" },
  "course_name": { "type": "string", "example": "Trí tuệ Nhân tạo" },
  "major_id": { "type": "string", "example": "CS_DATA_AI" },
  "credits": { "type": "integer", "example": 3 },
  "semester_recommended": { "type": "integer", "example": 5 },
  "is_mandatory": { "type": "boolean", "example": true },
  "prerequisites": { "type": "string", "example": "CS102,MTH100" }
}
```

#### Cấu trúc Văn bản Nhúng (Document Text Template):
```text
Môn học: Trí tuệ Nhân tạo (CS301). Số tín chỉ: 3.
Khối kiến thức: Chuyên ngành Khoa học Máy tính & Dữ liệu.
Điều kiện tiên quyết: Cấu trúc dữ liệu và giải thuật (CS102), Giải tích và Đại số tuyến tính (MTH100).
Chuẩn đầu ra kiến thức:
- Nắm vững các thuật toán tìm kiếm không gian trạng thái (A*, BFS, DFS, Alpha-Beta Pruning).
- Hiểu và áp dụng mô hình tri thức logic mệnh đề, suy luận mờ.
- Lập trình xây dựng thuật toán Machine Learning cơ bản và tối ưu hàm mất mát bằng Gradient Descent.
Kỹ năng bổ trợ: Python, PyTorch, NumPy, Thuật toán tối ưu hóa.
```

---

### 3.2. Chi tiết Collection 2: `industry_skill_benchmarks`
* **Nhiệm vụ:** Ánh xạ từ các chức danh nghề nghiệp thực tế sang tập hợp kỹ năng tiêu chuẩn để đo lường Skill Gap.

#### Cấu trúc Siêu dữ liệu (Metadata Schema):
```json
{
  "career_id": { "type": "string", "example": "DATA_SCIENTIST" },
  "career_title": { "type": "string", "example": "Junior Data Scientist" },
  "domain": { "type": "string", "example": "Artificial Intelligence & Analytics" },
  "experience_level": { "type": "string", "enum": ["Intern", "Junior", "Middle"] },
  "updated_year": { "type": "integer", "example": 2026 }
}
```

#### Cấu trúc Văn bản Nhúng (Document Text Template):
```text
Vị trí tiêu chuẩn: Junior Data Scientist / Kỹ sư Khoa học Dữ liệu.
Yêu cầu chuyên môn cốt lõi:
- Nền tảng toán học vững chắc: Xác suất thống kê, Đại số tuyến tính ma trận, Tối ưu hóa vi phân.
- Thành thạo ngôn ngữ lập trình Python và hệ sinh thái xử lý dữ liệu: Pandas, NumPy, Scikit-learn.
- Có kinh nghiệm thực nghiệm xây dựng pipeline Machine Learning từ tiền xử lý, trích xuất đặc trưng (Feature Engineering) đến huấn luyện và đánh giá mô hình.
- Nắm rõ kiến thức cơ sở dữ liệu SQL để truy vấn và tổng hợp dữ liệu quy mô lớn.
Kỹ năng nâng cao: Deep Learning cơ bản (CNN, RNN, Transformers), Docker containerization, Git version control.
```

---

## 4. LƯỢC ĐỒ QUẢN TRỊ TRẠNG THÁI CLIENT WEB 2.0 (ZUSTAND STORE)

Giao diện Web 2.0 tại Client quản lý trạng thái động thông qua giao diện TypeScript chặt chẽ:

```typescript
// Định nghĩa cấu trúc trạng thái trong Zustand Store (store/useWorkspaceStore.ts)

export interface CourseItem {
  courseCode: string;
  courseName: string;
  credits: number;
  gradePoint: number;
  isCompleted: boolean;
}

export interface RadarAxis {
  axisName: string;
  userScore: number;
  benchmarkScore: number;
}

export interface WorkspaceState {
  // Trạng thái dữ liệu người dùng
  studentGpa: number;
  hollandScores: Record<string, number>;
  selectedCareerTag: string;
  
  // Dữ liệu lộ trình và môn học
  activeCourses: CourseItem[];
  radarData: RadarAxis[];
  jobReadinessPercentage: number;
  
  // Hành động cập nhật động Web 2.0 (Optimistic Updates)
  toggleCourseCompletion: (courseCode: string) => void;
  recalculateMetricsLocally: () => void;
  updateCareerTag: (tag: string) => void;
  resetWorkspace: () => void;
}
```

---

## 5. QUY TRÌNH DỌN DẸP DỮ LIỆU TẠM VÀ BẢO MẬT BỘ NHỚ (EPHEMERAL CLEANUP)

Nhằm đảm bảo tuân thủ tuyệt đối nguyên tắc **Zero-Knowledge Data Privacy**:
1. **Dọn dẹp tệp tin vật lý:** Sau khi hàm trích xuất `pdfplumber` trả về dữ liệu, file tạm tại `/tmp/majormatch_ephemeral/<request_id>.pdf` lập tức bị xóa thông qua lệnh hệ thống `os.unlink()` bên trong khối lệnh `finally` của Python.
2. **Dọn dẹp rác bộ nhớ (Garbage Collection):** Gọi tường minh `gc.collect()` trong backend FastAPI sau khi xử lý xong các file PDF có dung lượng lớn để giải phóng RAM ngay lập tức, ngăn ngừa hiện tượng rò rỉ bộ nhớ (Memory Leak) trên môi trường 16GB RAM của Laptop Legion.
