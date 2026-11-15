export const CHART_STORE_KEY = 'heartcare-clinician-charts';
export const THEME_STORE_KEY = 'heartcare-clinician-theme';

export function loadCharts() {
  try {
    const raw = localStorage.getItem(CHART_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCharts(charts) {
  try {
    localStorage.setItem(CHART_STORE_KEY, JSON.stringify(charts));
  } catch (err) {
    console.error('Failed to persist patient charts:', err);
  }
}

export function normalizePatientId(value) {
  return String(value || '').trim().toUpperCase();
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORE_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme setting:', err);
  }
}

