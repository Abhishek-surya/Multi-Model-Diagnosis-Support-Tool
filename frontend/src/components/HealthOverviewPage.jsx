import React, { useMemo } from 'react';
import { REFERENCE_RANGES } from '../constants/clinicalConstants';

export function HealthOverviewPage({ formData, result, onScreen }) {
  const hasPatientValues = formData.trestbps !== '' || formData.chol !== '' || formData.thalach !== '';

  return (
    <>
      <section className="overview-hero">
        <div>
          <p className="eyebrow">Clinical Reference</p>
          <h1>Adult Cardiovascular Targets &amp; Normal Ranges</h1>
          <p className="lead">
            Standard physiological thresholds. Once a patient screening is entered or loaded,
            their measured clinical parameters are mapped directly against these reference intervals.
          </p>
        </div>
      </section>

      {result && (
        <div className={`status-banner ${result.predicted_class === 1 ? 'attention' : 'stable'}`}>
          {result.predicted_class === 1
            ? `Latest Model Prediction: Target Label Positive — Risk of Heart Disease Detected (Class 1)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`
            : `Latest Model Prediction: Target Label Negative — Low Risk of Heart Disease (Class 0)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`}
        </div>
      )}

      <section className="visual-grid">
        {REFERENCE_RANGES.map((metric) => (
          <RangeCard key={metric.id} metric={metric} formData={formData} />
        ))}
      </section>

      <section className="card anatomy-card">
        <h2 className="section-title">Physiological Mechanisms &amp; Diagnostic Rationale</h2>
        <div className="anatomy-grid">
          <ul className="anatomy-list">
            <li>
              <strong>Resting Blood Pressure</strong>
              Systolic blood pressure between 90–120 mm Hg minimizes cyclic barotrauma to the aortic root and coronary ostia. Chronic systolic pressure &gt;= 140 mm Hg induces smooth muscle hypertrophy and microvascular rarefaction.
            </li>
            <li>
              <strong>Total Serum Cholesterol</strong>
              Circulating levels under 200 mg/dL preserve endothelial nitrous oxide synthase bioavailability. Elevated LDL/total cholesterol drives oxidized lipid deposition within coronary intima forming vulnerable fibroatheromas.
            </li>
            <li>
              <strong>Peak Exercise Heart Rate Capacity</strong>
              Exercise heart rate measures chronotropic competence. Inability to achieve age-predicted target heart rate under stress indicates autonomic dysfunction or silent myocardial ischemia.
            </li>
            <li>
              <strong>Fasting Blood Sugar Regulation</strong>
              Fasting glucose &lt;= 120 mg/dL prevents chronic advanced glycation end-product (AGE) accumulation, protecting fragile coronary capillaries from diabetic microangiopathy.
            </li>
          </ul>
        </div>
      </section>

      {!hasPatientValues && (
        <div className="inline-cta">
          <p>Enter patient findings to plot their biomarkers on these reference tracks.</p>
          <button type="button" className="btn-primary" onClick={onScreen}>
            Open Screening Form
          </button>
        </div>
      )}
    </>
  );
}

function RangeCard({ metric, formData }) {
  const raw = formData[metric.formKey];
  const hasValue = raw !== '' && raw !== null && raw !== undefined;
  const numeric = hasValue ? Number(raw) : null;

  const markerPercent = useMemo(() => {
    if (!hasValue || Number.isNaN(numeric)) {
      return metric.categorical ? 8 : 28;
    }
    if (metric.categorical) {
      return numeric > 0 ? 78 : 18;
    }
    const pct = ((numeric - metric.min) / (metric.max - metric.min)) * 100;
    return Math.min(96, Math.max(4, pct));
  }, [hasValue, numeric, metric]);

  const band = !hasValue
    ? 'reference'
    : metric.categorical
      ? (numeric > 0 ? 'high' : 'healthy')
      : numeric < metric.healthyMin
        ? 'caution'
        : numeric <= metric.healthyMax
          ? 'healthy'
          : 'high';

  return (
    <article className="range-card">
      <header>
        <h3>{metric.label}</h3>
        <span className={`pill ${band}`}>
          {hasValue ? (metric.categorical ? (numeric > 0 ? 'Above target' : 'In range') : `${numeric} ${metric.unit}`) : 'Reference'}
        </span>
      </header>
      <div className="range-track" aria-hidden="true">
        <span className="zone healthy-zone" />
        <span className="zone caution-zone" />
        <span className="zone high-zone" />
        <span className="marker" style={{ left: `${markerPercent}%` }} />
      </div>
      <dl className="range-legend">
        <div>
          <dt>Normal Target</dt>
          <dd>{metric.healthy}</dd>
        </div>
        <div>
          <dt>Borderline / Watch</dt>
          <dd>{metric.caution}</dd>
        </div>
        <div>
          <dt>Needs Review</dt>
          <dd>{metric.high}</dd>
        </div>
      </dl>
    </article>
  );
}
