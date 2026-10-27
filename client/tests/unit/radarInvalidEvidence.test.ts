import { describe, expect, it } from 'vitest';
import { RadarTransformer } from '@/modules/analytics/utils/radarTransformer';
import { RadarAxisItem } from '@/types/api';

describe('Radar evidence boundary', () => {
  it('omits invalid evidence from both chart and aggregate instead of inventing zeros', () => {
    const axes = [
      { axis_name: 'Valid', user_score: 4, benchmark_score: 8 },
      { axis_name: 'Missing', user_score: null, benchmark_score: 8 },
      { axis_name: 'NaN', user_score: NaN, benchmark_score: 8 },
      { axis_name: 'Infinite', user_score: 4, benchmark_score: Infinity },
      { axis_name: 'String', user_score: '8', benchmark_score: 8 },
      null,
    ] as unknown as RadarAxisItem[];
    expect(RadarTransformer.transform(axes).map((axis) => axis.axis)).toEqual(['Valid']);
    expect(RadarTransformer.summarizeReadiness(axes)).toMatchObject({
      averageUserScore: 4, averageBenchmarkScore: 8, fitPercentage: 50,
    });
  });

  it('keeps a genuine zero as evidence and handles an entirely invalid response', () => {
    expect(RadarTransformer.transform([{ axis_name: 'Zero', user_score: 0, benchmark_score: 5 }])).toHaveLength(1);
    const invalid = [{ axis_name: 'Invalid', user_score: NaN, benchmark_score: 5 }];
    expect(RadarTransformer.transform(invalid)).toEqual([]);
    expect(RadarTransformer.summarizeReadiness(invalid).gapAxesCount).toBe(0);
  });
});
