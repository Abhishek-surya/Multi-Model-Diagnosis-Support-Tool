export const CLINICIAN_USER_KEY = 'heartcare-clinician-user';
export const CLINICIAN_TOKEN_KEY = 'heartcare-clinician-token';

export function loadClinicianUser() {
  try {
    const raw = localStorage.getItem(CLINICIAN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveClinicianUser(user, token) {
  try {
    if (user) {
      localStorage.setItem(CLINICIAN_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CLINICIAN_USER_KEY);
    }
    if (token) {
      localStorage.setItem(CLINICIAN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(CLINICIAN_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to save clinician auth session:', err);
  }
}

export function clearClinicianUser() {
  try {
    localStorage.removeItem(CLINICIAN_USER_KEY);
    localStorage.removeItem(CLINICIAN_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear clinician auth session:', err);
  }
}
