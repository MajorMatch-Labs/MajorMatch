# Advisor — context and cancellation verification

Ngày 27/10/2026. Owner: Long Nhật; người thực hiện: Codex trong phiên của người yêu cầu (CLI `Vcoch27`). Owner review: đang chờ. Baseline `c18e4ce`.

## Yêu cầu và phát hiện

Phạm vi: kiểm thử ngắt kết nối, đổi ngữ cảnh chat và phản hồi đến muộn, ứng với ADV-UI-AC-06/07. Review tìm thấy hai đường tải history ở effect và `switchSession`, nên response của phiên trước có thể ghi đè phiên mới. Effect chưa theo dõi toàn bộ evidence; các callback trong view không tự kiểm tra quyền cập nhật khi Stop hoặc context thay đổi. EOF transport đang được đánh dấu completed dù chưa có DONE.

## Thay đổi

- Chỉ effect tải history; mỗi request history/list/stream được ràng buộc vào context hiện tại và controller của nó. Không cho gửi tin khi history ban đầu chưa tải xong.
- Context bao gồm learner, session, selected major, profile, câu trả lời khảo sát và career tags. Context JSON chỉ tồn tại trong bộ nhớ để so sánh, không gửi thêm lên API, không đưa vào URL/log/storage.
- Stop tăng request generation trước khi abort; callback muộn không sửa UI hoặc lưu assistant response. Cleanup hủy đúng controller đã tạo trong effect.
- EOF trước DONE trở thành interrupted; giữ partial text, thông báo rõ và không gọi onComplete. Thông báo lỗi không giả vờ đã chạy offline fallback.

## Kiểm chứng

7 component tests đạt: Stop và partial text; đổi tài khoản; đổi evidence; đổi ngành; history trả muộn từ phiên cũ; lỗi thật giữ trạng thái lỗi; unmount không nhận callback/persistence muộn. Fake controller cố tình gọi callback sau khi hết hiệu lực để kiểm tra guard của component.

Lifecycle test tăng từ 6 lên 8 ca: thêm EOF trước DONE và external abort trong lúc reader chờ. Toàn bộ đạt. Browser test mock API phát stream có token nhưng thiếu DONE: cả desktop/mobile giữ partial text, báo interrupted và không POST lưu assistant như phản hồi hoàn chỉnh.

Lần test component đầu có cảnh báo React do test thay đổi store rồi chưa chờ effect async; đã chuyển thao tác đó sang async `act`. Lần chạy cuối không còn cảnh báo này. Đây là điều chỉnh của công cụ trong phiên, không gán thành phát hiện của Long Nhật.

Chưa kiểm thử model thật, live history/SQLite hoặc chính sách lưu partial text sau reload. Các fallback định danh/GPA có sẵn và cách backend xác thực phiên cần rà soát riêng; không coi gói này là hoàn tất bảo mật tài khoản.

Kết quả và cách chạy: [COMPONENT_VERIFICATION.md](../../05-testing-and-rules/COMPONENT_VERIFICATION.md). Xác nhận của Long Nhật và review bot: chưa ghi nhận trong phiên này.
