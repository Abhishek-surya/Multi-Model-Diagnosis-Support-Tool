import React from 'react';
import { CP_LABELS, RESTECG_LABELS, SLOPE_LABELS, THAL_LABELS } from '../constants/clinicalConstants';

export function AssessmentPage({
  formData,
  fieldErrors,
  loading,
  error,
  lastResult,
  onChange,
  onSubmit,
  onLoadSample,
  onClear,
  onViewLastResult
}) {
  return (
    <section className="card assessment-card">
      <p className="eyebrow">Diagnostic Decision Support</p>
      <h1 className="section-title">Cardiac Risk Assessment &amp; Screening</h1>
      <p className="section-intro">
        Enter the 13 clinical biomarkers to predict the target label (risk of heart disease)
        using the trained machine learning pipeline and record the encounter in the patient chart.
      </p>

      {lastResult && (
        <div className={`status-banner ${lastResult.predicted_class === 1 ? 'attention' : 'stable'}`}>
          <div className="banner-content">
            <span>
              Latest Session Prediction:{' '}
              <strong>
                {lastResult.predicted_class === 1
                  ? 'Positive — Risk of Heart Disease Detected (Class 1)'
                  : 'Negative — Low Risk (Class 0)'}
              </strong>
              {lastResult.probability_percentage != null && ` · ${lastResult.probability_percentage}% risk`}
            </span>
            <button type="button" className="btn-chip" onClick={onViewLastResult}>
              View Prediction Report →
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert-error" role="alert">{error}</div>}

      <div className="demo-bar">
        <span className="demo-bar-label">Quick fill:</span>
        <button type="button" className="btn-chip" onClick={() => onLoadSample('highRisk')}>
          Sample High Risk Profile
        </button>
        <button type="button" className="btn-chip" onClick={() => onLoadSample('moderateRisk')}>
          Sample Moderate Risk Profile
        </button>
        <button type="button" className="btn-chip" onClick={() => onLoadSample('lowRisk')}>
          Sample Low Risk Profile
        </button>
        <button type="button" className="btn-chip reset" onClick={onClear}>
          Clear Form
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {/* Patient Identification */}
        <div className="field-group">
          <h2>Patient Demographics</h2>
          <div className="form-grid">
            <Field
              id="patientId"
              label="Patient ID"
              hint="Unique identifier (e.g. PT-8801). Used to track visit history."
              error={fieldErrors.patientId}
            >
              <input
                id="patientId"
                name="patientId"
                type="text"
                placeholder="e.g. PT-8801"
                value={formData.patientId}
                onChange={onChange}
                className={fieldErrors.patientId ? 'error' : ''}
              />
            </Field>

            <Field id="patientName" label="Patient Full Name" error={fieldErrors.patientName}>
              <input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="e.g. Robert Vance"
                value={formData.patientName}
                onChange={onChange}
                className={fieldErrors.patientName ? 'error' : ''}
              />
            </Field>

            <Field id="age" label="Age (years)" error={fieldErrors.age}>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 55"
                value={formData.age}
                onChange={onChange}
                className={fieldErrors.age ? 'error' : ''}
              />
            </Field>

            <Field id="sex" label="Biological Sex" error={fieldErrors.sex}>
              <select
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={onChange}
                className={fieldErrors.sex ? 'error' : ''}
              >
                <option value="">Select sex...</option>
                <option value="0.0">Female (0)</option>
                <option value="1.0">Male (1)</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Symptoms & History */}
        <div className="field-group">
          <h2>Symptoms &amp; Clinical Presentation</h2>
          <div className="form-grid">
            <Field
              id="cp"
              label="Chest Pain Type (cp)"
              full
              hint="4 categories: Angina vs. Asymptomatic/Silent presentation"
              error={fieldErrors.cp}
            >
              <select
                id="cp"
                name="cp"
                value={formData.cp}
                onChange={onChange}
                className={fieldErrors.cp ? 'error' : ''}
              >
                <option value="">Select chest pain presentation...</option>
                <option value="1.0">1.0 — Typical angina (exertional substernal pressure)</option>
                <option value="2.0">2.0 — Atypical angina (atypical location or duration)</option>
                <option value="3.0">3.0 — Non-anginal pain (musculoskeletal or pleuritic)</option>
                <option value="4.0">4.0 — Asymptomatic (silent ischemia in high-risk patients)</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Vitals & Laboratory */}
        <div className="field-group">
          <h2>Vitals &amp; Serum Biomarkers</h2>
          <div className="form-grid">
            <Field
              id="trestbps"
              label="Resting Blood Pressure (mm Hg)"
              liveBadge={getBpBadge(formData.trestbps)}
              error={fieldErrors.trestbps}
            >
              <input
                id="trestbps"
                name="trestbps"
                type="number"
                min="50"
                max="260"
                placeholder="e.g. 130"
                value={formData.trestbps}
                onChange={onChange}
                className={fieldErrors.trestbps ? 'error' : ''}
              />
            </Field>

            <Field
              id="chol"
              label="Serum Cholesterol (mg/dL)"
              liveBadge={getCholBadge(formData.chol)}
              error={fieldErrors.chol}
            >
              <input
                id="chol"
                name="chol"
                type="number"
                min="50"
                max="650"
                placeholder="e.g. 240"
                value={formData.chol}
                onChange={onChange}
                className={fieldErrors.chol ? 'error' : ''}
              />
            </Field>

            <Field
              id="fbs"
              label="Fasting Blood Sugar > 120 mg/dL"
              error={fieldErrors.fbs}
            >
              <select
                id="fbs"
                name="fbs"
                value={formData.fbs}
                onChange={onChange}
                className={fieldErrors.fbs ? 'error' : ''}
              >
                <option value="">Select fasting sugar...</option>
                <option value="0.0">No — Fasting blood sugar &lt;= 120 mg/dL (Normal)</option>
                <option value="1.0">Yes — Fasting blood sugar &gt; 120 mg/dL (Elevated)</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Electrocardiography & Stress Testing */}
        <div className="field-group">
          <h2>Cardiac Diagnostic Tests</h2>
          <div className="form-grid">
            <Field
              id="restecg"
              label="Resting ECG Results"
              error={fieldErrors.restecg}
            >
              <select
                id="restecg"
                name="restecg"
                value={formData.restecg}
                onChange={onChange}
                className={fieldErrors.restecg ? 'error' : ''}
              >
                <option value="">Select resting ECG...</option>
                <option value="0.0">0.0 — Normal baseline ECG</option>
                <option value="1.0">1.0 — ST-T wave abnormality (T wave inversions)</option>
                <option value="2.0">2.0 — Left ventricular hypertrophy (Estes criteria)</option>
              </select>
            </Field>

            <Field
              id="thalach"
              label="Maximum Heart Rate Achieved (bpm)"
              liveBadge={getThalachBadge(formData.thalach)}
              error={fieldErrors.thalach}
            >
              <input
                id="thalach"
                name="thalach"
                type="number"
                min="50"
                max="250"
                placeholder="e.g. 150"
                value={formData.thalach}
                onChange={onChange}
                className={fieldErrors.thalach ? 'error' : ''}
              />
            </Field>

            <Field
              id="exang"
              label="Exercise-Induced Angina"
              error={fieldErrors.exang}
            >
              <select
                id="exang"
                name="exang"
                value={formData.exang}
                onChange={onChange}
                className={fieldErrors.exang ? 'error' : ''}
              >
                <option value="">Select exercise angina...</option>
                <option value="0.0">No — Absent during treadmill/stress test</option>
                <option value="1.0">Yes — Provoked under exertional stress</option>
              </select>
            </Field>

            <Field
              id="oldpeak"
              label="ST Depression (oldpeak, mm)"
              hint="Exercise-induced ST depression relative to rest"
              liveBadge={getOldpeakBadge(formData.oldpeak)}
              error={fieldErrors.oldpeak}
            >
              <input
                id="oldpeak"
                name="oldpeak"
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="e.g. 1.2"
                value={formData.oldpeak}
                onChange={onChange}
                className={fieldErrors.oldpeak ? 'error' : ''}
              />
            </Field>

            <Field
              id="slope"
              label="Peak Exercise ST Slope"
              error={fieldErrors.slope}
            >
              <select
                id="slope"
                name="slope"
                value={formData.slope}
                onChange={onChange}
                className={fieldErrors.slope ? 'error' : ''}
              >
                <option value="">Select peak ST slope...</option>
                <option value="1.0">1.0 — Upsloping (normal physiological)</option>
                <option value="2.0">2.0 — Flat (equivocal / mild ischemia)</option>
                <option value="3.0">3.0 — Downsloping (indicative of ischemia)</option>
              </select>
            </Field>

            <Field
              id="ca"
              label="Fluoroscopy Colored Vessels (ca 0–3)"
              hint="Major coronary vessels colored by fluoroscopy"
              error={fieldErrors.ca}
            >
              <select
                id="ca"
                name="ca"
                value={formData.ca}
                onChange={onChange}
                className={fieldErrors.ca ? 'error' : ''}
              >
                <option value="">Select colored vessels...</option>
                <option value="0.0">0 — No major vessel calcification/stenosis</option>
                <option value="1.0">1 — 1 major vessel colored</option>
                <option value="2.0">2 — 2 major vessels colored</option>
                <option value="3.0">3 — 3 major vessels colored</option>
              </select>
            </Field>

            <Field
              id="thal"
              label="Thallium Scintigraphy Result (thal)"
              full
              hint="Myocardial nuclear perfusion scan"
              error={fieldErrors.thal}
            >
              <select
                id="thal"
                name="thal"
                value={formData.thal}
                onChange={onChange}
                className={fieldErrors.thal ? 'error' : ''}
              >
                <option value="">Select thallium perfusion scan...</option>
                <option value="3.0">3.0 — Normal blood flow (homogenous perfusion)</option>
                <option value="6.0">6.0 — Fixed defect (non-viable tissue / prior infarct scar)</option>
                <option value="7.0">7.0 — Reversible defect (viable tissue with stress ischemia)</option>
              </select>
            </Field>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? 'Evaluating Biomarkers & Predicting Risk...' : 'Predict Heart Disease Risk & Save Visit'}
        </button>
        <p className="form-submit-note">
          Submits all 13 clinical features to the ML model to predict the target label (coronary heart disease risk) and saves encounter to history.
        </p>
      </form>
    </section>
  );
}

function Field({ id, label, hint, liveBadge, error, full, children }) {
  return (
    <div className={`form-group ${full ? 'full' : ''}`}>
      <div className="field-header">
        <label htmlFor={id}>{label}</label>
        {liveBadge}
      </div>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function getBpBadge(val) {
  if (!val) return null;
  const num = parseFloat(val);
  if (num >= 140) return <span className="field-badge high">Stage 2 HTN (≥140)</span>;
  if (num >= 120) return <span className="field-badge caution">Prehypertension</span>;
  if (num >= 90) return <span className="field-badge healthy">Normal (&lt;120)</span>;
  return null;
}

function getCholBadge(val) {
  if (!val) return null;
  const num = parseFloat(val);
  if (num >= 240) return <span className="field-badge high">High (≥240)</span>;
  if (num >= 200) return <span className="field-badge caution">Borderline (200-239)</span>;
  if (num >= 100) return <span className="field-badge healthy">Desirable (&lt;200)</span>;
  return null;
}

function getThalachBadge(val) {
  if (!val) return null;
  const num = parseFloat(val);
  if (num < 120) return <span className="field-badge caution">Low Peak HR</span>;
  if (num >= 150) return <span className="field-badge healthy">Adequate Reserve</span>;
  return null;
}

function getOldpeakBadge(val) {
  if (!val) return null;
  const num = parseFloat(val);
  if (num >= 1.5) return <span className="field-badge high">Significant (&gt;=1.5mm)</span>;
  if (num >= 1.0) return <span className="field-badge caution">Mild Ischemia (&gt;=1.0mm)</span>;
  return <span className="field-badge healthy">Normal (&lt;1.0mm)</span>;
}
