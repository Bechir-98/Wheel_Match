// A comprehensive theme system for Wheel Match application
// Following Apple design aesthetics with attention to color, typography, and spacing

export const theme = {
  colors: {
    // Primary colors
    primary: {
      50: '#E1F0FF',
      100: '#C2E0FF',
      200: '#99CAFF',
      300: '#66B0FF',
      400: '#3399FF',
      500: '#0A84FF', // Main primary color
      600: '#0070E0',
      700: '#0057B0',
      800: '#004080',
      900: '#002851'
    },
    // Secondary colors
    secondary: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#30B0C7',
      500: '#26A69A',
      600: '#00897B',
      700: '#00796B',
      800: '#00695C',
      900: '#004D40'
    },
    // Accent colors
    accent: {
      50: '#FFF9E6',
      100: '#FFEFBF',
      200: '#FFE299',
      300: '#FFD066',
      400: '#FFC133',
      500: '#FF9500', // Main accent color
      600: '#E67700',
      700: '#CC5F00',
      800: '#994700',
      900: '#663000'
    },
    // Success, warning, and error states
    success: {
      light: '#E3F9E5',
      main: '#34C759',
      dark: '#248A3D'
    },
    warning: {
      light: '#FFEFCC',
      main: '#FF9F0A',
      dark: '#C77700'
    },
    error: {
      light: '#FFDED6',
      main: '#FF453A',
      dark: '#C9312A'
    },
    // Neutral tones
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    },
    // Additional colors
    white: '#FFFFFF',
    black: '#000000',
    background: {
      light: '#FFFFFF',
      dark: '#121212'
    }
  },
  
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    // Font sizes following an 8px scale
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      none: 1,
      tight: 1.2,      // For headings
      normal: 1.5,     // For body text
      loose: 1.75      // For readable paragraphs
    }
  },
  
  spacing: {
    // 8px spacing system
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    full: '9999px'     // For circular elements
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  
  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    '2xl': '1400px'
  },
  
  transitions: {
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    duration: {
      fastest: '100ms',
      fast: '200ms',
      normal: '300ms',
      slow: '500ms',
      slowest: '700ms'
    }
  }
};

export default theme;