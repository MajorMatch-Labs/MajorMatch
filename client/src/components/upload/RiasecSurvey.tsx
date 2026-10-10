"use client";

import React, { useMemo } from "react";
import { AVAILABLE_CAREER_TAGS } from "@/types/survey";
import { useProfileStore } from "@/stores/useProfileStore";
import { Sparkles, Compass, Check, Award, BrainCircuit } from "lucide-react";
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

export const RiasecSurvey: React.FC = () => {
  const {
    riasecScores,
    selectedCareerTags,
    setRiasecScore,
    toggleCareerTag,
  } = useProfileStore();

  // State độc lập cho từng câu hỏi từ 1 đến 10
  const [questionAnswers, setQuestionAnswers] = React.useState<Record<number, number>>({
    1: 3, 2: 4, 3: 3, 4: 3, 5: 4, 6: 4, 7: 3, 8: 3, 9: 3, 10: 4
  });

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

    setRiasecScore('r', calcAvg(rScores));
    setRiasecScore('i', calcAvg(iScores));
    setRiasecScore('a', calcAvg(aScores));
    setRiasecScore('s', calcAvg(sScores));
    setRiasecScore('e', calcAvg(eScores));
    setRiasecScore('c', calcAvg(cScores));
  };

  // Tinh toan ma Holland noi troi tu diem so hien tai
  const dominantInfo = useMemo(() => {
    const rawScores = {
      r: riasecScores.r || riasecScores.R || 3.0,
      i: riasecScores.i || riasecScores.I || 3.0,
      a: riasecScores.a || riasecScores.A || 3.0,
      s: riasecScores.s || riasecScores.S || 3.0,
      e: riasecScores.e || riasecScores.E || 3.0,
      c: riasecScores.c || riasecScores.C || 3.0,
    };
    const ranked = rankRiasecTraits(rawScores);
    const dominant = getDominantHollandCode(rawScores);
    return {
      code: dominant.code,
      primaryMeta: RIASEC_TRAIT_DEFINITIONS[dominant.primary],
      secondaryMeta: RIASEC_TRAIT_DEFINITIONS[dominant.secondary],
      topTwo: ranked.slice(0, 2),
    };
  }, [riasecScores]);

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
            const isSelected = selectedCareerTags.includes(tag.id);
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              2. Trắc nghiệm Thiên hướng Holland Code (RIASEC)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">10 Câu hỏi trắc nghiệm</span>
        </div>

        {/* Khung xem trước thiên hướng nhận diện thời gian thực */}
        <div className="mb-4 p-3 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              Thiên hướng nhận diện:{" "}
              <strong className="text-indigo-700 dark:text-indigo-300 font-mono text-sm">{dominantInfo.code}</strong>{" "}
              ({dominantInfo.primaryMeta.codeName} & {dominantInfo.secondaryMeta.codeName})
            </span>
          </div>
          <div className="flex gap-1.5">
            {dominantInfo.topTwo.map((trait) => (
              <span
                key={trait.key}
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{
                  color: RIASEC_TRAIT_DEFINITIONS[trait.key].color,
                  backgroundColor: RIASEC_TRAIT_DEFINITIONS[trait.key].badgeBg,
                  borderColor: `${RIASEC_TRAIT_DEFINITIONS[trait.key].color}40`,
                }}
              >
                {trait.key}: {trait.percentage}%
              </span>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Kéo thanh trượt từ 1 (Rất không thích) đến 5 (Rất đam mê) để hệ thống nhận diện thiên hướng tự nhiên của bạn:
        </p>

        <div className="space-y-4">
          {RIASEC_QUESTIONS_DATASET.map((q) => {
            const currentScore = questionAnswers[q.id] ?? 3;
            const traitMeta = RIASEC_TRAIT_DEFINITIONS[q.category];

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
                        style={{ backgroundColor: traitMeta.color }}
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
