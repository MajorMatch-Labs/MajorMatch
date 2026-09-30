/**
 * Client-side PDF File Validation Engine
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 */

export interface ValidationSuccessResult {
  isValid: true;
  file: File;
  formattedSize: string;
}

export interface ValidationFailureResult {
  isValid: false;
  errorCode: 'FILE_EMPTY' | 'INVALID_EXTENSION' | 'INVALID_MIME_TYPE' | 'FILE_TOO_LARGE' | 'INVALID_MAGIC_BYTES';
  errorMessage: string;
}

export type FileValidationResult = ValidationSuccessResult | ValidationFailureResult;

export const FILE_VALIDATION_CONSTANTS = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 Megabytes
  ALLOWED_EXTENSIONS: ['.pdf'],
  ALLOWED_MIME_TYPES: ['application/pdf'],
  PDF_MAGIC_BYTES: [0x25, 0x50, 0x44, 0x46], // %PDF in ASCII
} as const;

/**
 * Dinh dang dung luong tep tin thanh chuoi de doc (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Kiem tra tinh hop le cua tep tin bang diem PDF tren Client
 */
export function validatePdfMimeAndExtension(file: File): FileValidationResult {
  if (!file || file.size === 0) {
    return {
      isValid: false,
      errorCode: 'FILE_EMPTY',
      errorMessage: 'Tệp tải lên bị rỗng (dung lượng 0 bytes). Vui lòng chọn tệp bảng điểm hợp lệ.',
    };
  }

  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = FILE_VALIDATION_CONSTANTS.ALLOWED_EXTENSIONS.some((ext) => fileNameLower.endsWith(ext));
  if (!hasValidExt) {
    return {
      isValid: false,
      errorCode: 'INVALID_EXTENSION',
      errorMessage: `Định dạng tệp '${file.name}' không được hỗ trợ. Hệ thống chỉ chấp nhận tệp định dạng .pdf.`,
    };
  }

  if (file.type && !FILE_VALIDATION_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      errorCode: 'INVALID_MIME_TYPE',
      errorMessage: `MIME type '${file.type}' không hợp lệ. Vui lòng chọn tệp PDF chuẩn.`,
    };
  }

  return {
    isValid: true,
    file,
    formattedSize: formatFileSize(file.size),
  };
}
