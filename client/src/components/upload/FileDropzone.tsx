"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileCode2 } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { IngestionService } from "@/modules/ingestion/services/ingestionService";

export const FileDropzone: React.FC = () => {
  const { profile, uploadedFileName, isUploading } = useProfileStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    const validation = IngestionService.validateTranscriptFile(file);
    if (!validation.isValid) {
      setErrorMsg(validation.errorMessage || "Tệp không hợp lệ");
      return;
    }

    try {
      await IngestionService.uploadTranscript(file);
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể bóc tách file. Vui lòng thử lại.");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
            : profile
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <span className="text-sm font-medium text-slate-300">
                Đang khử định danh PII & Bóc tách bảng điểm PDF...
              </span>
            </div>
          ) : profile ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-white">{uploadedFileName}</span>
              <span className="text-xs text-emerald-400 font-mono">
                Bóc tách thành công: GPA {profile.cumulative_gpa} | {profile.courses.length} Môn học
              </span>
              <p className="text-[11px] text-slate-400 max-w-md mt-1">
                Nhấp hoặc kéo thả tệp khác để thay thế bảng điểm
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Kéo thả Bảng điểm / CV định dạng PDF vào đây
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ tệp .PDF dung lượng tối đa 10MB (Khử định danh tự động 100%)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tùy chọn nạp dữ liệu Mock Demo nhanh nếu không có file PDF sẵn */}
      {!profile && !isUploading && (
        <div className="mt-2 text-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              IngestionService.loadOfflineDemoData();
            }}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 px-2.5 rounded-md hover:bg-indigo-500/10 transition-colors"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Sử dụng bảng điểm mẫu thử nghiệm (Offline Mock)</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hiển thị chi tiết sau khi trích xuất */}
      {profile && (
        <div className="mt-4 p-4 rounded-xl glass-panel border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-medium">GPA Tích lũy</span>
            <div className="text-lg font-bold text-indigo-300 mt-0.5 font-mono">
              {profile.cumulative_gpa} / 4.0
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Số tín chỉ</span>
            <div className="text-lg font-bold text-cyan-300 mt-0.5 font-mono">
              {profile.total_credits} tín chỉ
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Môn đã hoàn thành</span>
            <div className="text-lg font-bold text-emerald-300 mt-0.5 font-mono">
              {profile.courses.length} môn
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <span className="text-[11px] text-slate-400 uppercase font-medium">Kỹ năng phát hiện</span>
            <div className="text-lg font-bold text-amber-300 mt-0.5 font-mono">
              {profile.detected_skills.length} kỹ năng
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
