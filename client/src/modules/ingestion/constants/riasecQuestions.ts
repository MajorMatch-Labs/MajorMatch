/**
 * 10-Question Standard RIASEC Questionnaire Dataset
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 */

import { RiasecTraitKey } from './riasecConstants';

export interface RiasecQuestionItem {
  id: number;
  questionText: string;
  category: RiasecTraitKey;
  weight: number; // Trong so phan bo (mac dinh 1.0)
  scenarioHint: string;
}

export const RIASEC_QUESTIONS_DATASET: readonly RiasecQuestionItem[] = [
  {
    id: 1,
    questionText: 'Bạn thích tự tay lắp ráp linh kiện máy tính, cấu hình router mạng hoặc lập trình mạch nhúng IoT?',
    category: 'R',
    weight: 1.0,
    scenarioHint: 'Thao tác thực tế với thiết bị và hạ tầng vật lý',
  },
  {
    id: 2,
    questionText: 'Bạn say mê tìm hiểu bản chất thuật toán, cấu trúc dữ liệu hoặc đọc tài liệu nghiên cứu AI/Machine Learning?',
    category: 'I',
    weight: 1.2,
    scenarioHint: 'Tư duy trừu tượng, logic toán học và nghiên cứu chuyên sâu',
  },
  {
    id: 3,
    questionText: 'Bạn thích thiết kế giao diện web đẹp mắt, chăm chút từng animation, icon và trải nghiệm người dùng trực quan?',
    category: 'A',
    weight: 1.0,
    scenarioHint: 'Óc thẩm mỹ, thiết kế sáng tạo và cảm nhận trực quan',
  },
  {
    id: 4,
    questionText: 'Bạn thích giải thích khái niệm công nghệ phức tạp cho người khác, hướng dẫn bạn bè cùng tiến bộ?',
    category: 'S',
    weight: 1.0,
    scenarioHint: 'Giao tiếp, truyền đạt tri thức và phát triển cộng đồng',
  },
  {
    id: 5,
    questionText: 'Bạn muốn thành lập dự án startup công nghệ riêng, thương lượng hợp đồng hoặc thuyết trình ý tưởng sản phẩm?',
    category: 'E',
    weight: 1.1,
    scenarioHint: 'Khát vọng lãnh đạo, kinh doanh và hoạch định chiến lược',
  },
  {
    id: 6,
    questionText: 'Bạn thích xây dựng quy trình kiểm thử tự động, chuẩn hóa checklist code và kiểm soát chất lượng phần mềm?',
    category: 'C',
    weight: 1.0,
    scenarioHint: 'Tính cẩn thận, quy chuẩn kỷ luật và chi tiết hóa',
  },
  {
    id: 7,
    questionText: 'Bạn thích tối ưu hiệu năng cơ sở dữ liệu, phân tích các đồ thị log hệ thống và chỉ số giám sát server?',
    category: 'I',
    weight: 1.0,
    scenarioHint: 'Phân tích số liệu và giải quyết nút thắt cổ chai',
  },
  {
    id: 8,
    questionText: 'Bạn có hứng thú với việc tinh chỉnh hệ điều hành Linux, viết shell script tự động hóa hạ tầng đám mây?',
    category: 'R',
    weight: 1.0,
    scenarioHint: 'Kỹ thuật hệ thống và tự động hóa vận hành',
  },
  {
    id: 9,
    questionText: 'Bạn thích sáng tạo nội dung video công nghệ, thiết kế đồ họa 3D hoặc trực quan hóa dữ liệu sinh động?',
    category: 'A',
    weight: 1.0,
    scenarioHint: 'Sáng tạo nội dung đa phương tiện và nghệ thuật số',
  },
  {
    id: 10,
    questionText: 'Bạn muốn đóng vai trò điều phối các thành viên trong nhóm, phân chia sprint và quản lý tiến độ bàn giao dự án?',
    category: 'E',
    weight: 1.0,
    scenarioHint: 'Tổ chức đội ngũ, phân công nhiệm vụ và quản trị mục tiêu',
  },
] as const;
