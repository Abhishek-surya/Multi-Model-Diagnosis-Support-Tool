import React from 'react';

export function Topbar({
  page,
  onNavigate,
  hasResult,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={() => onNavigate('home')}>
        <span className="brand-mark" aria-hidden="true">
          <HeartIcon />
        </span>
        <span>
          <span className="brand-name">HeartCare</span>
          <span className="brand-sub">Clinician Workspace</span>
        </span>
      </button>

      <nav className="nav" aria-label="Main navigation">
        <NavButton active={page === 'home'} onClick={() => onNavigate('home')}>
          Dashboard
        </NavButton>
        <NavButton active={page === 'assessment'} onClick={() => onNavigate('assessment')}>
          New screening
        </NavButton>
        <NavButton active={page === 'history'} onClick={() => onNavigate('history')}>
          Patient roster
        </NavButton>
        <NavButton active={page === 'overview'} onClick={() => onNavigate('overview')}>
          Reference ranges
        </NavButton>
        <NavButton active={page === 'tips'} onClick={() => onNavigate('tips')}>
          Counseling points
        </NavButton>
        {hasResult && (
          <NavButton active={page === 'results'} onClick={() => onNavigate('results')}>
            Prediction report
          </NavButton>
        )}
      </nav>

      <div className="topbar-actions">
        {user ? (
          <div className="clinician-profile-pill">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="clinician-avatar"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <span className="clinician-initials">
                {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            )}
            <div className="clinician-meta">
              <span className="clinician-name">{user.name}</span>
              <span className="clinician-role">{user.role || 'Clinician'}</span>
            </div>
            <button
              type="button"
              className="btn-chip signout-btn"
              onClick={onLogout}
              title="Sign out of clinician workspace"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn-chip signin-btn"
            onClick={onOpenAuth}
            title="Sign in with Google or Clinician Account"
          >
            <GoogleIcon />
            <span>Sign in</span>
          </button>
        )}

        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle clinical theme"
        >
          {theme === 'dark' ? (
            <>
              <SunIcon />
              <span className="theme-toggle-text">Light mode</span>
            </>
          ) : (
            <>
              <MoonIcon />
              <span className="theme-toggle-text">Dark mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`nav-link ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
      <path
        d="M16 27s-9.5-6.2-12.4-11.4C1.4 12 2.6 7.4 6.8 6.2c2.5-.7 5.1.3 6.6 2.4 1.5-2.1 4.1-3.1 6.6-2.4 4.2 1.2 5.4 5.8 3.2 9.4C25.5 20.8 16 27 16 27z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

