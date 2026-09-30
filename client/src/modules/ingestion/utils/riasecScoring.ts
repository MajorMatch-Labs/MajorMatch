/**
 * RIASEC Scoring Algorithm & Normalization Engine
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Van Hoang <hoangtungmy123@gmail.com>
 */

import { RIASEC_TRAIT_KEYS, RiasecTraitKey } from '../constants/riasecConstants';
import { RIASEC_QUESTIONS_DATASET } from '../constants/riasecQuestions';

export type UserSurveyAnswers = Record<number, number>; // Question ID (1-10) -> Score (1-5)

export interface RawRiasecScores {
  r: number;
  i: number;
  a: number;
  s: number;
  e: number;
  c: number;
}

/**
 * Tinh toan diem trung binh 6 chieu Holland RIASEC tu cau tra loi khao sat (thang diem 1.0 - 5.0)
 * Ap dung trong so phan bo theo tung cau hoi.
 */
export function calculateHollandScores(answers: UserSurveyAnswers): RawRiasecScores {
  const traitAccumulator: Record<RiasecTraitKey, { totalWeightedScore: number; totalWeight: number }> = {
    R: { totalWeightedScore: 0, totalWeight: 0 },
    I: { totalWeightedScore: 0, totalWeight: 0 },
    A: { totalWeightedScore: 0, totalWeight: 0 },
    S: { totalWeightedScore: 0, totalWeight: 0 },
    E: { totalWeightedScore: 0, totalWeight: 0 },
    C: { totalWeightedScore: 0, totalWeight: 0 },
  };

  for (const question of RIASEC_QUESTIONS_DATASET) {
    const rawAnswer = answers[question.id];
    // Neu chua tra loi thi gan mac dinh muc do trung lap 3.0
    const score = typeof rawAnswer === 'number' && rawAnswer >= 1 && rawAnswer <= 5 ? rawAnswer : 3.0;
    const category = question.category;
    const weight = question.weight || 1.0;

    traitAccumulator[category].totalWeightedScore += score * weight;
    traitAccumulator[category].totalWeight += weight;
  }

  const normalizeTrait = (key: RiasecTraitKey): number => {
    const item = traitAccumulator[key];
    if (item.totalWeight === 0) return 3.0;
    const rawAvg = item.totalWeightedScore / item.totalWeight;
    // Gioi han thang diem [1.0, 5.0] va lam tron 1 chu so thap phan
    const clamped = Math.max(1.0, Math.min(5.0, rawAvg));
    return Number(clamped.toFixed(1));
  };

  return {
    r: normalizeTrait('R'),
    i: normalizeTrait('I'),
    a: normalizeTrait('A'),
    s: normalizeTrait('S'),
    e: normalizeTrait('E'),
    c: normalizeTrait('C'),
  };
}
