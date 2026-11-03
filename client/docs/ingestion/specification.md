# Đặc tả module Ingestion

Ngày 03/11/2026. Baseline monorepo `108c6ff`; client tree trước tài liệu: `336b43757266e6963c44d4c21b532c6b89dd560f`. Owner: Văn Hoàng. Actor soạn tài liệu: Codex; owner review chưa ghi nhận.

## Mục đích và ranh giới

Module tiếp nhận bằng chứng học tập PDF và 10 câu trả lời sở thích, cùng tối đa 5 lĩnh vực mục tiêu. Client kiểm tra dữ liệu, trình bày tiến trình và gửi HTTP tới backend. Việc đọc nội dung PDF, suy luận AI và lưu SQLite thuộc backend trong monorepo. Kiểm tra PDF trên trình duyệt không xác nhận nội dung đúng, không phải quét malware và không chứng minh khử định danh hoàn toàn.

Nguồn triển khai: [FileDropzone](../../src/components/upload/FileDropzone.tsx), [useFileUpload](../../src/modules/ingestion/hooks/useFileUpload.ts), [IngestionService](../../src/modules/ingestion/services/ingestionService.ts), [fileValidation](../../src/modules/ingestion/utils/fileValidation.ts), [RiasecSurvey](../../src/components/upload/RiasecSurvey.tsx).

## Luồng upload

1. Người dùng chọn hoặc thả một PDF. `useFileUpload` đọc auth store, yêu cầu đăng nhập nếu chưa có phiên.
2. Hook chặn thao tác upload trùng trong lúc validation/upload của chính hook còn chạy. Service là nơi gọi full validation một lần.
3. Validator xét file rỗng, đuôi `.pdf`, MIME, kích thước tối đa `10 * 1024 * 1024` bytes và dấu `%PDF` trong tối đa 1024 bytes đầu.
4. Store gọi API bóc tách rồi gửi hồ sơ tới API lưu. Khi nhận hồ sơ mới, store xóa phân tích/lộ trình phụ thuộc để không dùng kết quả cũ.
5. View hiển thị tên file, môn học, GPA và kỹ năng từ dữ liệu trả về. Error message đi qua hook, không biến upload thất bại thành mock thành công.

MIME được chấp nhận có `application/pdf`, các alias trong validator, `application/octet-stream` và chuỗi rỗng; điều này không bỏ qua kiểm tra magic bytes. Trường `errorCode` là `FILE_EMPTY`, `INVALID_EXTENSION`, `INVALID_MIME_TYPE`, `FILE_TOO_LARGE` hoặc `INVALID_MAGIC_BYTES`. Đọc `slice.arrayBuffer()` thất bại cũng trả `INVALID_MAGIC_BYTES` kèm thông báo.

## Khảo sát và công thức đang dùng

`riasecAnswers` giữ riêng câu 1–10. UI tính `answeredCount` theo số nguyên 1–5 và chỉ trình bày kết quả hoàn chỉnh khi đủ 10 câu. Nhóm R/I/A/S/E/C nhận trung bình có trọng số từ [dataset](../../src/modules/ingestion/constants/riasecQuestions.ts); hàm [calculateHollandScores](../../src/modules/ingestion/utils/riasecScoring.ts) làm tròn một chữ số thập phân trên thang 1–5. Mã Holland lấy hai nhóm điểm cao nhất. Phần trăm hiển thị của nhóm là `round(score / 5 * 100)`, không phải xác suất nghề nghiệp phù hợp.

**Giới hạn:** utility scoring tự thay câu thiếu/sai miền bằng 3.0. Vì vậy caller mới phải giữ guard đủ câu như UI; không dùng utility với dữ liệu thiếu rồi coi đó là khảo sát hoàn chỉnh. Đây là mô tả mã, chưa phải thang đo tâm lý được kiểm định. Tag được giới hạn ở store; đổi tag/câu trả lời làm mất hiệu lực kết quả phụ thuộc.

## Trạng thái và nghiệm thu

| Trạng thái | Hành vi | Cách kiểm tra |
|---|---|---|
| Chưa đăng nhập | Mở đăng nhập khi upload | Component/manual QA, chưa có live auth proof trong đợt này |
| PDF sai | Hiện lỗi, không chuyển sang upload action | `tests/unit/fileValidation.test.ts`, `ingestionUploadService.test.ts` |
| Đang xử lý | Disable file input, có pending | Hook/view inspection; không tuyên bố E2E upload thật |
| Hồ sơ mới | Loại kết quả phân tích/lộ trình cũ | Store integration tests và kiểm tra mã |
| Thiếu câu khảo sát | Không hiển thị mã như kết quả đầy đủ | UI guard và checklist bàn giao |
| Lưu khảo sát lỗi | API trả false hoặc lỗi mạng | Cần xem caveat ở integration guide trước khi trình diễn |

Nguồn yêu cầu: [PRD Ingestion](../../tasks/ingestion/prd-ingestion-ui.md), đặc biệt ING-UI-AC-01/02/03/06. Tài liệu hiện trạng không tự chuyển PRD sang Approved.

## Rủi ro còn mở

`saveProfile` và `saveRiasecSurvey` trả boolean. Một số caller chưa kiểm tra false, nên nhãn “đã lưu” không đủ chứng minh server persistence. Upload action chưa được chứng minh an toàn khi tài khoản đổi giữa request. Chưa có phép đo bao phủ khử định danh, vì vậy không dùng tuyên bố “khử định danh 100%” làm kết luận bảo mật. Các điểm này được ghi để tiếp tục sửa, không âm thầm sửa chính sách trong task tài liệu.

Ảnh hiện trạng guest, viewport 1280×900, production local với mọi API bị chặn, chụp ngày 03/11/2026: [upload guest](screenshots/upload-guest.png). Ảnh không chứng minh upload/model/storage live.
