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
          <span>Patients On File</span>
          <strong>{patientList.length}</strong>
        </article>
        <article className="stat-card">
          <span>Total Encounters</span>
          <strong>{patientList.reduce((sum, item) => sum + item.visits, 0)}</strong>
        </article>
        <article className="stat-card stat-attention">
          <span>High Risk (Class 1)</span>
          <strong className="text-attention">{highRiskCount}</strong>
        </article>
        <article className="stat-card stat-stable">
          <span>Low Risk (Class 0)</span>
          <strong className="text-stable">{lowRiskCount}</strong>
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

function HeartIllustration({ compact = false }) {
  return (
    <svg
      className={`heart-art ${compact ? 'compact' : ''}`}
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
