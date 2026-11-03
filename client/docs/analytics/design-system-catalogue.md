# Catalogue giao diện Analytics

Owner: Ánh Vy. Baseline `108c6ff`. Ngày tổng hợp 03/11/2026. Căn cứ: [DESIGN](../../DESIGN.md), [guardrails](../../DESIGN-GUARDRAILS.md), [PRD Analytics](../../tasks/analytics/prd-analytics-ui.md), mã trong `src/components/analysis` và `src/modules/analytics`.

## Foundation và phạm vi áp dụng

`design/shared/tokens.css` là nguồn token cho prototype review: nền `#0b0f19`, surface `#111827`, text `#f8fafc`, muted `#b8c3d4`, primary `#4338ca`, focus `#c7d2fe`, control tối thiểu 44 px, content 1120 px, spacing 4/8/12/16/24/32/48 px. Typography dùng Segoe UI/system sans theo DESIGN.

Production vẫn dùng Tailwind classes và [radarConfig](../../src/modules/analytics/constants/radarConfig.ts), không phải mọi control đều đọc CSS tokens này. Prototype trong `design/analytics` là nguồn review độc lập, không tự chứng minh production khớp pixel hay PRD đã được duyệt. Figma chỉ được nhắc khi có link file/node thật; task này không tạo Figma.

## Catalogue component

| Component | Input và trách nhiệm | Trạng thái/ràng buộc quan trọng |
|---|---|---|
| [MajorCard](../../src/components/analysis/MajorCard.tsx) | `MajorMatchRankItem`, lựa chọn ngành | Giữ `major_id`; phần trăm là output mô hình/adapter, không phải bảo đảm thành công nghề nghiệp |
| [RadarComparison](../../src/components/analysis/RadarComparison.tsx) | `RadarAxisItem[]`, tên ngành | Rỗng có status; dữ liệu lỗi bị loại và thông báo partial; có bảng số liệu cùng caption/header |
| [SkillBreakdown](../../src/components/analysis/SkillBreakdown.tsx) | Các nhóm mastered/developing/missing | Không tự thêm kỹ năng khi dữ liệu thiếu; kiểm tra nguồn và đơn vị trước khi giải thích |
| [RadarTooltip](../../src/modules/analytics/components/RadarTooltip.tsx) | Điểm trục và delta | Tooltip bổ sung cho biểu đồ; bảng là đường đọc số liệu độc lập với hover |
| [MilestoneSkillBadges](../../src/modules/analytics/components/MilestoneSkillBadges.tsx) | Nhãn kỹ năng học phần/giai đoạn | Nhãn là mô tả kỹ năng mục tiêu, chưa xác nhận người học đã làm chủ |
| [useReducedMotion](../../src/modules/analytics/hooks/useReducedMotion.ts) | Media query của trình duyệt | Ban đầu không animate; theo dõi change và gỡ listener lúc unmount |

## Nguồn số liệu và ngưỡng

[RadarTransformer](../../src/modules/analytics/utils/radarTransformer.ts) chỉ dùng trục có hai score finite numeric; giữ zero thật. Giá trị được làm tròn 1 chữ số. `delta = user - benchmark`, surplus khi >0.5, gap khi <-0.5, còn lại match. Summary hiện đếm gap theo chênh lệch >1.0 nên hai cách đếm không cùng ngưỡng; cần nêu khi thuyết trình, không diễn giải chúng là một chỉ số.

Summary fit dùng tỷ số trung bình hiện tại/chuẩn, giới hạn tối đa 100. Khi không có trục hợp lệ, summary trả zero theo contract cũ; view phải giữ ý nghĩa “không có dữ liệu”, không coi người học có năng lực bằng 0. Chưa có kiểm định học thuật cho các ngưỡng này trong task hiện tại.

## Quy tắc bàn giao

Trang `/result?demo=1` phải giữ nhãn dữ liệu minh họa. Thay ngành phải cập nhật đồng thời bảng/radar/skill groups; response cũ không được nhìn như kết quả mới. Dùng text cùng semantic color, không dùng màu làm kênh duy nhất. Các prototype đã có state matrix rộng; production mới kiểm chứng một tập trạng thái cụ thể theo [component verification](../05-testing-and-rules/COMPONENT_VERIFICATION.md).

Một hạn chế cần bảo vệ khi hỏi đáp: `toggleCompletedItem` trong store đang cập nhật cả match/radar/skill gap bằng mô phỏng, và dùng fallback readiness. Không trình bày việc tick checklist là phép đo tăng năng lực thật. Đặc tả baseline bất biến ở PRD vẫn cần triển khai/duyệt riêng.

Ảnh production local [demo result](screenshots/demo-result.png), chụp ngày 03/11/2026 ở viewport 1280×900, có nhãn DEMO và API bị chặn. Hiện `/result` còn một bảng số liệu riêng ngoài bảng của `RadarComparison`, nên có nội dung bảng trùng; đây là việc cần dọn UI tiếp, không phải hai bộ dữ liệu độc lập.
