import React, { useMemo, useState } from 'react';
import { calculateSimulatedRisk } from '../utils/xaiCalculator';

export function WhatIfSimulator({ formData }) {
  // Local state for modifiable biomarkers
  const [modifications, setModifications] = useState({
    trestbps: formData.trestbps || '130',
    chol: formData.chol || '240',
    thalach: formData.thalach || '150',
    oldpeak: formData.oldpeak || '1.0',
    exang: formData.exang || '0.0'
  });

  const simulation = useMemo(() => {
    return calculateSimulatedRisk(formData, modifications);
  }, [formData, modifications]);

  const hasModifications = useMemo(() => {
    return (
      String(modifications.trestbps) !== String(formData.trestbps) ||
      String(modifications.chol) !== String(formData.chol) ||
      String(modifications.thalach) !== String(formData.thalach) ||
      String(modifications.oldpeak) !== String(formData.oldpeak) ||
      String(modifications.exang) !== String(formData.exang)
    );
  }, [formData, modifications]);

  const handleSliderChange = (field, val) => {
    setModifications((prev) => ({
      ...prev,
      [field]: val
    }));
  };

  const resetToBaseline = () => {
    setModifications({
      trestbps: formData.trestbps || '130',
      chol: formData.chol || '240',
      thalach: formData.thalach || '150',
      oldpeak: formData.oldpeak || '1.0',
      exang: formData.exang || '0.0'
    });
  };

  const applyOptimalTargetPreset = () => {
    setModifications({
      trestbps: '118',
      chol: '185',
      thalach: Math.max(155, Number(formData.thalach) || 155),
      oldpeak: '0.2',
      exang: '0.0'
    });
  };

  const baselineClass = simulation.baseProbability >= 50 ? 'Class 1 (High Risk)' : 'Class 0 (Low Risk)';
  const simulatedClass = simulation.simulatedProbability >= 50 ? 'Class 1 (High Risk)' : 'Class 0 (Low Risk)';

  return (
    <section className="card what-if-card">
      <div className="what-if-header">
        <div>
          <span className="eyebrow sim-badge">Counterfactual Modeling</span>
          <h2 className="section-title">Interactive &quot;What-If&quot; Risk Simulator</h2>
          <p className="section-intro">
            Simulate how targeted clinical interventions on <strong>modifiable biomarkers</strong> would alter
            this patient&apos;s predicted risk of heart disease in real time.
          </p>
        </div>
        <div className="what-if-actions">
          <button
            type="button"
            className="btn-chip"
            onClick={applyOptimalTargetPreset}
            title="Simulate optimal clinical guideline targets"
          >
            Apply Optimal Target Preset
          </button>
          {hasModifications && (
            <button
              type="button"
              className="btn-chip reset"
              onClick={resetToBaseline}
              title="Reset sliders back to patient encounter values"
            >
              Reset to Baseline
            </button>
          )}
        </div>
      </div>

      {/* Real-time Simulated Risk Comparison Banner */}
      <div className="sim-comparison-banner">
        <div className="sim-metric-block">
          <span className="sim-label">Encounter Baseline Risk</span>
          <strong className="sim-val baseline">{simulation.baseProbability}%</strong>
          <span className="sim-sub">{baselineClass}</span>
        </div>

        <div className="sim-arrow" aria-hidden="true">
          →
        </div>

        <div className="sim-metric-block">
          <span className="sim-label">Projected Simulated Risk</span>
          <strong className={`sim-val ${simulation.simulatedProbability >= 50 ? 'high' : 'low'}`}>
            {simulation.simulatedProbability}%
          </strong>
          <span className="sim-sub">{simulatedClass}</span>
        </div>

        <div className="sim-metric-block delta">
          <span className="sim-label">Projected Risk Change</span>
          <strong className={`sim-val-delta ${simulation.delta <= 0 ? 'better' : 'worse'}`}>
            {simulation.delta > 0 ? `+${simulation.delta}` : simulation.delta}%
          </strong>
          <span className={`sim-pill ${simulation.delta <= 0 ? 'better' : 'worse'}`}>
            {simulation.delta < 0
              ? `↓ ${simulation.reductionMagnitude}% Risk Reduction`
              : simulation.delta === 0
                ? 'No Change'
                : `↑ +${simulation.delta}% Risk Increase`}
          </span>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="sim-sliders-grid">
        {/* 1. Resting Blood Pressure */}
        <div className="sim-control-group">
          <div className="sim-control-header">
            <label htmlFor="sim-trestbps">Resting Blood Pressure</label>
            <span className="sim-current-val">{modifications.trestbps} mm Hg</span>
          </div>
          <input
            id="sim-trestbps"
            type="range"
            min="90"
            max="200"
            step="1"
            value={modifications.trestbps}
            onChange={(e) => handleSliderChange('trestbps', e.target.value)}
            className="sim-slider"
          />
          <div className="sim-range-hints">
            <span>Optimal (&lt;120)</span>
            <span>Prehypertension (120–139)</span>
            <span>Stage 2 (140+)</span>
          </div>
        </div>

        {/* 2. Serum Cholesterol */}
        <div className="sim-control-group">
          <div className="sim-control-header">
            <label htmlFor="sim-chol">Serum Cholesterol</label>
            <span className="sim-current-val">{modifications.chol} mg/dL</span>
          </div>
          <input
            id="sim-chol"
            type="range"
            min="120"
            max="380"
            step="2"
            value={modifications.chol}
            onChange={(e) => handleSliderChange('chol', e.target.value)}
            className="sim-slider"
          />
          <div className="sim-range-hints">
            <span>Desirable (&lt;200)</span>
            <span>Borderline (200–239)</span>
            <span>Elevated (240+)</span>
          </div>
        </div>

        {/* 3. ST Depression */}
        <div className="sim-control-group">
          <div className="sim-control-header">
            <label htmlFor="sim-oldpeak">ST Depression (Ischemia)</label>
            <span className="sim-current-val">{modifications.oldpeak} mm</span>
          </div>
          <input
            id="sim-oldpeak"
            type="range"
            min="0.0"
            max="5.0"
            step="0.1"
            value={modifications.oldpeak}
            onChange={(e) => handleSliderChange('oldpeak', e.target.value)}
            className="sim-slider"
          />
          <div className="sim-range-hints">
            <span>Normal (&lt;1.0)</span>
            <span>Mild (1.0–1.9)</span>
            <span>Severe (2.0+)</span>
          </div>
        </div>

        {/* 4. Peak Heart Rate */}
        <div className="sim-control-group">
          <div className="sim-control-header">
            <label htmlFor="sim-thalach">Peak Exercise Heart Rate</label>
            <span className="sim-current-val">{modifications.thalach} bpm</span>
          </div>
          <input
            id="sim-thalach"
            type="range"
            min="80"
            max="210"
            step="1"
            value={modifications.thalach}
            onChange={(e) => handleSliderChange('thalach', e.target.value)}
            className="sim-slider"
          />
          <div className="sim-range-hints">
            <span>Incompetence (&lt;120)</span>
            <span>Adequate Reserve (150+)</span>
          </div>
        </div>

        {/* 5. Exercise Induced Angina Toggle */}
        <div className="sim-control-group full">
          <div className="sim-control-header">
            <label>Exertional Chest Pain Under Stress</label>
            <div className="sim-toggle-buttons">
              <button
                type="button"
                className={`sim-toggle-btn ${modifications.exang === '0.0' ? 'active' : ''}`}
                onClick={() => handleSliderChange('exang', '0.0')}
              >
                No Angina (Controlled / Absent)
              </button>
              <button
                type="button"
                className={`sim-toggle-btn ${modifications.exang === '1.0' ? 'active danger' : ''}`}
                onClick={() => handleSliderChange('exang', '1.0')}
              >
                Angina Induced by Exertion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="sim-takeaway-box">
        <strong>Clinician Counseling Guidance:</strong>{' '}
        {simulation.delta < 0 ? (
          <span>
            Achieving these simulated targets lowers positive-class risk from{' '}
            <strong>{simulation.baseProbability}%</strong> to <strong>{simulation.simulatedProbability}%</strong>{' '}
            (a <strong>{simulation.reductionMagnitude}% absolute risk reduction</strong>).
            {simulation.simulatedProbability < 50 && simulation.baseProbability >= 50 && (
              <em> Patient transitions from High Risk to Low Risk classification threshold!</em>
            )}
          </span>
        ) : simulation.delta > 0 ? (
          <span>
            Worsening these biomarker values elevates statistical risk by{' '}
            <strong>+{simulation.delta}%</strong>.
          </span>
        ) : (
          <span>
            Move any biomarker slider above to simulate how medical therapy or lifestyle modification impacts model risk.
          </span>
        )}
      </div>
    </section>
  );
}
