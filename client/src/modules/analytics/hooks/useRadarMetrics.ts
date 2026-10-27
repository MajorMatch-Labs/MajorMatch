/**
 * Custom Hook: useRadarMetrics with Memoized Computations
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 */

import { useMemo } from 'react';
import { RadarAxisItem, SkillBreakdown } from '@/types/api';
import {
  RadarTransformer,
  RechartsRadarPoint,
  RadarReadinessSummary,
  SkillGapMetrics,
} from '../utils/radarTransformer';

export interface UseRadarMetricsReturn {
  transformedData: RechartsRadarPoint[];
  readinessSummary: RadarReadinessSummary;
  skillMetrics: SkillGapMetrics;
  hasValidData: boolean;
  invalidAxisCount: number;
}

export function useRadarMetrics(
  rawAxes?: RadarAxisItem[] | null,
  skillGap?: SkillBreakdown | null
): UseRadarMetricsReturn {
  const transformedData = useMemo(() => {
    return RadarTransformer.transform(rawAxes || []);
  }, [rawAxes]);

  const readinessSummary = useMemo(() => {
    return RadarTransformer.summarizeReadiness(rawAxes || []);
  }, [rawAxes]);

  const skillMetrics = useMemo(() => {
    return RadarTransformer.analyzeSkillGap(skillGap);
  }, [skillGap]);

  const hasValidData = transformedData.length > 0;

  return {
    transformedData,
    readinessSummary,
    skillMetrics,
    hasValidData,
    invalidAxisCount: Array.isArray(rawAxes) ? rawAxes.length - transformedData.length : 0,
  };
}
