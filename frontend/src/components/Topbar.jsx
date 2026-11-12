import React, { useState, useEffect, useRef } from 'react';

export function Topbar({
  page,
  onNavigate,
  hasResult,
  theme,
  onToggleTheme,
  user,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  // Close mobile drawer when pressing Escape or clicking outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (targetPage) => {
    onNavigate(targetPage);
    setMobileMenuOpen(false);
  };

  return (
    <header className="topbar" ref={headerRef}>
      <div className="topbar-main-bar">
        <button type="button" className="brand" onClick={() => handleNavClick('home')}>
          <span className="brand-mark" aria-hidden="true">
            <HeartIcon />
          </span>
          <span className="brand-text-group">
            <span className="brand-name">HeartCare</span>
            <span className="brand-sub">Clinician Workspace</span>
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="nav desktop-nav" aria-label="Main navigation">
          <NavButton active={page === 'home'} onClick={() => handleNavClick('home')}>
            Dashboard
          </NavButton>
          <NavButton active={page === 'assessment'} onClick={() => handleNavClick('assessment')}>
            New screening
          </NavButton>
          <NavButton active={page === 'history'} onClick={() => handleNavClick('history')}>
            Patient roster
          </NavButton>
          <NavButton active={page === 'overview'} onClick={() => handleNavClick('overview')}>
            Reference ranges
          </NavButton>
          <NavButton active={page === 'tips'} onClick={() => handleNavClick('tips')}>
            Counseling points
          </NavButton>
          {hasResult && (
            <NavButton active={page === 'results'} onClick={() => handleNavClick('results')}>
              Prediction report
            </NavButton>
          )}
        </nav>

        <div className="topbar-actions">
          {user && (
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
                <span className="theme-toggle-text">Light</span>
              </>
            ) : (
              <>
                <MoonIcon />
                <span className="theme-toggle-text">Dark</span>
              </>
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {user && (
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="clinician-avatar" />
                ) : (
                  <span className="clinician-initials">
                    {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </span>
                )}
                <div>
                  <div className="clinician-name">{user.name}</div>
                  <div className="clinician-role">{user.role || 'Clinician'}</div>
                </div>
              </div>
              <button
                type="button"
                className="btn-chip signout-btn mobile-signout"
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
              >
                Sign out
              </button>
            </div>
          )}

          <nav className="mobile-nav-links" aria-label="Mobile navigation links">
            <button
              type="button"
              className={`mobile-nav-link ${page === 'home' ? 'active' : ''}`}
              onClick={() => handleNavClick('home')}
            >
              <span className="mobile-nav-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link ${page === 'assessment' ? 'active' : ''}`}
              onClick={() => handleNavClick('assessment')}
            >
              <span className="mobile-nav-icon">🩺</span>
              <span>New screening</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link ${page === 'history' ? 'active' : ''}`}
              onClick={() => handleNavClick('history')}
            >
              <span className="mobile-nav-icon">👥</span>
              <span>Patient roster</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link ${page === 'overview' ? 'active' : ''}`}
              onClick={() => handleNavClick('overview')}
            >
              <span className="mobile-nav-icon">🔬</span>
              <span>Reference ranges</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-link ${page === 'tips' ? 'active' : ''}`}
              onClick={() => handleNavClick('tips')}
            >
              <span className="mobile-nav-icon">📋</span>
              <span>Counseling points</span>
            </button>
            {hasResult && (
              <button
                type="button"
                className={`mobile-nav-link ${page === 'results' ? 'active' : ''}`}
                onClick={() => handleNavClick('results')}
              >
                <span className="mobile-nav-icon">⚡</span>
                <span>Prediction report</span>
              </button>
            )}
          </nav>
        </div>
      )}
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
