/**
 * Unit Test for PDF File Validation & Magic Bytes Security
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 * Module: Ingestion & Input Pipeline
 * Tuan 8 - Chuong 8: AI trong Kiem thu Phan mem (Testing & Automation)
 */

import { describe, it, expect } from "vitest";
import {
  formatFileSize,
  validatePdfMimeAndExtension,
  validatePdfFileSize,
  validatePdfMagicBytes,
  validateTranscriptPdfFull,
  FILE_VALIDATION_CONSTANTS,
} from "../../src/modules/ingestion/utils/fileValidation";

// Helper tạo mock File object trong môi trường Node / Vitest
function createMockFile(
  name: string,
  sizeBytes: number,
  type: string,
  contentBytes: number[] = [0x25, 0x50, 0x44, 0x46] // %PDF
): File {
  const buffer = new Uint8Array(sizeBytes);
  contentBytes.forEach((byte, idx) => {
    if (idx < sizeBytes) buffer[idx] = byte;
  });

  return new File([buffer], name, { type });
}

describe("Unit Test: Ingestion File Validation Engine", () => {
  describe("formatFileSize()", () => {
    it("should correctly format 0 bytes", () => {
      expect(formatFileSize(0)).toBe("0 Bytes");
    });

    it("should format bytes, kilobytes, and megabytes accurately", () => {
      expect(formatFileSize(500)).toBe("500 Bytes");
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1024 * 1024 * 2.5)).toBe("2.5 MB");
    });
  });

  describe("validatePdfMimeAndExtension()", () => {
    it("should reject empty file (0 bytes)", () => {
      const emptyFile = createMockFile("empty.pdf", 0, "application/pdf");
      const result = validatePdfMimeAndExtension(emptyFile);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorCode).toBe("FILE_EMPTY");
      }
    });

    it("should reject file with non-pdf extension", () => {
      const docxFile = createMockFile("transcript.docx", 1024, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      const result = validatePdfMimeAndExtension(docxFile);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorCode).toBe("INVALID_EXTENSION");
      }
    });

    it("should reject invalid MIME type even if extension is .pdf", () => {
      const spoofedFile = createMockFile("malicious.pdf", 1024, "text/plain");
      const result = validatePdfMimeAndExtension(spoofedFile);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorCode).toBe("INVALID_MIME_TYPE");
      }
    });

    it("should accept valid PDF file extension and MIME type", () => {
      const validFile = createMockFile("bang_diem.pdf", 1024 * 200, "application/pdf");
      const result = validatePdfMimeAndExtension(validFile);
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.formattedSize).toBe("200 KB");
      }
    });
  });

  describe("validatePdfFileSize()", () => {
    it("should accept files within the 10MB limit", () => {
      const normalFile = createMockFile("normal.pdf", 5 * 1024 * 1024, "application/pdf");
      const result = validatePdfFileSize(normalFile);
      expect(result.isValid).toBe(true);
    });

    it("should reject files exceeding 10MB limit", () => {
      const oversizedFile = createMockFile("huge.pdf", 11 * 1024 * 1024, "application/pdf");
      const result = validatePdfFileSize(oversizedFile);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorCode).toBe("FILE_TOO_LARGE");
      }
    });
  });

  describe("validatePdfMagicBytes()", () => {
    it("should accept binary buffer with valid %PDF- magic bytes", async () => {
      const validPdfFile = createMockFile("valid.pdf", 512, "application/pdf", [0x25, 0x50, 0x44, 0x46]);
      const result = await validatePdfMagicBytes(validPdfFile);
      expect(result.isValid).toBe(true);
    });

    it("should reject fake PDF that lacks %PDF- header", async () => {
      const fakePdfFile = createMockFile("fake.pdf", 512, "application/pdf", [0x89, 0x50, 0x4e, 0x47]); // PNG header
      const result = await validatePdfMagicBytes(fakePdfFile);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorCode).toBe("INVALID_MAGIC_BYTES");
      }
    });
  });

  describe("validateTranscriptPdfFull() Comprehensive Pipeline", () => {
    it("should pass standard transcript PDF through all pipeline gates", async () => {
      const transcriptFile = createMockFile(
        "BangDiem_VKU_ChinhThuc.pdf",
        1.5 * 1024 * 1024,
        "application/pdf",
        FILE_VALIDATION_CONSTANTS.PDF_MAGIC_BYTES as any
      );

      const result = await validateTranscriptPdfFull(transcriptFile);
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.formattedSize).toBe("1.5 MB");
        expect(result.file.name).toBe("BangDiem_VKU_ChinhThuc.pdf");
      }
    });
  });
});
