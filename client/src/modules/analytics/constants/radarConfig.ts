/**
 * Radar Chart Animation & Aesthetic Configuration Tokens
 * Mon hoc: Chuyen de 4 - AI Product Development (CS2028)
 * Tac gia: Nguyen Thi Anh Vy <anhvydn2005@gmail.com>
 */

export const RADAR_ANIMATION_CONFIG = {
  ANIMATION_DURATION_MS: 750,
  ANIMATION_EASING: 'ease-out' as const,
  IS_ANIMATION_ACTIVE: true,
  TRANSITION_DELAY_MS: 50,
} as const;

export const RADAR_THEME_TOKENS = {
  USER_SERIES: {
    NAME: 'Năng lực sinh viên hiện tại',
    STROKE_COLOR: '#818CF8', // Indigo 400
    FILL_COLOR: '#6366F1',   // Indigo 500
    FILL_OPACITY: 0.35,
    STROKE_WIDTH: 2.5,
    DOT_RADIUS: 4,
    ACTIVE_DOT_RADIUS: 6,
  },
  BENCHMARK_SERIES: {
    NAME: 'Chuẩn ngành yêu cầu',
    STROKE_COLOR: '#38BDF8', // Sky 400
    FILL_COLOR: '#0EA5E9',   // Sky 500
    FILL_OPACITY: 0.15,
    STROKE_WIDTH: 1.75,
    DOT_RADIUS: 3,
    ACTIVE_DOT_RADIUS: 5,
  },
  AXIS_GRID: {
    STROKE_COLOR: 'rgba(51, 65, 85, 0.45)', // Slate 700 with opacity
    TEXT_COLOR: '#94A3B8', // Slate 400
    FONT_SIZE: 11,
    TICK_LINE_COLOR: 'rgba(51, 65, 85, 0.3)',
  },
  DELTA_STATUS_COLORS: {
    SURPLUS: {
      TEXT: '#34D399', // Emerald 400
      BG: 'rgba(52, 211, 153, 0.12)',
      BORDER: 'rgba(52, 211, 153, 0.3)',
      LABEL: 'Vượt trội',
    },
    MATCH: {
      TEXT: '#818CF8', // Indigo 400
      BG: 'rgba(129, 140, 248, 0.12)',
      BORDER: 'rgba(129, 140, 248, 0.3)',
      LABEL: 'Đạt chuẩn',
    },
    GAP: {
      TEXT: '#FB7185', // Rose 400
      BG: 'rgba(251, 113, 133, 0.12)',
      BORDER: 'rgba(251, 113, 133, 0.3)',
      LABEL: 'Cần bổ sung',
    },
  },
} as const;
