import React from 'react';

export function HomePage({ patientList, onStart, onHistory, onOverview, onOpenPatient }) {
  const highRiskCount = patientList.filter((p) => p.latestResult?.predicted_class === 1).length;
  const lowRiskCount = patientList.filter((p) => p.latestResult?.predicted_class === 0).length;
  const totalVisits = patientList.reduce((sum, p) => sum + p.visits, 0);

  return (
    <>
      {/* Hero */}
      <section className="hero-panel">
        <div>
          <p className="eyebrow">
            <PulseIcon />
            Cardiology Diagnostic Workspace
          </p>
          <h1>Predict Heart Disease Risk with Explainable AI</h1>
          <p className="lead">
            Screen patients using a validated 13-feature ML pipeline. Review explainable risk drivers, run counterfactual simulations, and manage longitudinal records.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={onStart}>
              Start New Screening
            </button>
            <button type="button" className="btn-secondary" onClick={onHistory}>
              Patient Roster
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

      {/* Stats */}
      <section className="stat-row" aria-label="Summary statistics">
        <article className="stat-card">
          <span>Patients on file</span>
          <strong>{patientList.length}</strong>
        </article>
        <article className="stat-card">
          <span>Total encounters</span>
          <strong>{totalVisits}</strong>
        </article>
        <article className="stat-card stat-attention">
          <span>High risk (Class 1)</span>
          <strong>{highRiskCount}</strong>
        </article>
        <article className="stat-card stat-stable">
          <span>Low risk (Class 0)</span>
          <strong>{lowRiskCount}</strong>
        </article>
      </section>

      {/* Recent Patients */}
      {patientList.length > 0 && (
        <section className="card">
          <div className="recent-patients-header">
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Patients</h2>
            <button type="button" className="btn-link" onClick={onHistory}>
              View all in roster →
            </button>
          </div>
          <div className="patient-list" style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
            {patientList.slice(0, 6).map((patient) => {
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
                        {isHighRisk ? 'High risk' : 'Low risk'}
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

      {/* CTA Tiles */}
      <div className="home-cta-row">
        <button type="button" className="cta-tile" onClick={onOverview}>
          <p className="eyebrow" style={{ marginBottom: '10px' }}>
            <ChartIcon /> Reference Ranges
          </p>
          <h3>Clinical Biomarker Targets</h3>
          <p>Adult physiological ranges for blood pressure, cholesterol, heart rate, and fasting glucose.</p>
        </button>
        <button type="button" className="cta-tile" onClick={onHistory}>
          <p className="eyebrow" style={{ marginBottom: '10px' }}>
            <TrendIcon /> Longitudinal Data
          </p>
          <h3>Patient Visit Trends</h3>
          <p>Track how returning patient vitals and risk markers shift across clinical encounters over time.</p>
        </button>
      </div>
    </>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 20 20" width="12" height="12" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
    </svg>
  );
}

function HeartIllustration() {
  return (
    <svg
      className="heart-art"
      viewBox="0 0 220 200"
      role="img"
      aria-label="Stylized heart illustration"
    >
      <defs>
        <linearGradient id="hGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="hGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow backing */}
      <path
        d="M110 178s-68-44-88-82C6 66 16 30 48 22c20-5 40 4 52 22 12-18 32-27 52-22 32 8 42 44 26 74-20 38-88 82-88 82z"
        fill="url(#hGrad1)"
        opacity="0.15"
        filter="url(#glow)"
        transform="scale(1.08) translate(-8, -8)"
      />

      {/* Main heart */}
      <path
        d="M110 178s-68-44-88-82C6 66 16 30 48 22c20-5 40 4 52 22 12-18 32-27 52-22 32 8 42 44 26 74-20 38-88 82-88 82z"
        fill="url(#hGrad1)"
      />

      {/* ECG trace inside */}
      <path
        d="M60 100 L78 100 L86 82 L96 118 L104 100 L132 100 L140 90 L148 108 L156 100 L170 100"
        stroke="url(#hGrad2)"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

function EcgWave() {
  return (
    <svg viewBox="0 0 320 48" width="100%" height="48" aria-hidden="true">
      <defs>
        <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
          <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points="0,24 50,24 62,24 72,8 82,40 92,24 118,24 128,16 138,32 148,24 320,24"
        fill="none"
        stroke="url(#ecgGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
