import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  googleClientId
}) {
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          client_id: googleClientId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to authenticate with Google.');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
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

      const res = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Demo sign-in failed.');
      }
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="card modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="eyebrow">Clinician Portal</span>
            <h2 className="modal-title">Sign In to HeartCare</h2>
            <p className="modal-subtitle">
              Authenticate using your Google Workspace or hospital account to access decision support.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close authentication modal"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="modal-alert danger" role="alert">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="auth-body">
          {googleClientId ? (
            <div className="google-auth-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Google Sign-In failed or popup was closed.')}
                theme="filled_blue"
                shape="rectangular"
                size="large"
                text="signin_with"
                width="100%"
              />
            </div>
          ) : (
            <div className="client-id-notice">
              <p>
                <strong>Google Client ID not yet set:</strong> Once you provide your Client ID, the official Google Sign-In button will activate here automatically.
              </p>
            </div>
          )}

          <div className="auth-divider">
            <span>OR TEST CLINICIAN WORKSPACE</span>
          </div>

          <div className="dev-login-actions">
            <button
              type="button"
              className="btn-secondary dev-auth-btn"
              onClick={() => handleDevLogin('cardiologist')}
              disabled={loading}
            >
              🩺 Sign In as Dr. Alex Rivera, MD (Cardiologist)
            </button>
            <button
              type="button"
              className="btn-secondary dev-auth-btn"
              onClick={() => handleDevLogin('resident')}
              disabled={loading}
            >
              👩‍⚕️ Sign In as Dr. Priya Sharma, MD (Attending)
            </button>
          </div>

          <div className="auth-privacy-note">
            <span>🔒 Clinician sessions are securely logged to the SQL database with audit timestamps.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
