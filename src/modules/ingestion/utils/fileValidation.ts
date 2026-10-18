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
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/x-pdf',
    'application/acrobat',
    'applications/vnd.pdf',
    'text/pdf',
    'application/octet-stream',
    ''
  ],
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

  // Chấp nhận MIME type linh hoạt (Chrome/Windows có thể gắn application/x-pdf hoặc rỗng)
  if (file.type && !(FILE_VALIDATION_CONSTANTS.ALLOWED_MIME_TYPES as readonly string[]).includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      errorCode: 'INVALID_MIME_TYPE',
      errorMessage: `Định dạng tệp '${file.type}' không hợp lệ. Vui lòng chọn tệp PDF chuẩn.`,
    };
  }

  return {
    isValid: true,
    file,
    formattedSize: formatFileSize(file.size),
  };
}

/**
 * Kiem tra dung luong tep tin khong vuot qua nguong gioi han 10MB
 */
export function validatePdfFileSize(file: File): FileValidationResult {
  if (file.size > FILE_VALIDATION_CONSTANTS.MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `Dung lượng tệp (${formatFileSize(file.size)}) vượt quá giới hạn tối đa cho phép là 10 MB.`,
    };
  }

  return {
    isValid: true,
    file,
    formattedSize: formatFileSize(file.size),
  };
}

/**
 * Kiem tra tieu de Magic Bytes '%PDF' cua tep tin trong 1024 bytes dau tien (chuan ISO 32000-1)
 */
export async function validatePdfMagicBytes(file: File): Promise<FileValidationResult> {
  try {
    const sliceLength = Math.min(1024, file.size);
    const slice = file.slice(0, sliceLength);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    let isMatch = false;
    for (let i = 0; i <= bytes.length - 4; i++) {
      if (
        bytes[i] === 0x25 &&     // %
        bytes[i + 1] === 0x50 && // P
        bytes[i + 2] === 0x44 && // D
        bytes[i + 3] === 0x46    // F
      ) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) {
      return {
        isValid: false,
        errorCode: 'INVALID_MAGIC_BYTES',
        errorMessage: 'Nội dung tệp không phải là tệp PDF hợp lệ (không tìm thấy mã nhận dạng %PDF chuẩn).',
      };
    }

    return {
      isValid: true,
      file,
      formattedSize: formatFileSize(file.size),
    };
  } catch (error) {
    return {
      isValid: false,
      errorCode: 'INVALID_MAGIC_BYTES',
      errorMessage: `Không thể đọc cấu trúc tệp: ${(error as Error).message}`,
    };
  }
}

/**
 * Ham kiem tra toan dien tat ca tieu chi cho tep bang diem
 */
export async function validateTranscriptPdfFull(file: File): Promise<FileValidationResult> {
  const basicCheck = validatePdfMimeAndExtension(file);
  if (!basicCheck.isValid) return basicCheck;

  const sizeCheck = validatePdfFileSize(file);
  if (!sizeCheck.isValid) return sizeCheck;

  const magicCheck = await validatePdfMagicBytes(file);
  if (!magicCheck.isValid) return magicCheck;

  return {
    isValid: true,
    file,
    formattedSize: formatFileSize(file.size),
  };
}
