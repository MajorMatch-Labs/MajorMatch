# QUY TẮC PHÁT TRIỂN VÀ CHUẨN MỰC MÃ NGUỒN (CODING CONVENTIONS & ENGINEERING STANDARDS)

## TÊN DỰ ÁN: MAJORMATCH
### Bộ Quy chuẩn Lập trình Đa ngôn ngữ (Polyglot Engineering), Quản trị Bộ nhớ và Văn hóa Git
**Mã tài liệu:** MM-DOC-05-RULES  
**Phiên bản:** 1.0.0  
**Tác giả:** Chief Cloud Solutions Architect & Technical Lead  
**Ngày phê duyệt:** 05/09/2026  

---

## 1. NGUYÊN TẮC KỸ THUẬT CỐT LÕI (CORE ENGINEERING PRINCIPLES)

Toàn bộ các lập trình viên tham gia phát triển dự án MajorMatch bắt buộc phải tuân thủ 4 nguyên tắc kỹ thuật bất biến:
1. **Type Safety First (Ưu tiên an toàn kiểu dữ liệu):** Bắt buộc sử dụng kiểu dữ liệu tường minh (Type Hints trong Python và Strict Mode trong TypeScript). Tuyệt đối cấm sử dụng kiểu dữ liệu tự do thiếu kiểm soát (`any` hoặc hàm Python không định nghĩa kiểu).
2. **Resource & Memory Efficiency (Tối ưu hóa tài nguyên và bộ nhớ):** Thiết kế cho môi trường máy trạm 16GB RAM và thiết bị biên 3GB RAM. Mọi luồng xử lý tệp tin hoặc mô hình ma trận lớn phải có cơ chế giải phóng bộ nhớ ngay sau khi hoàn thành.
3. **Deterministic Logic (Tư duy logic tất định):** Các giải thuật toán học và pipeline xử lý AI phải có tính ổn định, dễ tái lập kết quả, kiểm soát chặt chẽ giá trị seed và temperature.
4. **Clean Code & Self-documenting:** Viết mã nguồn rõ ràng, có cấu trúc mô-đun hóa cao, tên hàm và biến phản ánh chính xác nghiệp vụ.

---

## 2. CHUẨN MỰC LẬP TRÌNH PYTHON BACKEND (FASTAPI & ML CORE)

### 2.1. Định dạng Mã nguồn và Type Hinting (PEP 8 & PEP 484)
* Áp dụng công cụ định dạng tự động **Black** (Line length: 88 ký tự) và sắp xếp import bằng **isort**.
* Bắt buộc khai báo Type Hints cho $100\%$ các tham số đầu vào và kiểu dữ liệu trả về của hàm:

```python
# CHUẨN MỰC: Khai báo kiểu tường minh, có Docstring mô tả logic
from typing import List, Dict, Any, Optional
import numpy as np

def calculate_skill_alignment(
    user_vector: np.ndarray,
    benchmark_vector: np.ndarray,
    threshold: float = 0.65
) -> Dict[str, Any]:
    """
    Tính toán độ tương đồng giữa vector năng lực người dùng và chuẩn ngành.

    Args:
        user_vector (np.ndarray): Mảng 1D chứa trọng số kỹ năng người dùng.
        benchmark_vector (np.ndarray): Mảng 1D chứa chuẩn kỹ năng của ngành.
        threshold (float): Ngưỡng chấp nhận đạt chuẩn kỹ năng. Mặc định 0.65.

    Returns:
        Dict[str, Any]: Đối tượng chứa điểm tương đồng và danh sách kỹ năng đạt/chưa đạt.
    """
    dot_product = float(np.dot(user_vector, benchmark_vector))
    norm_user = float(np.linalg.norm(user_vector))
    norm_bench = float(np.linalg.norm(benchmark_vector))

    if norm_user == 0.0 or norm_bench == 0.0:
        return {"similarity": 0.0, "is_qualified": False}

    similarity = dot_product / (norm_user * norm_bench)
    return {
        "similarity": round(similarity, 4),
        "is_qualified": similarity >= threshold
    }
```

### 2.2. Xử lý Bất đồng bộ trong FastAPI (Async/Await Best Practices)
* **Quy tắc vàng:** Các hàm I/O-bound (gọi HTTP tới Ollama, đọc/ghi SQLite) sử dụng `async def`. Các tác vụ tính toán CPU-bound nặng (bóc tách PDF bằng `pdfplumber`, tính toán ma trận `numpy`) bắt buộc phải bọc trong `run_in_threadpool` hoặc hàm đồng bộ `def` tiêu chuẩn để tránh làm block Event Loop chính của FastAPI:

```python
from fastapi import APIRouter, UploadFile, File
from starlette.concurrency import run_in_threadpool
import gc

router = APIRouter()

@router.post("/upload-transcript")
async def handle_transcript_upload(file: UploadFile = File(...)) -> dict:
    file_bytes = await file.read()
    
    # Đẩy tác vụ bóc tách PDF nặng sang worker thread pool riêng biệt
    parsed_result = await run_in_threadpool(parse_pdf_worker, file_bytes)
    
    # Kích hoạt dọn dẹp rác bộ nhớ ngay lập tức
    del file_bytes
    gc.collect()
    
    return {"status": "success", "data": parsed_result}
```

### 2.3. Xác thực Dữ liệu bằng Pydantic v2
* Sử dụng kế thừa từ `pydantic.BaseModel`. Mọi schema phải có cấu hình kiểm soát chặt chẽ (`extra = "forbid"`):

```python
from pydantic import BaseModel, Field, ConfigDict

class CourseInputSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    course_code: str = Field(..., pattern=r"^[A-Z]{2,4}\s?[0-9]{3,4}$")
    course_name: str = Field(..., min_length=2, max_length=100)
    credits: int = Field(..., ge=1, le=6)
    grade_point: float = Field(..., ge=0.0, le=4.0)
```

---

## 3. CHUẨN MỰC LẬP TRÌNH TYPESCRIPT & REACT (NEXT.JS 14 FRONTEND)

### 3.1. TypeScript Strict Mode & Định kiểu Dữ liệu
* Kích hoạt `"strict": true` trong `tsconfig.json`.
* **Tuyệt đối cấm** sử dụng kiểu `any`. Trong trường hợp chưa rõ kiểu dữ liệu của bên thứ ba, bắt buộc dùng `unknown` và thực hiện Type Narrowing:

```typescript
// KHÔNG CHẤP THUẬN:
// const handleData = (data: any) => { ... }

// CHUẨN MỰC:
export interface CourseNode {
  readonly id: string;
  readonly name: string;
  readonly credits: number;
  isCompleted: boolean;
}

export type RoadmapMilestoneProps = {
  semesterIndex: number;
  courses: readonly CourseNode[];
  onToggleCourse: (courseId: string) => void;
};
```

### 3.2. Cấu trúc Component và Tách biệt Server/Client Components
* Mặc định mọi component trong thư mục `app/` là **React Server Components (RSC)** để tối ưu SEO và kích thước bundle tải về.
* Chỉ gắn chỉ thị `"use client";` tại các component thực sự cần tương tác người dùng: Biểu đồ Recharts, bảng điều khiển Zustand Store, và các nút checkbox tương tác.

### 3.3. Quy tắc Quản lý State với Zustand
* State actions phải mang tính chất đơn nhiệm và giữ vững tính bất biến (Immutability):

```typescript
// store/useWorkspaceStore.ts
import { create } from 'zustand';

interface WorkspaceStore {
  completedCourses: Set<string>;
  jobReadinessScore: number;
  toggleCourse: (courseCode: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  completedCourses: new Set<string>(),
  jobReadinessScore: 0,
  
  toggleCourse: (courseCode) =>
    set((state) => {
      const nextCourses = new Set(state.completedCourses);
      if (nextCourses.has(courseCode)) {
        nextCourses.delete(courseCode);
      } else {
        nextCourses.add(courseCode);
      }
      
      // Tính toán lại điểm số cục bộ (Web 2.0 Dynamic State)
      const nextScore = calculateReadinessLocally(nextCourses);
      return { completedCourses: nextCourses, jobReadinessScore: nextScore };
    }),
}));
```

---

## 4. CHUẨN MỰC DOCKER & THIẾT KẾ HỆ THỐNG BIÊN

1. **Multi-stage Docker Builds:** Giảm thiểu tối đa kích thước Docker image của FastAPI bằng cách tách riêng tầng build dependencies và tầng runtime.
2. **Chạy dưới tài khoản Non-root:**
   ```dockerfile
   FROM python:3.11-slim
   RUN useradd -u 1001 -m appuser
   WORKDIR /app
   USER 1001
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
3. **Cấu hình Nginx Module:** Mỗi cấu hình Nginx phải ghi chú rõ ràng mục đích của các directive giới hạn lưu lượng, đệm kết nối và bảo mật Header.

---

## 5. QUY TẮC QUẢN TRỊ PHIÊN BẢN GIT VÀ TIÊU CHUẨN COMMIT (GIT CONVENTIONS)

### 5.1. Định dạng Tiêu đề Commit (Conventional Commits)
Từ thời điểm này trở đi, **toàn bộ thông điệp Git commit bắt buộc phải viết bằng tiếng Anh (English)** tuân thủ chuẩn Conventional Commits:
```text
<type>(<scope>): <short description in English, imperative mood>

[optional body in English: detailed motivation and breaking changes]
```

* **Các loại `type` hợp lệ:**
  * `feat`: Thêm một tính năng mới cho người dùng.
  * `fix`: Sửa một lỗi kỹ thuật phát sinh.
  * `docs`: Thêm hoặc chỉnh sửa tài liệu đặc tả.
  * `style`: Định dạng mã nguồn (khoảng trắng, dấu chấm phẩy) không đổi logic code.
  * `refactor`: Tái cấu trúc mã nguồn không thay đổi tính năng bên ngoài.
  * `perf`: Thay đổi mã nguồn nhằm cải thiện tốc độ hoặc giải phóng RAM/VRAM.
  * `test`: Bổ sung bộ kiểm thử tự động hoặc sửa đổi file test.
  * `chore`: Cập nhật cấu hình build, package.json, Dockerfile, v.v.

* **Ví dụ chuẩn tiếng Anh:**
  ```text
  feat(ml): integrate cosine similarity engine for skill gap scoring
  fix(parser): resolve regex matching issue for letter grades with plus sign
  perf(gateway): enable WAL mode for sqlite connection pool
  docs(arch): update high-level architecture diagram and hardware specs
  ```

### 5.2. Chiến lược Phân nhánh (Git Branching Strategy)
* `main`: Nhánh sản xuất ổn định, luôn sẵn sàng triển khai lên Vercel và máy chủ.
* `develop`: Nhánh tích hợp tính năng của toàn đội ngũ.
* `feature/<feature-name>`: Nhánh phát triển các tính năng độc lập (ví dụ: `feature/pdf-parser-v2`).
* `hotfix/<issue-name>`: Nhánh sửa lỗi khẩn cấp trực tiếp từ `main`.
