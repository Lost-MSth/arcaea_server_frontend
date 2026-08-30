// Naive UI theme overrides + shared brand tokens.
// The aurora background, glass surfaces and difficulty colors live in
// src/assets/css/global.css as CSS variables; these overrides tune the
// Naive UI component set to match.

const FONT_BODY = '"Manrope", "Segoe UI", system-ui, -apple-system, sans-serif'
const FONT_MONO = '"Chakra Petch", ui-monospace, monospace'

export const brand = {
  primary: '#8a7bff',
  primaryHover: '#9c90ff',
  primaryPressed: '#7767e6',
  info: '#37dfe8',
  success: '#57d9a3',
  warning: '#f0b429',
  error: '#f2607a',
}

// Canonical Arcaea difficulty colors (dark-tuned) — index 0..4.
export const difficultyColors = ['#23b7ff', '#63cf6a', '#c164da', '#e8505b', '#c3aef2']

export const themeOverrides = {
  common: {
    primaryColor: brand.primary,
    primaryColorHover: brand.primaryHover,
    primaryColorPressed: brand.primaryPressed,
    primaryColorSuppl: brand.primary,
    infoColor: brand.info,
    infoColorHover: brand.info,
    successColor: brand.success,
    warningColor: brand.warning,
    errorColor: brand.error,
    borderRadius: '10px',
    borderRadiusSmall: '8px',
    fontFamily: FONT_BODY,
    fontFamilyMono: FONT_MONO,
    fontWeightStrong: '600',
  },
  Card: {
    borderRadius: '16px',
  },
  Button: {
    borderRadiusMedium: '10px',
    fontWeight: '600',
  },
  DataTable: {
    borderRadius: '14px',
    thFontWeight: '600',
  },
  Tag: {
    borderRadius: '8px',
  },
  Menu: {
    borderRadius: '10px',
    itemHeight: '40px',
  },
}
