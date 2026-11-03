# Hướng tích hợp và xử lý lỗi Ingestion

Owner: Văn Hoàng. Nguồn hiện trạng: [API service](../../src/services/api.ts), [store](../../src/stores/useProfileStore.ts) và [DTO](../../src/types/api.ts), baseline `108c6ff`. Các ví dụ dùng dữ liệu tổng hợp.

## Endpoint được client sử dụng

| HTTP/path | Dữ liệu và response | Timeout client |
|---|---|---|
| POST `/api/v1/profile/upload-transcript` | FormData: `file`, `document_type=transcript`, `student_id`; JSON có `profile_data` hoặc alias `profile` | 30 giây |
| POST `/api/v1/profile/{student_id}` | Hồ sơ JSON; service trả `res.ok` | 6 giây |
| POST `/api/v1/survey/riasec` | `{student_id, answers, scores, dominant_code}`; service trả boolean | 6 giây |
| GET `/api/v1/survey/riasec/{student_id}` | Lấy khảo sát đã lưu, UI nạp từng câu trả lời | Xem `ApiService.getRiasecSurvey` |
| POST `/api/v1/assessment/calculate-match` | Điểm RIASEC, lĩnh vực, môn học/kỹ năng; kết quả chuẩn hóa ngành và radar | Xem `calculateMatch` |

Không tự gán header `Content-Type` cho FormData: trình duyệt cần đặt multipart boundary. `student_id` là trường định danh, không phải bằng chứng phân quyền. Server phải xác thực quyền trên hồ sơ độc lập với client. Token/quyền admin cần xem backend, không suy ra từ việc UI ẩn nút.

```json
{
  "student_id": "TEST-DEMO-001",
  "answers": {"1": 4, "2": 3, "3": 2, "4": 5, "5": 3, "6": 4, "7": 2, "8": 3, "9": 4, "10": 3},
  "scores": {"r": 3, "i": 4, "a": 2, "s": 3, "e": 3, "c": 4},
  "dominant_code": "IC"
}
```

Đây là ví dụ hình dạng payload, không phải fixture chuẩn dùng để chứng minh công thức scoring. Khi chạy thật, tạo scores bằng chính dataset/hàm của phiên bản đang kiểm tra.

## Chạy local và xác định đường dữ liệu

Từ repo client: `npm ci`, đặt `NEXT_PUBLIC_API_URL=http://127.0.0.1:8001` khi gateway test ở cổng 8001, sau đó `npm run dev`. Trình duyệt gọi path `/api/...` cùng origin; [Next rewrite](../../next.config.mjs) chuyển đến backend. Nếu đổi URL cho production, build lại vì Next config tham gia lúc build. Giá trị mặc định trong code là địa chỉ mạng riêng, không bảo đảm có trên máy giảng viên.

Backend nằm ở [monorepo](https://github.com/MajorMatch-Labs/MajorMatch/tree/108c6ff/backend-hpc); xem [bằng chứng database](../02-architecture/MONOREPO_BACKEND_EVIDENCE.md). Client-only clone chạy được UI và demo tường minh, nhưng tác vụ live cần backend/model theo hướng dẫn vận hành.

## Checklist chẩn đoán

1. Kiểm tra backend URL và response health trong Network. Trạng thái gateway trả 200 không tự xác nhận model sẵn sàng.
2. Nếu không phát sinh POST, kiểm tra auth gate, validation và pending của hook.
3. Nếu POST lỗi/timeout, giữ lỗi; không nạp kết quả mẫu vào phiên live. Không dán nội dung PDF hoặc response chứa hồ sơ lên log công khai.
4. Nếu nhãn đã lưu xuất hiện, đối chiếu HTTP status rồi đăng nhập lại và GET dữ liệu. Khi có quyền server, kiểm tra bản ghi SQLite bằng truy vấn chỉ đọc. Reload cùng browser có thể chỉ phục hồi localStorage.
5. Tạo file tổng hợp vượt ngưỡng, sai extension và PDF không có header để diễn tập recovery. Không upload file cá nhân của sinh viên trong demo nộp bài.

**Caveat cần sửa tiếp:** `saveRiasecSurvey` bắt lỗi rồi trả false, trong khi callback `.then()` của UI có thể đánh dấu saved bất kể giá trị. Tương tự store chưa kiểm tra kết quả boolean của `saveProfile`. Vì vậy task chương 9 chỉ mô tả hiện trạng, không xác nhận persistence thành công hay biến lỗi false thành pass.
