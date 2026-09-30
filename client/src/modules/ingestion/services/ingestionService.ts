/**
 * Ingestion Service & Data Adapter
 * Phụ trách: VĂN HOÀNG (Module Ingestion)
 * Đặc tả giáo trình: Chương 5 - Architecture & API Consumer (Client-side Data Pre-validation & Fallback)
 */

import { useProfileStore } from "@/stores/useProfileStore";
import { MOCK_TRANSCRIPT_PARSING } from "@/services/mockData";
import {
  calculateHollandScores,
  rankRiasecTraits,
  getDominantHollandCode,
  UserSurveyAnswers,
  RawRiasecScores,
  RankedTraitResult,
} from "../utils/riasecScoring";
import {
  validateTranscriptPdfFull,
  validatePdfMimeAndExtension,
  validatePdfFileSize,
  FileValidationResult as DetailedValidationResult,
  formatFileSize,
} from "../utils/fileValidation";

export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
  formattedSize?: string;
}

export class IngestionService {
  /**
   * Tiền kiểm định tính hợp lệ đồng bộ của tệp bảng điểm tại Client
   */
  static validateTranscriptFile(file: File): FileValidationResult {
    const check = validatePdfMimeAndExtension(file);
    if (!check.isValid) {
      return { isValid: false, errorMessage: check.errorMessage };
    }

    const sizeCheck = validatePdfFileSize(file);
    if (!sizeCheck.isValid) {
      return { isValid: false, errorMessage: sizeCheck.errorMessage };
    }

    return { isValid: true, formattedSize: sizeCheck.formattedSize };
  }

  /**
   * Tiền kiểm định bất đồng bộ toàn diện cả tiêu đề Magic Bytes %PDF-
   */
  static async validateTranscriptFileAdvanced(file: File): Promise<DetailedValidationResult> {
    return await validateTranscriptPdfFull(file);
  }

  /**
   * Gửi tệp bảng điểm đã qua kiểm định lên Store và kích hoạt tiến trình bóc tách API
   */
  static async uploadTranscript(file: File): Promise<void> {
    const validation = await this.validateTranscriptFileAdvanced(file);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    const { uploadTranscriptAction } = useProfileStore.getState();
    await uploadTranscriptAction(file);
  }

  /**
   * Tính toán điểm Holland RIASEC từ 10 câu trả lời khảo sát và nạp vào State Store
   */
  static processSurveyAnswers(answers: UserSurveyAnswers): {
    scores: RawRiasecScores;
    ranked: RankedTraitResult[];
    dominantCode: { code: string; primary: string; secondary: string };
  } {
    const scores = calculateHollandScores(answers);
    const ranked = rankRiasecTraits(scores);
    const dominantCode = getDominantHollandCode(scores);

    return { scores, ranked, dominantCode };
  }

  /**
   * Gửi kết quả khảo sát RIASEC và danh sách thẻ mục tiêu lên hệ thống
   * Tự động kích hoạt tính toán Cosine Similarity và phân loại ML
   */
  static async submitRiasecSurvey(
    scores: Record<string, number>,
    careerTags: string[] = []
  ): Promise<void> {
    const store = useProfileStore.getState();

    // Cập nhật điểm RIASEC vào store
    Object.entries(scores).forEach(([group, val]) => {
      store.setRiasecScore(group, val);
    });

    if (careerTags.length > 0) {
      careerTags.forEach((tag) => {
        if (!store.selectedCareerTags.includes(tag)) {
          store.toggleCareerTag(tag);
        }
      });
    }

    // Kích hoạt tính toán lại độ phù hợp ngành
    await store.calculateMatchAction();
  }

  /**
   * Nạp dữ liệu mẫu Mock Data khi cần demo ngoại tuyến (Offline Demo)
   */
  static loadOfflineDemoData(): void {
    const store = useProfileStore.getState();
    const mockProfile = MOCK_TRANSCRIPT_PARSING.profile_data || MOCK_TRANSCRIPT_PARSING.profile;
    store.setProfile(mockProfile, "Bang_Diem_Demo_VKU.pdf");
    store.calculateMatchAction();
  }
}
