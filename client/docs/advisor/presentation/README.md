# Slide bảo vệ MajorMatch

- [PowerPoint chỉnh sửa được](majormatch-defense.pptx): 11 slide, speaker notes dẫn tới nguồn trong repo.
- [Nội dung nguồn](slides.json): sửa câu chữ/notes mà không phải dò trong binary.
- [Demo và hỏi đáp](../demo-and-defense.md): kịch bản 10–12 phút, chỉ rõ live/DEMO/mock.

Phông thiết kế: Segoe UI, canvas 16:9 1280×720. Deck dùng số đo Lighthouse của batch 03/11/2026 và kết quả test có phạm vi rõ. Màu indigo/neutral lấy hướng từ DESIGN; không phải file Figma hoặc xác nhận thiết kế đã được owners duyệt.

PowerPoint có thể chỉnh trực tiếp bằng ứng dụng Office tương thích. Script [build-defense.mjs](../../../scripts/reporting/build-defense.mjs) cần bundled `@oai/artifact-tool` và finalizer của Codex, không phải dependency runtime của website. Khi rebuild trong Codex, lấy đường dẫn từ `load_workspace_dependencies`, đặt `ARTIFACT_MODULES`, `PRESENTATIONS_SKILL`, `ARTIFACT_PYTHON`, chạy script từ client root. Xem trước nằm trong `.presentation-build/` (gitignore). Finalizer không ghi đè file cuối đã có: xuất revision mới rồi thay bản bàn giao sau khi kiểm tra.

Script đọc `docs/analytics/measurements/lighthouse-2026-11-03.json`; muốn dùng số đo khác phải cập nhật nguồn và notes/date cùng nhau. Không đổi score trên slide bằng tay rồi giữ nguyên nhãn phép đo cũ. Đặt `PRESENTATION_OUTPUT_NAME` thành tên revision mới khi rebuild; receipt cũng dùng tên revision để không ghi đè bằng chứng cũ.

[Validation receipt rút gọn](validation.json) ghi hash của bản PowerPoint đã bàn giao. Kiểm tra package/layout/import không thay thế việc mở thử bằng PowerPoint thật; phiên này đã xem PNG của từng slide, chưa chạy Office.
