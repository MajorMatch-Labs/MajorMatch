/**
 * Types & Interfaces for Interactive Radar Components & Tooltips
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 */

import { RechartsRadarPoint } from '../utils/radarTransformer';

export interface RadarTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: RechartsRadarPoint;
}

export interface RadarCustomTooltipProps {
  active?: boolean;
  payload?: RadarTooltipPayloadItem[];
  label?: string;
}

export type SkillFilterCategory = 'all' | 'mastered' | 'developing' | 'missing';

export interface RadarMemoComparisonProps {
  data: RechartsRadarPoint[];
  majorTitle?: string;
  matchScore?: number;
  isLoading?: boolean;
}
