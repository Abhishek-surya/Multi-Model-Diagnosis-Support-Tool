import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Full-page sign-in screen — shown before the user can access the dashboard.
 * Users must authenticate via Google OAuth or the dev-login before proceeding.
 */
export function SignInPage({ googleClientId, onLoginSuccess, apiBaseUrl = '' }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [btnWidth, setBtnWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return Math.max(240, Math.min(320, window.innerWidth - 64));
    }
    return 300;
  });

  useEffect(() => {
    const handleResize = () => {
      setBtnWidth(Math.max(240, Math.min(320, window.innerWidth - 64)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sendAuthRequest = async (endpoint, payload) => {
    const primaryUrl = apiBaseUrl ? `${apiBaseUrl}${endpoint}` : endpoint;
    let res;
    try {
      res = await fetch(primaryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok && !apiBaseUrl) {
        res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    } catch (netErr) {
      if (!apiBaseUrl) {
        res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        throw netErr;
      }
    }

    if (!res) {
      throw new Error('Unable to connect to backend service.');
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (res.status === 404) {
        throw new Error('Backend API endpoint not found (HTTP 404). Please ensure VITE_API_URL is configured to point to your deployed backend URL.');
      }
      throw new Error(`Server returned status ${res.status}. Expected JSON response from backend.`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Authentication failed.');
    }
    return data;
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await sendAuthRequest('/api/auth/google', {
        credential: credentialResponse.credential,
        client_id: googleClientId
      });
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (roleType = 'cardiologist') => {
    setErrorMsg('');
    setLoading(true);
    try {
      const payload = roleType === 'cardiologist'
        ? { email: 'dr.rivera@heartcare.org', name: 'Dr. Alex Rivera, MD' }
        : { email: 'dr.sharma@heartcare.org', name: 'Dr. Priya Sharma, MD' };

      const data = await sendAuthRequest('/api/auth/dev-login', payload);
      onLoginSuccess(data.user, data.token);
    } catch (err) {
      setErrorMsg(err.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-header">
          <div className="signin-logo">
            <svg viewBox="0 0 32 32" width="48" height="48" fill="none" aria-hidden="true">
              <path
                d="M16 27s-9.5-6.2-12.4-11.4C1.4 12 2.6 7.4 6.8 6.2c2.5-.7 5.1.3 6.6 2.4 1.5-2.1 4.1-3.1 6.6-2.4 4.2 1.2 5.4 5.8 3.2 9.4C25.5 20.8 16 27 16 27z"
                fill="#e74c6f"
              />
            </svg>
          </div>
          <h1 className="signin-title">HeartCare</h1>
          <p className="signin-subtitle">Clinician Decision Support Workspace</p>
          <p className="signin-description">
            Sign in to access heart disease risk assessments, patient records, and clinical decision support tools.
          </p>
        </div>

        {errorMsg && (
          <div className="signin-alert danger" role="alert">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="signin-body">
          {googleClientId ? (
            <div className="google-auth-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Google Sign-In failed or popup was closed.')}
                theme="filled_blue"
                shape="rectangular"
                size="large"
                text="signin_with"
                width={String(btnWidth)}
              />
            </div>
          ) : (
            <div className="client-id-notice">
              <p>
                <strong>Google Client ID not configured.</strong> Set <code>VITE_GOOGLE_CLIENT_ID</code> in your <code>.env</code> file.
              </p>
            </div>
          )}

          <div className="signin-divider">
            <span>OR USE DEMO ACCOUNTS</span>
          </div>

          <div className="signin-dev-actions">
            <button
              type="button"
              className="signin-dev-btn"
              onClick={() => handleDevLogin('cardiologist')}
              disabled={loading}
            >
              🩺 Sign in as Dr. Alex Rivera, MD
              <span className="signin-dev-role">Cardiologist</span>
            </button>
            <button
              type="button"
              className="signin-dev-btn"
              onClick={() => handleDevLogin('resident')}
              disabled={loading}
            >
              👩‍⚕️ Sign in as Dr. Priya Sharma, MD
              <span className="signin-dev-role">Attending Physician</span>
            </button>
          </div>

          <div className="signin-footer">
            <span>🔒 Sessions are securely stored with audit timestamps.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
