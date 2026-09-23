/**
 * Ingestion Service & Data Adapter
 * Phụ trách: VĂN HOÀNG (Module Ingestion)
 * Đặc tả giáo trình: Chương 5 - Architecture & API Consumer (Client-side Data Pre-validation & Fallback)
 */

import { useProfileStore } from "@/stores/useProfileStore";
import { MOCK_TRANSCRIPT_PARSING } from "@/services/mockData";

export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export class IngestionService {
  /**
   * Tiền kiểm định tính hợp lệ của tệp bảng điểm tại Client trước khi gửi tới Backend HPC
   * Tiêu chuẩn: Tệp PDF, không vượt quá 10MB, đúng phần mở rộng
   */
  static validateTranscriptFile(file: File): FileValidationResult {
    if (!file) {
      return { isValid: false, errorMessage: "Vui lòng chọn một tệp tin." };
    }

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".pdf")) {
      return {
        isValid: false,
        errorMessage: "Hệ thống chỉ chấp nhận tệp định dạng chuẩn .PDF."
      };
    }

    const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_BYTES) {
      return {
        isValid: false,
        errorMessage: `Dung lượng tệp (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn 10MB.`
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        errorMessage: "Tệp tin rỗng, vui lòng kiểm tra lại."
      };
    }

    return { isValid: true };
  }

  /**
   * Gửi tệp bảng điểm đã qua kiểm định lên Store và kích hoạt tiến trình bóc tách API
   */
  static async uploadTranscript(file: File): Promise<void> {
    const validation = this.validateTranscriptFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage);
    }

    const { uploadTranscriptAction } = useProfileStore.getState();
    await uploadTranscriptAction(file);
  }

  /**
   * Gửi kết quả khảo sát RIASEC và danh sách thẻ mục tiêu lên hệ thống
   * Tự động kích hoạt tính toán Cosine Similarity và phân loại ML
   */
  static async submitRiasecSurvey(
    scores: Record<string, number>,
    careerTags: string[]
  ): Promise<void> {
    const store = useProfileStore.getState();

    // Cập nhật điểm RIASEC vào store
    Object.entries(scores).forEach(([group, val]) => {
      store.setRiasecScore(group, val);
    });

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
