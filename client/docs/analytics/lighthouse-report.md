# Số đo Lighthouse ngày 03/11/2026

Owner chuyên môn: Ánh Vy. Người chạy: Codex trong phiên của người yêu cầu. Nguồn số liệu: [JSON đã trích xuất](measurements/lighthouse-2026-11-03.json), chứa hash SHA-256 của raw report, cấu hình, version, timestamp, cảnh báo và audit thất bại.

## Môi trường và phương pháp

Trang đo: `http://127.0.0.1:3109/`, production build Next.js từ baseline `108c6ff`. Browser ẩn danh, không đăng nhập, không dùng hồ sơ thật. Node v24.20.0, Lighthouse 13.6.0 và Chromium của Playwright v1248. Mỗi cấu hình chạy **một lần**; Lighthouse dùng simulated throttling được ghi trong JSON. Mobile emulation rộng 412 px; desktop preset rộng 1350 px. Đây là cấu hình audit, khác viewport 375/1280 của E2E.

Production build đã chạy thành công trước phép đo. `next start` trên port 3109 phục vụ được trang nhưng phát cảnh báo cấu hình `output: standalone`; hướng deploy standalone chuẩn cần đóng gói assets và chạy server tương ứng. Không dùng số đo này để xác nhận quy trình Docker/EC2 đang đúng.

## Kết quả quan sát

| Chỉ số | Mobile | Desktop |
|---|---:|---:|
| Performance /100 | 96 | 100 |
| Accessibility /100 | 100 | 100 |
| Best practices /100 | 96 | 96 |
| SEO /100 | 100 | 100 |
| FCP (ms, raw làm tròn 2 số) | 764.87 | 207.97 |
| LCP (ms, raw làm tròn 2 số) | 764.87 | 207.97 |
| TBT (ms, raw) | 213 | 0 |
| CLS | 0 | 0 |
| Speed Index (ms, raw làm tròn 2 số) | 764.87 | 207.97 |

Không làm tròn điểm thành 100 nếu audit không đạt. Report có audit console error: request `/favicon.ico` trả 404; đó là một việc cần sửa tiếp, không được bỏ khỏi mô tả. Mobile còn ghi forced reflow, render-blocking và network dependency tree insights. JSON giữ các audit score 0 để người đọc đối chiếu; insight score 0 không đồng nghĩa mọi insight đó đều có cùng trọng số trong category score.

Accessibility 100 là kết quả audit tự động trên trang chủ ở hai lượt đo, không chứng nhận WCAG toàn ứng dụng. TBT là số đo lab, không thay INP/field data. Trang `/result`, chat live, upload live, mạng Internet, EC2 và GPU/model chưa được đo bằng hai audit này. Chưa có phép so sánh trước/sau hoặc thử nghiệm UX với sinh viên.

## Chạy lại

Sau khi build và khởi động server test, dùng phiên bản đã ghi, đặt `CHROME_PATH` tới Chromium của môi trường đang dùng:

```powershell
npx --yes lighthouse@13.6.0 http://127.0.0.1:3109/ --output=json --output-path=mobile.json --chrome-flags="--headless --disable-gpu" --quiet --no-enable-error-reporting
npx --yes lighthouse@13.6.0 http://127.0.0.1:3109/ --preset=desktop --output=json --output-path=desktop.json --chrome-flags="--headless --disable-gpu" --quiet --no-enable-error-reporting
node scripts/reporting/summarize-lighthouse.mjs mobile.json desktop.json docs/analytics/measurements
```

Script chỉ trích số đo thật và dừng nếu raw report có runtime error. Giữ raw JSON ở nơi riêng của nhóm nếu cần kiểm toán đầy đủ; bản nộp giữ selected fields và hash để tránh phình repo. Đầu ra có tên ngày cố định cho batch này; khi đo ngày khác cần đổi tên file/biên bản cho đúng, không ghi đè như thể vẫn là quan sát 03/11/2026.

Phương pháp CLI/preset/JSON theo [GoogleChrome Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/readme.md), đã đọc ngày 03/11/2026. Muốn kết luận ổn định hơn, chạy tối thiểu nhiều lượt trong cùng điều kiện và ghi median/độ biến thiên, không tự thêm dữ liệu vào batch hiện tại.
