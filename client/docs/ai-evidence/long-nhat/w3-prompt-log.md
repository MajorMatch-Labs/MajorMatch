# NHẬT KÝ MINH CHỨNG ỨNG DỤNG AI (AI PROMPT & VALIDATION LOG)
> **Mục tiêu**: Phục vụ tiêu chí đánh giá Rubric CLO2 (30%) và CLO3 (35%) môn Chuyên đề 4 (CS2028).  
> **Thành viên thực hiện**: Long Nhật — Advisor & Architecture theo phân công; chưa xác nhận trực tiếp thực hiện các lượt prompt minh họa dưới đây.  
> **Tuần thực hiện**: Tuần 3 - Chương 3.  
> **Module liên quan**: advisor.

**Nguồn gốc:** bản tái dựng có gắn nhãn, ngày 08/09/2026, giữ [PROMPT_LOG_TEMPLATE](../PROMPT_LOG_TEMPLATE.md). Không có transcript prompt ban đầu, trace React Profiler, ảnh SSE lỗi hoặc commit cá nhân chứng minh vòng chỉnh sửa của Long Nhật. Những giới hạn này không được thay bằng kết quả kiểm thử giả.

---

## 1. MỤC ĐÍCH SỬ DỤNG AI
* **Mục tiêu công việc**: Phân tích state reactive, tiên quyết, readiness và SSE; tạo user stories cho advisor, hợp đồng liên module và RTM; phát hiện rủi ro dữ liệu gốc bị mutation, stream bị parse sai và API drift.
* **Công cụ AI sử dụng**: Codex trong phiên soạn tài liệu này. Hai vòng prompt dưới là tình huống minh họa có nội dung cụ thể, không phải lịch sử được chứng thực của sinh viên.

---

## 2. LỊCH SỬ CẢI TIẾN PROMPT (PROMPT EVOLUTION)

### Lần 1: Prompt ban đầu (Initial Prompt)
```text
Design an interactive academic roadmap and AI mentor chat for MajorMatch.
When a student completes a course, update job readiness and the radar.
Stream the mentor response and keep chat history. Provide React code
and acceptance criteria for the advisor module.
```
* **Kết quả nhận được từ AI**:
  * **Đầu ra minh họa tái dựng:** dùng một React Context provider chứa profile/checklist/chat; mọi consumer đọc toàn object. Code stream giả định `JSON.parse(decoder.decode(chunk))` rồi append text. Chưa có parser event buffer hoặc ràng buộc Zustand.
  * Lỗi “React Context gây full-page rerender” trong đề bài được xem là điểm cần phản biện của ví dụ; không coi là kết quả profiler đã quan sát.
* **Đánh giá & Phát hiện lỗi (Critique & Defect Detection)**:
  * **ADV-D01:** stack đã chỉ định Zustand. Context value thay đổi có thể làm các consumer render lại, nhưng không đồng nghĩa browser reload hoặc mọi component trong trang đều render. Code thực tế đã dùng Zustand; vấn đề còn lại là nhiều component gọi hook không selector.
  * **ADV-D02:** chunk transport không phải JSON event. Thiếu tách dòng/event và buffer, kể cả regex nhận CRLF/LF/CR; chỉ thêm regex vẫn chưa đủ nếu delimiter hoặc UTF-8 bị cắt qua chunk.
  * **ADV-D03 — code thực tế:** `streamChat` decode UTF-8 streaming nhưng đưa nguyên text vào onChunk; không loại `data:`/`event:`, không xử lý done; endpoint gọi `/roadmap/chat` khác backend `/chat/stream`.
  * **ADV-D04 — code thực tế:** `baseScore = readiness_score || 60` làm base=0 thành60; cộng/trừ 0,3 trên giá trị đã clamp làm tick/uncheck không khôi phục chính xác; count cert không thống nhất mẫu số.
  * **ADV-D05:** thiếu ID hội thoại/message, missing skills, abort, timeouts và policy replay POST. Auto reconnect có thể tạo hai lượt inference nếu server không idempotent.

---

### Lần 2: Prompt cải tiến (Refined Prompt)
```text
Act as MajorMatch's lead architect. Use Next.js 14, strict TypeScript,
Zustand 4 atomic selectors and Recharts 2. Inspect useProfileStore.ts,
MilestoneTree.tsx, InteractiveTask.tsx, components/chat/StreamingChatBox.tsx,
services/api.ts, API_SPEC.md and the backend route declarations.

Write US-ADV-01 through US-ADV-05 and add US-ADV-06 for UC-06 export.
Use English Gherkin and Vietnamese design notes, linking every story
to requirements, the real component path and a verification test ID.

Keep immutable academic baselines and separate simulations by major
and roadmap version. Use idempotent setCompleted(id, boolean), unique
task IDs, a validated prerequisite DAG and descendant reset rules.
Readiness = min(100, base + sum(valid completed task weights)).
Zero is a valid base. Recompute radar from its baseline; do not mutate
the original match score by arbitrary bonuses. Use atomic selectors
so unchanged primitive subscribers need not rerender.

Fetch POST /api/v1/chat/stream with an AbortController. Parse UTF-8
incrementally, buffer complete lines and events, recognize CRLF/LF/CR,
join multiple data lines, ignore comments and validate JSON token/done.
Explain why a chunk regex alone is insufficient. Use 15s connection
and idle timers, cleanup on stop/unmount/major change, and no automatic
POST replay without server idempotency plus event-ID resume support.

Few-shot:
Scenario: Restore an axis after saturation
  Given a baseline axis is 9.9 and a task delta is 0.3
  When the task is checked and then unchecked
  Then the simulated axis returns exactly to 9.9

Include missing-skills context, opt-in local history, safe Markdown,
validated course pills and local Markdown export. Identify API schema
gaps explicitly. Do not fabricate manual edits or profiler results.
```
* **Kết quả sau khi cải tiến**:
  * Đã tạo [user-stories-advisor.md](../../03-specifications/user-stories-advisor.md) với sáu stories, kể cả export; [FEATURE_SPECIFICATION](../../03-specifications/FEATURE_SPECIFICATION.md) có state machine SSE, formula, TypeScript contracts và store bindings; [RTM](../../01-overview/REQUIREMENTS_ANALYSIS.md) bao phủ UC-01–06.
  * Output cuối đối chiếu được base=0, unique ID, clamp đảo ngược, selector primitives, context theo major và default không replay POST. Giới hạn xác minh là review tài liệu và source, chưa chạy inference, network trace hoặc UI performance.

---

## 3. KIỂM CHỨNG & CHỈNH SỬA THỦ CÔNG TRƯỚC KHI TÍCH HỢP (HUMAN-IN-THE-LOOP)
* **Những đoạn code hoặc logic do bạn tự sửa lại bằng tay**:
  * Chưa có bằng chứng chỉnh tay của Long Nhật. Các đoạn sau là patch candidate để review; chưa ghi vào source ứng dụng:
  ```typescript
  const readiness = useProfileStore((s) => s.dynamicReadinessScore);
  const checked = useProfileStore((s) => Boolean(s.completedItems[itemId]));
  const toggleCompleted = useProfileStore((s) => s.toggleCompletedItem);

  function calculateReadiness(
    base: number,
    completedIds: readonly string[],
    weights: Readonly<Record<string, number>>
  ): number {
    if (!Number.isFinite(base) || base < 0 || base > 100) {
      throw new Error("INVALID_BASE_SCORE");
    }
    let total = base;
    for (const id of new Set(completedIds)) {
      const weight = Object.prototype.hasOwnProperty.call(weights, id)
        ? weights[id] : undefined;
      if (weight === undefined || !Number.isFinite(weight) || weight < 0) {
        throw new Error("INVALID_TASK_WEIGHT");
      }
      total += weight;
    }
    return Math.round(Math.min(100, total) * 10) / 10;
  }
  ```
  * Selector snippet dùng tên store hiện tại, `itemId` là task ID từ component; formula nhận tập đã qua prerequisite validation. Refactor mục tiêu chuyển từ toggle sang setCompleted idempotent.
  * Parser event hoàn chỉnh sau đây chỉ dùng **sau khi** tầng stream đã tích lũy đủ event và xử lý CR biên chunk:
  ```typescript
  function parseCompleteMessageEvent(block: string): { token: string; done: boolean } | null {
    let eventName = "message";
    const data: string[] = [];
    for (const line of block.split(/\r\n|\r|\n/)) {
      if (line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      const field = colon < 0 ? line : line.slice(0, colon);
      let value = colon < 0 ? "" : line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "event") eventName = value || "message";
      if (field === "data") data.push(value);
    }
    if (eventName !== "message" || data.length === 0) return null;
    const raw: unknown = JSON.parse(data.join("\n"));
    if (typeof raw !== "object" || raw === null) throw new Error("INVALID_SSE_DATA");
    const value = raw as Record<string, unknown>;
    if (typeof value.token !== "string" || typeof value.done !== "boolean") {
      throw new Error("INVALID_SSE_DATA");
    }
    return { token: value.token, done: value.done };
  }
  ```
  * Regex tách dòng không tự giải quyết UTF-8, event buffering, duplicate IDs hay reconnect. Tầng transport còn phải tuân thủ đầy đủ FEATURE_SPECIFICATION §7; không gọi snippet này trực tiếp cho mỗi chunk mạng.

| Hạng mục | Bằng chứng / oracle | Trạng thái |
|---|---|---|
| Store đang dùng Zustand | Import create trong useProfileStore.ts | Đã đọc tĩnh; không phải React Context implementation |
| Broad subscription | Hook không selector ở component | Đã ghi nhận; chưa có số đo rerender |
| Base=0 và clamp | `|| 60` và cộng/trừ trực tiếp axis trong source | Defect logic được xác định; chưa sửa implementation |
| SSE framing | Service append text nguyên chunk | Gap đọc được; chưa chạy stream fixture trong ứng dụng |
| Protocol/algorithm target | T-ADV-01–06 và feature §4, §7 | Đã viết oracle cụ thể |
| Manual patch / runtime | Chưa có commit cá nhân, profiler hoặc replay SSE | Chưa xác nhận |

* **Bài học kinh nghiệm rút ra**: Prompt tốt khóa stack, data invariants và wire protocol; human review phải kiểm tra cả giả định nhân quả của AI. Zustand không tự giải quyết subscription rộng, regex không tự là SSE parser, và giao diện demo không chứng minh tích hợp backend. Chỉ ghi rubric “đã kiểm chứng” cho những phép kiểm tra thực sự có bằng chứng.
