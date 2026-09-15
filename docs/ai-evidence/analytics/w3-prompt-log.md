# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Ánh Vy — vai trò Analytics theo phân công; chưa xác nhận trực tiếp thực hiện các lượt prompt minh họa dưới đây.  
> **Tuần thực hiện**: Tuần 3 - Chương 3.  
> **Module liên quan**: analytics.

**Nguồn gốc:** bản tái dựng có gắn nhãn, ngày 08/09/2026, giữ cấu trúc [PROMPT_LOG_TEMPLATE](../PROMPT_LOG_TEMPLATE.md). Chưa có chat transcript, ảnh 375px hoặc commit cá nhân cho tình huống lỗi trong đề bài. Quan sát code được tách khỏi ví dụ output AI và khỏi đề xuất chỉnh sửa.

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Soạn user stories/acceptance criteria cho radar sáu trục, top 3 ngành và bảng kỹ năng; biến yêu cầu responsive/“zero latency” thành tiêu chí đo được.
* **Công cụ AI sử dụng**: Codex trong phiên tạo tài liệu này; không khẳng định Ánh Vy từng dùng một model hoặc thực hiện một phiên chat không có bằng chứng.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Design a six-axis Recharts radar for MajorMatch and write analytics
user stories. Show current student scores versus major benchmarks,
top three major cards and a Mastered / Developing / Missing table.
Make the interface attractive and update it when a major is selected.
```
* **Kết quả nhận được từ AI**:
  * **Đầu ra minh họa tái dựng:** AI đề xuất `<RadarChart width={600} height={400}>`, legend nằm ngang và hover tooltip, không có parent responsive hoặc acceptance criteria trên viewport 375px.
  * Đây là tình huống phản biện được soạn để thể hiện prompt evolution theo đề bài, không phải đoạn đã tìm thấy trong checkout.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * **ANA-D01 — lỗi trong output minh họa:** width cố định 600px vượt vùng nội dung của viewport 375px nếu không có cơ chế co/overflow phù hợp; hover-only không phục vụ touch/keyboard. Cần constraint cụ thể thay “attractive”.
  * **ANA-D02 — hiện trạng code thật:** RadarComparison đã có `ResponsiveContainer width="100%" height="100%"`, parent `h-[360px]` và outerRadius 75%. Không được nói đã phát hiện thiếu ResponsiveContainer trong source hoặc đã nhìn thấy lỗi mobile khi chưa chạy browser.
  * **ANA-D03 — rủi ro cần kiểm tra:** nhãn tiếng Việt dài, parent grid min-width, tooltip focus/touch và 200% zoom; chứng minh bằng viewport check, không suy đoán thành bug đã tái hiện.
  * **ANA-D04 — ngưỡng mơ hồ:** “Developing 2.0–3.0” chồng với Mastered nếu tính inclusive ở 3.0; cần `2 <= x < 3`. Điểm <2 và evidence thiếu phải có reason khác nhau.
  * **ANA-D05 — hợp đồng dữ liệu:** API_SPEC chỉ có một radar/skill breakdown chung trong response, trong khi component cần chi tiết mỗi ngành. Không thể tạo benchmark các ngành còn lại chỉ bằng rename JSON field.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Write US-ANA-01 through US-ANA-05 using professional Vietnamese notes
and strict English Gherkin. Base the specification on PRD AC-02,
FR-3.3 and FR-5.1/5.2, plus the current Recharts 2 client components.

Use exactly six competence axes on a shared 0-10 scale, never the
RIASEC 1-5 interest vector. Validate unique IDs and finite ranges.
Preserve missing evidence as missing rather than drawing a fake polygon.

Require ResponsiveContainer width="100%" height="100%" within a
w-full min-w-0 h-[320px] sm:h-[360px] parent. Use mobile-first Tailwind:
sm=640, md=768, lg=1024. Include a 375px case with long Vietnamese labels,
touch axis controls, keyboard focus, Escape dismissal and a data table.
Do not claim those checks have already run.

Few-shot:
Scenario: Inspect the radar at 375 pixels
  Given the viewport is 375 pixels wide
  When the student selects an axis using touch
  Then both exact scores and the full label are readable
  And the page has no horizontal overflow

Define Mastered >=3, Developing >=2 and <3, and Missing with explicit
no-evidence or below-threshold reasons. Include 1.99, 2, 2.99 and 3.
Rank by raw score, break ties by major ID and show at most three cards.
Interpret zero latency as zero requests for cached switching and p95
event-to-paint below 50ms under a specified production-build test.
Separate current implementation, proposed contract and API blockers.
```
* **Kết quả sau khi cải tiến**:
  * Đã tạo [user-stories-analytics.md](../../03-specifications/user-stories-analytics.md) với năm story và T-ANA-01–05; [FEATURE_SPECIFICATION](../../03-specifications/FEATURE_SPECIFICATION.md) khóa axis IDs, state matrix và per-major contract.
  * Output cuối đã được đối chiếu nội dung: biên 2.0/3.0 không chồng; dữ liệu ít hơn ba ngành không nhân bản; performance không còn hứa vật lý 0ms; T-ANA-04 có touch/keyboard/table. Đây là kết quả review đặc tả, không phải responsive test đã pass.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do bạn tự sửa lại bằng tay**:
  * Chưa có diff source hay xác nhận chỉnh tay của Ánh Vy. Patch candidate dưới đây dùng shape `RadarAxisItem` hiện có để review cấu trúc container; chưa phải component hoàn thiện tooltip/a11y:
  ```typescript
  import { Radar, RadarChart, ResponsiveContainer, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis } from "recharts";
  import type { RadarAxisItem } from "@/types/api";

  export function ResponsiveRadarCandidate({ data }: { data: RadarAxisItem[] }) {
    return (
      <div className="w-full min-w-0 h-[320px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="65%">
            <PolarGrid />
            <PolarAngleAxis dataKey="axis" />
            <PolarRadiusAxis domain={[0, 10]} />
            <Radar name="Current competence" dataKey="user_score" />
            <Radar name="Major benchmark" dataKey="benchmark_score" strokeDasharray="4 4" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  ```
  * Đây là JSX trong code fence `typescript` để giữ cấu trúc template; khi áp dụng cần tệp `.tsx`. Giảm outerRadius là lựa chọn review, không bảo đảm nhãn luôn vừa; phải thêm bảng/control trục và kiểm tra layout thực tế.

| Hạng mục | Cách kiểm chứng / oracle | Trạng thái hiện tại |
|---|---|---|
| Source responsive | Đọc RadarComparison: ResponsiveContainer đã có | Đã xác minh tĩnh |
| 375px / 200% zoom | Không overflow; nhãn đầy đủ qua table/control; tooltip trong viewport | Đã đặc tả, chưa chạy browser |
| Sáu trục | Fixture đủ 6 ID duy nhất, domain 0–10; sai shape thì error | Đã đặc tả T-ANA-01 |
| Skill boundaries | 1.99 Missing, 2/2.99 Developing, 3 Mastered | Đã đối chiếu quy tắc; chưa xác minh backend phù hợp |
| Switching performance | 30 lần, production build, p95 event-to-paint <50ms, zero request | Chưa benchmark |
| Human adjustment | Commit/diff/screenshot của thành viên | Chưa có bằng chứng |

* **Bài học kinh nghiệm rút ra**: Constraint viewport phải đi cùng parent size, nhãn thật và nhiều phương thức tương tác. Human critique cần phản biện cả yêu cầu “zero latency” và cách AI khẳng định lỗi không có bằng chứng. Minh chứng CLO3 hợp lệ cần kết quả test của implementation sau khi sửa, không chỉ một snippet trông hợp lý.
