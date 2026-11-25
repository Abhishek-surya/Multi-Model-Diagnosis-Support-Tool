import React from 'react';

export function HomePage({
  patientList,
  onStart,
  onHistory,
  onOverview,
  onOpenPatient
}) {
  const highRiskCount = patientList.filter(
    (p) => p.latestResult?.predicted_class === 1
  ).length;

  const lowRiskCount = patientList.filter(
    (p) => p.latestResult?.predicted_class === 0
  ).length;

  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Cardiology Diagnostic Workspace</p>
          <h1>Predict Heart Disease Risk, Review Charts, and Compare Encounters.</h1>
          <p className="lead">
            Screen patients using a validated 13-feature machine learning pipeline.
            Evaluate Explainable AI risk drivers, run counterfactual simulations, and manage longitudinal clinical records.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={onStart}>
              Start New Screening
            </button>
            <button type="button" className="btn-secondary" onClick={onHistory}>
              Open Patient Roster
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <HeartIllustration />
          <div className="ecg-line" aria-hidden="true">
            <EcgWave />
          </div>
        </div>
      </section>

      {/* Enhanced Statistics Row */}
      <section className="stat-row">
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Patients On File</span>
            <div className="stat-icon-badge" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <strong>{patientList.length}</strong>
          <p className="stat-card-sub">Active clinician roster</p>
        </article>
        <article className="stat-card">
          <div className="stat-card-top">
            <span>Total Encounters</span>
            <div className="stat-icon-badge stat-icon-blue" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
          <strong>{patientList.reduce((sum, item) => sum + item.visits, 0)}</strong>
          <p className="stat-card-sub">Recorded clinical visits</p>
        </article>
        <article className="stat-card stat-attention">
          <div className="stat-card-top">
            <span>High Risk (Class 1)</span>
            <div className="stat-icon-badge stat-icon-hazard" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <strong className="text-attention">{highRiskCount}</strong>
          <p className="stat-card-sub">Positive prediction (≥50%)</p>
        </article>
        <article className="stat-card stat-stable">
          <div className="stat-card-top">
            <span>Low Risk (Class 0)</span>
            <div className="stat-icon-badge stat-icon-safe" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <strong className="text-stable">{lowRiskCount}</strong>
          <p className="stat-card-sub">Negative prediction (&lt;50%)</p>
        </article>
      </section>

      {/* Recent Patients */}
      {patientList.length > 0 && (
        <section className="card">
          <div className="recent-patients-header">
            <h2 className="section-title">Recent Patients</h2>
            <button type="button" className="btn-link" onClick={onHistory}>
              View All in Roster →
            </button>
          </div>
          <div className="patient-list">
            {patientList.slice(0, 5).map((patient) => {
              const isHighRisk = patient.latestResult?.predicted_class === 1;

              return (
                <button
                  key={patient.id}
                  type="button"
                  className="patient-row"
                  onClick={() => onOpenPatient(patient.id)}
                >
                  <div className="patient-row-info">
                    <strong>{patient.name}</strong>
                    <em>{patient.id}</em>
                  </div>
                  <div className="patient-badges">
                    {patient.latestResult && (
                      <span className={`pill ${isHighRisk ? 'high' : 'healthy'}`}>
                        {isHighRisk ? 'Target: Risk (Class 1)' : 'Target: Low Risk (Class 0)'}
                        {patient.latestResult.probability_percentage != null
                          ? ` · ${patient.latestResult.probability_percentage}%`
                          : ''}
                      </span>
                    )}
                    <span className="pill reference">
                      {patient.visits} visit{patient.visits === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="home-cta-row">
        <button type="button" className="cta-tile" onClick={onOverview}>
          <h3>Clinical Reference Ranges</h3>
          <p>Adult physiological targets for blood pressure, total cholesterol, heart rate, and fasting sugar.</p>
        </button>
        <button type="button" className="cta-tile" onClick={onHistory}>
          <h3>Longitudinal Encounters</h3>
          <p>Inspect how returning patient vitals and statistical risk markers trend over time.</p>
        </button>
      </section>
    </>
  );
}

function HeartIllustration() {
  return (
    <svg
      className="heart-art"
      viewBox="0 0 220 200"
      role="img"
      aria-label="Heart illustration"
    >
      <defs>
        <linearGradient id="heartFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path
        d="M110 178s-68-44-88-82C6 66 16 30 48 22c20-5 40 4 52 22 12-18 32-27 52-22 32 8 42 44 26 74-20 38-88 82-88 82z"
        fill="url(#heartFill)"
      />
      <path
        d="M70 92c18-2 28 10 40 24 10-16 26-28 46-22"
        stroke="#ecfeff"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EcgWave() {
  return (
    <svg viewBox="0 0 320 64" width="100%" height="64" aria-hidden="true">
      <polyline
        points="0,32 40,32 52,32 62,8 72,56 84,32 110,32 122,20 134,44 146,32 320,32"
        fill="none"
        stroke="#5eead4"
        strokeWidth="3"
      />
    </svg>
  );
}
