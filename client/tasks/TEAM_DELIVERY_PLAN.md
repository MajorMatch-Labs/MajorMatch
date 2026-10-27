# Kế hoạch thực thi Chương 7–9

Baseline: monorepo `0154bcf`, kiểm tra ngày 27/10/2026. Mục tiêu: bàn giao client có thể truy vết từ phát hiện review → thay đổi → kiểm thử → PR → quyết định của người phụ trách.

Cập nhật tiếp theo từ baseline `c18e4ce`: phần component verification của Analytics/Advisor đã được triển khai, cùng một phần E2E mock. Xem [kết quả và giới hạn](../docs/05-testing-and-rules/COMPONENT_VERIFICATION.md). Các mục bên dưới mô tả kế hoạch ban đầu; chưa coi toàn bộ chương 8 hoặc xác nhận của module owners đã hoàn tất.

## Chương 7: review và refactor

| Module / người phụ trách | Gói công việc hiện tại | Commit nên tách | Người xác nhận |
|---|---|---|---|
| ingestion / Văn Hoàng `Vcoch27` | Tách `useFileUpload`, tập trung validation trong service, xử lý lỗi async | Refactor source; regression tests | Văn Hoàng |
| analytics / Ánh Vy `anhvy0904` | Chuẩn hóa dữ liệu radar đầu vào, không biến dữ liệu thiếu thành 0, báo dữ liệu một phần | Refactor source; regression tests | Ánh Vy |
| advisor/core / Long Nhật `NhatPrv` | Cô lập vòng đời SSE, nối signal bên ngoài với abort nội bộ, chống cleanup luồng cũ | Refactor source; regression tests | Long Nhật |

Các gói đã được Codex chuẩn bị trong cùng phiên cho người yêu cầu. Người phụ trách module không tự động trở thành tác giả các commit này. Phiên hiện tại xác thực CLI là `Vcoch27`; việc xác nhận của Ánh Vy và Long Nhật đang chờ. Không làm lại lịch sử hoặc chia tên tác giả chỉ để đủ số commit.

Để mỗi thành viên có đóng góp thực tế, mỗi người tiếp tục trên nhánh riêng từ bản chung đã merge, kiểm tra gói của mình và sửa các phát hiện có cơ sở:

- Văn Hoàng: hoàn thiện `useRiasecSurvey`, kiểm tra lưu khảo sát thất bại và thay đổi tài khoản khi request còn chạy.
- Ánh Vy: kiểm thử component hiển thị radar rỗng/một phần, kiểm tra bảng số liệu thay thế và reduced motion; chỉ đổi UI khi có căn cứ.
- Long Nhật: rà soát parser SSE, kiểm thử chuyển ngữ cảnh hồ sơ trong chat và đối chiếu lỗi HTTP/event.

Mỗi thành viên ghi prompt thật, phản biện, kết quả và commit bằng tài khoản của mình. Không tạo commit rỗng hoặc cố định số commit để chấm điểm; nguồn và test là hai đơn vị tách hợp lý nếu cả hai tạo giá trị. Các đề xuất trên chưa được thực hiện trong gói hiện tại.

## Chương 8: kiểm thử hệ thống

| Module | Công việc tiếp theo | Bằng chứng kết thúc |
|---|---|---|
| ingestion | Hook/component tests cho tải lại cùng PDF, upload trùng, file hỏng, lỗi đọc, auth thay đổi; kiểm thử khảo sát | Test tự động và ảnh dữ liệu tổng hợp |
| analytics | Component tests cho dữ liệu không hợp lệ, rỗng/một phần, đổi ngành và kết quả cũ | Kết quả thực thi; đối chiếu AC |
| advisor/core | E2E đăng nhập → upload → survey → result → roadmap → chat; model offline; ngắt/kết nối lại | Playwright report/trace đã loại thông tin nhạy cảm |
| core phối hợp | CI cho repo client standalone: install từ lockfile, test, typecheck, build | GitHub Actions run thật trên PR; chưa được tạo trong gói tuần 7 |

Trước khi kiểm thử local, đặt `NEXT_PUBLIC_API_URL` tới backend test. Dùng dữ liệu tổng hợp và mock có nhãn khi kiểm thử cô lập; tách rõ E2E live với model thật và E2E dùng mock. Build thành công không chứng minh lưu trữ SQLite hoặc model hoạt động.

Dependency backlog cần ưu tiên: lúc `npm ci` phiên này, npm cảnh báo Next.js `14.2.14` có vấn đề bảo mật và Recharts 2.x đã ngừng duy trì. Trước khi nâng cấp, tra advisory/migration chính thức và chọn bản tương thích đã vá; không nâng major tự động trong một task refactor. Phiên này giữ dependency/lockfile để kiểm tra thay đổi chương 7 độc lập.

## Chương 9: tài liệu và bảo vệ

- ingestion: đặc tả upload/khảo sát, giới hạn PDF, bảng lỗi và quá trình cải tiến prompt.
- analytics: catalogue component, nguồn dữ liệu/giới hạn chỉ số; ghi phép đo trải nghiệm thực tế thay vì khẳng định chung.
- advisor/core: báo cáo kỹ thuật chung, sơ đồ liên kết tới backend/database trong monorepo, hướng dẫn chạy và khắc phục lỗi, slide và kịch bản demo.
- Nhóm: ma trận CLO2/CLO3/CLO4 dẫn tới PR, diff, test, prompt và xác nhận thật của từng thành viên. Kiểm tra liên kết tương đối từ repo standalone.

## Lệnh dùng ở phiên tiếp theo

Ví dụ: **“Dùng $majormatch-team-delivery làm chương 8 cho cả ba module, bắt đầu từ main mới nhất.”**

Skill project: [SKILL.md](../.agents/skills/majormatch-team-delivery/SKILL.md). Nếu skill chưa hiện trên máy khác, yêu cầu agent đọc đường dẫn này trước. Có thể giới hạn: “chương 7, chỉ ingestion”.

Agent phải đọc lại trạng thái thực, `AGENTS.md`, roadmap và bằng chứng mới trước khi thực hiện. Đầu ra mỗi lần: thay đổi có căn cứ, kiểm tra thật, nhật ký theo module, commit nhỏ có nghĩa và PR nếu lần đó được yêu cầu xuất bản. Giữ commit Author = Committer, không gán tên người khác. Việc gọi skill không tự cấp quyền gửi tin cho thành viên, chạy hạ tầng production hoặc merge PR.

## Xuất bản cùng hai repository

Từ monorepo, dùng nhánh `codex/<task>` đồng tên ở cả hai remote. Kiểm tra `git diff --check`, test/typecheck/build trước khi push. Tách subtree `client/` và push sang `client-remote` trước, sau đó mới push cùng tên nhánh sang `origin`. Kiểm tra cây client và cây subtree có cùng tree hash. Nếu lịch sử standalone lệch, điều tra và đồng bộ; không force push.

Mở PR vào `main` trên cả hai repo và dẫn link chéo. Review được gọi trên PR client là bằng chứng chính của bản nộp; PR monorepo giữ bối cảnh toàn hệ thống. Không merge thay người duyệt.

## Skills chính thức đã chọn

Đối chiếu catalog `openai/skills` trực tiếp ngày 27/10/2026:

- [gh-address-comments](https://github.com/openai/skills/tree/main/skills/.curated/gh-address-comments): xử lý nhận xét PR sau review; đã cài trên máy hiện tại.
- [gh-fix-ci](https://github.com/openai/skills/tree/main/skills/.curated/gh-fix-ci): chẩn đoán GitHub Actions khi check thất bại; đã cài trên máy hiện tại.
- [playwright](https://github.com/openai/skills/tree/main/skills/.curated/playwright): ứng viên cho tuần 8, chưa cài trong phiên này. Test được nộp phải nằm trong repo, không chỉ nằm trong skill cá nhân.

Hai skill mới cài được khám phá từ lượt tiếp theo. Skill local không tự bật bot GitHub; xem [hướng dẫn kết nối](../docs/05-testing-and-rules/CODEX_GITHUB_REVIEW.md).
