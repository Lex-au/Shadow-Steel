export const UI_CONSTANTS = {
  COLORS: {
    BACKGROUND: '#0f172a',
    BACKGROUND_LIGHT: '#1e293b',
    BACKGROUND_HOVER: '#334155',
    BACKGROUND_ACTIVE: '#475569',
    BACKGROUND_OVERLAY: 'rgba(15, 23, 42, 0.8)',
    TEXT: '#ffffff',
    TEXT_DIM: '#94a3b8',
    TEXT_MUTED: '#64748b',
    ACCENT: '#3b82f6',
    ACCENT_LIGHT: '#60a5fa',
    ERROR: '#ef4444',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    BORDER: '#1e293b',
    BORDER_LIGHT: '#334155'
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 24,
    XXL: 32
  },
  SIZES: {
    SIDEBAR_WIDTH: 200,
    MINIMAP_SIZE: 200,
    OPTIONS_BAR_HEIGHT: 40,
    GRID_CELL_SIZE: 90,
    GRID_PADDING: 5,
    INFO_PANEL_HEIGHT: 50,
    CATEGORY_TAB_HEIGHT: 40,
    BORDER_RADIUS: {
      SM: 4,
      MD: 6,
      LG: 8,
      FULL: 9999
    }
  },
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
      VERY_SLOW: 800
    },
    EASING: {
      LINEAR: 'linear',
      EASE_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  FONTS: {
    FAMILY: {
      SANS: '"Inter", system-ui, -apple-system, sans-serif',
      MONO: '"JetBrains Mono", monospace'
    },
    SIZES: {
      XS: 10,
      SM: 12,
      MD: 14,
      LG: 16,
      XL: 20,
      XXL: 24,
      XXXL: 32,
      HUGE: 40
    },
    WEIGHTS: {
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700
    }
  },
  SHADOWS: {
    SM: '0 1px 2px rgba(15, 23, 42, 0.1)',
    MD: '0 4px 6px rgba(15, 23, 42, 0.1)',
    LG: '0 10px 15px rgba(15, 23, 42, 0.1)',
    GLOW: '0 0 15px rgba(59, 130, 246, 0.5)'
  },
  EFFECTS: {
    GLASS: {
      BACKGROUND: 'rgba(255, 255, 255, 0.1)',
      BORDER: '1px solid rgba(255, 255, 255, 0.1)',
      BACKDROP_FILTER: 'blur(8px)'
    }
  }
} as const;