import React from 'react';

export function BiomarkerTile({ label, value, status = 'reference', note }) {
  return (
    <div className={`biomarker-tile ${status}`}>
      <span className="biomarker-label">{label}</span>
      <strong className="biomarker-value">{value}</strong>
      {note && <span className="biomarker-note">{note}</span>}
    </div>
  );
}
