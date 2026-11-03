# Ma trận minh chứng CS2028

Chương 9 tổng hợp nguồn có thật; không tự chấm điểm nhóm. Các trọng số/điểm cuối cùng cần đối chiếu đề cương giảng viên đang áp dụng.

| Tiêu chí | Minh chứng trong repo | Kết luận hợp lệ | Phần còn thiếu |
|---|---|---|---|
| CLO2: dùng AI và cải tiến prompt | `docs/ai-evidence/{ingestion,analytics,advisor}`, [prompt evolution](../ingestion/prompt-evolution.md) | Có nhật ký và source để đối chiếu | Chưa replay độc lập toàn bộ log lịch sử |
| CLO3: phản biện và kiểm chứng | [W7 review](../ai-evidence/W7_REFACTOR_REVIEW.md), [component verification](../05-testing-and-rules/COMPONENT_VERIFICATION.md), [caveat hiện trạng](final-technical-report.md) | Phát hiện/ràng buộc có dẫn nguồn và test cụ thể | Model efficacy và vài policy chưa được duyệt |
| CLO4: vận hành, báo cáo, chuyển giao | [technical report](final-technical-report.md), [demo script](demo-and-defense.md), [slide](presentation/majormatch-defense.pptx), [Lighthouse](../analytics/lighthouse-report.md) | Có bộ bàn giao để chạy, giải thích và luyện bảo vệ | Buổi bảo vệ và đánh giá người dùng chưa diễn ra trong phiên |
| Trách nhiệm cá nhân | Git Author/Committer, PR/review thật và module logs | Chỉ ghi người thực hiện/xác nhận thật | Review cá nhân của từng owner không được agent tự xác nhận |
| Phạm vi hệ thống | [backend evidence](../02-architecture/MONOREPO_BACKEND_EVIDENCE.md) và linked monorepo | Chỉ rõ database/model nằm ngoài client-only repo | Cần bằng chứng runtime riêng cho live auth/DB/model |

## Cách sử dụng khi nộp

Đóng gói đúng nhánh/main đã merge, giữ source slide và file PowerPoint, link JSON số đo và các báo cáo kiểm tra. Người trình bày cần giải thích test đang dùng mock hay live. Nếu giảng viên yêu cầu bằng chứng từng thành viên, ghi nhận review/thao tác thật và link cụ thể, không thay tên tác giả trên lịch sử để lấp thiếu sót.
