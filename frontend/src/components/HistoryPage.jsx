import React, { useEffect, useMemo, useState } from 'react';
import { TREND_METRICS } from '../constants/clinicalConstants';

export function HistoryPage({
  charts,
  selectedId,
  onSelect,
  onScreen,
  onOpenLatest,
  onOpenVisitReport,
  onDeletePatient,
  onClearAllPatients,
  onUpdateCharts
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'low'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'visits'
  const [metricCategory, setMetricCategory] = useState('all'); // 'all', 'vitals', 'ecg', 'imaging', 'demo'

  const ids = Object.keys(charts);

  const displayedMetrics = useMemo(() => {
    if (metricCategory === 'all') return TREND_METRICS;
    return TREND_METRICS.filter((m) => m.category === metricCategory);
  }, [metricCategory]);

  // Compute patient entries with metadata for filtering & sorting
  const patientRoster = useMemo(() => {
    return ids.map((id) => {
      const record = charts[id];
      const visits = record.visits || [];
      const latest = visits.length ? visits[visits.length - 1] : null;
      const latestRiskClass = latest?.result?.predicted_class;
      const latestProb = latest?.result?.probability_percentage;
      const lastRecorded = latest?.recordedAt ? new Date(latest.recordedAt).getTime() : 0;

      return {
        id,
        name: record.name,
        visits,
        visitCount: visits.length,
        latest,
        latestRiskClass,
        latestProb,
        lastRecorded
      };
    });
  }, [charts, ids]);

  // Counts for filter chips
  const highRiskCount = useMemo(() => {
    return patientRoster.filter((p) => p.latestRiskClass === 1).length;
  }, [patientRoster]);

  const lowRiskCount = useMemo(() => {
    return patientRoster.filter((p) => p.latestRiskClass === 0).length;
  }, [patientRoster]);

  // Filtered & sorted roster
  const filteredRoster = useMemo(() => {
    let result = patientRoster;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query)
      );
    }

    // Risk category filter
    if (riskFilter === 'high') {
      result = result.filter((p) => p.latestRiskClass === 1);
    } else if (riskFilter === 'low') {
      result = result.filter((p) => p.latestRiskClass === 0);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'visits') {
        return b.visitCount - a.visitCount;
      }
      // 'recent'
      return b.lastRecorded - a.lastRecorded;
    });

    return result;
  }, [patientRoster, searchQuery, riskFilter, sortBy]);

  const activeId = charts[selectedId] ? selectedId : filteredRoster[0]?.id || ids[0] || '';
  const record = activeId ? charts[activeId] : null;
  const visits = record?.visits || [];
  const previous = visits.length >= 2 ? visits[visits.length - 2] : null;
  const latest = visits.length ? visits[visits.length - 1] : null;

  useEffect(() => {
    if (activeId && activeId !== selectedId) {
      onSelect(activeId);
    }
  }, [activeId, selectedId, onSelect]);

  const handleDeletePatient = (patientId) => {
    const pName = charts[patientId]?.name || patientId;
    if (window.confirm(`Are you sure you want to permanently delete patient "${pName}" (${patientId}) and all their encounter records?`)) {
      if (onDeletePatient) {
        onDeletePatient(patientId);
      } else if (onUpdateCharts) {
        const next = { ...charts };
        delete next[patientId];
        onUpdateCharts(next);
      }
      const remainingIds = Object.keys(charts).filter((id) => id !== patientId);
      if (remainingIds.length > 0) {
        onSelect(remainingIds[0]);
      } else {
        onSelect('');
      }
    }
  };

  const handleClearAllPatients = () => {
    if (window.confirm('Are you sure you want to permanently delete ALL patients and all clinical encounters from your records? This cannot be undone.')) {
      if (onClearAllPatients) {
        onClearAllPatients();
      } else if (onUpdateCharts) {
        onUpdateCharts({});
      }
      onSelect('');
    }
  };

  if (!ids.length) {
    return (
      <section className="card roster-empty-card">
        <h1 className="section-title">Patient Roster &amp; Visit History</h1>
        <p className="section-intro">
          No patient charts on file yet. Save a screening with a patient ID to initialize a longitudinal record.
        </p>
        <div className="empty-roster-actions">
          <button type="button" className="btn-primary" onClick={onScreen}>
            Start First Screening
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Roster Controls Toolbar */}
      <section className="card roster-toolbar-card">
        <div className="roster-toolbar-header">
          <div>
            <span className="eyebrow">Patient Management</span>
            <h1 className="section-title">Clinical Roster &amp; Longitudinal History</h1>
          </div>
          <div className="roster-header-actions">
            <button
              type="button"
              className="btn-chip delete-btn"
              onClick={handleClearAllPatients}
              title="Permanently delete all patients and encounter history"
            >
              Clear All Patients
            </button>
          </div>
        </div>

        <div className="roster-filters-row">
          <div className="roster-search-box">
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="roster-filter-chips">
            <button
              type="button"
              className={`filter-chip ${riskFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRiskFilter('all')}
            >
              All ({patientRoster.length})
            </button>
            <button
              type="button"
              className={`filter-chip high ${riskFilter === 'high' ? 'active' : ''}`}
              onClick={() => setRiskFilter('high')}
            >
              High Risk ({highRiskCount})
            </button>
            <button
              type="button"
              className={`filter-chip low ${riskFilter === 'low' ? 'active' : ''}`}
              onClick={() => setRiskFilter('low')}
            >
              Low Risk ({lowRiskCount})
            </button>
          </div>

          <div className="roster-sort-box">
            <label htmlFor="roster-sort">Sort by:</label>
            <select
              id="roster-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="recent">Most Recent Encounter</option>
              <option value="name">Patient Name (A-Z)</option>
              <option value="visits">Visit Count (High to Low)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Roster Layout: Left Rail + Right Patient Chart */}
      <section className="history-layout">
        <aside className="card patient-rail">
          <div className="rail-header">
            <h2>Patients ({filteredRoster.length})</h2>
            <button type="button" className="btn-link" onClick={onScreen}>
              + Add
            </button>
          </div>

          <div className="patient-rail-list">
            {filteredRoster.map((patient) => {
              const isSelected = patient.id === activeId;
              const hasRisk = patient.latestRiskClass === 1;

              return (
                <button
                  key={patient.id}
                  type="button"
                  className={`patient-row ${isSelected ? 'active' : ''}`}
                  onClick={() => onSelect(patient.id)}
                >
                  <div className="patient-row-info">
                    <strong>{patient.name}</strong>
                    <em>{patient.id}</em>
                  </div>
                  <div className="patient-badges">
                    {patient.latestRiskClass !== undefined && (
                      <span className={`pill ${hasRisk ? 'high' : 'healthy'}`}>
                        {hasRisk ? 'Risk (Class 1)' : 'Low Risk'}
                      </span>
                    )}
                    <span className="pill reference">
                      {patient.visitCount} visit{patient.visitCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
              );
            })}

            {filteredRoster.length === 0 && (
              <div className="no-patients-match">
                <p>No patients match your search or filter.</p>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setSearchQuery('');
                    setRiskFilter('all');
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Selected Patient Details & Longitudinal Charts */}
        {record && (
          <div className="patient-chart-content">
            <section className="card patient-header-card">
              <div className="patient-card-header">
                <div>
                  <span className="eyebrow">Longitudinal Chart</span>
                  <h1 className="section-title">{record.name}</h1>
                  <p className="section-intro">
                    Patient ID: <strong>{activeId}</strong> · {visits.length} visit{visits.length === 1 ? '' : 's'} on record.
                  </p>
                </div>
                <div className="patient-card-actions">
                  <button type="button" className="btn-primary" onClick={onScreen}>
                    Add Visit
                  </button>
                  <button
                    type="button"
                    className="btn-chip delete-btn"
                    onClick={() => handleDeletePatient(activeId)}
                    title="Delete patient and their history"
                  >
                    Delete Patient
                  </button>
                </div>
              </div>
            </section>

            {/* Change Since Last Encounter */}
            {latest && previous && (
              <section className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <h2 className="section-title">Change Since Last Visit</h2>
                    <p className="section-intro">
                      Prior: {formatVisitDate(previous.recordedAt)} · Latest: {formatVisitDate(latest.recordedAt)}
                    </p>
                  </div>
                  <div className="roster-filter-chips">
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('all')}
                    >
                      All Features ({TREND_METRICS.length})
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'vitals' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('vitals')}
                    >
                      Vitals &amp; Labs
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'ecg' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('ecg')}
                    >
                      ECG &amp; Symptoms
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'imaging' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('imaging')}
                    >
                      Vascular &amp; Scans
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'demo' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('demo')}
                    >
                      Age
                    </button>
                  </div>
                </div>

                <div className="compare-grid">
                  <ImpressionChange previous={previous.result} latest={latest.result} />
                  {displayedMetrics.map((metric) => (
                    <CompareCard
                      key={metric.key}
                      metric={metric}
                      previousRaw={getEncounterMetricValue(previous, metric)}
                      latestRaw={getEncounterMetricValue(latest, metric)}
                    />
                  ))}
                </div>
              </section>
            )}

            {latest && !previous && (
              <div className="status-banner stable">
                Initial visit on file. A second encounter for patient {record.name} will unlock visual change indicators and trend trajectories across all 13 clinical biomarkers.
              </div>
            )}

            {/* Trajectory Sparklines */}
            {visits.length >= 2 && (
              <section className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <h2 className="section-title">Trajectory Across Encounters</h2>
                    <p className="section-intro">Longitudinal progression of all clinical features across {visits.length} clinical visits.</p>
                  </div>
                  <div className="roster-filter-chips">
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('all')}
                    >
                      All Features ({TREND_METRICS.length})
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'vitals' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('vitals')}
                    >
                      Vitals &amp; Labs
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'ecg' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('ecg')}
                    >
                      ECG &amp; Symptoms
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'imaging' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('imaging')}
                    >
                      Vascular &amp; Scans
                    </button>
                    <button
                      type="button"
                      className={`filter-chip ${metricCategory === 'demo' ? 'active' : ''}`}
                      onClick={() => setMetricCategory('demo')}
                    >
                      Age
                    </button>
                  </div>
                </div>

                <div className="trend-grid">
                  {displayedMetrics.map((metric) => (
                    <TrendChart
                      key={metric.key}
                      metric={metric}
                      values={visits.map((visit) => getEncounterMetricValue(visit, metric))}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Visit Timeline */}
            <section className="card">
              <h2 className="section-title">Encounter Timeline</h2>
              <ol className="timeline">
                {[...visits].reverse().map((visit, index) => {
                  const isRisk = visit.result?.predicted_class === 1;
                  const prob = visit.result?.probability_percentage ??
                    (visit.result?.probability != null ? Math.round(visit.result.probability * 1000) / 10 : null);

                  return (
                    <li key={visit.id}>
                      <span className={`dot ${isRisk ? 'attention' : 'stable'}`} />
                      <div>
                        <div className="timeline-header">
                          <strong>{index === 0 ? 'Latest Encounter' : `Visit ${visits.length - index}`}</strong>
                          <span className={`pill ${isRisk ? 'high' : 'healthy'}`}>
                            {isRisk ? 'Target: Risk (Class 1)' : 'Target: Low Risk (Class 0)'}
                            {prob != null ? ` · ${prob}%` : ''}
                          </span>
                        </div>
                        <p className="timeline-meta">{formatVisitDate(visit.recordedAt)}</p>
                        <p className="timeline-vitals">
                          BP {visit.formData.trestbps} mm Hg · Chol {visit.formData.chol} mg/dL · HR {visit.formData.thalach} bpm · ST Dep {visit.formData.oldpeak} mm
                        </p>
                        {visit.result && onOpenVisitReport && (
                          <div className="timeline-actions">
                            <button
                              type="button"
                              className="btn-link"
                              onClick={() => onOpenVisitReport(visit, record.name)}
                            >
                              View full prediction report →
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>
        )}
      </section>
    </>
  );
}

function getEncounterMetricValue(encounter, metric) {
  if (!encounter) return null;
  if (metric.isModel || metric.key === 'probability') {
    const prob = encounter.result?.probability_percentage ??
      (encounter.result?.probability != null ? Math.round(encounter.result.probability * 1000) / 10 : null);
    return prob;
  }
  const raw = encounter.formData?.[metric.key];
  return raw !== undefined && raw !== null ? raw : null;
}

function CompareCard({ metric, previousRaw, latestRaw }) {
  if (metric.categorical) {
    const prevStr = previousRaw !== null && previousRaw !== undefined ? String(previousRaw) : '';
    const latestStr = latestRaw !== null && latestRaw !== undefined ? String(latestRaw) : '';
    const prevText = metric.labels?.[prevStr] || metric.labels?.[`${Number(prevStr).toFixed(1)}`] || (prevStr ? `Type ${prevStr}` : '—');
    const currText = metric.labels?.[latestStr] || metric.labels?.[`${Number(latestStr).toFixed(1)}`] || (latestStr ? `Type ${latestStr}` : '—');
    const changed = prevStr !== latestStr;

    let tone = 'same';
    if (changed && metric.lowerIsBetter !== null) {
      const pNum = Number(prevStr);
      const cNum = Number(latestStr);
      if (!isNaN(pNum) && !isNaN(cNum)) {
        tone = (metric.lowerIsBetter ? cNum < pNum : cNum > pNum) ? 'better' : 'worse';
      }
    }

    return (
      <article className="compare-card">
        <header>
          <h3>{metric.label}</h3>
          <span className={`delta ${tone}`}>
            {!changed ? 'Unchanged' : tone === 'better' ? 'Improved' : tone === 'worse' ? 'Worsened' : 'Changed'}
          </span>
        </header>
        <div className="cat-compare-rows">
          <div className="cat-row">
            <span className="cat-label">Prior:</span>
            <span className="cat-val">{prevText}</span>
          </div>
          <div className="cat-row">
            <span className="cat-label">Latest:</span>
            <span className={`cat-val ${tone === 'better' ? 'text-stable' : tone === 'worse' ? 'text-attention' : ''}`}>{currText}</span>
          </div>
        </div>
        {metric.description && <p className="cat-hint">{metric.description}</p>}
      </article>
    );
  }

  const prevNum = Number(previousRaw) || 0;
  const latestNum = Number(latestRaw) || 0;
  const delta = Math.round((latestNum - prevNum) * 10) / 10;
  const improved = metric.lowerIsBetter === null ? false : (metric.lowerIsBetter ? delta < 0 : delta > 0);
  const worsened = metric.lowerIsBetter === null ? false : (metric.lowerIsBetter ? delta > 0 : delta < 0);
  const tone = delta === 0 ? 'same' : improved ? 'better' : worsened ? 'worse' : 'same';
  const max = Math.max(metric.max || 1, prevNum, latestNum, 1);
  const previousWidth = Math.max(8, (prevNum / max) * 100);
  const latestWidth = Math.max(8, (latestNum / max) * 100);

  return (
    <article className="compare-card">
      <header>
        <h3>{metric.label}</h3>
        <span className={`delta ${tone}`}>
          {delta === 0 ? 'No change' : `${delta > 0 ? '+' : ''}${delta} ${metric.unit}`.trim()}
        </span>
      </header>
      <div className="bar-row">
        <span>Prior</span>
        <div className="bar-track">
          <span className="bar prior" style={{ width: `${Math.min(100, previousWidth)}%` }} />
        </div>
        <strong>{prevNum} {metric.unit}</strong>
      </div>
      <div className="bar-row">
        <span>Latest</span>
        <div className="bar-track">
          <span className={`bar latest ${tone}`} style={{ width: `${Math.min(100, latestWidth)}%` }} />
        </div>
        <strong>{latestNum} {metric.unit}</strong>
      </div>
      {metric.description && <p className="cat-hint">{metric.description}</p>}
    </article>
  );
}

function ImpressionChange({ previous, latest }) {
  const prevClass = previous?.predicted_class;
  const currClass = latest?.predicted_class;
  const before = prevClass === 1 ? 'Risk Detected (Class 1)' : prevClass === 0 ? 'Low Risk (Class 0)' : 'Not assessed';
  const after = currClass === 1 ? 'Risk Detected (Class 1)' : currClass === 0 ? 'Low Risk (Class 0)' : 'Not assessed';
  const changed = prevClass !== undefined && currClass !== undefined && prevClass !== currClass;
  const tone = !changed ? 'same' : currClass === 1 ? 'worse' : 'better';

  const prevProb = previous?.probability_percentage ??
    (previous?.probability != null ? Math.round(previous.probability * 1000) / 10 : null);
  const currProb = latest?.probability_percentage ??
    (latest?.probability != null ? Math.round(latest.probability * 1000) / 10 : null);

  return (
    <article className="compare-card">
      <header>
        <h3>Target Label Prediction</h3>
        <span className={`delta ${tone}`}>{changed ? 'Status Changed' : 'Unchanged'}</span>
      </header>
      <p className="impression-line">
        {before} <span aria-hidden="true">→</span> {after}
      </p>
      {currProb != null && prevProb != null && (
        <p className="impression-sub">
          Risk probability: {prevProb}% → {currProb}% ({currProb >= prevProb ? '+' : ''}{Math.round((currProb - prevProb) * 10) / 10}%)
        </p>
      )}
    </article>
  );
}

function TrendChart({ metric, values }) {
  const numValues = values.map((v) => (v !== null && v !== undefined ? Number(v) : 0));
  const max = Math.max(metric.max || 1, ...numValues, 1);
  const points = numValues
    .map((value, index) => {
      const x = numValues.length === 1 ? 50 : (index / (numValues.length - 1)) * 100;
      const y = 90 - (value / max) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  let subText = '';
  if (metric.categorical) {
    const firstStr = values[0] !== null && values[0] !== undefined ? String(values[0]) : '';
    const lastStr = values[values.length - 1] !== null && values[values.length - 1] !== undefined ? String(values[values.length - 1]) : '';
    const firstLabel = metric.labels?.[firstStr] || metric.labels?.[`${Number(firstStr).toFixed(1)}`] || firstStr;
    const lastLabel = metric.labels?.[lastStr] || metric.labels?.[`${Number(lastStr).toFixed(1)}`] || lastStr;
    subText = `${firstLabel} → ${lastLabel}`;
  } else {
    subText = `${values[0]} → ${values[values.length - 1]} ${metric.unit}`.trim();
  }

  return (
    <article className="trend-card">
      <h3>{metric.label}</h3>
      <svg viewBox="0 0 100 100" className="sparkline" aria-hidden="true">
        <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="3" />
        {numValues.map((value, index) => {
          const x = numValues.length === 1 ? 50 : (index / (numValues.length - 1)) * 100;
          const y = 90 - (value / max) * 70;
          return <circle key={index} cx={x} cy={y} r="2.8" fill="#14b8a6" />;
        })}
      </svg>
      <p title={subText}>{subText}</p>
    </article>
  );
}

function formatVisitDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return iso;
  }
}
