/**
 * Unit Test Suite: Ingestion Algorithm & File Validation
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 */

import {
  calculateHollandScores,
  rankRiasecTraits,
  getDominantHollandCode,
} from '../../src/modules/ingestion/utils/riasecScoring';
import {
  validatePdfMimeAndExtension,
  validatePdfFileSize,
  formatFileSize,
} from '../../src/modules/ingestion/utils/fileValidation';

describe('Ingestion Module - RIASEC Scoring Algorithm', () => {
  it('tính toán điểm tối đa 5.0 khi người dùng chọn tất cả câu trả lời là 5', () => {
    const allFives: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) allFives[i] = 5;

    const scores = calculateHollandScores(allFives);
    expect(scores.r).toBe(5.0);
    expect(scores.i).toBe(5.0);
    expect(scores.a).toBe(5.0);
    expect(scores.s).toBe(5.0);
    expect(scores.e).toBe(5.0);
    expect(scores.c).toBe(5.0);
  });

  it('tính toán điểm tối thiểu 1.0 khi người dùng chọn tất cả câu trả lời là 1', () => {
    const allOnes: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) allOnes[i] = 1;

    const scores = calculateHollandScores(allOnes);
    expect(scores.r).toBe(1.0);
    expect(scores.i).toBe(1.0);
    expect(scores.a).toBe(1.0);
    expect(scores.s).toBe(1.0);
    expect(scores.e).toBe(1.0);
    expect(scores.c).toBe(1.0);
  });

  it('xếp hạng chính xác nhóm tính cách nổi trội nhất (Ranked Traits)', () => {
    const customAnswers: Record<number, number> = {
      1: 2, // R
      2: 5, // I (cao)
      3: 3, // A
      4: 2, // S
      5: 4, // E
      6: 3, // C
      7: 5, // I (cao)
      8: 2, // R
      9: 3, // A
      10: 4, // E
    };

    const scores = calculateHollandScores(customAnswers);
    const ranked = rankRiasecTraits(scores);
    const dominant = getDominantHollandCode(scores);

    expect(ranked[0].key).toBe('I');
    expect(ranked[1].key).toBe('E');
    expect(dominant.code).toBe('IE');
    expect(dominant.primary).toBe('I');
    expect(dominant.secondary).toBe('E');
  });
});

describe('Ingestion Module - File Validation Utilities', () => {
  it('định dạng dung lượng tệp tin chính xác', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('từ chối tệp tin không phải định dạng PDF', () => {
    const fakeDocx = new File(['dummy content'], 'bang_diem.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const result = validatePdfMimeAndExtension(fakeDocx);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorCode).toBe('INVALID_EXTENSION');
    }
  });

  it('từ chối tệp tin vượt quá dung lượng tối đa 10MB', () => {
    const oversizedBytes = new Uint8Array(11 * 1024 * 1024); // 11MB
    const largeFile = new File([oversizedBytes], 'large_transcript.pdf', {
      type: 'application/pdf',
    });

    const result = validatePdfFileSize(largeFile);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.errorCode).toBe('FILE_TOO_LARGE');
    }
  });
});
