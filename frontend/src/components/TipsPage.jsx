import React from 'react';
import { HEART_TIPS } from '../constants/clinicalConstants';

export function TipsPage() {
  return (
    <>
      <section className="card">
        <p className="eyebrow">Preventive Cardiology Guidance</p>
        <h1 className="section-title">Clinician Counseling Talking Points</h1>
        <p className="section-intro">
          Evidence-based cardiovascular lifestyle and risk-reduction talking points for clinician-patient dialogue.
          Use during clinical encounters to counsel patients on actionable modifiable risk factors.
        </p>
      </section>
      <section className="tips-grid">
        {HEART_TIPS.map((tip) => (
          <article key={tip.title} className="tip-card">
            <h3>{tip.title}</h3>
            <p>{tip.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
