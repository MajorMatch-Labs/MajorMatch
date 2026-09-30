/**
 * R.I.A.S.E.C Domain Constants & Trait Definitions
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 */

export const RIASEC_TRAIT_KEYS = ['R', 'I', 'A', 'S', 'E', 'C'] as const;

export type RiasecTraitKey = typeof RIASEC_TRAIT_KEYS[number];

export interface RiasecTraitMeta {
  key: RiasecTraitKey;
  codeName: string;
  vietnameseName: string;
  summary: string;
  color: string;
  badgeBg: string;
  typicalCareers: string[];
}

export const RIASEC_TRAIT_DEFINITIONS: Record<RiasecTraitKey, RiasecTraitMeta> = {
  R: {
    key: 'R',
    codeName: 'Realistic',
    vietnameseName: 'Thực tế & Kỹ thuật',
    summary: 'Thích làm việc với máy móc, công cụ, phần cứng thực tế và hệ thống vận hành.',
    color: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.15)',
    typicalCareers: ['Kỹ sư Mạng & Hạ tầng', 'Chuyên viên IoT & Vi mạch', 'Quản trị Hệ thống'],
  },
  I: {
    key: 'I',
    codeName: 'Investigative',
    vietnameseName: 'Nghiên cứu & Khám phá',
    summary: 'Thích tư duy logic, nghiên cứu khoa học, phân tích thuật toán và giải quyết bài toán phức tạp.',
    color: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    typicalCareers: ['Kỹ sư AI / Machine Learning', 'Nhà Khoa học Dữ liệu', 'Nghiên cứu Mật mã & Thuật toán'],
  },
  A: {
    key: 'A',
    codeName: 'Artistic',
    vietnameseName: 'Nghệ thuật & Sáng tạo',
    summary: 'Thích sự trực quan, sáng tạo giao diện, trải nghiệm người dùng và thiết kế độc đáo.',
    color: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    typicalCareers: ['UI/UX Product Designer', 'Frontend Creative Engineer', 'Game Visual Developer'],
  },
  S: {
    key: 'S',
    codeName: 'Social',
    vietnameseName: 'Xã hội & Hỗ trợ',
    summary: 'Thích làm việc nhóm, đào tạo, chia sẻ kiến thức công nghệ và hỗ trợ người dùng.',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    typicalCareers: ['Developer Relations (DevRel)', 'Chuyên viên Tư vấn Giải pháp', 'Technical Trainer'],
  },
  E: {
    key: 'E',
    codeName: 'Enterprising',
    vietnameseName: 'Quản trị & Khởi nghiệp',
    summary: 'Thích dẫn dắt dự án, hoạch định chiến lược kinh doanh công nghệ và thuyết phục người khác.',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    typicalCareers: ['AI Product Manager', 'Giám đốc Công nghệ (CTO)', 'Scrum Master / Agile Coach'],
  },
  C: {
    key: 'C',
    codeName: 'Conventional',
    vietnameseName: 'Tổ chức & Quy chuẩn',
    summary: 'Thích sự chi tiết, kiểm soát chất lượng, tuân thủ quy chuẩn bảo mật và chuẩn hóa quy trình.',
    color: '#6B7280',
    badgeBg: 'rgba(107, 114, 128, 0.15)',
    typicalCareers: ['Chuyên viên QA/QC Phần mềm', 'Kỹ sư Đảm bảo An toàn Thông tin', 'Database Administrator'],
  },
};

export const RIASEC_SCORE_THRESHOLDS = {
  HIGH: 4.0,
  MODERATE: 2.8,
  MIN_SCALE: 1.0,
  MAX_SCALE: 5.0,
} as const;
