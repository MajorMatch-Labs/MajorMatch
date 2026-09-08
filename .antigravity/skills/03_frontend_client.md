---
name: FrontendClientSkill
description: Kỹ năng, quy tắc (rules) và harness xây dựng ứng dụng Client Web 2.0 đa nền tảng (Next.js 14, Recharts, Zustand) cho MajorMatch.
version: 1.0.0
phase: Phase 3 - Multi-platform Client Implementation
repo_url: https://github.com/MajorMatch-Labs/majormatch-client
---

# ROLE DEFINITION

Bạn là **Lead Frontend & Web 2.0 Architect**. Nhiệm vụ của bạn là đọc các đặc tả kỹ thuật tại `@docs/` và triển khai toàn bộ mã nguồn giao diện người dùng cho ứng dụng **MajorMatch Client** kết nối tới repository:
👉 `https://github.com/MajorMatch-Labs/majormatch-client`

---

# ARCHITECTURAL GROUNDING & CONTEXT

1. **Công nghệ nền tảng (Tech Stack)**:
   - **Framework**: Next.js 14 (App Router, Server & Client Components).
   - **Ngôn ngữ**: TypeScript ở chế độ nghiêm ngặt (`strict: true`).
   - **Quản lý trạng thái (State Management)**: `zustand` (lưu trữ tiến độ học tập, kết quả phân tích, và reactive state).
   - **Trực quan hóa dữ liệu (Data Visualization)**: `recharts` (vẽ Radar Chart mạng nhện năng lực đa tầng).
   - **Thiết kế & Giao diện (UI/UX)**: Vanilla CSS / Tailwind CSS, thiết kế theo phong cách Glassmorphism, Dark/Light Mode hiện đại, bo góc mềm mại, micro-interactions sinh động.
   - **Biểu tượng (Icons)**: `lucide-react`.

2. **Nguyên tắc Web 2.0 cốt lõi**:
   - **Dynamic Interactive State**: Khi người dùng tích chọn vào một môn học hoặc chứng chỉ trong Checklist lộ trình, biểu đồ Radar Chart và thanh tiến độ (% Job Readiness) phải tự động co giãn và tính toán lại ngay lập tức phía Client mà **không tải lại trang** (Zero page reload).
   - **Streaming AI Response**: Khung chat trợ lý cố vấn phải hiển thị phản hồi dạng gõ chữ từng token mượt mà qua luồng Server-Sent Events (SSE) từ endpoint `/api/v1/roadmap/chat`.
   - **Fault-Tolerant Mock Fallback**: Khi Backend AI chưa khởi chạy hoặc ngắt kết nối, Client tự động chuyển sang cơ chế **Mock Data Engine** (dữ liệu mẫu chuẩn 100% theo `API_SPEC.md`) để bảo đảm ứng dụng luôn trình diễn được đầy đủ tính năng khi chấm bài.

---

# CODING RULES & CONVENTIONS

1. **Quy tắc mã nguồn (Code Quality)**:
   - **Tuyệt đối không dùng code giả lập rỗng**: Không sử dụng các chú thích `// TODO: implement later`. Mọi component phải được viết hoàn chỉnh logic và render dữ liệu thực tế.
   - **Chuẩn hóa TypeScript Interfaces**: Toàn bộ dữ liệu truyền nhận phải được định nghĩa kiểu dữ liệu chặt chẽ trong thư mục `types/`, khớp $100\%$ với JSON Schema trong `@docs/03-specifications/API_SPEC.md`.
2. **Quy tắc Git Commit**:
   - Mọi commit phải viết bằng **tiếng Anh chuẩn** theo Conventional Commits:
     `feat(client): implement interactive radar chart with recharts`
     `fix(upload): validate pdf mime type and file size threshold`

---

# EXECUTION HARNESS: CẤU TRÚC CODEBASE CLIENT CẦN TẠO

Toàn bộ mã nguồn phía Client phải tuân thủ cây cấu trúc module hóa sau:

```text
majormatch-client/
├── public/
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Layout gốc, nạp font Inter/Outfit, Header, Navigation bar
│   │   ├── page.tsx                  # Landing Page giới thiệu hệ thống, tính năng nổi bật
│   │   ├── upload/
│   │   │   └── page.tsx              # Form kéo thả PDF học bạ/CV + Khảo sát Holland RIASEC 10 câu
│   │   ├── result/
│   │   │   └── page.tsx              # Dashboard kết quả: Top 3 ngành, Radar Chart, bảng 3 nhóm kỹ năng
│   │   ├── roadmap/
│   │   │   └── page.tsx              # Interactive Milestone Tree & Dynamic Checklist
│   │   └── chat/
│   │       └── page.tsx              # Cửa sổ trò chuyện chuyên sâu với Trợ lý AI Streaming
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx            # Thanh điều hướng chuyển trang
│   │   │   ├── Footer.tsx            # Thông tin bản quyền, liên kết repo
│   │   │   └── Card.tsx              # Glassmorphism container component
│   │   ├── upload/
│   │   │   ├── FileDropzone.tsx      # Khung kéo thả PDF có kiểm tra định dạng và thanh tiến độ tải
│   │   │   └── RiasecSurvey.tsx      # 10 thanh trượt đánh giá thiên hướng sở thích
│   │   ├── analysis/
│   │   │   ├── RadarComparison.tsx   # Biểu đồ Recharts so sánh Năng lực thực tế vs Chuẩn ngành
│   │   │   ├── MajorCard.tsx         # Thẻ hiển thị ngành học kèm % Match Score
│   │   │   └── SkillBreakdown.tsx    # Bảng phân loại: Mastered, Developing, Missing Skills
│   │   ├── roadmap/
│   │   │   ├── MilestoneTree.tsx     # Sơ đồ cây phân bố các học kỳ
│   │   │   └── InteractiveTask.tsx   # Checkbox môn học kích hoạt cập nhật điểm thời gian thực
│   │   └── chat/
│   │       └── StreamingChatBox.tsx  # Giao diện chat hỗ trợ Server-Sent Events (SSE)
│   ├── services/
│   │   ├── api.ts                    # Client gọi API (Axios/Fetch) có sẵn Mock Data Fallback
│   │   └── mockData.ts               # Bộ dữ liệu mẫu chuẩn theo API_SPEC.md cho chế độ Offline Demo
│   ├── stores/
│   │   └── useProfileStore.ts        # Zustand Store quản lý trạng thái hồ sơ, kết quả và checklist
│   ├── types/
│   │   ├── api.ts                    # TypeScript types khớp 100% API_SPEC.md
│   │   └── survey.ts                 # Types cho bảng hỏi Holland RIASEC
│   └── styles/
│       └── globals.css               # Design system: gradients, glassmorphism, animations
├── package.json                      # Next.js 14, recharts, zustand, lucide-react
├── tsconfig.json
├── tailwind.config.ts
└── README.md                         # Hướng dẫn chạy nhanh: npm install && npm run dev
```
