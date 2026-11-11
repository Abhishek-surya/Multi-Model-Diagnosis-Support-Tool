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

export function exportChartsAsJson(charts) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(charts, null, 2));
  const downloadAnchor = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `heartcare-patient-roster-backup-${timestamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseImportedJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid file format. Expected a patient records object.');
  }
  // Validate basic shape
  Object.entries(parsed).forEach(([id, record]) => {
    if (!record || typeof record !== 'object' || !Array.isArray(record.visits)) {
      throw new Error(`Record for patient ${id} is malformed.`);
    }
  });
  return parsed;
}
