# Checklist bàn giao Analytics và UI

Owner: Ánh Vy. Dùng chung với [catalogue](design-system-catalogue.md) và [Lighthouse report](lighthouse-report.md). Đây là hướng dẫn nghiệm thu, không tự ghi nhận một buổi usability test với sinh viên.

| Ca | Cách thực hiện | Bằng chứng hiện có |
|---|---|---|
| Rỗng | Render radar với `[]` | Component test kiểm tra status, không có bảng giả |
| Một phần | Một score null/NaN cùng trục hợp lệ | Component test giữ zero thật, loại hàng lỗi và có thông báo |
| Chuyển ngành | Rerender dữ liệu và tên ngành khác | Component test kiểm tra hàng cũ biến mất |
| Reduced motion | Đổi media query khi component đang mount | Component test kiểm tra props animation và cleanup listener |
| Demo browser | Mở `/result?demo=1` | E2E Chromium desktop/mobile, có nhãn DEMO và bảng số liệu |
| Keyboard/touch | Tab tới thao tác ngành và đọc bảng không hover | Cần người kiểm tra tương tác sâu, không suy ra từ score accessibility |
| Zoom/contrast | Kiểm tra 200%, forced colors và reduced motion | Prototype có bằng chứng lịch sử; không tuyên bố production hiện tại đã đạt hết |
| Hiệu năng | Local production Lighthouse | Xem JSON/môi trường; không đại diện EC2 hay dữ liệu người dùng thực |

## Cách phân tích số đo

Tách LCP/CLS/TBT/FCP/Speed Index khỏi điểm Lighthouse tổng hợp. TBT là số đo lab, không thay INP từ field data. Điểm accessibility là tập audit tự động, không phải chứng nhận WCAG. Một lần mobile và một lần desktop không đủ suy ra phân phối hiệu năng hoặc lợi ích UX cho người dùng. Chưa có nhóm người dùng thử, khảo sát hài lòng hoặc conversion rate được đo trong task này.

## Ưu tiên sau báo cáo

1. Duyệt semantics readiness/match và ngăn mô phỏng thay baseline trước khi đưa ra tuyên bố định lượng.
2. Đối chiếu bảng số với backend contract khi thiếu dữ liệu, ngoài miền điểm, hoặc lỗi API.
3. Đo lại ba lượt mỗi cấu hình trên môi trường cố định; sau đó mới dùng median cho so sánh trước/sau.
4. Kiểm tra thực bằng keyboard/screen reader và các browser khác Chromium. Owner ghi nhận vấn đề/ý kiến thật trong PR, không gán tự động từ tên module.
