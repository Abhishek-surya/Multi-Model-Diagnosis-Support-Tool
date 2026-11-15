import React, { useMemo, useState } from 'react';
import { REFERENCE_RANGES } from '../constants/clinicalConstants';

export function HealthOverviewPage({ formData, result, onScreen }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if patient has any populated clinical biomarkers
  const hasPatientValues = useMemo(() => {
    return Object.keys(formData).some((k) => {
      if (k === 'patientId' || k === 'patientName') return false;
      return formData[k] !== '' && formData[k] !== null && formData[k] !== undefined;
    });
  }, [formData]);

  // Filtered reference ranges
  const filteredRanges = useMemo(() => {
    if (selectedCategory === 'all') return REFERENCE_RANGES;
    return REFERENCE_RANGES.filter((r) => r.category === selectedCategory);
  }, [selectedCategory]);

  // Compute overall status breakdown across all 12 clinical biomarkers if patient values exist
  const statusCounts = useMemo(() => {
    let healthy = 0;
    let caution = 0;
    let high = 0;
    let unassessed = 0;

    REFERENCE_RANGES.forEach((metric) => {
      const raw = formData[metric.formKey];
      if (raw === '' || raw === null || raw === undefined) {
        unassessed += 1;
        return;
      }
      const num = Number(raw);
      if (Number.isNaN(num)) {
        unassessed += 1;
        return;
      }

      if (metric.categorical) {
        const opt = metric.options?.find((o) => parseFloat(o.value) === num);
        const status = opt?.status || 'healthy';
        if (status === 'healthy') healthy += 1;
        else if (status === 'caution') caution += 1;
        else high += 1;
      } else {
        if (metric.invertScale) {
          if (num >= metric.healthyMin) healthy += 1;
          else if (num >= 120) caution += 1;
          else high += 1;
        } else {
          if (num <= metric.healthyMax && num >= (metric.healthyMin || 0)) healthy += 1;
          else if (num < (metric.healthyMin || 0)) caution += 1;
          else if (num <= (metric.max ? metric.max * 0.75 : 9999)) caution += 1;
          else high += 1;
        }
      }
    });

    return { healthy, caution, high, unassessed };
  }, [formData]);

  return (
    <>
      <section className="overview-hero">
        <div>
          <p className="eyebrow">Comprehensive Clinical Reference</p>
          <h1>Cardiovascular Reference Ranges &amp; Physiological Guidelines</h1>
          <p className="lead">
            Standard clinical thresholds and diagnostic rationale for <strong>all 12 Cleveland clinical biomarkers</strong>.
            Patient encounter findings are mapped directly against clinical targets, alerting physicians to occult ischemia, atherogenic lipidemia, and chronotropic incompetence.
          </p>
        </div>
      </section>

      {/* Patient Assessment Status Banner */}
      {result && (
        <div className={`status-banner ${result.predicted_class === 1 ? 'attention' : 'stable'}`}>
          {result.predicted_class === 1
            ? `Latest Model Assessment: Target Label Positive — Elevated Heart Disease Risk Detected (Class 1)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`
            : `Latest Model Assessment: Target Label Negative — Low Risk of Heart Disease (Class 0)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`}
        </div>
      )}

      {/* Summary Scorecard if patient data is loaded */}
      {hasPatientValues && (
        <section className="card ref-summary-card">
          <div className="ref-summary-header">
            <div>
              <span className="eyebrow">Patient Chart Concordance</span>
              <h3 className="section-title">
                {formData.patientName ? `${formData.patientName}'s Biomarker Summary` : 'Active Patient Biomarker Mapping'}
              </h3>
            </div>
            <div className="ref-summary-chips">
              <span className="pill healthy">
                ✓ {statusCounts.healthy} Within Target
              </span>
              <span className="pill caution">
                ⚡ {statusCounts.caution} Borderline / Watch
              </span>
              <span className="pill high">
                ⚠️ {statusCounts.high} Elevated / Review
              </span>
              {statusCounts.unassessed > 0 && (
                <span className="pill reference">
                  {statusCounts.unassessed} Not Recorded
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Category Navigation Tabs */}
      <div className="ref-category-tabs">
        <button
          type="button"
          className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All 12 Biomarkers ({REFERENCE_RANGES.length})
        </button>
        <button
          type="button"
          className={`filter-chip ${selectedCategory === 'vitals' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('vitals')}
        >
          Vitals &amp; Metabolic (5)
        </button>
        <button
          type="button"
          className={`filter-chip ${selectedCategory === 'ecg' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('ecg')}
        >
          ECG &amp; Stress Response (4)
        </button>
        <button
          type="button"
          className={`filter-chip ${selectedCategory === 'imaging' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('imaging')}
        >
          Anatomy &amp; Imaging (3)
        </button>
      </div>

      {/* Visual Reference Cards Grid */}
      <section className="visual-grid">
        {filteredRanges.map((metric) => (
          <RangeCard key={metric.id} metric={metric} formData={formData} />
        ))}
      </section>

      {/* Plain-Language Clinical Guide (All 13 Features) */}
      <section className="card anatomy-card">
        <h2 className="section-title">Plain-Language Clinical Guide (All 13 Features)</h2>
        <p className="section-intro">
          A clear, clinician- and patient-friendly guide explaining what each test measures, why it matters for cardiovascular diagnosis, and standard healthy target ranges.
        </p>

        <div className="anatomy-categories-grid">
          {/* Group 1: Vitals & Metabolism */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">1. Vitals &amp; Metabolic Health</h3>
            <ul className="anatomy-list">
              <li>
                <div className="anatomy-item-header">
                  <strong>Resting Blood Pressure</strong>
                  <span className="feature-code">trestbps</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Pressure inside arteries when the heart contracts at rest.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Chronically high blood pressure forces the heart to work harder and damages arterial walls over time.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> 90–120 mm Hg.
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Total Serum Cholesterol</strong>
                  <span className="feature-code">chol</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Total amount of fat-like substances circulating in the bloodstream.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Excess cholesterol sticks to vessel walls, forming fatty plaques that narrow coronary arteries.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Under 200 mg/dL.
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Peak Exercise Heart Rate</strong>
                  <span className="feature-code">thalach</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Highest heart rate reached during treadmill exercise stress testing.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> A healthy heart pumps vigorously under effort; failure to reach target rate indicates poor stamina or restricted blood flow.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> &ge; 150 bpm (or age-predicted maximum).
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Fasting Blood Sugar</strong>
                  <span className="feature-code">fbs</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Blood glucose level after fasting overnight for at least 8 hours.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Elevated blood sugar damages microvascular blood vessel linings and doubles heart disease risk.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> &le; 120 mg/dL (Normal).
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Patient Chronological Age</strong>
                  <span className="feature-code">age</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Patient&apos;s chronological age in years.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Arteries naturally lose elasticity and accumulate plaque over decades, making age an important natural risk factor.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Under 45 years (risk rises progressively thereafter).
                </p>
              </li>
            </ul>
          </div>

          {/* Group 2: Symptoms, Demographics & Resting ECG */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">2. Symptoms, Demographics &amp; Resting ECG</h3>
            <ul className="anatomy-list">
              <li>
                <div className="anatomy-item-header">
                  <strong>Biological Sex</strong>
                  <span className="feature-code">sex</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Biological sex recorded at birth (Male or Female).
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Men typically develop coronary artery disease at younger ages; risk in women rises sharply after menopause as estrogen declines.
                </p>
                <p className="anatomy-item-target">
                  <strong>Role:</strong> Baseline demographic risk modifier in diagnostic models.
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Chest Pain Presentation</strong>
                  <span className="feature-code">cp</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Characterizes the patient&apos;s chest discomfort (Typical, Atypical, Non-anginal, or Asymptomatic).
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Anginal pain signals cardiac oxygen starvation. Silent (asymptomatic) presentation in high-risk patients often disguises severe multivessel disease.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Non-anginal or asymptomatic without underlying disease.
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Exercise-Induced Angina</strong>
                  <span className="feature-code">exang</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Whether physical exertion triggers chest tightness or pain.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Discomfort during exertion directly indicates narrowed coronary arteries unable to meet cardiac workload.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> No (Absent during exercise).
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Resting Electrocardiogram</strong>
                  <span className="feature-code">restecg</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Electrical recording of heart rhythm while lying comfortably at rest.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Detects irregular rhythms, prior silent damage, or enlarged heart muscle (LVH) caused by high blood pressure.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Normal baseline ECG (Code 0).
                </p>
              </li>
            </ul>
          </div>

          {/* Group 3: Stress Testing, Perfusion & Anatomy */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">3. Stress Testing, Perfusion &amp; Anatomy</h3>
            <ul className="anatomy-list">
              <li>
                <div className="anatomy-item-header">
                  <strong>ST Depression Under Stress</strong>
                  <span className="feature-code">oldpeak</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Downward dip of the ECG line during exercise compared to rest.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> A drop of 1.0 mm or more indicates that the inner heart muscle is experiencing acute oxygen deprivation under stress.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Less than 1.0 mm dip.
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Peak Exercise ST Slope</strong>
                  <span className="feature-code">slope</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Direction and slope of the ECG ST wave at maximum exercise.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> A healthy heart shows a steep upward slope. Flat or downward slopes indicate impaired electrical recovery due to ischemia.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Upsloping (Type 1).
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Calcified Major Vessels</strong>
                  <span className="feature-code">ca</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Count of main coronary arteries (0 to 3) showing visible calcium under X-ray fluoroscopy.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Direct structural evidence of hardened atherosclerotic plaque narrowing coronary vessels.
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> 0 vessels (Completely clear arteries).
                </p>
              </li>
              <li>
                <div className="anatomy-item-header">
                  <strong>Thallium Perfusion Scan</strong>
                  <span className="feature-code">thal</span>
                </div>
                <p className="anatomy-item-desc">
                  <strong>What it is:</strong> Nuclear imaging test tracing blood flow distribution across heart muscle tissue.
                </p>
                <p className="anatomy-item-meaning">
                  <strong>Why it matters:</strong> Distinguishes normal blood flow from temporary oxygen starvation (reversible defect) or permanent scar tissue (fixed defect).
                </p>
                <p className="anatomy-item-target">
                  <strong>Healthy Target:</strong> Normal myocardial blood flow (Code 3).
                </p>
              </li>
            </ul>
          </div>
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

  // Determine clinical status band
  const { band, labelText } = useMemo(() => {
    if (!hasValue || Number.isNaN(numeric)) {
      return { band: 'reference', labelText: 'Reference' };
    }

    if (metric.categorical) {
      const match = metric.options?.find((o) => parseFloat(o.value) === numeric);
      const status = match?.status || (numeric > 0 ? 'high' : 'healthy');
      const text = match ? match.label.split(':')[1]?.trim() || match.label : (numeric > 0 ? 'Above target' : 'In range');
      return { band: status, labelText: text };
    }

    if (metric.invertScale) {
      if (numeric >= metric.healthyMin) {
        return { band: 'healthy', labelText: `${numeric} ${metric.unit}` };
      }
      if (numeric >= 120) {
        return { band: 'caution', labelText: `${numeric} ${metric.unit}` };
      }
      return { band: 'high', labelText: `${numeric} ${metric.unit}` };
    }

    if (numeric < (metric.healthyMin || 0)) {
      return { band: 'caution', labelText: `${numeric} ${metric.unit}` };
    }
    if (numeric <= metric.healthyMax) {
      return { band: 'healthy', labelText: `${numeric} ${metric.unit}` };
    }
    return { band: 'high', labelText: `${numeric} ${metric.unit}` };
  }, [hasValue, numeric, metric]);

  // Marker placement on 0-100% scale
  const markerPercent = useMemo(() => {
    if (!hasValue || Number.isNaN(numeric)) {
      return metric.categorical ? 12 : 28;
    }
    if (metric.categorical) {
      if (metric.options && metric.options.length > 1) {
        const idx = metric.options.findIndex((o) => parseFloat(o.value) === numeric);
        if (idx !== -1) {
          return Math.min(94, Math.max(6, ((idx + 0.5) / metric.options.length) * 100));
        }
      }
      return numeric > 0 ? 82 : 18;
    }

    const clamped = Math.min(metric.max, Math.max(metric.min, numeric));
    const pct = ((clamped - metric.min) / (metric.max - metric.min)) * 100;
    return Math.min(96, Math.max(4, pct));
  }, [hasValue, numeric, metric]);

  return (
    <article className={`range-card ${band !== 'reference' ? `card-status-${band}` : ''}`}>
      <header>
        <div>
          <span className="range-category-tag">{metric.categoryLabel}</span>
          <h3>{metric.label}</h3>
        </div>
        <span className={`pill ${band}`}>
          {labelText}
        </span>
      </header>

      {/* Visual Indicator Track */}
      {metric.categorical ? (
        <div className="range-segmented-track" aria-hidden="true">
          {metric.options?.map((opt) => {
            const isSelected = hasValue && parseFloat(opt.value) === numeric;
            return (
              <span
                key={opt.value}
                className={`range-segment ${opt.status}-zone ${isSelected ? 'selected' : ''}`}
                title={opt.label}
              />
            );
          })}
          {hasValue && <span className="marker" style={{ left: `${markerPercent}%` }} />}
        </div>
      ) : (
        <div className="range-track" aria-hidden="true">
          {metric.invertScale ? (
            <>
              <span className="zone high-zone" style={{ width: '30%' }} />
              <span className="zone caution-zone" style={{ width: '30%' }} />
              <span className="zone healthy-zone" style={{ width: '40%' }} />
            </>
          ) : (
            <>
              <span className="zone healthy-zone" style={{ width: '42%' }} />
              <span className="zone caution-zone" style={{ width: '28%' }} />
              <span className="zone high-zone" style={{ width: '30%' }} />
            </>
          )}
          {hasValue && <span className="marker" style={{ left: `${markerPercent}%` }} />}
        </div>
      )}

      {/* Threshold Legends */}
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

      {/* Clinical Rationale Footer */}
      {metric.clinicalSignificance && (
        <p className="range-significance">
          <strong>Clinical Meaning:</strong> {metric.clinicalSignificance}
        </p>
      )}
    </article>
  );
}
