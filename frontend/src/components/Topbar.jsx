import React from 'react';

export function Topbar({ page, onNavigate, hasResult, theme, onToggleTheme }) {
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
