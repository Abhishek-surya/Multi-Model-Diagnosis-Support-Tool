import React, { useState, useEffect, useRef } from 'react';

export function Topbar({ page, onNavigate, hasResult, theme, onToggleTheme, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
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

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: '⬡' },
    { id: 'assessment', label: 'New screening', icon: '◎' },
    { id: 'history', label: 'Patient roster', icon: '◫' },
    { id: 'overview', label: 'Reference ranges', icon: '◈' },
    { id: 'tips', label: 'Counseling', icon: '◉' },
    ...(hasResult ? [{ id: 'results', label: 'Last report', icon: '◑' }] : []),
  ];

  return (
    <header className="topbar" ref={headerRef}>
      <div className="topbar-main-bar">
        {/* Brand */}
        <button type="button" className="brand" onClick={() => handleNavClick('home')}>
          <span className="brand-mark" aria-hidden="true">
            <HeartIcon />
          </span>
          <span className="brand-text-group">
            <span className="brand-name">HeartCare</span>
            <span className="brand-sub">Clinical AI</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${page === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Actions */}
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
                <span className="clinician-initials" aria-hidden="true">
                  {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              )}
              <div className="clinician-meta">
                <span className="clinician-name">{user.name}</span>
                <span className="clinician-role">{user.role || 'Clinician'}</span>
              </div>
              <button
                type="button"
                className="signout-btn"
                onClick={onLogout}
                title="Sign out"
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
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          {user && (
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="clinician-avatar" />
                ) : (
                  <span className="clinician-initials" aria-hidden="true">
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

          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mobile-nav-link ${page === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="mobile-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
      <path
        d="M16 27s-9.5-6.2-12.4-11.4C1.4 12 2.6 7.4 6.8 6.2c2.5-.7 5.1.3 6.6 2.4 1.5-2.1 4.1-3.1 6.6-2.4 4.2 1.2 5.4 5.8 3.2 9.4C25.5 20.8 16 27 16 27z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
