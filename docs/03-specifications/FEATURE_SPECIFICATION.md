# ĐẶC TẢ TÍNH NĂNG MAJORMATCH CLIENT

**Mục:** 3.5. **Phiên bản:** 1.0 — 08/09/2026. **Owner:** Long Nhật; ingestion: Văn Hoàng; analytics: Ánh Vy.  
**Trạng thái:** hợp đồng triển khai đề xuất, chưa phải mô tả tất cả code đang chạy.  
**Baseline:** [PRD 1.0.0](../01-overview/PRD.md), [API_SPEC](API_SPEC.md). Xem [RTM và quyết định D-01–D-08](../01-overview/REQUIREMENTS_ANALYSIS.md). Mục 3.2 tham chiếu PRD đã baseline; không ghi đè PRD.

## 1. Nguyên tắc và ranh giới trách nhiệm

Client xác thực đầu vào, preview PDF metadata, tính RIASEC, hiển thị analysis, mô phỏng checklist và parse SSE. HPC trích xuất điểm, khử PII, đối sánh, truy vấn curriculum/RAG và chạy Ollama Qwen 2.5 7B. Browser không giữ secret dùng giữa các server và không trực tiếp gọi API AI SaaS với hồ sơ.

Ba khái niệm phải tách biệt: **RIASEC** đo sở thích 1–5; **competence radar** biểu diễn năng lực 0–10; **Job Readiness** là chỉ số hoàn thành kế hoạch mô phỏng 0–100. Match Score do engine đối sánh trả về cũng không phải xác suất việc làm. Dữ liệu có provenance `live` hoặc `demo`; mutation checklist không thay đổi transcript hay match score gốc.

## 2. Interface contracts

### 2.1. Interface hiện có đã đối chiếu

| Thành phần | Props / dữ liệu hiện tại | Binding hiện tại |
|---|---|---|
| FileDropzone | Không props | profile, uploadedFileName, isUploading, setProfile, setUploading |
| RiasecSurvey | Không props | riasecScores theo group, selectedCareerTags, setRiasecScore, toggleCareerTag |
| RadarComparison | `data: RadarAxisItem[]; majorName: string` | Props từ result page; majorName chưa được dùng bên trong chart |
| MajorCard | `major: MajorRecommendationItem; isSelected: boolean; onSelect: (major) => void` | Callback setSelectedMajor |
| SkillBreakdown | `skillGap: SkillGapItem` | Ba mảng string từ ngành chọn |
| MilestoneTree | `semesters: SemesterMilestone[]; targetMajor: string` | dynamicReadinessScore, completedItems |
| InteractiveTask | id, type course/project/cert, title; subtitle/credits/skills/rationale tùy chọn | completedItems và toggleCompletedItem |
| StreamingChatBox | Không props; nằm ở `components/chat/` | selectedMajor; messages/input/isStreaming trong local state |
| useProfileStore | create của Zustand 4; chưa persist | Component thường gọi hook không selector, subscribe toàn store |
| ExportCareerPlan | Chưa tồn tại | Hợp đồng mục tiêu dưới đây |

### 2.2. Domain types mục tiêu

Đoạn TypeScript dưới là **định nghĩa đầy đủ cho view model đề xuất**, không khẳng định đã tồn tại trong `types/api.ts`. Kiểu `number` vẫn phải kiểm tra finite/range khi nhận JSON. DTO network không dùng trực tiếp làm props.

```typescript
export type RiasecGroup = "R" | "I" | "A" | "S" | "E" | "C";
export type QuestionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type AnswerValue = 1 | 2 | 3 | 4 | 5;
export type Answers = Record<QuestionId, AnswerValue | null>;
export type RiasecVector = Record<RiasecGroup, number>;
export type CareerTagId =
  | "ai_engineer" | "fullstack_dev" | "devops_cloud"
  | "cyber_sec" | "mobile_dev" | "embedded_iot";
export type AxisId =
  | "math_statistics" | "algorithms"
  | "machine_learning" | "data_engineering"
  | "application_programming" | "devops_mlops";
export type Six<T> = readonly [T, T, T, T, T, T];
export interface AxisScore {
  id: AxisId;
  label: string;
  userScore: number;
  benchmarkScore: number;
}
export interface Provenance {
  mode: "live" | "demo";
  evidence: "academic" | "interest-only";
  curriculumVersion: string | null;
  curriculumSource: string | null;
  modelVersion: string;
  generatedAt: string;
}
export interface UiError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfterSeconds?: number;
}
export type Resource<T> =
  | { status: "empty" }
  | { status: "loading"; requestId: string }
  | { status: "error"; error: UiError }
  | { status: "success"; data: T };
export interface PdfPreview {
  fileName: string;
  byteSize: number;
  pageCount: number;
  documentType: "transcript" | "cv";
}
export interface CourseEvidence {
  courseCode: string;
  courseName: string;
  credits: number;
  gradePoint: number;
  gradeLetter: string;
}
export interface ProfileView {
  cumulativeGpa: number | null;
  courses: readonly CourseEvidence[];
  detectedSkills: readonly string[];
  provenance: Provenance;
}
export interface SkillEvidence {
  skillId: string;
  label: string;
  gradePoint: number | null;
  verifiedProjectId: string | null;
  sourceReferences: readonly string[];
}
export interface SkillRow extends SkillEvidence {
  category: "mastered" | "developing" | "missing";
  reason: "grade" | "verified-project" | "below-threshold" | "no-evidence";
}
export interface MajorSummary {
  id: string;
  name: string;
  matchScore: number;
  description: string;
}
export interface MajorDetail extends MajorSummary {
  competence: Six<AxisScore> | null;
  skills: readonly SkillRow[];
  provenance: Provenance;
}
export interface RoadmapTask {
  id: string;
  kind: "course" | "project" | "cert";
  title: string;
  courseCode: string | null;
  credits: number | null;
  rationale: string;
  prerequisiteIds: readonly string[];
  readinessWeight: number;
  axisDelta: Record<AxisId, number>;
  verifiedComplete: boolean;
}
export interface RoadmapSemester {
  id: string;
  title: string;
  taskIds: readonly string[];
}
export interface RoadmapView {
  id: string;
  majorId: string;
  version: string;
  baseReadiness: number;
  tasks: Readonly<Record<string, RoadmapTask>>;
  semesters: readonly RoadmapSemester[];
  provenance: Provenance;
}
export interface Simulation {
  roadmapId: string;
  completedIds: readonly string[];
}
export interface CourseReference {
  courseId: string;
  label: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  state: "streaming" | "complete" | "stopped" | "interrupted" | "error";
  createdAt: string;
  courseReferences: readonly CourseReference[];
}
export interface ChatContext {
  majorId: string;
  majorName: string;
  missingSkills: readonly string[];
  curriculumVersion: string | null;
}
export interface Conversation {
  id: string;
  majorId: string;
  messages: readonly ChatMessage[];
}
export interface ExportPlan {
  major: MajorDetail;
  roadmap: RoadmapView;
  simulation: Simulation;
  simulatedReadiness: number;
  exportedAt: string;
}
```

Axis IDs được cố định cho MVP CNTT theo sáu nhóm trong `mockData.ts`: Toán & Thống kê; Thuật toán & CTDL; Học máy & Deep Learning; Kỹ thuật Dữ liệu; Lập trình ứng dụng; DevOps & MLOps. API có thể dùng label khác nên cần mapping được kiểm tra, không map theo vị trí một cách mù quáng. Chưa có vector năng lực thì `competence=null`, không tạo số giả.

### 2.3. Props và ràng buộc callback mục tiêu

Container đọc store và truyền props dưới đây cho view; file object, reader, worker, AbortController và timer nằm trong controller/ref, không persist vào Zustand. Promise callback phải chuyển lỗi thành `Resource.error`/chat state trước khi kết thúc.

```typescript
export interface FileDropzoneProps {
  preview: Resource<PdfPreview>;
  profile: Resource<ProfileView>;
  phase: "idle" | "validating" | "previewing" | "ready" | "uploading";
  onFile: (file: File) => Promise<void>;
  onConfirmUpload: () => Promise<void>;
  onCancel: () => void;
}
export interface RiasecSurveyProps {
  answers: Answers;
  selectedTags: readonly CareerTagId[];
  error: UiError | null;
  onAnswer: (id: QuestionId, value: AnswerValue) => void;
  onToggleTag: (id: CareerTagId) => void;
}
export interface RadarComparisonProps {
  detail: Resource<MajorDetail>;
  simulatedScores: Six<AxisScore> | null;
  activeAxis: AxisId | null;
  onActiveAxis: (id: AxisId | null) => void;
}
export interface MajorCardProps {
  major: MajorSummary;
  rank: 1 | 2 | 3;
  selected: boolean;
  disabled: boolean;
  onSelect: (majorId: string) => void;
}
export interface SkillBreakdownProps {
  detail: Resource<MajorDetail>;
}
export interface MilestoneTreeProps {
  roadmap: Resource<RoadmapView>;
  completedIds: readonly string[];
  readiness: number | null;
  onSetCompleted: (taskId: string, completed: boolean) => void;
}
export interface InteractiveTaskProps {
  task: RoadmapTask;
  completed: boolean;
  blockedBy: readonly string[];
  onChange: (completed: boolean) => void;
}
export interface StreamingChatBoxProps {
  conversation: Conversation | null;
  context: ChatContext | null;
  status: "idle" | "connecting" | "streaming" | "error";
  error: UiError | null;
  persistHistory: boolean;
  onSend: (message: string) => Promise<void>;
  onStop: () => void;
  onClear: () => void;
  onPersistenceChange: (enabled: boolean) => void;
}
export interface ExportCareerPlanProps {
  plan: ExportPlan | null;
  status: "idle" | "exporting" | "success" | "error";
  error: UiError | null;
  onExport: () => Promise<void>;
}
```

`onFile` chỉ preview; `onConfirmUpload` mới gửi PDF. `onSelect` phải commit major ID và vô hiệu request ngữ cảnh cũ. `onSetCompleted` idempotent theo giá trị, không dùng toggle để replay action. MajorCard loading/empty/error do parent deck xử lý vì một card hợp lệ luôn cần MajorSummary.

### 2.4. Store bindings và tính nhất quán

```typescript
export interface ProfileState {
  profile: Resource<ProfileView>;
  answers: Answers;
  selectedTags: readonly CareerTagId[];
  recommendations: Resource<readonly MajorSummary[]>;
  detailsByMajor: Readonly<Record<string, Resource<MajorDetail>>>;
  selectedMajorId: string | null;
  roadmapsByMajor: Readonly<Record<string, Resource<RoadmapView>>>;
  simulationsByMajor: Readonly<Record<string, Simulation>>;
  conversationsByMajor: Readonly<Record<string, Conversation>>;
  persistHistory: boolean;
  generation: number;
  setAnswer: (id: QuestionId, value: AnswerValue) => void;
  toggleCareerTag: (id: CareerTagId) => void;
  commitProfile: (profile: ProfileView, generation: number) => void;
  commitRecommendations: (items: readonly MajorSummary[], generation: number) => void;
  commitMajorDetail: (detail: MajorDetail, generation: number) => void;
  commitRoadmap: (roadmap: RoadmapView, generation: number) => void;
  selectMajor: (majorId: string) => void;
  setCompleted: (majorId: string, taskId: string, completed: boolean) => void;
  appendToken: (conversationId: string, messageId: string, token: string) => void;
  finishMessage: (conversationId: string, messageId: string, state: ChatMessage["state"]) => void;
  setPersistence: (enabled: boolean) => void;
  clearConversation: (majorId: string) => void;
  resetAll: () => void;
}
```

| View/container | Selector và action cần subscribe |
|---|---|
| Upload | profile + controller phase; commitProfile; không subscribe toàn store |
| Survey question | answers[questionId], setAnswer; progress/vector là derived selector |
| Tag picker | selectedTags, toggleCareerTag |
| Major deck | recommendations, selectedMajorId, selectMajor |
| Radar/SkillBreakdown | detailsByMajor[selectedMajorId], simulation tương ứng nếu cần |
| Task checkbox | boolean completion của đúng task, trạng thái blocked, setCompleted |
| Readiness | roadmap/base và completion của ngành hiện tại; không phụ thuộc token chat |
| Chat | conversation/context theo major, appendToken/finishMessage; trạng thái request trong controller |
| Export | snapshot nhất quán của major/roadmap/simulation, không đọc từng phần sau khi bắt đầu ghi file |

Zustand cho phép chọn giá trị nguyên tử bằng selector; object/array selector phải có tham chiếu ổn định hoặc comparator phù hợp version 4. Không gọi `useProfileStore()` rồi destructure toàn store cho mọi view. Ví dụ áp dụng ngay với API store hiện tại:

```typescript
const readiness = useProfileStore((state) => state.dynamicReadinessScore);
const checked = useProfileStore((state) => Boolean(state.completedItems[itemId]));
const toggle = useProfileStore((state) => state.toggleCompletedItem);
```

Ví dụ trên dùng tên hiện tại; API mục tiêu `setCompleted` thay `toggleCompletedItem` khi refactor. React vẫn có thể render do parent/props, nên selector không phải lời hứa “không bao giờ rerender”. Tham chiếu [Zustand — atomic state picks](https://github.com/pmndrs/zustand).

**Quy tắc state:** profile mới tăng generation, clear analysis/roadmap/simulation/chat context; cập nhật câu trả lời/tags làm analysis stale và yêu cầu phân tích lại. Response chỉ commit khi generation trùng. Đổi major hủy stream cũ, giữ simulation riêng theo `majorId + roadmap.version`; roadmap mới reset simulation cũ. `resetAll` hủy request, xóa dữ liệu phiên, answers về null, tags rỗng và readiness về null; không mặc định GPA hoặc readiness mẫu.

## 3. UI States Matrix

| Component | Empty | Loading / skeleton | Error / validation | Success |
|---|---|---|---|---|
| FileDropzone | Nút chọn PDF, giới hạn, nơi xử lý | Validating → previewing spinner → uploading; khóa request trùng | Banner từng mã lỗi, giữ thao tác thay file/retry; không giữ spinner | Page count local và profile summary backend tách nhãn; checkmark sau JSON hợp lệ |
| RiasecSurvey | 10 câu chưa xác nhận, progress 0/10 | Khi hydrate, skeleton ngắn và khóa submit; tính điểm local không tạo loading giả | Chưa đủ câu, ngoài miền, giới hạn tags | 10/10, vector final 1–5; cho sửa và tính lại |
| Career tag picker trong survey | Không chọn, 0/5 | Catalog chưa sẵn: chips skeleton disabled | Tag lạ hoặc chọn thứ sáu: thông báo, không bỏ tag cũ | 1–5 tag duy nhất với aria-pressed |
| MajorCard / deck | “Chưa có đề xuất”, CTA ingestion | 3 card skeleton trong parent, không % giả | Lỗi response/schema trong parent; không render card invalid | Tối đa 3 card xếp hạng, selected rõ |
| RadarComparison | Chưa có analysis hoặc thiếu academic evidence | Khung chart có chiều cao ổn định, skeleton | 5/7 axis, duplicate, NaN, range sai: error thay chart | 2 polygon hoặc benchmark-only có nhãn, table và axis controls |
| SkillBreakdown | Chưa có evidence; từng nhóm rỗng hiển thị 0 | Ba khu vực skeleton cùng bố cục | Evidence không hợp lệ/khác ngưỡng: banner dữ liệu | Nhóm loại trừ nhau, reason/source đọc được |
| MilestoneTree | Chưa có roadmap, nút sinh lộ trình | Skeleton kỳ học, checkbox disabled | DAG lỗi hoặc request fail; retry; không tăng readiness | Kỳ học, tiên quyết và readiness có nhãn mô phỏng |
| InteractiveTask | Không có task thì parent không render | Parent skeleton, không tick | Blocked prerequisite là trạng thái giải thích, DAG invalid là error | Checkbox semantic, completed/available, lý do và nguồn |
| StreamingChatBox | Hướng dẫn chọn ngành hoặc bắt đầu chat | Connecting spinner → streaming caret, Stop luôn dùng được | 429/timeout/protocol/interrupted; giữ partial text, retry | done:true → complete, input mở, Markdown/course pills hợp lệ |
| ExportCareerPlan | Disabled khi thiếu roadmap | Exporting, ngăn click trùng | Báo lỗi tạo/download, cho retry | Tệp Markdown local; thông báo tải được khởi tạo, không khẳng định OS đã lưu nếu chưa biết |
| useProfileStore | Initial state không data mẫu | Hydrating riêng cho history opt-in | Storage/schema lỗi quay memory-only và thông báo | Các snapshot nhất quán; store không render UI riêng |

Tất cả status có text và `aria-live="polite"`; lỗi cần chú ý dùng alert có kiểm soát; không announce mỗi token làm screen reader quá tải. Spinner có nhãn, animation tôn trọng reduced motion. `ResponsiveContainer` cần parent có kích thước thực; pattern mục tiêu `w-full min-w-0 h-[320px] sm:h-[360px]`. Tooltip đầy đủ có controls/table thay thế; không dựa riêng vào SVG hover. [Recharts — ResponsiveContainer](https://recharts.github.io/en-US/api/ResponsiveContainer/).

## 4. Thuật toán phía client

### 4.1. RIASEC local scoring

Lưu từng câu $q_i\in\{1,2,3,4,5\}$, chưa trả lời là null. Mapping lấy đúng `src/types/survey.ts`:

| Nhóm | Câu | Công thức final |
|---|---|---|
| R | 1, 2 | $(q_1+q_2)/2$ |
| I | 3, 4, 9 | $(q_3+q_4+q_9)/3$ |
| A | 5 | $q_5$ |
| S | 6 | $q_6$ |
| E | 7, 10 | $(q_7+q_{10})/2$ |
| C | 8 | $q_8$ |

$$r_g=\frac{\sum_{i\in Q_g}q_i}{|Q_g|},\qquad \vec{R}_{Holland}=[R,I,A,S,E,C].$$

Tính trung bình theo nhóm tránh nhóm I có ba câu tự được trọng số lớn gấp ba nhóm A. Trước đủ 10 câu, chỉ hiển thị trung bình provisional trên các câu đã xác nhận của nhóm; nhóm chưa trả lời là null, không 0. Final submission cần đủ 10 câu và 1–5 tags. Progress $=100\times n_{answered}/10$. Giữ precision khi tính, làm tròn hai chữ số ở UI; adapter đổi R/I/A/S/E/C sang tên field realistic/investigative/artistic/social/enterprising/conventional theo API.

Fixture: `[1,5,2,4,5,1,3,4,3,5]` → `[3,3,5,1,4,4]`; tất cả 1 → sáu giá trị 1; tất cả 5 → sáu giá trị 5. Thay q1 không đổi q2. Bộ 10 câu CNTT là công cụ khám phá do dự án xây dựng, chưa có bằng chứng tương đương thang O*NET chuẩn. [O*NET — sáu nhóm và các phiên bản 30/60 câu](https://www.onetcenter.org/IP.html).

### 4.2. Skill categorization

Trên mỗi skill bắt buộc trong benchmark: evidence dự án được xác minh → Mastered; nếu không, lấy grade evidence đã quy đổi hợp lệ về hệ 4.0. Với nhiều học phần cùng skill, hợp đồng MVP chọn điểm cao nhất trong các học phần đạt mapping và có evidence, đồng thời giữ mọi source reference; đây là quyết định kỹ thuật cần được domain owner review, không tự suy ra từ tên môn.

Grade ≥3 → Mastered; 2≤grade<3 → Developing; 0≤grade<2 → Missing/below-threshold; không có evidence → Missing/no-evidence. Invalid grade là lỗi, không là Missing. Không đủ mapping học phần–skill thì chưa xác minh, không tự gán năng lực. Project tự khai chưa được kiểm chứng không được ưu tiên hơn điểm thật. Không tự thêm skill vào danh sách Missing rỗng. Client chỉ phân loại khi có evidence tương ứng; ba mảng string trong API cũ chưa đủ để làm việc đó.

### 4.3. Dynamic Job Readiness

$$\text{JobReadiness}(\%)=\min\left(100,\text{BaseScore}+\sum_{c\in\text{Completed}}w_c\right).$$

`BaseScore` hữu hạn thuộc [0,100], lấy từ baseline roadmap. `Completed` là tập ID duy nhất của các course/project/cert đủ tiên quyết, không bao gồm mục đã xác nhận trong hồ sơ gốc. $w_c\ge0$ hữu hạn, đơn vị **điểm phần trăm**, không phải phần trăm nhân với BaseScore. Bản MVP khi backend chưa có weight được dùng policy đồng đều đã gắn version: với N task đủ điều kiện chưa thuộc baseline, $w_c=(100-BaseScore)/N$. N=0 → không cộng, readiness giữ base. Không chia theo số kỳ hoặc số course nếu UI còn cho tick project/cert.

Khi có trọng số học thuật đã được duyệt, dùng trọng số trả về có version; không đổi policy giữa phiên. Không tự phát minh tác động riêng của một chứng chỉ lên tuyển dụng. Validate input trước công thức; không dùng `base || 60` vì 0 hợp lệ. Round một chữ số thập phân **sau tổng cuối cùng** để hiển thị, không tích lũy làm tròn sau mỗi click.

Ví dụ base=60, N=4 → mỗi weight=10; tick hai ID →80; set một ID true lần nữa →80; bỏ một →70. Base=0 vẫn là 0 trước tick; base=95, weight=10 →100 theo cap. ID không nằm trong roadmap bị từ chối. Tick verifiedComplete không cộng lần hai.

**Tiên quyết:** kiểm tra DAG bằng DFS/topological sort O(V+E) khi nhận roadmap; ID thiếu hoặc cycle làm roadmap invalid. Khi check task, mọi prerequisite phải thuộc tập verified hoặc simulated; khi uncheck, loại tất cả hậu duệ không còn đủ điều kiện theo fixpoint/topological order trong cùng transaction. Nội dung lý do bị reset phải được hiển thị cho người dùng.

### 4.4. Radar mô phỏng và tính đảo ngược

$$u^{sim}_k=\min(10,\max(0,u^{base}_k+\sum_{c\in Completed}\Delta_{c,k})).$$

$\Delta_{c,k}$ lấy từ mapping task–axis có version, không tăng đều 0,3 mọi trục như code hiện tại. Thiếu mapping thì giữ nguyên radar và giải thích chỉ readiness đang mô phỏng. Tính lại từ baseline bất biến mỗi lần; axis 9,9 → tick +0,3 =10 → uncheck phải về 9,9, không 9,7. Khi preview mô phỏng bật, polygon sinh viên được đổi nhãn “Năng lực dự kiến”; benchmark giữ nguyên. Match Score gốc không bị cộng điểm tùy ý; nếu có recalculation tương lai phải dùng công thức/phiên bản riêng và nhãn mô phỏng.

### 4.5. Xếp hạng và switching

Validate unique major ID và điểm [0,100]; sort score gốc giảm dần, hòa theo ID tăng dần, lấy ba phần tử đầu. Không tạo đủ ba khi dữ liệu ít hơn. Cập nhật selectedMajorId làm các selector đọc đúng detail; không copy/mutate object shared trong fixture. Nếu detail thiếu, hiển thị loading hoặc unavailable và fetch hợp đồng per-major; không tái sử dụng radar chung như dữ liệu đúng cho mọi ngành.

## 5. API contract và kế hoạch tương thích

| Nghiệp vụ | Client hiện tại | API_SPEC / backend main.py | Mapping hoặc blocker |
|---|---|---|---|
| Upload | POST `/api/v1/profile/parse-transcript`; response `profile` | POST `/api/v1/profile/upload-transcript`; multipart file + document_type; `profile_data` | Đổi route, thêm document_type; grade_point → gradePoint, grade_letter → gradeLetter; không cast response thẳng |
| Analysis | POST `/api/v1/analysis/skill-gap`, một target_career và user_skills | POST `/api/v1/assessment/calculate-match`, holland_scores + target_career_tags + courses | Gửi mọi tag hợp lệ; dùng course_code/grade_point; không tự gán skills khi thiếu hồ sơ |
| Per-major result | top_recommendations có radar_data/skill_gap từng ngành | top_matches chỉ summary; radar_chart_data và skill_breakdown chung | Blocker: cần mở rộng API trả details theo major_id hoặc endpoint chi tiết; không thể sửa chỉ bằng rename field |
| Roadmap | target_major, missing_skills, cumulative_gpa; semesters practical_projects[] | target_major_id, missing_skills, completed_course_codes, current_semester; practical_project đơn | Thu current_semester qua input/context đã xác nhận; không mặc định GPA mẫu; đổi single project thành list khi adapter |
| Prerequisites/weights | Schema hiện thiếu DAG và weight | Boolean prerequisites_satisfied, chưa đủ dependency IDs | Cần curriculum graph/weight policy version; không infer DAG từ boolean |
| Chat | POST `/api/v1/roadmap/chat`, raw stream | POST `/api/v1/chat/stream`, conversation_id/message/context; SSE token/done | Parser phía client; adapter context target_major; majorId/version là metadata mở rộng cần backend hỗ trợ |
| Health | Flat health fields, fallback mock healthy | Nested gateway_node/private_compute_node | Chỉ báo demo là demo; validator nested fields; health không chứa raw payload logs |

Tài liệu không tự đổi API_SPEC đã baseline. Adapter phải phân biệt contract legacy và contract đã thống nhất; chỉ bật live per-major simulation khi backend cung cấp đủ data. Không thêm giả sourceVersion hoặc gọi model local đã hoạt động chỉ vì health fixture nói healthy. Origin secret trong API_SPEC chỉ dùng trên kênh server-to-server đáng tin cậy; tuyệt đối không nhúng vào bundle công khai. Hệ thống cần cơ chế session/access ở gateway cho browser, không xem CORS là xác thực.

## 6. Validation, sanitization và lỗi

| Đối tượng / lỗi | Quy tắc | UI / recovery |
|---|---|---|
| File | Một file; `.pdf` case-insensitive; 1–10.485.760 byte; MIME application/pdf; bytes đầu `25 50 44 46 2D` | Từ chối trước upload; MIME rỗng báo không xác minh, yêu cầu xuất lại |
| PDF parser | Structural parse trong worker, không thực thi embedded scripts; ≤100 trang; 15s local timer | PDF hỏng/mật khẩu/quá số trang: hướng dẫn bản hợp lệ; cleanup worker/URL |
| File name | Render text, không dùng như path server; tên export sinh từ ID an toàn | Không innerHTML; không gửi filename vào telemetry |
| Survey/tags | Integer 1–5; 10 ID đúng; 1–5 tag từ allowlist, không trùng | Báo câu thiếu/limit; không clamp âm thầm giá trị sai |
| JSON | Kiểm kiểu, finite, range, required fields, unique IDs; chỉ nhận field allowlist | DATA_CONTRACT_ERROR; không ghi store một phần |
| Chat input | Trim, 1–2.000 ký tự; giới hạn context 50 missing skills, 120 ký tự/skill; không gửi lịch sử vô hạn | Báo vượt giới hạn; không cắt nội dung ngầm khiến người dùng hiểu sai |
| Markdown | Renderer safe, raw HTML disabled; URL chỉ https/http và route nội bộ đã kiểm; không eval code | Script/javascript URL bị chặn; code hiển thị như text, course pills từ catalog |
| 400/413/415/422 | Giữ mã lỗi và thông điệp tiếng Việt có hướng sửa | Không auto retry và không fallback thành success |
| 401/403 | Báo quyền/phiên hết hạn | Không retry vòng lặp; hướng đăng nhập/khởi tạo phiên nếu triển khai có auth |
| 429 | Đọc Retry-After seconds/date hoặc retry_after_seconds hợp lệ | Hiện countdown; không gửi lại trước hạn; không mock healthy |
| Network/5xx | Hiển thị retry/demo có chủ đích | GET idempotent có thể retry 1 lần; POST chỉ retry có idempotency hoặc người dùng chủ động |
| Timeout | Business request hết 15s → AbortController; health 3s | Dọn timer trong finally; loading phải kết thúc; state không bị response muộn ghi đè |
| Storage | Validate schema version/TTL, catch quota/security errors | Memory-only, thông báo khả năng lưu bị tắt; không crash |

Không dùng “sanitize bằng regex” như bảo đảm PII sạch hoàn toàn. Tạo DTO tối thiểu thay vì serialize cả store; PDF chỉ gửi tới gateway/HPC được cấu hình. Không ghi nội dung hồ sơ, chat hoặc header secret trong log client. Không đặt PII ở URL/query string. Production dùng HTTPS; không tự cho phép mixed content để chạy LAN demo.

## 7. SSE event-stream state machine

### 7.1. Wire contract tối thiểu

```text
event: message
data: {"token":"Chào ","done":false}

event: message
data: {"token":"bạn","done":false}

event: message
data: {"token":"","done":true}

```

`event: message` hoặc event mặc định được hỗ trợ; comment bắt đầu `:` là heartbeat. Không giả định mọi chunk là một token. Các field SSE như `id`/`retry` chỉ dùng cho resume khi server có hợp đồng tương ứng. Tham chiếu framing tại [WHATWG — Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html).

### 7.2. Thuật toán parser bắt buộc

1. Sau POST thành công, kiểm MIME `text/event-stream`, tạo reader, TextDecoder UTF-8 streaming và buffer dòng/event rỗng. State: connecting → streaming → complete/interrupted/stopped/error.
2. Decode chunk với `{stream:true}`; giữ state decoder qua các chunk để ký tự tiếng Việt bị chia byte vẫn nguyên vẹn. Không `JSON.parse` chunk trực tiếp.
3. Quét ký tự để nhận CRLF, LF hoặc CR như một line ending. Nếu CR ở cuối chunk, giữ cờ pending CR; chunk sau bắt đầu LF thì tiêu thụ LF như phần cùng delimiter, không tạo dòng trống giả. Regex `/\r\n|\r|\n/` chỉ tách **dòng đã hoàn chỉnh**, không thay thế state machine này.
4. Dòng bắt đầu `:` bỏ qua nội dung; dòng field tách tại dấu `:` đầu tiên, bỏ tối đa một space đầu value. Tích lũy nhiều field `data` thành các dòng nối bằng `\n`; field event cuối xác định loại sự kiện. Field lạ không có tác dụng nghiệp vụ.
5. Dòng trống kết thúc event. Không có data thì không dispatch. Có data thì parse JSON hoàn chỉnh, kiểm token:string và done:boolean. Event không hỗ trợ được bỏ qua; event error hợp đồng hỗ trợ phải chuyển error state.
6. Append token một lần vào đúng conversation/message ID. Nếu done=true, append token còn lại nếu có rồi đóng thành complete đúng một lần; dừng reader, cleanup timer. Flush render theo requestAnimationFrame, không delay giả từng từ làm tăng backlog.
7. EOF: flush decoder; event chưa có delimiter hoàn tất không được đoán thành complete. Nếu chưa nhận done → interrupted, giữ partial text. JSON sai hoặc event vượt 64 KiB → protocol error; giới hạn response 100.000 ký tự để bảo vệ memory.
8. Abort/unmount/đổi major: cancel reader và fetch, invalidate request ID, cleanup timers và pending animation frame; không phát callback complete sau stop/error.

Test parser bắt buộc: LF/CRLF/CR; delimiter cắt giữa chunk; UTF-8 nhiều byte; nhiều event/chunk; nhiều data line tạo JSON hợp lệ; comment heartbeat; unknown field; malformed JSON; duplicate event ID khi resume; EOF trước done; done có token cuối; abort và response muộn. Regex SSE chỉ là phần tách dòng, không là toàn bộ parsing protocol.

### 7.3. Timer và reconnect policy

| Tình huống | Policy |
|---|---|
| Chưa có HTTP headers | Timeout kết nối 15s; hủy và cho người dùng retry |
| Stream đang chạy | Idle timer 15s tính từ byte hợp lệ gần nhất, heartbeat reset timer; không áp total timeout 15s lên cả câu trả lời |
| Chưa có idempotency/resume | **0 automatic POST reconnect**; retry chủ động tạo attempt/message ID mới, giữ lượt trước interrupted |
| Server đã hỗ trợ request ID idempotent + event ID replay | Tối đa 2 reconnect sau 1s rồi 2s cộng jitter 0–250ms; gửi last processed event ID theo contract; loại duplicate ID; không vượt Retry-After |
| 4xx thông thường / lỗi schema | Không reconnect tự động; 429 chỉ cho retry sau thời hạn |
| Người dùng Stop/đổi ngành | Không reconnect; lần gửi mới dùng context snapshot mới |

Endpoint baseline chưa công bố event ID hay bảo đảm POST idempotent nên default hiện tại phải là không replay tự động. Không coi mất kết nối trước token đầu là bảo đảm server chưa chạy inference.

## 8. Persistence và export

History chỉ lưu khi opt-in. Storage schema `majormatch.chat.v1` gồm version, expiresAt và messages theo conversation/major; không lưu profile, answers hoặc PDF. Giới hạn 7 ngày, 50 message/phiên, 200 KiB tổng; xóa bản cũ nhất khi cần và thông báo khi không thể lưu. Người dùng có thể tự gõ PII trong chat, nên UI nhắc không lưu dữ liệu nhạy cảm trên thiết bị dùng chung; không tuyên bố bộ lọc client phát hiện hết PII. Bỏ opt-in xóa các history đã persist của ứng dụng và tiếp tục in-memory.

Hydration chỉ chạy sau mount; validate role/id/state/time/content trước restore. Message đang streaming lúc đóng tab khôi phục thành interrupted. Clear history xóa memory và storage tương ứng; storage exception không làm crash chat. Không đồng bộ cloud hoặc gửi lịch sử sang API nếu wire contract chưa yêu cầu.

Export tạo một snapshot tại click: tên ngành, ngày giờ ISO, nguồn/phiên bản chương trình, trạng thái demo/live, missing skills, baseline và simulated readiness, các kỳ/môn/tiên quyết, mục tick và giới hạn diễn giải. Tên file `majormatch-plan-YYYY-MM-DD.md`; UTF-8, newline chuẩn, escape Markdown từ dữ liệu; dùng Blob/Object URL, khởi tạo download rồi revoke khi không còn dùng. Không xuất PDF gốc, PII hoặc full chat. Demo phải ghi rõ ở đầu file; sourceVersion không có thì ghi “chưa xác minh phiên bản chương trình”, không tạo nguồn giả.

## 9. Nghiệm thu và phạm vi kiểm chứng

Thực hiện T-ING-01–05, T-ANA-01–05, T-ADV-01–06 và các test xuyên suốt trong RTM. Kiểm tra p95 <50ms bằng event-to-paint trên production build với môi trường ghi rõ; PRD TTFT <800ms và 40–55 tokens/s là mục tiêu backend riêng, chưa có benchmark trong phiên này. Preview PDF local không chứng minh extraction ≥95%.

Code hiện tại đã có scaffolding ba module; các type/store/parser/persistence/export đề xuất trong tài liệu chưa được tích hợp. Tài liệu được kiểm tra cấu trúc, liên kết và tính nhất quán; không tự coi đây là xác nhận build, UI, E2E hay hoạt động chỉnh sửa thủ công của thành viên.
