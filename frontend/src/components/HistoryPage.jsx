import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TREND_METRICS } from '../constants/clinicalConstants';
import { exportChartsAsJson, parseImportedJson } from '../utils/storage';

export function HistoryPage({
  charts,
  selectedId,
  onSelect,
  onScreen,
  onOpenLatest,
  onOpenVisitReport,
  onUpdateCharts
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all'); // 'all', 'high', 'low'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'visits'
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const ids = Object.keys(charts);

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

  const handleExportBackup = () => {
    exportChartsAsJson(charts);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = parseImportedJson(event.target?.result);
        const merged = { ...charts, ...parsed };
        onUpdateCharts(merged);
        alert(`Successfully imported patient records. Total patients: ${Object.keys(merged).length}`);
      } catch (err) {
        setImportError(err.message || 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeletePatient = (patientId) => {
    const pName = charts[patientId]?.name || patientId;
    if (window.confirm(`Are you sure you want to permanently delete patient "${pName}" (${patientId}) and all their encounter records?`)) {
      const next = { ...charts };
      delete next[patientId];
      onUpdateCharts(next);
      const remainingIds = Object.keys(next);
      if (remainingIds.length > 0) {
        onSelect(remainingIds[0]);
      }
    }
  };

  if (!ids.length) {
    return (
      <section className="card roster-empty-card">
        <h1 className="section-title">Patient Roster &amp; Visit History</h1>
        <p className="section-intro">
          No patient charts on file yet. Save a screening with a patient ID to initialize a longitudinal record,
          or import an existing clinical backup.
        </p>
        <div className="empty-roster-actions">
          <button type="button" className="btn-primary" onClick={onScreen}>
            Start First Screening
          </button>
          <button type="button" className="btn-secondary" onClick={handleImportClick}>
            Import JSON Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
        {importError && <div className="alert-error mt-4">{importError}</div>}
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
          <div className="roster-backup-actions">
            <button
              type="button"
              className="btn-chip"
              onClick={handleExportBackup}
              title="Download full JSON backup of all patient records"
            >
              Export JSON Backup
            </button>
            <button
              type="button"
              className="btn-chip"
              onClick={handleImportClick}
              title="Import or restore patient charts from JSON backup"
            >
              Import Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {importError && <div className="alert-error">{importError}</div>}

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
                <h2 className="section-title">Change Since Last Visit</h2>
                <p className="section-intro">
                  Prior: {formatVisitDate(previous.recordedAt)} · Latest: {formatVisitDate(latest.recordedAt)}
                </p>
                <div className="compare-grid">
                  {TREND_METRICS.map((metric) => (
                    <CompareCard
                      key={metric.key}
                      metric={metric}
                      previousValue={Number(previous.formData[metric.key])}
                      latestValue={Number(latest.formData[metric.key])}
                    />
                  ))}
                  <ImpressionChange previous={previous.result} latest={latest.result} />
                </div>
              </section>
            )}

            {latest && !previous && (
              <div className="status-banner stable">
                Initial visit on file. A second encounter for patient {record.name} will unlock visual change indicators and trend trajectories.
              </div>
            )}

            {/* Trajectory Sparklines */}
            {visits.length >= 2 && (
              <section className="card">
                <h2 className="section-title">Trajectory Across Encounters</h2>
                <div className="trend-grid">
                  {TREND_METRICS.map((metric) => (
                    <TrendChart
                      key={metric.key}
                      metric={metric}
                      values={visits.map((visit) => Number(visit.formData[metric.key]))}
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

function CompareCard({ metric, previousValue, latestValue }) {
  const delta = Math.round((latestValue - previousValue) * 10) / 10;
  const improved = metric.lowerIsBetter ? delta < 0 : delta > 0;
  const worsened = metric.lowerIsBetter ? delta > 0 : delta < 0;
  const tone = delta === 0 ? 'same' : improved ? 'better' : worsened ? 'worse' : 'same';
  const previousWidth = Math.max(8, (previousValue / metric.max) * 100);
  const latestWidth = Math.max(8, (latestValue / metric.max) * 100);

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
        <strong>{previousValue}</strong>
      </div>
      <div className="bar-row">
        <span>Latest</span>
        <div className="bar-track">
          <span className={`bar latest ${tone}`} style={{ width: `${Math.min(100, latestWidth)}%` }} />
        </div>
        <strong>{latestValue}</strong>
      </div>
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
  const max = Math.max(metric.max, ...values, 1);
  const points = values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 90 - (value / max) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <article className="trend-card">
      <h3>{metric.label}</h3>
      <svg viewBox="0 0 100 100" className="sparkline" aria-hidden="true">
        <polyline points={points} fill="none" stroke="#0f766e" strokeWidth="3" />
        {values.map((value, index) => {
          const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100;
          const y = 90 - (value / max) * 70;
          return <circle key={index} cx={x} cy={y} r="2.4" fill="#14b8a6" />;
        })}
      </svg>
      <p>
        {values[0]} → {values[values.length - 1]} {metric.unit}
      </p>
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
