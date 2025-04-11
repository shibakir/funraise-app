const tintColorLight = '#0ea5e9'; // sky-500
const tintColorDark = '#f8fafc'; // slate-50

const primary = {
  50: '#f0f9ff',   // sky-50
  100: '#e0f2fe',  // sky-100
  200: '#bae6fd',  // sky-200
  300: '#7dd3fc',  // sky-300
  400: '#38bdf8',  // sky-400
  500: '#0ea5e9',  // sky-500 (основной цвет бренда)
  600: '#0284c7',  // sky-600
  700: '#0369a1',  // sky-700
  800: '#075985',  // sky-800
  900: '#0c4a6e',  // sky-900
};

const neutral = {
  50: '#f8fafc',   // slate-50
  100: '#f1f5f9',  // slate-100
  200: '#e2e8f0',  // slate-200
  300: '#cbd5e1',  // slate-300
  400: '#94a3b8',  // slate-400
  500: '#64748b',  // slate-500
  600: '#475569',  // slate-600
  700: '#334155',  // slate-700
  800: '#1e293b',  // slate-800
  900: '#0f172a',  // slate-900
};

const success = '#22c55e';  // green-500
const error = '#ef4444';    // red-500
const warning = '#facc15';  // yellow-400
const info = '#3b82f6';     // blue-500

export const Colors = {
  light: {
    text: neutral[900],
    sectionBackground: '#ffffff',
    background: '#ffffff',
    tint: tintColorLight,
    icon: neutral[500],
    tabIconDefault: neutral[400],
    tabIconSelected: tintColorLight,

    primary: primary[500],
    primaryLight: primary[300],
    primaryDark: primary[700],

    success,
    error,
    warning,
    info,

    neutral50: neutral[50],
    neutral100: neutral[100],
    neutral200: neutral[200],
    neutral300: neutral[300],
    neutral400: neutral[400],
    neutral500: neutral[500],

    surface: '#ffffff',
    surfaceHighlight: 'ffffff',
    card: '#ffffff',
    divider: neutral[200],
    placeholder: neutral[400],
  },
  dark: {
    text: neutral[50],
    sectionBackground: neutral[900],
    background: neutral[900],
    tint: tintColorDark,
    icon: neutral[400],
    tabIconDefault: neutral[500],
    tabIconSelected: tintColorDark,

    primary: primary[400],
    primaryLight: primary[300],
    primaryDark: primary[600],

    success,
    error,
    warning,
    info,

    neutral50: neutral[900],
    neutral100: neutral[800],
    neutral200: neutral[700],
    neutral300: neutral[600],
    neutral400: neutral[500],
    neutral500: neutral[400],

    surface: neutral[800],
    surfaceHighlight: neutral[700],
    card: neutral[800],
    divider: neutral[700],
    placeholder: neutral[500],
  },
};

/*
export const Palette = {
  primary,
  neutral,
  success,
  error,
  warning,
  info,
};
 */