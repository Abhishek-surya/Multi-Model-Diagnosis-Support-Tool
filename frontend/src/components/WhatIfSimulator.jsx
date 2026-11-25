import React, { useMemo, useState } from 'react';
import { calculateSimulatedRisk } from '../utils/xaiCalculator';

export function WhatIfSimulator({ formData }) {
  const [activeTab, setActiveTab] = useState('all');

  // Complete 13-feature counterfactual state
  const [modifications, setModifications] = useState({
    trestbps: formData.trestbps || '130',
    chol: formData.chol || '240',
    thalach: formData.thalach || '150',
    oldpeak: formData.oldpeak || '1.0',
    age: formData.age || '55',
    exang: formData.exang || '0.0',
    fbs: formData.fbs || '0.0',
    cp: formData.cp || '4.0',
    restecg: formData.restecg || '0.0',
    slope: formData.slope || '2.0',
    ca: formData.ca || '0.0',
    thal: formData.thal || '3.0',
    sex: formData.sex || '1.0'
  });

  const simulation = useMemo(() => {
    return calculateSimulatedRisk(formData, modifications);
  }, [formData, modifications]);

  // Identify how many and which fields have been modified from encounter baseline
  const modifiedFieldsList = useMemo(() => {
    const list = [];
    // Sex is excluded as it is an immutable demographic trait
    const keys = ['trestbps', 'chol', 'thalach', 'oldpeak', 'age', 'exang', 'fbs', 'cp', 'restecg', 'slope', 'ca', 'thal'];
    keys.forEach((k) => {
      if (String(modifications[k]) !== String(formData[k] || '')) {
        list.push(k);
      }
    });
    return list;
  }, [formData, modifications]);

  const hasModifications = modifiedFieldsList.length > 0;

  const handleChange = (field, val) => {
    setModifications((prev) => ({
      ...prev,
      [field]: String(val)
    }));
  };

  const resetToBaseline = () => {
    setModifications({
      trestbps: formData.trestbps || '130',
      chol: formData.chol || '240',
      thalach: formData.thalach || '150',
      oldpeak: formData.oldpeak || '1.0',
      age: formData.age || '55',
      exang: formData.exang || '0.0',
      fbs: formData.fbs || '0.0',
      cp: formData.cp || '4.0',
      restecg: formData.restecg || '0.0',
      slope: formData.slope || '2.0',
      ca: formData.ca || '0.0',
      thal: formData.thal || '3.0',
      sex: formData.sex || '1.0'
    });
  };

  const applyOptimalTargetPreset = () => {
    setModifications({
      trestbps: '118',
      chol: '185',
      thalach: Math.max(160, Number(formData.thalach) || 160).toString(),
      oldpeak: '0.2',
      age: formData.age || '55',
      exang: '0.0',
      fbs: '0.0',
      cp: '1.0',
      restecg: '0.0',
      slope: '1.0',
      ca: '0.0',
      thal: '3.0',
      sex: formData.sex || '1.0'
    });
  };

  const applySevereIschemiaPreset = () => {
    setModifications({
      trestbps: '162',
      chol: '285',
      thalach: '118',
      oldpeak: '2.8',
      age: formData.age || '55',
      exang: '1.0',
      fbs: '1.0',
      cp: '4.0',
      restecg: '2.0',
      slope: '2.0',
      ca: '2.0',
      thal: '7.0',
      sex: formData.sex || '1.0'
    });
  };

  const baselineClass = simulation.baseProbability >= 50 ? 'Class 1 (High Risk)' : 'Class 0 (Low Risk)';
  const simulatedClass = simulation.simulatedProbability >= 50 ? 'Class 1 (High Risk)' : 'Class 0 (Low Risk)';

  return (
    <section className="card what-if-card">
      <div className="what-if-header">
        <div>
          <span className="eyebrow sim-badge">Counterfactual Decision Modeling</span>
          <h2 className="section-title">Interactive &quot;What-If&quot; Risk Simulator (12 Clinical Features)</h2>
          <p className="section-intro">
            Simulate how clinical interventions, lifestyle changes, or diagnostic improvements across <strong>all 12 modifiable &amp; clinical biomarkers</strong> would
            shift this patient&apos;s predicted risk of heart disease in real time.
          </p>
        </div>
        <div className="what-if-actions">
          <button
            type="button"
            className="btn-chip"
            onClick={applyOptimalTargetPreset}
            title="Simulate optimal clinical guideline targets across all modifiable biomarkers"
          >
            ✓ Optimal Guidelines Preset
          </button>
          <button
            type="button"
            className="btn-chip"
            onClick={applySevereIschemiaPreset}
            title="Simulate acute ischemic worsening and multi-vessel burden"
          >
            ⚠️ Ischemic Stress Preset
          </button>
          {hasModifications && (
            <button
              type="button"
              className="btn-chip reset"
              onClick={resetToBaseline}
              title="Reset all parameters back to patient's recorded encounter findings"
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

      {/* Active Modification Count Pill */}
      <div className="sim-mod-counter-bar">
        <span>
          {hasModifications ? (
            <>
              <strong>{modifiedFieldsList.length} of 12</strong> clinical parameters currently modified from encounter baseline.
            </>
          ) : (
            'All parameters match patient encounter baseline. Adjust any slider or control below.'
          )}
        </span>
      </div>

      {/* Category Tabs for the 12 Features */}
      <div className="sim-category-tabs">
        <button
          type="button"
          className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All 12 Features
        </button>
        <button
          type="button"
          className={`filter-chip ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          Hemodynamics &amp; Vitals (5)
        </button>
        <button
          type="button"
          className={`filter-chip ${activeTab === 'ecg' ? 'active' : ''}`}
          onClick={() => setActiveTab('ecg')}
        >
          ECG &amp; Stress Testing (4)
        </button>
        <button
          type="button"
          className={`filter-chip ${activeTab === 'imaging' ? 'active' : ''}`}
          onClick={() => setActiveTab('imaging')}
        >
          Anatomy &amp; Imaging (3)
        </button>
        <button
          type="button"
          className={`filter-chip ${activeTab === 'demo' ? 'active' : ''}`}
          onClick={() => setActiveTab('demo')}
        >
          Patient Age (1)
        </button>
      </div>

      {/* Interactive Controls Grid */}
      <div className="sim-sliders-grid">
        {/* --- GROUP 1: HEMODYNAMICS & METABOLIC VITALS --- */}
        {(activeTab === 'all' || activeTab === 'vitals') && (
          <>
            {/* 1. Resting Blood Pressure */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('trestbps') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label htmlFor="sim-trestbps">Resting Blood Pressure (trestbps)</label>
                <span className="sim-current-val">{modifications.trestbps} mm Hg</span>
              </div>
              <input
                id="sim-trestbps"
                type="range"
                min="90"
                max="200"
                step="1"
                value={modifications.trestbps}
                onChange={(e) => handleChange('trestbps', e.target.value)}
                className="sim-slider"
              />
              <div className="sim-range-hints">
                <span>Optimal (&lt;120)</span>
                <span>Prehypertension (120–139)</span>
                <span>Stage 2 (140+)</span>
              </div>
            </div>

            {/* 2. Serum Cholesterol */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('chol') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label htmlFor="sim-chol">Serum Cholesterol (chol)</label>
                <span className="sim-current-val">{modifications.chol} mg/dL</span>
              </div>
              <input
                id="sim-chol"
                type="range"
                min="120"
                max="380"
                step="2"
                value={modifications.chol}
                onChange={(e) => handleChange('chol', e.target.value)}
                className="sim-slider"
              />
              <div className="sim-range-hints">
                <span>Desirable (&lt;200)</span>
                <span>Borderline (200–239)</span>
                <span>Elevated (240+)</span>
              </div>
            </div>

            {/* 3. Peak Heart Rate */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('thalach') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label htmlFor="sim-thalach">Peak Exercise Heart Rate (thalach)</label>
                <span className="sim-current-val">{modifications.thalach} bpm</span>
              </div>
              <input
                id="sim-thalach"
                type="range"
                min="80"
                max="210"
                step="1"
                value={modifications.thalach}
                onChange={(e) => handleChange('thalach', e.target.value)}
                className="sim-slider"
              />
              <div className="sim-range-hints">
                <span>Chronotropic Incompetence (&lt;120)</span>
                <span>Target Reserve (150+)</span>
              </div>
            </div>

            {/* 4. Fasting Blood Sugar */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('fbs') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Fasting Blood Sugar (fbs)</label>
                <span className="sim-current-val">{modifications.fbs === '1.0' ? '> 120 mg/dL' : '<= 120 mg/dL'}</span>
              </div>
              <div className="sim-toggle-buttons">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.fbs === '0.0' ? 'active' : ''}`}
                  onClick={() => handleChange('fbs', '0.0')}
                >
                  &lt;= 120 mg/dL (Normal)
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.fbs === '1.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('fbs', '1.0')}
                >
                  &gt; 120 mg/dL (Elevated)
                </button>
              </div>
            </div>
          </>
        )}

        {/* --- GROUP 2: ELECTROCARDIOGRAPHY & EXERCISE STRESS --- */}
        {(activeTab === 'all' || activeTab === 'ecg') && (
          <>
            {/* 5. ST Depression */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('oldpeak') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label htmlFor="sim-oldpeak">ST Depression (oldpeak)</label>
                <span className="sim-current-val">{modifications.oldpeak} mm</span>
              </div>
              <input
                id="sim-oldpeak"
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                value={modifications.oldpeak}
                onChange={(e) => handleChange('oldpeak', e.target.value)}
                className="sim-slider"
              />
              <div className="sim-range-hints">
                <span>Normal (&lt;1.0)</span>
                <span>Mild Ischemia (1.0–1.9)</span>
                <span>Severe (&ge;2.0)</span>
              </div>
            </div>

            {/* 6. Exercise Induced Angina Toggle */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('exang') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Exertional Chest Pain (exang)</label>
                <span className="sim-current-val">{modifications.exang === '1.0' ? 'Yes (Angina)' : 'No (Absent)'}</span>
              </div>
              <div className="sim-toggle-buttons">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.exang === '0.0' ? 'active' : ''}`}
                  onClick={() => handleChange('exang', '0.0')}
                >
                  No Angina Provoked
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.exang === '1.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('exang', '1.0')}
                >
                  Angina Induced by Exertion
                </button>
              </div>
            </div>

            {/* 7. Peak ST Slope */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('slope') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Peak Exercise ST Slope (slope)</label>
                <span className="sim-current-val">
                  {modifications.slope === '1.0' ? 'Upsloping' : modifications.slope === '2.0' ? 'Flat' : 'Downsloping'}
                </span>
              </div>
              <div className="sim-toggle-buttons segmented">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.slope === '1.0' ? 'active' : ''}`}
                  onClick={() => handleChange('slope', '1.0')}
                >
                  1: Upsloping (Normal)
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.slope === '2.0' ? 'active caution' : ''}`}
                  onClick={() => handleChange('slope', '2.0')}
                >
                  2: Flat (Equivocal)
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.slope === '3.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('slope', '3.0')}
                >
                  3: Downsloping
                </button>
              </div>
            </div>

            {/* 8. Resting ECG */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('restecg') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Resting ECG Tracing (restecg)</label>
                <span className="sim-current-val">
                  {modifications.restecg === '0.0' ? 'Normal' : modifications.restecg === '1.0' ? 'ST-T Wave' : 'LVH'}
                </span>
              </div>
              <div className="sim-toggle-buttons segmented">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.restecg === '0.0' ? 'active' : ''}`}
                  onClick={() => handleChange('restecg', '0.0')}
                >
                  0: Normal
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.restecg === '1.0' ? 'active caution' : ''}`}
                  onClick={() => handleChange('restecg', '1.0')}
                >
                  1: ST-T Abnormality
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.restecg === '2.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('restecg', '2.0')}
                >
                  2: LV Hypertrophy
                </button>
              </div>
            </div>
          </>
        )}

        {/* --- GROUP 3: CARDIAC IMAGING & ANATOMY --- */}
        {(activeTab === 'all' || activeTab === 'imaging') && (
          <>
            {/* 9. Fluoroscopy Major Vessels (ca) */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('ca') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Fluoroscopy Vessels Calcified (ca)</label>
                <span className="sim-current-val">{modifications.ca} vessel(s)</span>
              </div>
              <div className="sim-toggle-buttons segmented">
                {['0.0', '1.0', '2.0', '3.0'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`sim-toggle-btn ${modifications.ca === v ? (v === '0.0' ? 'active' : 'active danger') : ''}`}
                    onClick={() => handleChange('ca', v)}
                  >
                    {v === '0.0' ? '0 (Patent)' : `${parseInt(v, 10)} vessel`}
                  </button>
                ))}
              </div>
            </div>

            {/* 10. Thallium Myocardial Perfusion (thal) */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('thal') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Thallium Perfusion Scintigraphy (thal)</label>
                <span className="sim-current-val">
                  {modifications.thal === '3.0' ? 'Normal' : modifications.thal === '6.0' ? 'Fixed Defect' : 'Reversible'}
                </span>
              </div>
              <div className="sim-toggle-buttons segmented">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.thal === '3.0' ? 'active' : ''}`}
                  onClick={() => handleChange('thal', '3.0')}
                >
                  3: Normal Blood Flow
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.thal === '6.0' ? 'active caution' : ''}`}
                  onClick={() => handleChange('thal', '6.0')}
                >
                  6: Fixed Defect (Scar)
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.thal === '7.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('thal', '7.0')}
                >
                  7: Reversible Defect
                </button>
              </div>
            </div>

            {/* 11. Chest Pain Presentation (cp) */}
            <div className={`sim-control-group ${modifiedFieldsList.includes('cp') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label>Chest Pain Symptom Pattern (cp)</label>
                <span className="sim-current-val">
                  {modifications.cp === '1.0'
                    ? 'Typical Angina'
                    : modifications.cp === '2.0'
                      ? 'Atypical Angina'
                      : modifications.cp === '3.0'
                        ? 'Non-anginal'
                        : 'Asymptomatic (Silent)'}
                </span>
              </div>
              <div className="sim-toggle-buttons segmented">
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.cp === '1.0' ? 'active' : ''}`}
                  onClick={() => handleChange('cp', '1.0')}
                >
                  1: Typical
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.cp === '2.0' ? 'active' : ''}`}
                  onClick={() => handleChange('cp', '2.0')}
                >
                  2: Atypical
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.cp === '3.0' ? 'active' : ''}`}
                  onClick={() => handleChange('cp', '3.0')}
                >
                  3: Non-anginal
                </button>
                <button
                  type="button"
                  className={`sim-toggle-btn ${modifications.cp === '4.0' ? 'active danger' : ''}`}
                  onClick={() => handleChange('cp', '4.0')}
                >
                  4: Asymptomatic
                </button>
              </div>
            </div>
          </>
        )}

        {/* --- GROUP 4: DEMOGRAPHICS (PATIENT AGE) --- */}
        {(activeTab === 'all' || activeTab === 'demo') && (
          <>
            {/* 12. Patient Age */}
            <div className={`sim-control-group full ${modifiedFieldsList.includes('age') ? 'modified' : ''}`}>
              <div className="sim-control-header">
                <label htmlFor="sim-age">Chronological Age (age)</label>
                <span className="sim-current-val">{modifications.age} years</span>
              </div>
              <input
                id="sim-age"
                type="range"
                min="25"
                max="85"
                step="1"
                value={modifications.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="sim-slider"
              />
              <div className="sim-range-hints">
                <span>Low Risk (&lt;45)</span>
                <span>Middle-Aged (45–64)</span>
                <span>Advanced (65+)</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="sim-takeaway-box">
        <strong>Clinician Counseling Guidance:</strong>{' '}
        {simulation.delta < 0 ? (
          <span>
            Achieving these simulated targets lowers positive-class risk from{' '}
            <strong>{simulation.baseProbability}%</strong> to <strong>{simulation.simulatedProbability}%</strong>{' '}
            (a <strong>{simulation.reductionMagnitude}% absolute risk reduction</strong>).
            {simulation.simulatedProbability < 50 && simulation.baseProbability >= 50 && (
              <em> Patient successfully transitions from High Risk (Class 1) to Low Risk (Class 0) classification threshold!</em>
            )}
          </span>
        ) : simulation.delta > 0 ? (
          <span>
            These simulated parameter shifts elevate statistical risk by{' '}
            <strong>+{simulation.delta}%</strong> (from <strong>{simulation.baseProbability}%</strong> to <strong>{simulation.simulatedProbability}%</strong>).
            {simulation.simulatedProbability >= 50 && simulation.baseProbability < 50 && (
              <em> Patient crosses the threshold into High Risk (Class 1) territory!</em>
            )}
          </span>
        ) : (
          <span>
            Move any biomarker slider or toggle any diagnostic category above to simulate how targeted medical therapy,
            revascularization, or progression across all 13 features impacts model risk.
          </span>
        )}
      </div>
    </section>
  );
}
