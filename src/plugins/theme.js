// Naive UI theme overrides + shared brand tokens.
// The aurora background, glass surfaces and difficulty colors live in
// src/assets/css/global.css as CSS variables; the accent color is user
// selectable (ACCENT_PRESETS) and drives both Naive UI and the CSS tokens.

const FONT_BODY = '"Manrope", "Segoe UI", system-ui, -apple-system, sans-serif'
const FONT_MONO = '"Chakra Petch", ui-monospace, monospace'

export const ACCENT_PRESETS = [
  { key: 'aurora', color: '#8a7bff' },
  { key: 'sky', color: '#3f9cf5' },
  { key: 'cyan', color: '#2bbfc9' },
  { key: 'emerald', color: '#3cbf83' },
  { key: 'sakura', color: '#ef6fae' },
  { key: 'ember', color: '#efa03c' },
  { key: 'crimson', color: '#e7606f' },
]

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].color

// Mix a hex color toward white (amt > 0) or black (amt < 0); amt in 0..1.
function shade(hex, amt) {
  const n = hex.replace('#', '')
  const t = amt < 0 ? 0 : 255
  const p = Math.abs(amt)
  const ch = (i) => {
    const v = parseInt(n.slice(i, i + 2), 16)
    return Math.round(v + (t - v) * p)
      .toString(16)
      .padStart(2, '0')
  }
  return '#' + ch(0) + ch(2) + ch(4)
}

export const brand = {
  info: '#37dfe8',
  success: '#57d9a3',
  warning: '#f0b429',
  error: '#f2607a',
}

// Canonical Arcaea difficulty colors (dark-tuned) — index 0..4.
export const difficultyColors = ['#23b7ff', '#63cf6a', '#c164da', '#e8505b', '#c3aef2']

export function buildThemeOverrides(accent = DEFAULT_ACCENT) {
  return {
    common: {
      primaryColor: accent,
      primaryColorHover: shade(accent, 0.15),
      primaryColorPressed: shade(accent, -0.15),
      primaryColorSuppl: accent,
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
}

// Default overrides (used as the initial value for the discrete API).
export const themeOverrides = buildThemeOverrides()
