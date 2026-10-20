import React from 'react';
import { CP_LABELS, RESTECG_LABELS, SLOPE_LABELS, THAL_LABELS } from '../constants/clinicalConstants';
import { BiomarkerTile } from './BiomarkerTile';
import { RiskGauge } from './RiskGauge';
import { XaiAttributionPanel } from './XaiAttributionPanel';
import { WhatIfSimulator } from './WhatIfSimulator';

export function ResultsPage({
  result,
  formData,
  priorVisitCount,
  onHistory,
  onStartNew,
  onOverview
}) {
  const isDisease = result.predicted_class === 1;
  const probPercent = result.probability_percentage != null
    ? result.probability_percentage
    : (result.probability != null ? Math.round(result.probability * 1000) / 10 : (isDisease ? 75.0 : 25.0));

  const riskCategory = probPercent >= 65 ? 'High Risk' : probPercent >= 35 ? 'Moderate Risk' : 'Low Risk';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="results-container">
      <section className="card results-card">
        <div className="results-header">
          <span className={`result-target-badge ${isDisease ? 'target-disease' : 'target-no-disease'}`}>
            Target Label: {isDisease ? 'Positive (Class 1) — Risk Detected' : 'Negative (Class 0) — Low Risk'}
          </span>
          <div className="results-header-actions">
            <span className="results-date">
              Recorded: {new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
            <button
              type="button"
              className="btn-chip print-btn"
              onClick={handlePrint}
              title="Print clinical consultation summary"
            >
              Print Consultation Note
            </button>
          </div>
        </div>

        {/* Diagnostic Hero Card */}
        <div className={`prediction-hero ${isDisease ? 'hero-disease' : 'hero-no-disease'}`}>
          <div className="prediction-hero-text">
            <p className="prediction-eyebrow">Diagnostic Decision Support</p>
            <h1 className="prediction-headline">
              {isDisease ? 'Risk of Heart Disease Detected' : 'Low Risk of Heart Disease'}
            </h1>
            <p className="prediction-subheadline">
              Model Diagnostic Decision:{' '}
              <strong>{result.readable_result || (isDisease ? 'Disease detected by model' : 'No disease detected by model')}</strong>
            </p>
            <p className="prediction-patient-meta">
              Patient: <strong>{formData.patientName || 'Patient'}</strong> · ID: <strong>{formData.patientId || '—'}</strong> · Age: {formData.age} · Sex: {formData.sex === '1.0' ? 'Male' : formData.sex === '0.0' ? 'Female' : '—'}
            </p>
          </div>

          <div className="prediction-hero-metric">
            <span className="metric-label">Risk Probability</span>
            <span className="metric-value">{probPercent}%</span>
            <span className={`metric-tag ${isDisease ? 'tag-high' : 'tag-low'}`}>{riskCategory}</span>
          </div>
        </div>

        {/* Visual Risk Probability Gauge */}
        <RiskGauge probabilityPercentage={probPercent} />

        {/* Clinical Decision Support Interpretation */}
        <div className="clinical-interpretation-box">
          <h3>Clinical Decision Support Interpretation</h3>
          <p>
            {isDisease
              ? 'The machine learning pipeline predicts POSITIVE for coronary heart disease risk (Target Class: 1). This patient presents cardiovascular biomarkers associated with heightened cardiac risk. Consider scheduling confirmatory diagnostic testing (stress echocardiography, coronary CTA, or angiography) alongside lifestyle and therapeutic risk factor reduction.'
              : 'The machine learning pipeline predicts NEGATIVE for significant coronary heart disease risk (Target Class: 0). The patient’s clinical biomarkers align with typical low-risk cardiovascular patterns. Continue routine preventive care, annual risk factor surveillance, and standard diet/exercise counseling.'}
          </p>
        </div>

        {/* Biomarker Findings Breakdown */}
        <div className="biomarkers-section">
          <h3>Input Biomarkers &amp; Risk Factor Analysis</h3>
          <div className="biomarkers-grid">
            <BiomarkerTile
              label="Resting Blood Pressure"
              value={`${formData.trestbps} mm Hg`}
              status={Number(formData.trestbps) >= 140 ? 'high' : Number(formData.trestbps) >= 120 ? 'caution' : 'healthy'}
              note={Number(formData.trestbps) >= 140 ? 'Hypertension (>=140)' : Number(formData.trestbps) >= 120 ? 'Prehypertension' : 'Normal (<120)'}
            />
            <BiomarkerTile
              label="Serum Cholesterol"
              value={`${formData.chol} mg/dL`}
              status={Number(formData.chol) >= 240 ? 'high' : Number(formData.chol) >= 200 ? 'caution' : 'healthy'}
              note={Number(formData.chol) >= 240 ? 'Elevated (>=240)' : Number(formData.chol) >= 200 ? 'Borderline (200-239)' : 'Desirable (<200)'}
            />
            <BiomarkerTile
              label="Peak Heart Rate (thalach)"
              value={`${formData.thalach} bpm`}
              status={Number(formData.thalach) < 120 ? 'caution' : 'healthy'}
              note="Maximum exercise HR achieved"
            />
            <BiomarkerTile
              label="ST Depression (oldpeak)"
              value={`${formData.oldpeak} mm`}
              status={Number(formData.oldpeak) >= 1.5 ? 'high' : Number(formData.oldpeak) >= 1.0 ? 'caution' : 'healthy'}
              note={Number(formData.oldpeak) >= 1.0 ? 'Exertional ischemia sign' : 'Normal (<1.0)'}
            />
            <BiomarkerTile
              label="Chest Pain Type (cp)"
              value={CP_LABELS[formData.cp] || '—'}
              status={formData.cp === '4.0' || formData.cp === '1.0' ? 'high' : 'healthy'}
              note={formData.cp === '4.0' ? 'Asymptomatic (silent ischemia hazard)' : formData.cp === '1.0' ? 'Typical angina' : 'Atypical / Non-anginal'}
            />
            <BiomarkerTile
              label="Exercise Angina (exang)"
              value={formData.exang === '1.0' ? 'Yes (Present)' : 'No (Absent)'}
              status={formData.exang === '1.0' ? 'high' : 'healthy'}
              note={formData.exang === '1.0' ? 'Positive cardiac strain' : 'Negative'}
            />
            <BiomarkerTile
              label="Fluoroscopy Vessels (ca)"
              value={`${formData.ca} vessels`}
              status={Number(formData.ca) > 0 ? 'high' : 'healthy'}
              note={Number(formData.ca) > 0 ? `${formData.ca} major vessel(s) colored` : 'No fluoroscopic vessel stenosis'}
            />
            <BiomarkerTile
              label="Thallium Perfusion (thal)"
              value={THAL_LABELS[formData.thal] || '—'}
              status={formData.thal === '7.0' ? 'high' : formData.thal === '6.0' ? 'caution' : 'healthy'}
              note={formData.thal === '7.0' ? 'Reversible perfusion defect' : formData.thal === '6.0' ? 'Fixed defect (scar)' : 'Normal myocardial perfusion'}
            />
            <BiomarkerTile
              label="Peak ST Slope"
              value={SLOPE_LABELS[formData.slope] || '—'}
              status={formData.slope === '2.0' ? 'caution' : formData.slope === '3.0' ? 'high' : 'healthy'}
              note={formData.slope === '2.0' ? 'Flat ST segment' : formData.slope === '3.0' ? 'Downsloping ST segment' : 'Normal upsloping ST'}
            />
            <BiomarkerTile
              label="Fasting Blood Sugar (fbs)"
              value={formData.fbs === '1.0' ? '> 120 mg/dL' : '<= 120 mg/dL'}
              status={formData.fbs === '1.0' ? 'caution' : 'healthy'}
              note={formData.fbs === '1.0' ? 'Elevated fasting glucose' : 'Normal fasting glucose'}
            />
            <BiomarkerTile
              label="Resting ECG (restecg)"
              value={RESTECG_LABELS[formData.restecg] || '—'}
              status={formData.restecg === '0.0' ? 'healthy' : 'caution'}
              note={formData.restecg === '1.0' ? 'ST-T wave abnormality' : formData.restecg === '2.0' ? 'Left ventricular hypertrophy' : 'Normal'}
            />
            <BiomarkerTile
              label="Demographics"
              value={`${formData.age} yrs, ${formData.sex === '1.0' ? 'Male' : 'Female'}`}
              status="reference"
              note="Patient demographic profile"
            />
          </div>
        </div>

        {/* Record Saved Confirmation */}
        <div className="status-banner stable">
          ✓ Encounter saved to chart for <strong>{formData.patientName}</strong> (ID: {formData.patientId}).
          {priorVisitCount > 0
            ? ` Patient now has ${priorVisitCount + 1} visits recorded. View history to inspect longitudinal changes.`
            : ' Initial visit saved to patient history. Subsequent visits will enable comparison charts.'}
        </div>

        <div className="results-actions">
          <button type="button" className="btn-primary" onClick={onHistory}>
            View visit history &amp; trends
          </button>
          <button type="button" className="btn-secondary" onClick={onStartNew}>
            New screening
          </button>
          <button type="button" className="btn-secondary" onClick={onOverview}>
            Adult reference ranges
          </button>
        </div>

        <div className="disclaimer-footer">
          <strong>Academic Decision Support Disclaimer:</strong> This application is a machine learning research prototype developed for decision support study. Predictions reflect statistical pattern matching and are not an autonomous diagnosis or replacement for qualified medical evaluation.
        </div>
      </section>

      {/* 2. Explainable AI Feature Attribution */}
      <XaiAttributionPanel formData={formData} />

      {/* 3. Counterfactual "What-If" Simulator */}
      <WhatIfSimulator formData={formData} />
    </div>
  );
}
