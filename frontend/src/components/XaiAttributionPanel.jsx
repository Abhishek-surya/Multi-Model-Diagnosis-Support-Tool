import React, { useMemo, useState } from 'react';
import { calculateFeatureAttributions } from '../utils/xaiCalculator';

export function XaiAttributionPanel({ formData }) {
  const [filterDirection, setFilterDirection] = useState('all'); // 'all', 'increase', 'decrease'

  const xaiData = useMemo(() => {
    return calculateFeatureAttributions(formData);
  }, [formData]);

  const maxAbsContrib = useMemo(() => {
    const maxVal = Math.max(...xaiData.attributions.map((item) => Math.abs(item.contribution)), 0.1);
    return maxVal;
  }, [xaiData]);

  const displayedAttributions = useMemo(() => {
    if (filterDirection === 'increase') {
      return xaiData.attributions.filter((a) => a.direction === 'increase');
    }
    if (filterDirection === 'decrease') {
      return xaiData.attributions.filter((a) => a.direction === 'decrease');
    }
    return xaiData.attributions;
  }, [xaiData, filterDirection]);

  return (
    <section className="xai-panel card">
      <div className="xai-header">
        <div>
          <span className="eyebrow xai-badge">Explainable AI (XAI)</span>
          <h2 className="section-title">Biomarker Risk Attribution & Decision Drivers</h2>
          <p className="section-intro">
            Mathematical breakdown of which patient features drove the risk prediction <strong>higher</strong> (positive log-odds)
            versus which factors served as <strong>protective</strong> markers (negative log-odds).
          </p>
        </div>
        <div className="xai-filter-tabs">
          <button
            type="button"
            className={`xai-tab-btn ${filterDirection === 'all' ? 'active' : ''}`}
            onClick={() => setFilterDirection('all')}
          >
            All Features ({xaiData.attributions.length})
          </button>
          <button
            type="button"
            className={`xai-tab-btn increase ${filterDirection === 'increase' ? 'active' : ''}`}
            onClick={() => setFilterDirection('increase')}
          >
            Risk Drivers ({xaiData.riskIncreasing.length})
          </button>
          <button
            type="button"
            className={`xai-tab-btn decrease ${filterDirection === 'decrease' ? 'active' : ''}`}
            onClick={() => setFilterDirection('decrease')}
          >
            Protective ({xaiData.riskDecreasing.length})
          </button>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="xai-summary-grid">
        <div className="xai-summary-card increase">
          <span className="summary-title">Top Primary Risk Accelerators</span>
          {xaiData.riskIncreasing.slice(0, 3).map((item) => (
            <div key={item.id} className="summary-row">
              <strong>{item.label}</strong>
              <span className="impact-pill increase">+{item.contribution.toFixed(2)} log-odds</span>
            </div>
          ))}
          {xaiData.riskIncreasing.length === 0 && (
            <p className="no-factors-note">No significant risk accelerators identified.</p>
          )}
        </div>

        <div className="xai-summary-card decrease">
          <span className="summary-title">Top Protective Clinical Markers</span>
          {xaiData.riskDecreasing.slice(0, 3).map((item) => (
            <div key={item.id} className="summary-row">
              <strong>{item.label}</strong>
              <span className="impact-pill decrease">{item.contribution.toFixed(2)} log-odds</span>
            </div>
          ))}
          {xaiData.riskDecreasing.length === 0 && (
            <p className="no-factors-note">No significant protective biomarkers found.</p>
          )}
        </div>
      </div>

      {/* Interactive Waterfall / Divergence Chart */}
      <div className="xai-chart-container">
        <div className="xai-chart-axis-header">
          <span className="axis-label-left">← Reduces Risk (Protective)</span>
          <span className="axis-zero">Baseline (0.0)</span>
          <span className="axis-label-right">Increases Risk (Hazard) →</span>
        </div>

        <div className="xai-bars-list">
          {displayedAttributions.map((attr) => {
            const absWidth = Math.min(100, Math.round((Math.abs(attr.contribution) / maxAbsContrib) * 100));
            const isIncrease = attr.direction === 'increase';

            return (
              <div key={attr.id} className={`xai-bar-row ${attr.direction}`}>
                <div className="xai-row-label">
                  <strong>{attr.label}</strong>
                  <span className="xai-row-value">{attr.value}</span>
                </div>

                <div className="xai-bar-track">
                  {/* Left (protective) zone */}
                  <div className="track-half left">
                    {!isIncrease && (
                      <div
                        className="divergence-bar decrease"
                        style={{ width: `${absWidth}%` }}
                        title={`${attr.label}: ${attr.contribution.toFixed(3)} log-odds`}
                      />
                    )}
                  </div>

                  <div className="track-center-divider" />

                  {/* Right (risk) zone */}
                  <div className="track-half right">
                    {isIncrease && (
                      <div
                        className="divergence-bar increase"
                        style={{ width: `${absWidth}%` }}
                        title={`${attr.label}: +${attr.contribution.toFixed(3)} log-odds`}
                      />
                    )}
                  </div>
                </div>

                <div className="xai-row-score">
                  <span className={`impact-score ${attr.direction}`}>
                    {attr.contribution >= 0 ? `+${attr.contribution.toFixed(2)}` : attr.contribution.toFixed(2)}
                  </span>
                </div>

                {attr.clinicalExplanation && (
                  <div className="xai-row-explanation">
                    {attr.clinicalExplanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="xai-footnote">
        <p>
          <strong>Methodology Note:</strong> Contributions represent standardized linear coefficients ($\beta_i \cdot z_i$)
          derived from the validated multi-model Cleveland pipeline. Log-odds are summed with model intercept ($-0.026$)
          to yield the final sigmoid probability.
        </p>
      </div>
    </section>
  );
}
