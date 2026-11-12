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

      {/* Physiological Mechanisms & Diagnostic Rationale for All 12 Clinical Features */}
      <section className="card anatomy-card">
        <h2 className="section-title">Physiological Mechanisms &amp; Diagnostic Rationale (All 12 Clinical Biomarkers)</h2>
        <p className="section-intro">
          Understanding the biological pathophysiology underlying each diagnostic marker strengthens clinical decision-making.
        </p>

        <div className="anatomy-categories-grid">
          {/* Group 1: Vitals & Metabolism */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">1. Hemodynamics &amp; Metabolic Homeostasis</h3>
            <ul className="anatomy-list">
              <li>
                <strong>Resting Blood Pressure (trestbps)</strong>
                Systolic BP 90–120 mm Hg preserves aortic root elasticity. Sustained pressures &ge; 140 mm Hg generate cyclic shear stress, endothelial denudation, and smooth muscle hyperplasia.
              </li>
              <li>
                <strong>Total Serum Cholesterol (chol)</strong>
                Levels &lt; 200 mg/dL maintain nitric oxide bioavailability. Elevated total and LDL cholesterol drive subendothelial apolipoprotein-B retention, initiating fatty streaks and fibroatheromas.
              </li>
              <li>
                <strong>Peak Exercise Heart Rate (thalach)</strong>
                Peak exertional rate reflects sympathetic tone and chronotropic competence. Inability to reach age-predicted targets (&lt; 120 bpm) indicates autonomic neuropathy or rate-limiting occult ischemia.
              </li>
              <li>
                <strong>Fasting Blood Sugar (fbs)</strong>
                Fasting glucose &le; 120 mg/dL protects microvascular capillary beds. Hyperglycemia (&gt; 120 mg/dL) accelerates advanced glycation end-products (AGEs), doubling vascular mortality risk.
              </li>
              <li>
                <strong>Patient Chronological Age (age)</strong>
                Age acts as a surrogate for lifetime exposure to hemodynamic pulse-wave velocity, arterial wall calcification, and microvascular rarefaction.
              </li>
            </ul>
          </div>

          {/* Group 2: Electrocardiography & Stress */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">2. Electrocardiography &amp; Exercise Stress</h3>
            <ul className="anatomy-list">
              <li>
                <strong>ST Depression Under Stress (oldpeak)</strong>
                Subendocardial myocardium has the highest metabolic demand. Exertional ST depression &ge; 1.0 mm directly visualizes regional subendocardial ischemia during increased cardiac workload.
              </li>
              <li>
                <strong>Peak Exercise ST Slope (slope)</strong>
                Rapid upsloping ST is the normal repolarization adaptation. Flat or downsloping ST signifies delayed potassium efflux and impaired trans-sarcolemmal repolarization under ischemic stress.
              </li>
              <li>
                <strong>Resting Electrocardiogram (restecg)</strong>
                Resting ST-T inversions or Left Ventricular Hypertrophy (LVH) indicate chronic left ventricular pressure afterload and increased myocardial oxygen consumption at rest.
              </li>
              <li>
                <strong>Exercise-Induced Angina (exang)</strong>
                Exertional retrosternal discomfort signals regional adenosine and lactate release from cardiomyocytes when stenotic coronary arteries cannot meet oxygen demands.
              </li>
            </ul>
          </div>

          {/* Group 3: Anatomy & Imaging */}
          <div className="anatomy-category-block">
            <h3 className="anatomy-category-title">3. Coronary Anatomy &amp; Perfusion Imaging</h3>
            <ul className="anatomy-list">
              <li>
                <strong>Fluoroscopy Calcified Vessels (ca)</strong>
                Fluoroscopic radiopacity in epicardial arteries directly identifies intimal and medial calcified atherosclerotic plaques in the LAD, LCx, or RCA.
              </li>
              <li>
                <strong>Thallium-201 Scintigraphy (thal)</strong>
                Nuclear thallium uptake reflects cellular potassium ATPase activity. Reversible defects indicate viable ischemic myocardium that can benefit from revascularization, whereas fixed defects signify transmural scar tissue.
              </li>
              <li>
                <strong>Chest Pain Symptom Category (cp)</strong>
                Asymptomatic presentations (Class 4) in high-risk patients often disguise silent myocardial ischemia, which is statistically associated with occult multi-vessel disease.
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
          <strong>Pathophysiology:</strong> {metric.clinicalSignificance}
        </p>
      )}
    </article>
  );
}
