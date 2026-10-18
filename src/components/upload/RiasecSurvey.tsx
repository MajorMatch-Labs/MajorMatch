"use client";

import React, { useMemo, useEffect, useState } from "react";
import { AVAILABLE_CAREER_TAGS } from "@/types/survey";
import { useProfileStore } from "@/stores/useProfileStore";
import { Sparkles, Compass, Check, BrainCircuit, Cloud, Loader2, Save } from "lucide-react";
import { RIASEC_QUESTIONS_DATASET } from "@/modules/ingestion/constants/riasecQuestions";
import {
  RIASEC_TRAIT_DEFINITIONS,
} from "@/modules/ingestion/constants/riasecConstants";
import {
  calculateHollandScores,
  getDominantHollandCode,
  rankRiasecTraits,
} from "@/modules/ingestion/utils/riasecScoring";
import { ApiService } from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

const EMPTY_ANSWERS: Record<number, number> = {};

export const RiasecSurvey: React.FC = () => {
  const {
    profile,
    riasecAnswers,
    selectedCareerTags,
    setRiasecScore,
    setRiasecAnswers,
    toggleCareerTag,
  } = useProfileStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();

  const studentId = isAuthenticated ? (user?.studentId || profile?.student_id) : null;

  // State độc lập cho từng câu hỏi từ 1 đến 10
  const questionAnswers = isAuthenticated ? riasecAnswers || EMPTY_ANSWERS : EMPTY_ANSWERS;
  const answeredCount = RIASEC_QUESTIONS_DATASET.filter((q) => Number.isInteger(questionAnswers[q.id]) && questionAnswers[q.id] >= 1 && questionAnswers[q.id] <= 5).length;
  const surveyComplete = answeredCount === RIASEC_QUESTIONS_DATASET.length;
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "saved" | "saving">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Nạp câu trả lời cũ từ Cloud CSDL khi mở trang (chỉ khi đã đăng nhập)
  useEffect(() => {
    if (!isAuthenticated || !studentId) {
      setSyncStatus("idle");
      return;
    }
    let isMounted = true;
    const loadPreviousSurvey = async () => {
      setSyncStatus("loading");
      try {
        const saved = await ApiService.getRiasecSurvey(studentId);
        if (saved && saved.answers && Object.keys(saved.answers).length > 0 && isMounted) {
          const parsed: Record<number, number> = {};
          Object.entries(saved.answers).forEach(([k, v]) => {
            parsed[Number(k)] = Number(v);
          });
          useProfileStore.setState({ riasecAnswers: parsed });
          if (Object.keys(parsed).length === RIASEC_QUESTIONS_DATASET.length) {
            Object.entries(calculateHollandScores(parsed)).forEach(([grp, sc]) => setRiasecScore(grp, sc));
          }
          setSyncStatus("saved");
        } else if (isMounted) {
          setSyncStatus("idle");
        }
      } catch {
        if (isMounted) setSyncStatus("idle");
      }
    };
    loadPreviousSurvey();
    return () => { isMounted = false; };
  }, [studentId, isAuthenticated, setRiasecScore]);

  const handleScoreChange = (qId: number, val: number) => {
    const nextAnswers = { ...questionAnswers, [qId]: val };
    setRiasecAnswers(nextAnswers);
    setSaveError(null);
    if (Object.keys(nextAnswers).length !== RIASEC_QUESTIONS_DATASET.length) {
      setSyncStatus("idle");
      return;
    }
    const rawScores = calculateHollandScores(nextAnswers);
    Object.entries(rawScores).forEach(([group, score]) => setRiasecScore(group, score));

    // Chỉ tự động lưu ngầm vào Cloud nếu đã đăng nhập tài khoản
    if (isAuthenticated && studentId) {
      setSyncStatus("saving");
      const dominant = getDominantHollandCode(rawScores);
      ApiService.saveRiasecSurvey(studentId, nextAnswers, { ...rawScores }, dominant.code)
        .then(() => setSyncStatus("saved"))
        .catch(() => { setSyncStatus("idle"); setSaveError("Chưa lưu được khảo sát. Vui lòng thử lại."); });
    } else {
      setSyncStatus("idle");
    }
  };

  const handleManualSave = async () => {
    if (!surveyComplete) {
      setSaveError("Vui lòng trả lời đủ 10 câu hỏi trước khi lưu.");
      return;
    }
    if (!isAuthenticated || !studentId) {
      openAuthModal("login");
      return;
    }
    setSyncStatus("saving");
    const rawScores = calculateHollandScores(questionAnswers);
    const dominant = getDominantHollandCode(rawScores);
    try {
      await ApiService.saveRiasecSurvey(studentId, questionAnswers, { ...rawScores }, dominant.code);
      setSyncStatus("saved");
      setSaveError(null);
    } catch {
      setSyncStatus("idle");
      setSaveError("Chưa lưu được khảo sát. Vui lòng thử lại.");
    }
  };

  // Tinh toan ma Holland noi troi tu diem so hien tai voi Fallback an toan tuyet doi
  const dominantInfo = useMemo(() => {
    if (!surveyComplete) return null;
    const rawScores = calculateHollandScores(questionAnswers);
    const ranked = rankRiasecTraits(rawScores);
    const dominant = getDominantHollandCode(rawScores);

    const defaultTrait = RIASEC_TRAIT_DEFINITIONS.I || {
      key: 'I',
      codeName: 'Investigative',
      vietnameseName: 'Nghiên cứu & Khám phá',
      summary: '',
      color: '#3B82F6',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      typicalCareers: [],
    };

    const primaryMeta = RIASEC_TRAIT_DEFINITIONS[dominant.primary] || defaultTrait;
    const secondaryMeta = RIASEC_TRAIT_DEFINITIONS[dominant.secondary] || RIASEC_TRAIT_DEFINITIONS.R || defaultTrait;

    return {
      code: dominant.code || "IR",
      primaryMeta,
      secondaryMeta,
      topTwo: ranked.slice(0, 2),
    };
  }, [questionAnswers, surveyComplete]);

  const safeCareerTags = isAuthenticated && Array.isArray(selectedCareerTags) ? selectedCareerTags : [];

  return (
    <div className="space-y-6">
      {/* 1. Chọn định hướng mục tiêu (Career Tags) */}
      <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            1. Chọn lĩnh vực / Chuyên ngành mục tiêu (Tối đa 5 thẻ)
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Chọn ít nhất một lĩnh vực bạn muốn tìm hiểu. Bạn có thể chọn tối đa năm lĩnh vực.
        </p>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CAREER_TAGS.map((tag) => {
            const isSelected = safeCareerTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={isSelected}
                disabled={!isAuthenticated}
                onClick={() => toggleCareerTag(tag.id)}
                className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 border border-indigo-400"
                    : "bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-white shadow-xs"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                <span>{tag.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Khảo sát Holland Code RIASEC 10 câu */}
      <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              2. Trắc nghiệm Thiên hướng Holland Code (RIASEC)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                Đăng nhập để chọn câu trả lời và lưu khảo sát
              </span>
            )}
            {isAuthenticated && syncStatus === "loading" && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" /> Đang tải...
              </span>
            )}
            {isAuthenticated && syncStatus === "saving" && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...
              </span>
            )}
            {isAuthenticated && syncStatus === "saved" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                <Cloud className="w-3 h-3" /> Đã lưu Cloud ({studentId})
              </span>
            )}
            <button
              type="button"
              onClick={handleManualSave}
              className="flex min-h-11 items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
              title={isAuthenticated ? "Lưu bài khảo sát vào CSDL Cloud" : "Đăng nhập để lưu tiến trình vào Cloud"}
            >
              <Save className="w-3 h-3" />
              <span>Lưu tiến trình</span>
            </button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300" aria-live="polite">{answeredCount}/10 đã trả lời</span>
          </div>
        </div>

        {/* Khung xem trước thiên hướng nhận diện thời gian thực */}
        <div className="mb-4 p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              {dominantInfo ? <>
                Thiên hướng tham khảo: <strong className="text-indigo-700 dark:text-indigo-300 text-sm">{dominantInfo.code}</strong> ({dominantInfo.primaryMeta?.vietnameseName} và {dominantInfo.secondaryMeta?.vietnameseName})
              </> : "Trả lời đủ 10 câu để xem thiên hướng của bạn."}
            </span>
          </div>
          <div className="flex gap-1.5">
            {dominantInfo?.topTwo.map((trait) => {
              const meta = RIASEC_TRAIT_DEFINITIONS[trait.key] || RIASEC_TRAIT_DEFINITIONS.I;
              return (
                <span
                  key={trait.key}
                  className="text-[10px] font-mono px-2 py-0.5 rounded border"
                  style={{
                    color: meta?.color || '#3B82F6',
                    backgroundColor: meta?.badgeBg || 'rgba(59, 130, 246, 0.15)',
                    borderColor: `${meta?.color || '#3B82F6'}40`,
                  }}
                >
                  {trait.key}: {trait.percentage}%
                </span>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Chọn một mức từ 1 (Rất không thích) đến 5 (Rất thích) cho từng câu. Không có câu trả lời đúng hay sai.
        </p>

        <div className="space-y-4">
          {RIASEC_QUESTIONS_DATASET.map((q) => {
            const hasAnswer = questionAnswers[q.id] !== undefined;
            const currentScore = questionAnswers[q.id];
            const traitMeta = RIASEC_TRAIT_DEFINITIONS[q.category] || RIASEC_TRAIT_DEFINITIONS.I;

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-1.5">Câu {q.id}:</span>
                    {q.questionText}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: traitMeta?.color || '#3B82F6' }}
                      />
                      <span>{q.scenarioHint}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800/50 flex-shrink-0 font-semibold">
                    {hasAnswer ? `${currentScore}/5` : "Chưa trả lời"}
                  </span>
                </div>

                <div role="group" aria-label={`Câu ${q.id}: ${q.questionText}`} className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button key={score} type="button" aria-pressed={currentScore === score} aria-label={`Mức ${score} trên 5`} disabled={!isAuthenticated} onClick={() => handleScoreChange(q.id, score)} className={`min-h-11 rounded-lg border text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 ${currentScore === score ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}>{score}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {saveError && <p role="alert" className="mt-4 text-sm text-rose-600 dark:text-rose-400">{saveError}</p>}
      </div>
    </div>
  );
};
