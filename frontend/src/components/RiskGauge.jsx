import React from 'react';

export function RiskGauge({ probabilityPercentage }) {
  const prob = typeof probabilityPercentage === 'number'
    ? probabilityPercentage
    : parseFloat(probabilityPercentage || 0);

  const clamped = Math.min(98, Math.max(2, prob));

  return (
    <div className="risk-gauge-container">
      <div className="risk-gauge-header">
        <span>Classifier Statistical Decision Score</span>
        <strong>{prob}% Risk of Heart Disease</strong>
      </div>
      <div className="risk-gauge-track" aria-hidden="true">
        <span className="gauge-segment gauge-low" title="Low Risk: 0-35%">
          Low (0–35%)
        </span>
        <span className="gauge-segment gauge-med" title="Moderate Risk: 35-65%">
          Moderate (35–65%)
        </span>
        <span className="gauge-segment gauge-high" title="High Risk: 65-100%">
          High Risk (65–100%)
        </span>
        <span
          className="gauge-pointer"
          style={{ left: `${clamped}%` }}
          aria-label={`Risk score marker at ${prob}%`}
        />
      </div>
      <div className="risk-gauge-scale-labels">
        <span>0%</span>
        <span>35%</span>
        <span>65%</span>
        <span>100%</span>
      </div>
      <p className="risk-gauge-caption">
        Probability reflects the trained logistic regression pipeline&apos;s positive-class decision confidence based on Cleveland biomarker distributions.
      </p>
    </div>
  );
}
