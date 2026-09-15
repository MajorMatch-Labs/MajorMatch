# PRD Analytics UI — So sánh chuyên ngành và khoảng cách kỹ năng

## Document control

| Field | Value |
|---|---|
| Owner | Nguyễn Thị Ánh Vy |
| Module | Analytics — MajorCard, RadarComparison, SkillBreakdown, `/result` |
| Week / task | Week 4 / Task 1 — UI PRD |
| Status | In review — đã bổ sung review chất lượng liên module; chờ Vy và Tech Lead duyệt design |
| Date | 2026-09-15 |
| Evidence baseline | Monorepo `36b161cd89637b6f705cc9d9290c367fe1c09aca` |
| Branch | `feat/anhvy-w4-analytics-ui-prd` |
| Design task | Task 2 chỉ bắt đầu sau phê duyệt, trên `feat/anhvy-w4-analytics-ui-design` |
| Verification scope | Audit mã nguồn và tài liệu; chưa chạy browser QA, automated tests hoặc usability test |

Quy ước: **VERIFIED** = thấy trực tiếp trong nguồn; **INFERRED** = suy luận có căn cứ; **ASSUMPTION** = giả định chưa được chứng minh; **MISSING** = chưa tìm thấy bằng chứng; **CONTRADICTION** = các nguồn mâu thuẫn; **HUMAN DECISION REQUIRED** = cần chủ sản phẩm quyết định. VERIFIED về sự tồn tại của code/tài liệu không có nghĩa policy đã đúng hoặc UI đã pass.

Review chất lượng từ baseline `9b260e2`: [UI PRD review](../ui-prd-review.md). C01–C11 bên dưới giữ bằng chứng lịch sử; rule auto-mock đã được đồng bộ trong vòng review, nhưng code fallback chưa được sửa. Review không thay thế phê duyệt của Vy hoặc Tech Lead. Các policy D02–D08 vẫn mở.

Mọi đường dẫn nguồn bên dưới tính từ thư mục `client/`, trừ đường dẫn ghi rõ monorepo. Các yêu cầu UI là đích nghiệm thu đề xuất để review, không phải báo cáo đã triển khai.

## 1. Repository understanding

### 1.1. Sản phẩm, hành trình và nguồn

MajorMatch giúp người học đối chiếu sở thích, minh chứng học tập và hướng chuyên ngành, rồi xem khoảng cách kỹ năng và học phần bổ sung. Quyết định của người học là chọn hướng để tìm hiểu/lập kế hoạch; hệ thống chỉ cung cấp gợi ý, không quyết định thay người học. **VERIFIED:** `docs/01-overview/PRODUCT_DISCOVERY.md: §1, Persona A, §3`; `docs/01-overview/PRD.md: §2–4`.

Luồng hiện có: `/upload` → `ApiService.analyzeSkillGap` → `setAnalysisResult` → `/result` → chọn ngành → `generateRoadmap` → `/roadmap`; `/chat` thuộc Advisor. `src/modules/analytics/index.ts` chỉ re-export ba component, không chứa engine phân tích. **VERIFIED:** `src/app/upload/page.tsx: handleStartAnalysis`; `src/app/result/page.tsx: ResultPage, handleGenerateRoadmap`.

| Ref | Nguồn và phần đã đối chiếu | Vai trò |
|---|---|---|
| E01 | `docs/01-overview/PRODUCT_DISCOVERY.md: §1–4, §6` | Proto-persona CNTT, giả thuyết quyết định và provenance; chưa có pilot thực đo |
| E02 | `docs/01-overview/PRD.md: FR-3, FR-5, AC-02, AC-04` | Baseline sản phẩm, Cosine, radar, skill groups |
| E03 | `docs/01-overview/REQUIREMENTS_ANALYSIS.md: D-03–06, UC-03, RTM, §5` | FR-C06–10, các mâu thuẫn, phương pháp test |
| E04 | `docs/03-specifications/FEATURE_SPECIFICATION.md: §2–6, §9` | Hợp đồng đề xuất; chưa phải API/code hoàn thành |
| E05 | `docs/03-specifications/user-stories-analytics.md: US-ANA-01–05` | Story, boundary, accessibility, per-major consistency |
| E06 | `src/app/result/page.tsx: ResultPage, handleGenerateRoadmap` | Điều phối UI và handoff |
| E07 | `src/components/analysis/MajorCard.tsx: MajorCard` | Thẻ ngành |
| E08 | `src/components/analysis/RadarComparison.tsx: RadarComparison` | Biểu đồ hai polygon |
| E09 | `src/components/analysis/SkillBreakdown.tsx: SkillBreakdown` | Ba nhóm kỹ năng |
| E10 | `src/stores/useProfileStore.ts: setAnalysisResult, setSelectedMajor, toggleCompletedItem, resetAll` | State và mô phỏng |
| E11 | `src/types/api.ts`; `src/services/api.ts`; `src/services/mockData.ts` | DTO, network, fixtures |
| E12 | `docs/03-specifications/API_SPEC.md: §2.2`; monorepo `backend-hpc/schemas.py: CalculateMatchResponse`; `backend-hpc/main.py: calculate-match`; `backend-hpc/ml_engine.py: process_skill_assessment, MLEngine` | Đối chiếu backend thực tế; backend không nằm trong subtree client |
| E13 | `docs/05-testing-and-rules/TESTING_PLAN.md: §5–6`; `package.json`; danh sách file test/spec | Kế hoạch có ví dụ Playwright; không tìm thấy suite client thực thi trong checkout |
| E14 | `.agents/rules/client-coding-standards.md`; `tailwind.config.ts`; `src/styles/globals.css` | Atomic selectors, bảng thay thế, Tailwind, tokens và hiệu ứng hiện có |
| E15 | `tasks/README.md`; `tasks/PRD_UI_BASE.md`; `tasks/anh-vy/README.md`; `.agents/skills/prd/SKILL.md` | Quy trình Week 4, template và cổng duyệt design |

### 1.2. Audit UI hiện tại — đọc tĩnh

| Thành phần | VERIFIED — đã có | MISSING / rủi ro suy ra từ code | Yêu cầu liên quan |
|---|---|---|---|
| MajorCard (E07) | Tên, rank, match %, mô tả cắt hai dòng, số missing; callback chọn và chữ “Đang chọn” | `div onClick` không có button/radio semantics, tabIndex hay keyboard handler; không có selected state cho AT. Không validate score; không source/version; progress dùng `style={{ width }}`. Mô tả bị cắt nhưng chưa có cách đọc đầy đủ | FR-02, 03, 06, 07 |
| RadarComparison (E08) | ResponsiveContainer, parent 360px, domain 0–10; hai lớp, nét benchmark đứt, Tooltip/Legend | Không validate sáu trục, không table/caption/axis controls; `majorName` chưa dùng trong chart. `contentStyle`, `wrapperStyle` dùng style object. Chưa xác minh text dài hoặc layout 375px bằng browser | FR-04, 06, 07 |
| SkillBreakdown (E09) | Ba nhóm, count, text và icon; một cột rồi md ba cột | Mảng rỗng chỉ còn count, không giải thích; string[] không có evidence/reason; copy Missing nói “chưa từng tích lũy” quá chắc chắn. Chưa kiểm tra duplicate/cross-category, error/loading | FR-05, 06, 08 |
| `/result` (E06) | Map cards; radar/skills lấy `currentMajor`; chọn local; CTA có spinner/disabled khi sinh roadmap | useEffect và fallback render đều tự lấy mock, không banner. Map toàn bộ response, không giới hạn ba, key=rank, chọn bằng tên. Empty array có thể làm truy cập `currentMajor.major_name` lỗi. Không analysis loading/error/empty; catch roadmap chỉ console; GPA `|| 3.42` làm mất giá trị 0. Có copy tên công nghệ không giúp chọn ngành | FR-01–03, 08–10 |

**INFERRED:** khi toggle checklist, `selectedMajor` có score/radar đã cộng nhưng card vẫn lấy object từ `analysisResult.top_recommendations`; có thể hiện hai Match Score khác nhau cho cùng ngành. Đổi A → B → A lấy lại object gốc trong deck; store không lưu simulation theo ngành. Chưa chạy tương tác để khẳng định biểu hiện runtime. E10 là bằng chứng logic.

### 1.3. Contradiction register — tách khỏi yêu cầu đích

| ID | CONTRADICTION / bằng chứng | Hậu quả và người quyết định |
|---|---|---|
| C01 | E06/E11 tự mock cả lỗi API; E14 yêu cầu auto fallback, nhưng E01/E03/E04/E15 yêu cầu demo chủ động | Che lỗi thật. PRD này theo prompt Week 4: không silent mock; Vy/Tech Lead cần ghi nhận giải quyết xung đột rules |
| C02 | E11 gọi `/analysis/skill-gap`, nhận per-major `top_recommendations`; E12 dùng `/assessment/calculate-match`, `top_matches` và một `radar_chart_data`/`skill_breakdown` cho top 1 | Không thể đổi tên field để có dữ liệu cho mọi ngành. Backend/Tech Lead phải thống nhất per-major contract |
| C03 | Fixture E11 có ba radar riêng, user vector giống nhau nhưng benchmark khác nhau; E12 chỉ tính detail ngành đứng đầu | User vector dùng chung không tự là lỗi khi cùng evidence. Lấy benchmark/skill gap top 1 cho ngành khác là sai. Không tuyên bố frontend hiện tái dùng cùng benchmark ở cả ba fixture |
| C04 | E02 FR-3.4 nói 6–8 trục, 1–10; E03 D-03/E05 chọn sáu trục 0–10. E04 dùng sáu nhóm CNTT tiếng Việt; backend `MAJOR_BENCHMARKS.axes_weights` dùng Core Technical, Domain Specialization, Algorithmic Thinking, System Architecture, Industry Tools, Soft Skills & Professionalism | Cần duyệt taxonomy/ID/domain; không ánh xạ theo vị trí hoặc dịch tên để giả cùng ý nghĩa |
| C05 | E02 nêu Cosine; backend `process_skill_assessment` còn điều chỉnh Holland/tag, floor 35/cap 98.5, làm tròn trước sort; E04/E05 sort raw score, tie theo ID | Ý nghĩa %, precision và ranking chưa thống nhất. Các hằng số code là IMPLEMENTATION-DEFINED BUSINESS RULE — HUMAN REVIEW REQUIRED |
| C06 | E02/E05 ngưỡng GPA hệ 4 và verified project; backend `analyze_skill_breakdown` dùng user skill score >=7, >=3, tự thêm Missing khi rỗng; E09 chỉ render string[] | Chưa đủ evidence để xác nhận “đã đạt”. Backend/domain owner cần phê duyệt mapping và ngưỡng |
| C07 | E10 cộng ±0.3 mọi trục và ±0.6 Match; E04 §4.4 yêu cầu baseline bất biến, mapping task-axis có version, không cộng Match tùy ý | Clamp có thể mất đảo ngược; snapshot không riêng từng ngành. Vy phối hợp Long Nhật |
| C08 | E14 cấm inline styles, yêu cầu keyboard và bảng thay thế; E07/E08 còn style object và thiếu hỗ trợ đó | Khoảng cách triển khai, không sửa code trong Task 1 |
| C09 | E03/E05 mục tiêu p95 <50ms; E13 QA-05 ghi <16ms; ví dụ test chỉ kiểm tra số tăng | Tech Lead chọn tiêu chí hiệu năng; chưa có phép đo để xác nhận cả hai |
| C10 | E06 GPA mẫu; E11 roadmap fallback chỉ đổi tên ngành trên fixture AI, E12 yêu cầu major ID/courses/current semester | Roadmap có thể không đúng ngành. Handoff live bị chặn khi thiếu context hợp lệ |
| C11 | Backend `compute_radar_axes` đặt sàn hiển thị 1.5 và fallback mean 3.5; E05 cấm biến thiếu evidence thành điểm đo | Domain owner quyết định xử lý thiếu dữ liệu; không diễn giải sàn là năng lực thật |

## 2. Introduction / overview

PRD hỗ trợ sinh viên đại học chọn một chuyên ngành để tìm hiểu sâu: so sánh tối đa ba gợi ý, đối chiếu sáu trục năng lực với benchmark của đúng ngành, rồi hiểu kỹ năng cần bổ sung trước khi xem học phần gợi ý. **VERIFIED — quyết định Vy ngày 2026-09-15:** câu 1A và 2A. Phạm vi CNTT kế thừa E01; mở rộng sang mọi ngành là **ASSUMPTION**, chưa thuộc PRD này.

Chọn thẻ là xem chi tiết, không phải đăng ký/nguyện vọng chính thức. Điểm match không phải confidence, xác suất tuyển dụng, dự báo thu nhập hay bằng chứng thị trường. Độ chính xác mô hình, nguồn benchmark được công nhận và hiệu quả giúp chọn ngành: **UNKNOWN / MISSING**.

## 3. Goals and non-goals

| Objective | Mục tiêu nghiệm thu |
|---|---|
| O1 | Người học so sánh các gợi ý và xác định đúng ngành đang xem; tất cả vùng chi tiết nhất quán theo ngành |
| O2 | Đọc chính xác sáu cặp điểm và lý do phân nhóm kỹ năng; thiếu evidence phải phân biệt với điểm 0 |
| O3 | Nhận biết REAL/MOCK/DERIVED/AI-GENERATED và phục hồi sau lỗi mà không bị đổi sang thành công giả |
| O4 | Hoàn thành chọn ngành và đọc dữ liệu ở 375px, bằng keyboard/screen reader, không bắt buộc hover |
| O5 | Chuyển sang học phần/lộ trình với đúng ngành và missing skills; giữ dữ liệu gốc khi quay lại |

Non-goals: tạo design/mockup/Figma hoặc sửa component trong nhánh PRD; phát minh thuật toán scoring/nguồn benchmark; xây ingestion, engine backend, checklist hoặc chat; thêm dashboard cố vấn, salary, confidence, dự báo việc làm, chia sẻ hồ sơ tự động. Analytics chỉ đặc tả biên handoff với các module đó.

## 4. Target users and user needs

- **Chính — VERIFIED theo Vy:** sinh viên đại học đang chọn chuyên ngành. E01 Persona A mô tả sinh viên CNTT năm hai chọn học phần/hướng thực tập; đây là proto-persona, chưa có phỏng vấn xác thực. Cần thấy khoảng cách có nguồn và hành động học tiếp.
- **Phụ — E01/E05:** học sinh THPT quan tâm CNTT, chưa có điểm đại học. Có thể xem định hướng theo sở thích; không gán GPA/skills mẫu, không coi RIASEC là vector năng lực.
- **Hỗ trợ — E01 Persona C:** cố vấn cùng xem phiên do người học chủ động chia sẻ; cần reason và nguồn. Không có quyền xem hồ sơ người khác trong phạm vi này.

## 5. User journey and information hierarchy

| State | Quyết định | Thông tin chính | Thứ cấp | Hành động chính | Recovery |
|---|---|---|---|---|---|
| Chưa có kết quả | Bắt đầu phân tích | “Chưa có kết quả” | Giải thích dữ liệu cần có; lựa chọn demo rõ ràng | Về `/upload` | Bắt đầu lại phiên |
| Loading | Chờ hay quay lại | “Đang phân tích”/“Đang tải chi tiết ngành …” | Không có điểm giả | Chờ; không submit trùng | Quay lại ingestion; vô hiệu response cũ |
| Success | Chọn ngành để đọc sâu | Nguồn dữ liệu → danh sách ngành → ngành đang chọn → radar/bảng → skill groups | Nguồn benchmark, model, reason/evidence, giới hạn chỉ số | Chọn ngành; sau đó “Xem học phần gợi ý” qua handoff roadmap | Chọn ngành khác hoặc sửa hồ sơ |
| Interest-only / partial | Có cần thêm evidence | Hạn chế dữ liệu ngay trong vùng radar/skills | Benchmark có nguồn nếu hợp lệ | Bổ sung hồ sơ; vẫn so sánh phần hợp lệ | Không chèn vector mẫu |
| Empty response | Có thử lại dữ liệu đầu vào | Không có gợi ý phù hợp trong kết quả này | Không tự kết luận không có ngành phù hợp | Sửa thông tin ở `/upload` | Phân tích lại chủ động |
| Error / stale | Khắc phục hay thử lại | Lỗi cụ thể hoặc “Kết quả cần phân tích lại” | Phần dữ liệu cũ nếu giữ phải có nhãn stale | Retry khi có thể, hoặc sửa hồ sơ | Demo riêng do người học chọn |
| Roadmap pending/error | Tiếp tục học phần | Ngành đang gửi, trạng thái tiến trình/lỗi | Giữ radar/skill breakdown để đọc | Chờ hoặc thử lại | Ở lại `/result`, không mất lựa chọn |

## 6. User stories

Các checklist dưới là việc phải xác minh khi triển khai, **chưa chạy**. Mỗi story dùng state tương ứng ở §8 và scenario §14; không yêu cầu tạo test code trong PRD.

### ANA-US-01 — So sánh và chọn ngành (E05 US-ANA-02)

As a sinh viên đại học đang chọn chuyên ngành, I want xem tối đa ba gợi ý và chọn một ngành, so that tôi so sánh trước khi đọc chi tiết.

- [ ] Tên, điểm có giải thích/nguồn, mô tả đầy đủ truy cập được, selected state rõ; chính sách sort chờ D02; 0/1/2 ngành không nhân bản.
- [ ] Invalid score/ID có lỗi; loading không điểm giả; empty/error có recovery; keyboard và 375px đạt AC01/AC04/AC05.
- [ ] Typecheck và lint pass.
- [ ] Verify bằng browser automation tương đương được repo cho phép; ghi viewport và evidence.

### ANA-US-02 — Đọc sáu cặp điểm (E05 US-ANA-01, 04)

As a sinh viên có evidence học thuật, I want xem radar và bảng số của ngành chọn, so that tôi hiểu khoảng cách của từng nhóm năng lực.

- [ ] AC02: sáu trục hợp lệ, hai lớp có nhãn, table dùng cùng dữ liệu; không polygon năng lực khi thiếu evidence.
- [ ] Error/retry, loading, touch/keyboard, label dài và provenance theo FR-04/06/07.
- [ ] Typecheck và lint pass.
- [ ] Verify browser ở 375px, tablet, desktop và zoom 200%; lưu evidence.

### ANA-US-03 — Hiểu nhóm kỹ năng (E05 US-ANA-03)

As a sinh viên xem ngành đã chọn cùng cố vấn, I want đọc reason và evidence cho từng nhóm kỹ năng, so that tôi biết cần xác minh hoặc học thêm điều gì.

- [ ] AC03: không trùng nhóm; count khớp; nhóm rỗng có giải thích; thiếu evidence khác không có năng lực; không tự phân loại từ string[] legacy.
- [ ] Loading/error/retry và nguồn theo FR-05/06/08; nội dung đọc được bằng screen reader và mobile.
- [ ] Typecheck và lint pass.
- [ ] Verify browser với nhóm rỗng, nhãn dài và dữ liệu invalid; lưu evidence.

### ANA-US-04 — Đổi ngành nhất quán (E05 US-ANA-05)

As a sinh viên so sánh nhiều hướng, I want đổi ngành và quay lại mà dữ liệu gốc không đổi, so that tôi so sánh đúng cùng hồ sơ.

- [ ] AC04/AC07: title, card, radar, skills, CTA cùng major/snapshot; cached switch không request; detail thiếu có unavailable/loading chứ không reuse top 1.
- [ ] Error/retry giữ major đích; phản hồi muộn không ghi đè; simulation gắn đúng ngành và nhãn DERIVED.
- [ ] Typecheck và lint pass.
- [ ] Verify browser keyboard, 375px và network trace; đo hiệu năng riêng sau D08.

### ANA-US-05 — Nhận biết nguồn và phục hồi (E03 BG-05, E04 §3/6)

As a sinh viên nhận kết quả phân tích, I want biết kết quả là thật, mẫu hay mô phỏng và sửa được lỗi, so that tôi không ra quyết định từ dữ liệu giả không được báo trước.

- [ ] AC05/AC08: nhãn nguồn xuyên suốt; không auto mock; refresh/deep link, validation, timeout, 429 và retry có state rõ.
- [ ] Alert/status có text, focus hợp lý và đọc được ở 375px; nguồn unknown không bị nâng thành REAL.
- [ ] Typecheck và lint pass.
- [ ] Verify browser và fault injection bằng fixture; không dùng hồ sơ thật trong evidence.

### ANA-US-06 — Xem học phần gợi ý (E02 FR-4, E06 handoff)

As a sinh viên đã chọn hướng tìm hiểu, I want chuyển sang học phần gợi ý cho kỹ năng cần bổ sung, so that tôi có hành động tiếp theo.

- [ ] AC06: payload/snapshot đúng ngành; missing context hiện hướng bổ sung; duplicate, timeout, retry và late response được xử lý.
- [ ] CTA có keyboard, focus, loading/disabled và nhãn AI-GENERATED hoặc MOCK đúng nguồn; không tự gán GPA.
- [ ] Typecheck và lint pass.
- [ ] Verify browser handoff và back navigation; ghi nguồn fixture và viewport.

## 7. Functional requirements

| ID | Yêu cầu đích |
|---|---|
| ANA-UI-FR-01 | `/result` phân biệt no-session, loading, empty response, success, partial, stale, error; chỉ hiển thị fixture sau lựa chọn demo rõ ràng |
| ANA-UI-FR-02 | Hiển thị tối đa ba gợi ý hợp lệ; có tên, chỉ số có ngữ cảnh, mô tả và thao tác chọn. Không tự sửa thứ hạng/precision trước D02; policy đề xuất kế thừa E04/E05 ở §9 |
| ANA-UI-FR-03 | Chọn bằng stable ID; lần đầu chọn gợi ý đầu sau validation; giữ lựa chọn hợp lệ trong cùng snapshot. Một lần chọn cập nhật toàn bộ chi tiết/CTA; không reload hoặc fetch nếu cache đầy đủ |
| ANA-UI-FR-04 | Radar dùng sáu axis ID duy nhất và taxonomy/domain đã duyệt, hai lớp cùng trục; table và axis detail có cùng giá trị, nhãn đầy đủ; không thay dữ liệu thiếu bằng 0 hoặc mock |
| ANA-UI-FR-05 | Ba nhóm kỹ năng loại trừ nhau, count chính xác, có reason/source khi được cung cấp. Legacy thiếu evidence phải báo chưa xác minh; invalid evidence là lỗi, không tự biến thành Missing |
| ANA-UI-FR-06 | Phân biệt REAL/MOCK/STATIC/DERIVED/AI-GENERATED/UNKNOWN theo §9; đưa nguồn và giới hạn gần điểm/chart, không chỉ trong tooltip |
| ANA-UI-FR-07 | Keyboard, screen reader, responsive và reduced motion đạt §10; thông tin không phụ thuộc màu hoặc hover |
| ANA-UI-FR-08 | Lỗi theo §11 có thông điệp, hành động sửa/retry, kết thúc loading; không commit state một phần hoặc silent fallback |
| ANA-UI-FR-09 | CTA học phần dùng đúng ngành/missing skills/context đã xác nhận; pending chặn submit trùng, lỗi giữ selection, chỉ chuyển `/roadmap` sau response hợp lệ đúng request |
| ANA-UI-FR-10 | Tách baseline và simulation theo ngành/version; đổi hồ sơ làm kết quả stale; không cộng Match gốc, không giữ roadmap sai ngành; xử lý refresh/back theo §11 |
| ANA-UI-FR-11 | Nhận invalidation từ mọi thay đổi profile, path, survey hoặc tag của Ingestion; một snapshot mới vô hiệu request và handoff cũ. Phản hồi chỉ được ghi khi còn đúng snapshot, major và request; kiểm bằng XUI-AC-01/03 |

## 8. UI state matrix

| Feature | Default / empty | Loading | Success | Error / retry | Disabled | Data provenance |
|---|---|---|---|---|---|---|
| `/result` | Deep link: chưa có kết quả, về upload; response []: không có gợi ý | Status có tên tác vụ, skeleton không số giả | Hierarchy §5 và current snapshot | Alert; retry khi retryable; sửa input khi invalid | Handoff khi thiếu valid detail/context hoặc stale | Banner REAL/MOCK/UNKNOWN; nhãn cấp trường |
| Major deck | Không thẻ; 1–2 thẻ giữ số thực | Skeleton parent | Tối đa ba, một selected | Lỗi contract tại deck, không render thẻ sai | Selection khi đang thay snapshot; pending roadmap khóa đổi ngành theo §11 | Match DERIVED trên REAL/MOCK; mô tả STATIC/AI-GENERATED chỉ khi biết nguồn |
| Radar/table | Chưa chọn / thiếu academic evidence; benchmark riêng nếu hợp lệ | Khung ổn định, aria-busy | Hai lớp và table nhất quán; phần chưa có số ghi “Chưa có dữ liệu” | Sai shape/range: bỏ polygon lỗi, lỗi và retry từ controller | Axis control chưa có dữ liệu không hoạt động, có lý do | Năng lực REAL hoặc DERIVED; benchmark STATIC có nguồn hoặc UNKNOWN; demo MOCK |
| SkillBreakdown | Ba nhóm 0 nếu dữ liệu hợp lệ rỗng; thiếu evidence ghi chưa xác minh | Skeleton ba nhóm | Count/list/reason/source | Duplicate hoặc evidence lỗi: chỉ rõ dữ liệu chưa hợp lệ, retry | Không có thao tác chọn giả trên chip | REAL evidence; DERIVED category; MOCK fixture |
| Axis detail | Đóng, controls có tên | Không request riêng khi cache đủ | Hover/focus/tap cùng số và gap | Dữ liệu thiếu không tính gap | Invalid axis không cho đọc số giả | Gap DERIVED từ hai số có nguồn |
| Roadmap CTA | Hướng dẫn chọn ngành/bổ sung context | Nút disabled và status | Chuyển roadmap đúng ngành | Giữ kết quả; chủ động retry | Thiếu detail/context, stale hoặc pending | AI-GENERATED với output AI xác định; MOCK nếu demo |

Không có endpoint detail riêng được xác minh: loading detail chỉ áp dụng khi contract được thống nhất; hiện thiếu detail thì unavailable, không dựng endpoint tưởng tượng.

## 9. Business, validation, and data rules

| Rule | Nguồn / trạng thái | Target và edge cases | Test |
|---|---|---|---|
| R01 Ranking | E04 §4.5/E05 US-ANA-02 đề xuất raw score giảm, tie ID tăng, lấy ba, hiển thị một số thập phân; **HUMAN DECISION REQUIRED D02**, khác backend C05 | Adapter/deck; ID thiếu/trùng, score không hữu hạn hoặc ngoài [0,100] là invalid, không clamp che lỗi; không tự tạo stable ID từ rank/tên | AC01; T-ANA-02 |
| R02 Radar | E03 D-03/E05: sáu trục 0–10; domain/taxonomy chờ D03 | Validator/chart; thiếu/trùng/5/7 trục, NaN, ngoài miền không vẽ polygon sai; đổi thứ tự qua ID được duyệt, không qua vị trí | AC02; T-ANA-01 |
| R03 Skill groups | E02 FR-3.3; E03 D-05/E04 §4.2 bổ sung grade <2, verified project, chọn điểm cao nhất khi nhiều course; chờ D04 | Evidence adapter/SkillBreakdown; 3.0, 2.99, 2.0, 1.99, 0, thiếu evidence, project chưa xác minh; invalid grade không thành Missing | AC03; T-ANA-03 |
| R04 Per-major | E04 §2.4/5, E05 US-ANA-05 | Store/controller; thiếu detail của B không dùng detail A; stable ID và generation phải có contract, C02 chặn live | AC04/07; T-CONTRACT-01 |
| R05 Simulation | E04 §4.4; C07 | Analytics chỉ đọc snapshot gốc hoặc preview có nhãn. Không mapping task-axis đã duyệt thì giữ radar gốc; không làm điểm match gốc tăng | AC07; T-ANA-05 |
| R06 Missing GPA/context | E06 dùng `|| 3.42`; đây là IMPLEMENTATION-DEFINED BUSINESS RULE — HUMAN REVIEW REQUIRED, bị loại khỏi yêu cầu đích | Handoff; 0 hợp lệ không bị thay; absence yêu cầu bổ sung context theo contract, không mặc định profile mẫu | AC06 |
| R07 Provenance | E01/E04/E15; schema E11/E12 còn thiếu metadata | Validator/view model cần metadata được thống nhất; không tự sinh curriculum/model version hoặc timestamp như thể do nguồn trả | AC05 |

**Quy ước nhãn hiển thị đề xuất:**

- **REAL — Dữ liệu từ hồ sơ/phiên thật:** chỉ khi biết nguồn và phiên; HTTP 200 không đủ chứng minh tính chính xác. Giá trị do engine tính từ hồ sơ thật mang cả REAL (nguồn đầu vào) và DERIVED (phép tính).
- **MOCK — Dữ liệu minh họa:** fixture, cả kết quả và handoff demo; luôn có banner, không đổi tên target để giả cá nhân hóa.
- **STATIC — Dữ liệu tham chiếu cố định:** taxonomy/benchmark/catalog có nguồn/version. Hardcoded không đồng nghĩa đã được công nhận; nguồn chưa xác minh ghi UNKNOWN.
- **DERIVED — Chỉ số tính toán / mô phỏng:** Match, gap, category hoặc preview checklist; chỉ tính gap = benchmark − current khi cả hai hợp lệ cùng trục. Ví dụ 8.5 − 8 = 0.5 từ fixture E05, không phải confidence. Âm nghĩa current cao hơn benchmark trên trục, không tự kết luận sẵn sàng làm việc.
- **AI-GENERATED — Nội dung AI gợi ý:** chỉ gắn khi biết nội dung do model tạo; không áp nhãn này cho mọi điểm/fixture vì sản phẩm có AI. Roadmap thực cần người học/cố vấn kiểm tra.
- **UNKNOWN — Chưa xác minh nguồn:** giữ giới hạn ngay cạnh nội dung; không công bố “chuẩn ngành được xác thực”.

Match Score, radar năng lực, RIASEC và readiness là các khái niệm riêng. Không biến RIASEC ×2 thành competence; không dùng readiness thay Match; không thêm confidence/salary/market evidence. Không tăng precision ngoài nguồn hoặc suy độ chính xác từ số chữ số thập phân.

## 10. Accessibility and responsive requirements

- Deck là nhóm lựa chọn radio semantic với legend “Chọn chuyên ngành để xem chi tiết”; Tab vào nhóm, phím mũi tên đổi lựa chọn, Space chọn; nhãn gồm tên và trạng thái/điểm có ngữ cảnh. Nếu team chọn button pattern thay thế phải ghi quyết định và dùng Enter/Space, aria-pressed nhất quán. Không `div onClick` không keyboard.
- Heading theo thứ tự, tên ngành nằm trong heading vùng chi tiết; table có caption gồm ngành/nguồn, header cột và header hàng. Các cột: trục đầy đủ, hiện tại, benchmark, chênh lệch, nguồn/giới hạn; sáu hàng cùng data của radar. “Chưa có dữ liệu” thay ô trống hoặc 0 giả. Bảng có thể thu gọn bằng nút semantic nhưng luôn truy cập được.
- Axis controls có tên, dùng touch/focus/hover để mở cùng nội dung; Escape/nút đóng đóng detail và trả focus về control; không keyboard trap hoặc phụ thuộc focus SVG. Tooltip không che vùng đang đọc.
- Đổi ngành giữ focus tại control và announce ngắn “Đã chọn …, chi tiết đã cập nhật” bằng polite status; loading aria-busy, spinner có text; lỗi cần chú ý dùng role=alert một lần, retry có tên tác vụ.
- Focus nhìn thấy; selected không chỉ màu. Mục tiêu theo E14 WCAG 2.1 AA: contrast text thường >=4.5:1, text lớn >=3:1, control/focus thiết yếu >=3:1 với nền; cần đo trên màu composite glass thực. Chưa đo trong audit này.
- 375px: một cột theo hierarchy §5, thẻ không carousel bắt buộc, nhãn ngành/trục/skill dài wrap; không overflow toàn trang. Table giữ nội dung đầy đủ; nếu cần scroll ngang thì chỉ trong vùng có tên và keyboard, trang vẫn không tràn. Zoom 200% vẫn chọn và đọc được.
- Tablet kiểm ở 768px; desktop 1280px kiểm deck và detail song song khi đủ chỗ. Breakpoints hiện E03: sm=640, md=768, lg=1024. Kích thước là viewport nghiệm thu đề xuất, không kết quả test.
- Reuse ResponsiveContainer với parent min-width phù hợp và height xác định; E04 đề xuất 320px mobile/360px lớn hơn, chỉ chốt sau kiểm nhãn thật. Không khẳng định 360px hiện tại đã lỗi ở 375px.
- `prefers-reduced-motion` bỏ scale/pulse/animation radar không thiết yếu; đổi ngành phải đọc được ngay mà không chờ animation.

## 11. Error and recovery behavior

| Tình huống | Phản hồi và phục hồi |
|---|---|
| Input không hợp lệ / 400, 413, 415, 422 | Giải thích chỗ cần sửa; về ingestion khi cần; không retry vòng lặp hoặc mock |
| JSON/schema sai, score/axis/evidence invalid | DATA_CONTRACT_ERROR; không commit state một phần, không clamp; retry chỉ gửi lại theo hành động người học |
| Thiếu dữ liệu theo ngành | Chọn B vẫn ghi B; vùng B unavailable; không hiển thị A dưới tên B. Chỉ fetch khi có contract được thống nhất |
| Network / 5xx | Kết thúc loading, giữ input/selection và lỗi; nút thử lại chủ động; không POST lại tự động thiếu idempotency |
| Timeout | E03 D-06/E04 đề xuất business timeout 15s; E11 hiện analysis 6s/roadmap 20s là mâu thuẫn cần D08. Sau timeout kết thúc busy, hủy/ignore response cũ và cho retry |
| 429 | Hiện thời gian chờ nếu Retry-After hợp lệ; disable retry tới hết hạn, không dựng thời gian giả |
| 401/403 | Báo quyền/phiên không hợp lệ theo service; không tự tạo luồng đăng nhập chưa tồn tại |
| Submit trùng / request muộn | Một request đang chạy; trong lúc sinh roadmap khóa chọn ngành và CTA với lý do, vẫn đọc được kết quả. Hủy/quay lại làm generation cũ vô hiệu; response chỉ commit khi request, major và snapshot còn khớp |
| Refresh/deep link | Store hiện in-memory; mất session hiển thị chưa có kết quả và CTA upload; demo là lựa chọn riêng. Không thêm persistence hồ sơ ngầm |
| Back từ roadmap | Trong cùng session giữ selected major và baseline; preview mô phỏng có nhãn riêng. Nếu session mất dùng no-session state |
| Hồ sơ/survey thay đổi | Mark stale và yêu cầu phân tích lại trước handoff; không trộn profile mới với analysis cũ |
| Path/tag thay đổi | Cùng quy tắc invalidation với hồ sơ/survey; giữ input mới, chặn handoff cũ và vô hiệu response đang chạy; phối hợp Hoàng và Nhật theo XUI-AC-01 |
| Interest-only thiếu context roadmap | Giữ phần phân tích hợp lệ đọc được; giải thích thiếu học kỳ/môn đã học, không gán semester hoặc GPA mẫu. Cách thu context hoặc roadmap thay thế chờ D06 / XD-01 |
| Empty skill group | Count 0 và giải thích “Không có kỹ năng trong nhóm này theo dữ liệu hiện có”; không tự thêm skill |

## 12. Design considerations

Đây là design brief bằng yêu cầu, chưa tạo màn hình hoặc design asset. Ưu tiên hierarchy quyết định trước hiệu ứng. Reuse tokens `brand`, `accent`, `surface` và `.glass-panel` từ E14 sau kiểm contrast. Card phục vụ lựa chọn; badge phục vụ trạng thái/nguồn; số phục vụ đối chiếu có nguồn; icon phải có text; gradient/animation chỉ giữ nếu không giảm khả năng đọc. Không thêm trophy hoặc claim “tốt nhất” để hàm ý đảm bảo kết quả. CTA chính mở học phần gợi ý; tên engine/Ollama/RAG không cần xuất hiện trong copy người học. Mọi state §8 phải nằm trong handoff Task 2.

## 13. Technical considerations

**VERIFIED E11/E14:** Next.js 14.2.14, React 18, TypeScript, Recharts ^2.12.7, Zustand ^4.5.5, Tailwind; các component analytics là client components. Giữ API phù hợp phiên bản trong repo; không nâng dependencies trong PRD. Store cần atomic selectors và per-major snapshot theo hợp đồng E04; đó là đích refactor, chưa tồn tại.

Phụ thuộc phải giải quyết: stable major/axis ID, per-major detail, curriculum/model source/version, evidence/reason, request generation, provenance, handoff roadmap đúng DTO. API hiện không đủ các trường này. Không định nghĩa endpoint mới như đã tồn tại. C02/C04/C06 yêu cầu phối hợp backend; C07/C10 phối hợp Long Nhật; C01/input provenance phối hợp Văn Hoàng. Không gửi profile vào URL, log hoặc evidence; dùng fixtures tổng hợp khi kiểm thử.

## 14. Acceptance criteria

Tất cả scenario dưới đây là **planned / UNTESTED**; không phải test đã pass.

| ID | GIVEN / WHEN / THEN và oracle |
|---|---|
| AC01 | GIVEN policy D02 được duyệt và fixture A=82.44, B=91.25, C=82.44, D=60; WHEN dựng deck; THEN theo đề xuất E05 hiển thị B,A,C, tie ID tăng, 1 chữ số thập phân. Với 2 ngành chỉ có 2; [] là empty; score -1/101/NaN hoặc ID trùng là lỗi. Nếu D02 đổi, cập nhật oracle trước design |
| AC02 | GIVEN sáu trục hợp lệ theo D03 với E05 current 8.5,8,7.5,7,9,6 và benchmark 9,8.5,9.5,8.5,8,8; WHEN mở chart/table; THEN cả hai cùng sáu cặp số, đúng ngành/nguồn. 5/7/trùng axis hoặc >10 không vẽ polygon sai; interest-only không có polygon năng lực giả |
| AC03 | GIVEN rule D04 đã duyệt; WHEN xem evidence grade 3.0/2.99/2.0/1.99/0; THEN theo E05: Mastered/Developing/Developing/Missing-below-threshold/Missing-below-threshold. Evidence absent và project chưa xác minh có reason no-evidence, không xác nhận năng lực; empty group giữ 0; duplicate/cross-group lỗi. Legacy string[] không được tuyên bố đã xác thực ngưỡng |
| AC04 | GIVEN A/B có validated detail cache; WHEN chọn B bằng keyboard/touch; THEN card, heading, radar/table, skill groups và CTA đều là B, không request/reload. Thiếu detail B không reuse A; giữ focus và announce ngắn |
| AC05 | GIVEN direct `/result`, API fail hoặc fixture demo; WHEN mở/refresh/retry; THEN lần lượt có no-session, error hoặc banner MOCK; không fail → mock success. REAL cần nguồn, DERIVED/AI-GENERATED không bị giấu; lỗi có recovery và kết thúc busy |
| AC06 | GIVEN B được chọn và context hợp lệ; WHEN bấm học phần hai lần; THEN một request, đúng B/missing skills, không GPA mẫu. Response hợp lệ mới navigate; fail ở lại với retry. Response request cũ sau hủy/đổi snapshot không đổi roadmap hiện tại |
| AC07 | GIVEN A có simulation và B không có; WHEN đổi A→B→A hoặc bỏ tick đã clamp ở 10; THEN baseline/Match gốc giữ nguyên và mỗi ngành có preview đúng version. Thiếu mapping thì radar giữ gốc. Hồ sơ đổi làm analysis stale, handoff bị khóa |
| AC08 | GIVEN 375px, 768px, 1280px và zoom 200%, keyboard/screen reader, reduced motion; WHEN chọn ngành/đọc trục/đóng detail/retry; THEN không tràn trang, đọc đủ nhãn/số qua table, focus không mất, text/status đúng, không cần hover. Đo contrast thực; không lấy build pass thay browser QA |

## 15. Traceability matrix

Các AC01–AC08 là ID cục bộ của PRD Analytics. Dùng tên file hoặc tiền tố Analytics khi viện dẫn từ tài liệu khác; XUI-AC-* thuộc [bộ nghiệm thu liên module](../ui-prd-review.md#10-acceptance-criteria-audit).

Status phản ánh baseline code, không phải mức hoàn thành tài liệu.

| Objective | Epic | Story | Acceptance criteria | Feature / UI state | Implementation target | Test | Status |
|---|---|---|---|---|---|---|---|
| O1 | BG-02 / FR-C07 | ANA-US-01 / US-ANA-02 | AC01,04,08 | Deck success/empty/error; FR-02/03/07 | MajorCard, result, adapter mục tiêu | T-ANA-02, T-A11Y-01 | PARTIAL |
| O2 | BG-02 / FR-C06 | ANA-US-02 / US-ANA-01 | AC02 | Radar/table partial/invalid; FR-04/06 | RadarComparison, validator mục tiêu | T-ANA-01, T-CONTRACT-01 | PARTIAL |
| O4 | BG-02 / FR-C09 | ANA-US-02 / US-ANA-04 | AC08 | Axis detail/touch/focus; FR-07 | RadarComparison, table/control mục tiêu | T-ANA-04, T-A11Y-01 | MISSING IMPLEMENTATION |
| O2 | BG-02 / FR-C08 | ANA-US-03 / US-ANA-03 | AC03 | Skill groups success/empty/invalid; FR-05/06 | SkillBreakdown, evidence adapter/backend | T-ANA-03 | CONTRADICTORY |
| O1 | BG-02 / FR-C10 | ANA-US-04 / US-ANA-05 | AC04,07 | Switching/cache/stale; FR-03/10 | result, useProfileStore, per-major contract | T-ANA-05, T-CONTRACT-01 | CONTRADICTORY |
| O3 | BG-05 / FR-C05 | ANA-US-05 / US-ING-05 dependency | AC05 | No-session/demo/error/retry; FR-01/06/08 | result, api, store, ingestion boundary | T-DEMO-01, T-ING-05 | CONTRADICTORY |
| O5 | BG-03 / FR-4 | ANA-US-06 | AC06 | Roadmap pending/error/disabled; FR-09 | result.handleGenerateRoadmap, api, Advisor boundary | Handoff fixture + late response scenario | PARTIAL |
| O4 | BG-02 / NFR-C01 | ANA-US-04 / US-ANA-05 | AC04; D08 performance gate | Cached switching; FR-03 | store, result, RadarComparison | T-PERF-01 | UNTESTED |
| O3 | BG-05 | ANA-US-05 | AC05 | Auto-mock/GPA mẫu trái brief | result, api, upload | Negative fallback tests planned | ORPHAN IMPLEMENTATION |
| O1/O3/O5 | So sánh nhất quán xuyên module | ANA-US-04/05/06 | XUI-AC-01–06 | Evidence thay đổi, demo, thiếu detail/context, simulation và back | Ingestion/result/Advisor handoff; FR-11 | Integration + browser dự kiến | UNTESTED |

### Đồng bộ với hai PRD còn lại

- REAL/MOCK mô tả nguồn phiên tương ứng LIVE/DEMO; DERIVED và AI-GENERATED là cách tạo nội dung, có thể đi cùng cả hai nguồn. LIVE/REAL không xác nhận độ chính xác; thông tin nguồn chưa có giữ UNKNOWN.
- Vy sở hữu danh sách/chọn ngành, chi tiết đang hiển thị và trạng thái CTA tại `/result`; Nhật phối hợp contract/generation và state roadmap/chat. Hoàng phát tín hiệu input thay đổi. Phân công này làm rõ các boundary đã có, không tạo API mới.
- XUI-AC-03 kiểm tra thiếu detail của B không dùng detail A; XUI-AC-05 kiểm tra simulation đúng snapshot/ngành và không đổi Match/radar gốc. Retention của simulation qua reload chưa được cấp phép.
- C01 được giải quyết ở chỉ dẫn coding theo yêu cầu Week 4; vẫn phải kiểm chứng lỗi API không thành mock success khi triển khai. D01 cần ghi nhận khi duyệt PRD, không giả định review này là chữ ký của Vy.

## 16. Success metrics

Outcome baseline và target đã được duyệt riêng cho Analytics Week 4: **UNKNOWN — HUMAN DECISION REQUIRED**. E01 có ngưỡng pilot đề xuất (activation, hiểu chỉ số, nhận biết demo), không coi chúng là KPI đã duyệt hoặc số liệu thực tế.

Phương pháp đề xuất: cho sinh viên chọn một hướng và giải thích hai khoảng cách có evidence, nêu đúng nguồn demo/real và giới hạn chỉ số, rồi mở học phần đúng ngành; ghi số đạt/tổng người, lỗi và thời gian tác vụ. Chốt mẫu tuyển, tiêu chí thành công và quyền thu event ở D07; không thu hồ sơ/điểm cá nhân vào log. Hiệu năng cached switching kế thừa phương pháp T-PERF-01: production build, thiết bị/browser ghi rõ, warmup, 30 lần, đo event-to-paint và network; target chờ D08, chưa có số đo.

## 17. Open questions and human decisions

**VERIFIED — trả lời thật của Vy trong phiên 2026-09-15:** 1A sinh viên đại học chọn chuyên ngành; 2A chọn ngành để xem kỹ năng thiếu và học phần gợi ý; 3A ghi điểm chưa xác minh và để quyết định chặn duyệt design cho Vy/Tech Lead. Đây là quyết định định hướng, **không phải phê duyệt PRD**.

| ID | HUMAN DECISION REQUIRED | Người cần chốt | Blocking design |
|---|---|---|---|
| D01 | Ghi nhận bỏ auto-mock theo prompt Week 4, thống nhất lại rule fallback C01 | Vy + Tech Lead + ingestion owner | Có |
| D02 | Ranking owner/backend hay adapter; raw vs rounded; tie ID; precision; giải thích Match có Holland/tag/floor/cap; nguồn/model version | Vy + Tech Lead + backend owner | Có |
| D03 | Taxonomy/axis IDs, đúng sáu trục và 0–10; benchmark nguồn/phiên bản; thiếu evidence và sàn điểm; per-major contract C02–04/C11 | Vy + Tech Lead + domain/backend owner | Có |
| D04 | Ngưỡng/evidence skill, project verified, nhiều course cùng skill, xử lý below-threshold/no-evidence; không tự thêm Missing | Vy + domain/backend owner + Tech Lead | Có |
| D05 | Snapshot theo ngành, preview simulation và task-axis mapping; Match gốc không tự tăng | Vy + Long Nhật | Có |
| D06 | Context học phần: major ID, current semester/courses; hành vi unavailable/interest-only và demo; không GPA mẫu | Vy + Long Nhật + backend owner | Có |
| D07 | Target/baseline đo hiểu dữ liệu và hoàn thành tác vụ; mẫu pilot và event được phép | Vy + Tech Lead | Có |
| D08 | Tiêu chí performance <50ms p95 hay QA-05 <16ms; timeout nghiệp vụ 15s hay giá trị hiện tại | Tech Lead + backend owner | Có |

Không quyết định thay domain owner các policy có số hoặc tự thêm nguồn. Sau khi chốt phải cập nhật requirement, scenario và log cùng nhau; unresolved blocking decision giữ status In review, chưa được Approved for design.

## 18. Design handoff checklist

- [x] Đã ghi ba lựa chọn định hướng của Vy và audit bốn thành phần hiện tại.
- [x] Có hierarchy, state matrix, recovery, provenance và traceability dựa trên repository.
- [ ] PRD được Vy và Tech Lead phê duyệt bằng review có ghi ngày/link.
- [ ] D01–D08 và blocking contradictions được giải quyết; API/data thiếu được xác nhận cách xử lý.
- [ ] Mobile/desktop hierarchy được duyệt; danh sách tất cả state §8 nằm trong brief design.
- [ ] Copy REAL/MOCK/STATIC/DERIVED/AI-GENERATED/UNKNOWN và các giới hạn chỉ số được duyệt.
- [ ] Tokens được kiểm contrast, không thêm tính năng/policy chưa duyệt.
- [ ] Sau approval mới tạo `feat/anhvy-w4-analytics-ui-design` từ main đã có PRD được duyệt; nếu PRD chưa merge, Tech Lead xác nhận base phù hợp.
- [ ] Task 2 lưu source design/screenshots/review evidence trong commit và PR riêng, cùng tên nhánh trên client/monorepo.
- [ ] Mọi test/browser/usability evidence tương lai ghi môi trường và kết quả thật; không đánh dấu pass từ audit tĩnh này.

Nhánh hiện tại chỉ chứa PRD và prompt log. Kế hoạch triển khai/test/design trong tài liệu không cấp phép bắt đầu Task 2 trước approval.
