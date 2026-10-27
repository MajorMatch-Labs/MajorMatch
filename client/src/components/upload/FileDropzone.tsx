"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFileUpload } from "@/modules/ingestion/hooks/useFileUpload";

export const FileDropzone: React.FC = () => {
  const { profile, uploadedFileName, isUploading } = useProfileStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const { handleFile, errorMsg, isPending } = useFileUpload();
  const uploadBusy = isUploading || isPending;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClickDropzone = () => {
    if (uploadBusy) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    fileInputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
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
        onClick={handleClickDropzone}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); handleClickDropzone(); } }}
        role="button"
        tabIndex={0}
        aria-label={uploadedFileName ? "Thay tệp PDF đã tải" : "Chọn tệp PDF để tải lên"}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
            : isAuthenticated && profile && uploadedFileName
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900/70 shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          disabled={uploadBusy}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
            e.target.value = "";
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          {uploadBusy ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Đang đọc và xử lý tệp PDF...
              </span>
            </div>
          ) : isAuthenticated && profile && uploadedFileName ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{uploadedFileName}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                Bóc tách thành công: {profile.courses?.length ? `${profile.courses.length} Môn học` : "Hồ sơ CV"}{profile.detected_skills?.length ? ` | ${profile.detected_skills.length} Kỹ năng` : ""}{profile.cumulative_gpa ? ` | GPA ${profile.cumulative_gpa}` : ""}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-md mt-1">
                Nhấp hoặc kéo thả tệp khác để thay thế bảng điểm
              </p>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  Kéo thả Bảng điểm / CV định dạng PDF vào đây
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hỗ trợ tệp PDF dung lượng tối đa 10 MB.
                </p>
                {!isAuthenticated && (
                  <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Đăng nhập để tải và lưu hồ sơ của bạn.</span>
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>



      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hiển thị chi tiết sau khi trích xuất */}
      {isAuthenticated && profile && uploadedFileName && (
        <div className="mt-4 p-4 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center shadow-sm">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">GPA Tích lũy</span>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-0.5 font-mono">
              {profile.cumulative_gpa ?? "N/A"} / 4.0
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">Số tín chỉ</span>
            <div className="text-lg font-bold text-cyan-600 dark:text-cyan-300 mt-0.5 font-mono">
              {profile.total_credits ?? 0} tín chỉ
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">Môn đã hoàn thành</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-0.5 font-mono">
              {profile.courses?.length ?? 0} môn
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">Kỹ năng phát hiện</span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-300 mt-0.5 font-mono">
              {profile.detected_skills?.length ?? 0} kỹ năng
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
