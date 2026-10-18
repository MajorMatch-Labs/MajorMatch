"use client";

import React, { useMemo, useEffect, useState } from "react";
import { AVAILABLE_CAREER_TAGS } from "@/types/survey";
import { useProfileStore } from "@/stores/useProfileStore";
import { Sparkles, Compass, Check, Award, BrainCircuit, Cloud, Loader2, Save } from "lucide-react";
import { RIASEC_QUESTIONS_DATASET } from "@/modules/ingestion/constants/riasecQuestions";
import {
  RIASEC_TRAIT_DEFINITIONS,
  RiasecTraitKey,
} from "@/modules/ingestion/constants/riasecConstants";
import {
  calculateHollandScores,
  getDominantHollandCode,
  rankRiasecTraits,
} from "@/modules/ingestion/utils/riasecScoring";
import { ApiService } from "@/services/api";

export const RiasecSurvey: React.FC = () => {
  const {
    profile,
    riasecScores,
    selectedCareerTags,
    setRiasecScore,
    toggleCareerTag,
  } = useProfileStore();

  const studentId = profile?.student_id || "SV-2025001";

  // State độc lập cho từng câu hỏi từ 1 đến 10
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, number>>({
    1: 3, 2: 4, 3: 3, 4: 3, 5: 4, 6: 4, 7: 3, 8: 3, 9: 3, 10: 4
  });
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "saved" | "saving">("idle");

  // Nạp câu trả lời cũ từ Cloud CSDL khi mở trang
  useEffect(() => {
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
          setQuestionAnswers(parsed);
          if (saved.scores) {
            Object.entries(saved.scores).forEach(([grp, sc]) => {
              setRiasecScore(grp.toLowerCase(), Number(sc));
            });
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
  }, [studentId, setRiasecScore]);

  const handleScoreChange = (qId: number, val: number) => {
    const nextAnswers = { ...questionAnswers, [qId]: val };
    setQuestionAnswers(nextAnswers);

    // Tính điểm trung bình theo chuẩn từng nhóm RIASEC
    const rScores = [nextAnswers[1] || 3, nextAnswers[8] || 3];
    const iScores = [nextAnswers[2] || 3, nextAnswers[7] || 3];
    const aScores = [nextAnswers[3] || 3, nextAnswers[9] || 3];
    const sScores = [nextAnswers[4] || 3];
    const eScores = [nextAnswers[5] || 3, nextAnswers[10] || 3];
    const cScores = [nextAnswers[6] || 3];

    const calcAvg = (arr: number[]) => Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;

    const r = calcAvg(rScores);
    const i = calcAvg(iScores);
    const a = calcAvg(aScores);
    const s = calcAvg(sScores);
    const e = calcAvg(eScores);
    const c = calcAvg(cScores);

    setRiasecScore('r', r);
    setRiasecScore('i', i);
    setRiasecScore('a', a);
    setRiasecScore('s', s);
    setRiasecScore('e', e);
    setRiasecScore('c', c);

    // Tự động lưu ngầm vào Cloud sau khi người dùng tương tác
    setSyncStatus("saving");
    const rawScores = { r, i, a, s, e, c };
    const dominant = getDominantHollandCode(rawScores);
    ApiService.saveRiasecSurvey(studentId, nextAnswers, rawScores, dominant.code || "I")
      .then(() => setSyncStatus("saved"))
      .catch(() => setSyncStatus("idle"));
  };

  const handleManualSave = async () => {
    setSyncStatus("saving");
    const safeScores = riasecScores || {};
    const rawScores = {
      r: Number(safeScores.r ?? safeScores.R ?? 3.0) || 3.0,
      i: Number(safeScores.i ?? safeScores.I ?? 3.0) || 3.0,
      a: Number(safeScores.a ?? safeScores.A ?? 3.0) || 3.0,
      s: Number(safeScores.s ?? safeScores.S ?? 3.0) || 3.0,
      e: Number(safeScores.e ?? safeScores.E ?? 3.0) || 3.0,
      c: Number(safeScores.c ?? safeScores.C ?? 3.0) || 3.0,
    };
    const dominant = getDominantHollandCode(rawScores);
    await ApiService.saveRiasecSurvey(studentId, questionAnswers, rawScores, dominant.code || "I");
    setSyncStatus("saved");
  };

  // Tinh toan ma Holland noi troi tu diem so hien tai voi Fallback an toan tuyet doi
  const dominantInfo = useMemo(() => {
    const safeScores = riasecScores || {};
    const rawScores = {
      r: Number(safeScores.r ?? safeScores.R ?? 3.0) || 3.0,
      i: Number(safeScores.i ?? safeScores.I ?? 3.0) || 3.0,
      a: Number(safeScores.a ?? safeScores.A ?? 3.0) || 3.0,
      s: Number(safeScores.s ?? safeScores.S ?? 3.0) || 3.0,
      e: Number(safeScores.e ?? safeScores.E ?? 3.0) || 3.0,
      c: Number(safeScores.c ?? safeScores.C ?? 3.0) || 3.0,
    };
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
  }, [riasecScores]);

  const safeCareerTags = Array.isArray(selectedCareerTags) ? selectedCareerTags : [];

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
          Chọn các nhóm chuyên môn bạn mong muốn được hệ thống định lượng khoảng cách kỹ năng:
        </p>

        <div className="flex flex-wrap gap-2">
          {AVAILABLE_CAREER_TAGS.map((tag) => {
            const isSelected = safeCareerTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleCareerTag(tag.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            {syncStatus === "loading" && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-500" /> Đang tải...
              </span>
            )}
            {syncStatus === "saving" && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...
              </span>
            )}
            {syncStatus === "saved" && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                <Cloud className="w-3 h-3" /> Đã lưu Cloud ({studentId})
              </span>
            )}
            <button
              type="button"
              onClick={handleManualSave}
              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Lưu bài khảo sát vào CSDL Cloud"
            >
              <Save className="w-3 h-3" />
              <span>Lưu tiến trình</span>
            </button>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">10 Câu hỏi</span>
          </div>
        </div>

        {/* Khung xem trước thiên hướng nhận diện thời gian thực */}
        <div className="mb-4 p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Thiên hướng nhận diện:{" "}
              <strong className="text-indigo-700 dark:text-indigo-300 font-mono text-sm">{dominantInfo.code}</strong>{" "}
              ({dominantInfo.primaryMeta?.codeName || 'Chưa xác định'} & {dominantInfo.secondaryMeta?.codeName || 'Chưa xác định'})
            </span>
          </div>
          <div className="flex gap-1.5">
            {dominantInfo.topTwo.map((trait) => {
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
          Kéo thanh trượt từ 1 (Rất không thích) đến 5 (Rất đam mê) để hệ thống nhận diện thiên hướng tự nhiên của bạn:
        </p>

        <div className="space-y-4">
          {RIASEC_QUESTIONS_DATASET.map((q) => {
            const currentScore = questionAnswers[q.id] ?? 3;
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
                    {currentScore}/5
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">1</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={currentScore}
                    onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400">5</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
