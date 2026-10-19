import React, { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';
const CHART_STORE_KEY = 'heartcare-clinician-charts';

const emptyForm = {
  patientId: '',
  patientName: '',
  age: '',
  sex: '',
  cp: '',
  trestbps: '',
  chol: '',
  fbs: '',
  restecg: '',
  thalach: '',
  exang: '',
  oldpeak: '',
  slope: '',
  ca: '',
  thal: ''
};

const numberRules = {
  age: { min: 1, max: 120, label: 'Age' },
  trestbps: { min: 50, max: 260, label: 'Resting blood pressure' },
  chol: { min: 50, max: 650, label: 'Cholesterol' },
  thalach: { min: 50, max: 250, label: 'Maximum heart rate' },
  oldpeak: { min: 0, max: 10, label: 'ST depression' }
};

const requiredSelects = {
  sex: 'Please select biological sex.',
  cp: 'Please select a chest pain type.',
  fbs: 'Please select a fasting blood sugar result.',
  restecg: 'Please select a resting ECG result.',
  exang: 'Please select whether exercise caused chest pain.',
  slope: 'Please select the ST slope from the report.',
  ca: 'Please select the number of major vessels.',
  thal: 'Please select the thalassemia result.'
};

const CP_LABELS = {
  '1.0': 'Typical angina',
  '2.0': 'Atypical angina',
  '3.0': 'Non-anginal pain',
  '4.0': 'Asymptomatic'
};

const SLOPE_LABELS = {
  '1.0': 'Upsloping',
  '2.0': 'Flat',
  '3.0': 'Downsloping'
};

const THAL_LABELS = {
  '3.0': 'Normal',
  '6.0': 'Fixed defect',
  '7.0': 'Reversible defect'
};

const RESTECG_LABELS = {
  '0.0': 'Normal',
  '1.0': 'ST-T wave abnormality',
  '2.0': 'Left ventricular hypertrophy'
};

const SAMPLE_PROFILES = {
  highRisk: {
    patientId: 'PT-8801',
    patientName: 'Robert Vance',
    age: '63',
    sex: '1.0',
    cp: '1.0',
    trestbps: '152',
    chol: '286',
    fbs: '1.0',
    restecg: '2.0',
    thalach: '124',
    exang: '1.0',
    oldpeak: '2.6',
    slope: '2.0',
    ca: '2.0',
    thal: '7.0'
  },
  lowRisk: {
    patientId: 'PT-1042',
    patientName: 'Sarah Jenkins',
    age: '42',
    sex: '0.0',
    cp: '3.0',
    trestbps: '115',
    chol: '178',
    fbs: '0.0',
    restecg: '0.0',
    thalach: '168',
    exang: '0.0',
    oldpeak: '0.2',
    slope: '1.0',
    ca: '0.0',
    thal: '3.0'
  }
};

const HEART_TIPS = [
  {
    title: 'Diet counseling',
    body: 'Encourage vegetables, fruit, whole grains, legumes, nuts, and fish. Limit fried food, processed meat, and sugary drinks.'
  },
  {
    title: 'Sodium',
    body: 'Aim for less than 5 grams of salt a day. Suggest herbs and lemon instead of extra table salt.'
  },
  {
    title: 'Activity',
    body: 'Recommend 150 minutes of moderate activity a week. Short walks after meals help blood pressure and cholesterol.'
  },
  {
    title: 'Follow-up numbers',
    body: 'Recheck blood pressure, cholesterol, blood sugar, and weight as clinically indicated, especially after age 40.'
  },
  {
    title: 'Sleep and stress',
    body: 'Target 7–9 hours of sleep. Breathing practice and regular routines can lower cardiac strain.'
  },
  {
    title: 'Tobacco and alcohol',
    body: 'Advise no smoking or vaping. If alcohol is used, keep intake light.'
  },
  {
    title: 'Weight',
    body: 'Central adiposity raises blood pressure and cholesterol. Support small, sustained meal and activity changes.'
  },
  {
    title: 'Warning signs',
    body: 'Chest pressure, arm or jaw pain, sudden breathlessness, or syncope needs urgent evaluation.'
  }
];

const REFERENCE_RANGES = [
  {
    id: 'bp',
    label: 'Resting blood pressure',
    unit: 'mm Hg',
    healthy: '90–120',
    caution: '121–139',
    high: '140+',
    min: 70,
    max: 200,
    healthyMin: 90,
    healthyMax: 120,
    formKey: 'trestbps'
  },
  {
    id: 'chol',
    label: 'Total cholesterol',
    unit: 'mg/dL',
    healthy: 'Under 200',
    caution: '200–239',
    high: '240+',
    min: 80,
    max: 400,
    healthyMin: 80,
    healthyMax: 199,
    formKey: 'chol'
  },
  {
    id: 'hr',
    label: 'Peak heart rate',
    unit: 'bpm',
    healthy: 'Age-adjusted target',
    caution: 'Below expected',
    high: 'Above expected',
    min: 50,
    max: 220,
    healthyMin: 100,
    healthyMax: 170,
    formKey: 'thalach'
  },
  {
    id: 'sugar',
    label: 'Fasting blood sugar',
    unit: '',
    healthy: '120 mg/dL or lower',
    caution: 'Above 120 mg/dL',
    high: 'Needs follow-up',
    min: 0,
    max: 1,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'fbs',
    categorical: true
  }
];

const TREND_METRICS = [
  { key: 'trestbps', label: 'Blood pressure', unit: 'mm Hg', max: 200, lowerIsBetter: true },
  { key: 'chol', label: 'Cholesterol', unit: 'mg/dL', max: 400, lowerIsBetter: true },
  { key: 'thalach', label: 'Peak heart rate', unit: 'bpm', max: 220, lowerIsBetter: false },
  { key: 'oldpeak', label: 'ST depression', unit: '', max: 10, lowerIsBetter: true },
  { key: 'ca', label: 'Major vessels', unit: '', max: 3, lowerIsBetter: true }
];

function loadCharts() {
  try {
    const raw = localStorage.getItem(CHART_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCharts(charts) {
  localStorage.setItem(CHART_STORE_KEY, JSON.stringify(charts));
}

function normalizePatientId(value) {
  return String(value || '').trim().toUpperCase();
}

export default function App() {
  const [page, setPage] = useState('home');
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [charts, setCharts] = useState(() => loadCharts());
  const [historyPatientId, setHistoryPatientId] = useState('');

  const goTo = (nextPage) => {
    setPage(nextPage);
    window.scrollTo(0, 0);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
    setFieldErrors((previous) => ({
      ...previous,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.patientId.trim()) {
      errors.patientId = 'Enter a patient ID.';
    }
    if (!formData.patientName.trim()) {
      errors.patientName = 'Enter the patient name.';
    }

    Object.entries(numberRules).forEach(([name, rule]) => {
      const raw = formData[name];
      if (raw === '' || raw === null) {
        errors[name] = `Please enter ${rule.label.toLowerCase()}.`;
        return;
      }
      const value = Number(raw);
      if (Number.isNaN(value)) {
        errors[name] = `${rule.label} must be a number.`;
      } else if (value < rule.min || value > rule.max) {
        errors[name] = `${rule.label} should be between ${rule.min} and ${rule.max}.`;
      }
    });

    Object.entries(requiredSelects).forEach(([name, message]) => {
      if (formData[name] === '') {
        errors[name] = message;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistVisit = (screeningResult) => {
    const patientId = normalizePatientId(formData.patientId);
    const visit = {
      id: `${Date.now()}`,
      recordedAt: new Date().toISOString(),
      formData: { ...formData, patientId },
      result: screeningResult
    };

    setCharts((previous) => {
      const existing = previous[patientId] || { name: formData.patientName.trim(), visits: [] };
      const next = {
        ...previous,
        [patientId]: {
          name: formData.patientName.trim() || existing.name,
          visits: [...existing.visits, visit]
        }
      };
      saveCharts(next);
      return next;
    });
    setHistoryPatientId(patientId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError('Please complete the highlighted fields from the patient chart.');
      return;
    }

    setLoading(true);

    const payload = {
      age: parseFloat(formData.age),
      sex: parseFloat(formData.sex),
      cp: parseFloat(formData.cp),
      trestbps: parseFloat(formData.trestbps),
      chol: parseFloat(formData.chol),
      fbs: parseFloat(formData.fbs),
      restecg: parseFloat(formData.restecg),
      thalach: parseFloat(formData.thalach),
      exang: parseFloat(formData.exang),
      oldpeak: parseFloat(formData.oldpeak),
      slope: parseFloat(formData.slope),
      ca: parseFloat(formData.ca),
      thal: parseFloat(formData.thal)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const rawBody = await response.text();
      let data = null;
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          throw new Error('Screening could not be completed. Please try again.');
        }
      }

      if (!response.ok) {
        const detail = data?.detail;
        let message = 'Screening could not be completed. Please check the entries.';
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((item) => item?.msg || 'Please check a form value.').join(' ');
        }
        throw new Error(message);
      }

      persistVisit(data);
      setResult(data);
      goTo('results');
    } catch (err) {
      const isNetworkError =
        err instanceof TypeError ||
        /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
      setError(
        isNetworkError
          ? 'Unable to reach the screening service. Please try again shortly.'
          : err.message || 'Unable to complete screening right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openPatientChart = (patientId) => {
    const record = charts[patientId];
    if (!record) {
      return;
    }
    const latest = record.visits[record.visits.length - 1];
    setHistoryPatientId(patientId);
    if (latest) {
      setFormData({
        ...emptyForm,
        ...latest.formData,
        patientId,
        patientName: record.name
      });
      setResult(latest.result);
    } else {
      setFormData((previous) => ({
        ...previous,
        patientId,
        patientName: record.name
      }));
    }
    goTo('history');
  };

  const viewVisitReport = (visit, patientName) => {
    setFormData({
      ...emptyForm,
      ...visit.formData,
      patientName: patientName || visit.formData.patientName
    });
    setResult(visit.result);
    goTo('results');
  };

  const startNewAssessment = () => {
    setFormData((previous) => ({
      ...emptyForm,
      patientId: previous.patientId,
      patientName: previous.patientName,
      sex: previous.sex
    }));
    setFieldErrors({});
    setError(null);
    goTo('assessment');
  };

  const clearForm = () => {
    setFormData(emptyForm);
    setFieldErrors({});
    setError(null);
  };

  const loadSampleProfile = (key) => {
    if (SAMPLE_PROFILES[key]) {
      setFormData(SAMPLE_PROFILES[key]);
      setFieldErrors({});
      setError(null);
    }
  };

  const patientList = Object.entries(charts).map(([id, record]) => {
    const latestVisit = record.visits[record.visits.length - 1];
    return {
      id,
      name: record.name,
      visits: record.visits.length,
      latestResult: latestVisit?.result
    };
  });

  return (
    <div className="app">
      <header className="topbar">
        <button type="button" className="brand" onClick={() => goTo('home')}>
          <span className="brand-mark" aria-hidden="true">
            <HeartIcon />
          </span>
          <span>
            <span className="brand-name">HeartCare</span>
            <span className="brand-sub">Clinician workspace</span>
          </span>
        </button>
        <nav className="nav">
          <NavButton active={page === 'home'} onClick={() => goTo('home')}>Dashboard</NavButton>
          <NavButton active={page === 'assessment'} onClick={() => goTo('assessment')}>New screening</NavButton>
          <NavButton active={page === 'history'} onClick={() => goTo('history')}>Visit history</NavButton>
          <NavButton active={page === 'overview'} onClick={() => goTo('overview')}>Reference ranges</NavButton>
          <NavButton active={page === 'tips'} onClick={() => goTo('tips')}>Counseling points</NavButton>
          {result && (
            <NavButton active={page === 'results'} onClick={() => goTo('results')}>Prediction report</NavButton>
          )}
        </nav>
      </header>

      <main className={`main ${page === 'overview' || page === 'tips' || page === 'home' || page === 'history' ? 'wide' : ''}`}>
        {page === 'home' && (
          <HomePage
            patientList={patientList}
            onStart={() => goTo('assessment')}
            onHistory={() => goTo('history')}
            onOverview={() => goTo('overview')}
            onOpenPatient={openPatientChart}
          />
        )}
        {page === 'assessment' && (
          <AssessmentPage
            formData={formData}
            fieldErrors={fieldErrors}
            loading={loading}
            error={error}
            lastResult={result}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onLoadSample={loadSampleProfile}
            onClear={clearForm}
            onViewLastResult={() => goTo('results')}
          />
        )}
        {page === 'history' && (
          <HistoryPage
            charts={charts}
            selectedId={historyPatientId || normalizePatientId(formData.patientId)}
            onSelect={setHistoryPatientId}
            onScreen={startNewAssessment}
            onOpenLatest={(patientId) => openPatientChart(patientId)}
            onOpenVisitReport={viewVisitReport}
          />
        )}
        {page === 'overview' && (
          <HealthOverviewPage formData={formData} result={result} onScreen={() => goTo('assessment')} />
        )}
        {page === 'tips' && <TipsPage />}
        {page === 'results' && result && (
          <ResultsPage
            result={result}
            formData={formData}
            priorVisitCount={(charts[normalizePatientId(formData.patientId)]?.visits.length || 1) - 1}
            onHistory={() => goTo('history')}
            onStartNew={startNewAssessment}
            onOverview={() => goTo('overview')}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`nav-link ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function HomePage({ patientList, onStart, onHistory, onOverview, onOpenPatient }) {
  return (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Cardiology workspace</p>
          <h1>Predict heart disease risk, review charts, and compare visits.</h1>
          <p className="lead">
            Enter clinical biomarkers to classify the target label (risk of heart disease)
            via the ML pipeline, store encounters in history, and monitor changes over time.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={onStart}>
              Start new screening
            </button>
            <button type="button" className="btn-secondary" onClick={onHistory}>
              Open visit history
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <HeartIllustration />
          <div className="ecg-line" aria-hidden="true">
            <EcgWave />
          </div>
        </div>
      </section>

      <section className="stat-row">
        <article className="stat-card">
          <span>Patients on file</span>
          <strong>{patientList.length}</strong>
        </article>
        <article className="stat-card">
          <span>Total visits</span>
          <strong>{patientList.reduce((sum, item) => sum + item.visits, 0)}</strong>
        </article>
        <article className="stat-card">
          <span>Workspace</span>
          <strong>Clinician</strong>
        </article>
      </section>

      {patientList.length > 0 && (
        <section className="card">
          <h2 className="section-title">Recent patients</h2>
          <div className="patient-list">
            {patientList.map((patient) => (
              <button
                key={patient.id}
                type="button"
                className="patient-row"
                onClick={() => onOpenPatient(patient.id)}
              >
                <span>
                  <strong>{patient.name}</strong>
                  <em>{patient.id}</em>
                </span>
                <span className="patient-badges">
                  {patient.latestResult && (
                    <span className={`pill ${patient.latestResult.predicted_class === 1 ? 'high' : 'healthy'}`}>
                      {patient.latestResult.predicted_class === 1 ? 'Target: Risk (Class 1)' : 'Target: Low Risk (Class 0)'}
                    </span>
                  )}
                  <span className="pill reference">{patient.visits} visit{patient.visits === 1 ? '' : 's'}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-cta-row">
        <button type="button" className="cta-tile" onClick={onOverview}>
          <h3>Reference ranges</h3>
          <p>Adult targets for blood pressure, cholesterol, heart rate, and fasting sugar.</p>
        </button>
        <button type="button" className="cta-tile" onClick={onHistory}>
          <h3>Visit comparison</h3>
          <p>See how a returning patient’s numbers changed since the last visit.</p>
        </button>
      </section>
    </>
  );
}

function AssessmentPage({
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
    <section className="card">
      <p className="eyebrow">Diagnostic Decision Support</p>
      <h1 className="section-title">Cardiac Risk Assessment & Screening</h1>
      <p className="section-intro">
        Enter the 13 clinical biomarkers to predict the target label (risk of heart disease)
        using the trained machine learning pipeline and save the encounter to the patient’s record.
      </p>

      {lastResult && (
        <div className={`status-banner ${lastResult.predicted_class === 1 ? 'attention' : 'stable'}`}>
          <div className="banner-content">
            <span>
              Latest Session Prediction: <strong>{lastResult.predicted_class === 1 ? 'Positive — Risk of Heart Disease Detected (Class 1)' : 'Negative — Low Risk (Class 0)'}</strong>
              {lastResult.probability_percentage != null && ` · ${lastResult.probability_percentage}% risk`}
            </span>
            <button type="button" className="btn-chip" onClick={onViewLastResult}>
              View Prediction Report →
            </button>
          </div>
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}

      <div className="demo-bar">
        <span className="demo-bar-label">Quick fill:</span>
        <button type="button" className="btn-chip" onClick={() => onLoadSample('highRisk')}>
          Sample High Risk Profile
        </button>
        <button type="button" className="btn-chip" onClick={() => onLoadSample('lowRisk')}>
          Sample Low Risk Profile
        </button>
        <button type="button" className="btn-chip" onClick={onClear}>
          Clear Form
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="field-group">
          <h2>Patient</h2>
          <div className="form-grid">
            <Field id="patientId" label="Patient ID" hint="Use the same ID on return visits." error={fieldErrors.patientId}>
              <input id="patientId" name="patientId" type="text" value={formData.patientId} onChange={onChange} className={fieldErrors.patientId ? 'error' : ''} />
            </Field>
            <Field id="patientName" label="Patient name" error={fieldErrors.patientName}>
              <input id="patientName" name="patientName" type="text" value={formData.patientName} onChange={onChange} className={fieldErrors.patientName ? 'error' : ''} />
            </Field>
            <Field id="age" label="Age (years)" error={fieldErrors.age}>
              <input id="age" name="age" type="number" min="1" max="120" value={formData.age} onChange={onChange} className={fieldErrors.age ? 'error' : ''} />
            </Field>
            <Field id="sex" label="Biological sex" error={fieldErrors.sex}>
              <select id="sex" name="sex" value={formData.sex} onChange={onChange} className={fieldErrors.sex ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="0.0">Female</option>
                <option value="1.0">Male</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="field-group">
          <h2>Symptoms</h2>
          <div className="form-grid">
            <Field id="cp" label="Chest pain type" full error={fieldErrors.cp}>
              <select id="cp" name="cp" value={formData.cp} onChange={onChange} className={fieldErrors.cp ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="1.0">Typical angina</option>
                <option value="2.0">Atypical angina</option>
                <option value="3.0">Non-anginal pain</option>
                <option value="4.0">No chest pain</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="field-group">
          <h2>Vitals and laboratory</h2>
          <div className="form-grid">
            <Field id="trestbps" label="Resting blood pressure (mm Hg)" error={fieldErrors.trestbps}>
              <input id="trestbps" name="trestbps" type="number" min="50" max="260" value={formData.trestbps} onChange={onChange} className={fieldErrors.trestbps ? 'error' : ''} />
            </Field>
            <Field id="chol" label="Serum cholesterol (mg/dL)" error={fieldErrors.chol}>
              <input id="chol" name="chol" type="number" min="50" max="650" value={formData.chol} onChange={onChange} className={fieldErrors.chol ? 'error' : ''} />
            </Field>
            <Field id="fbs" label="Fasting blood sugar above 120 mg/dL" error={fieldErrors.fbs}>
              <select id="fbs" name="fbs" value={formData.fbs} onChange={onChange} className={fieldErrors.fbs ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="0.0">No (120 mg/dL or lower)</option>
                <option value="1.0">Yes (above 120 mg/dL)</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="field-group">
          <h2>Cardiac tests</h2>
          <div className="form-grid">
            <Field id="restecg" label="Resting ECG result" error={fieldErrors.restecg}>
              <select id="restecg" name="restecg" value={formData.restecg} onChange={onChange} className={fieldErrors.restecg ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="0.0">Normal</option>
                <option value="1.0">ST-T wave abnormality</option>
                <option value="2.0">Left ventricular hypertrophy</option>
              </select>
            </Field>
            <Field id="thalach" label="Maximum heart rate (bpm)" error={fieldErrors.thalach}>
              <input id="thalach" name="thalach" type="number" min="50" max="250" value={formData.thalach} onChange={onChange} className={fieldErrors.thalach ? 'error' : ''} />
            </Field>
            <Field id="exang" label="Chest pain during exercise" error={fieldErrors.exang}>
              <select id="exang" name="exang" value={formData.exang} onChange={onChange} className={fieldErrors.exang ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="0.0">No</option>
                <option value="1.0">Yes</option>
              </select>
            </Field>
            <Field id="oldpeak" label="ST depression" error={fieldErrors.oldpeak}>
              <input id="oldpeak" name="oldpeak" type="number" step="0.1" min="0" max="10" value={formData.oldpeak} onChange={onChange} className={fieldErrors.oldpeak ? 'error' : ''} />
            </Field>
            <Field id="slope" label="Peak exercise ST slope" error={fieldErrors.slope}>
              <select id="slope" name="slope" value={formData.slope} onChange={onChange} className={fieldErrors.slope ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="1.0">Upsloping</option>
                <option value="2.0">Flat</option>
                <option value="3.0">Downsloping</option>
              </select>
            </Field>
            <Field id="ca" label="Major vessels on fluoroscopy" error={fieldErrors.ca}>
              <select id="ca" name="ca" value={formData.ca} onChange={onChange} className={fieldErrors.ca ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="0.0">0</option>
                <option value="1.0">1</option>
                <option value="2.0">2</option>
                <option value="3.0">3</option>
              </select>
            </Field>
            <Field id="thal" label="Thalassemia result" full error={fieldErrors.thal}>
              <select id="thal" name="thal" value={formData.thal} onChange={onChange} className={fieldErrors.thal ? 'error' : ''}>
                <option value="">Select...</option>
                <option value="3.0">Normal</option>
                <option value="6.0">Fixed defect</option>
                <option value="7.0">Reversible defect</option>
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

function HistoryPage({ charts, selectedId, onSelect, onScreen, onOpenVisitReport }) {
  const ids = Object.keys(charts);
  const activeId = charts[selectedId] ? selectedId : ids[0] || '';
  const record = activeId ? charts[activeId] : null;
  const visits = record?.visits || [];
  const previous = visits.length >= 2 ? visits[visits.length - 2] : null;
  const latest = visits.length ? visits[visits.length - 1] : null;

  useEffect(() => {
    if (activeId && activeId !== selectedId) {
      onSelect(activeId);
    }
  }, [activeId, selectedId, onSelect]);

  if (!ids.length) {
    return (
      <section className="card">
        <h1 className="section-title">Visit history</h1>
        <p className="section-intro">
          No charts yet. Save a screening with a patient ID to start a longitudinal record.
        </p>
        <button type="button" className="btn-primary" onClick={onScreen}>
          Start first screening
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="history-layout">
        <aside className="card patient-rail">
          <h2>Patients</h2>
          {ids.map((id) => (
            <button
              key={id}
              type="button"
              className={`patient-row ${id === activeId ? 'active' : ''}`}
              onClick={() => onSelect(id)}
            >
              <span>
                <strong>{charts[id].name}</strong>
                <em>{id}</em>
              </span>
              <span className="pill reference">{charts[id].visits.length}</span>
            </button>
          ))}
        </aside>

        <div>
          <section className="card">
            <p className="eyebrow">Longitudinal chart</p>
            <h1 className="section-title">{record.name}</h1>
            <p className="section-intro">
              {visits.length} visit{visits.length === 1 ? '' : 's'} on file. Use the same patient ID
              on return encounters to compare change.
            </p>
            <button type="button" className="btn-primary" onClick={onScreen}>
              Add another visit
            </button>
          </section>

          {latest && previous && (
            <section className="card">
              <h2 className="section-title">Change since last visit</h2>
              <p className="section-intro">
                Previous: {formatVisitDate(previous.recordedAt)} · Latest: {formatVisitDate(latest.recordedAt)}
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
              Only one visit is on file. A second screening will show visual change here.
            </div>
          )}

          {visits.length >= 2 && (
            <section className="card">
              <h2 className="section-title">Trend across visits</h2>
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

          <section className="card">
            <h2 className="section-title">Visit timeline</h2>
            <ol className="timeline">
              {[...visits].reverse().map((visit, index) => {
                const isRisk = visit.result?.predicted_class === 1;
                const prob = visit.result?.probability_percentage ?? (visit.result?.probability != null ? Math.round(visit.result.probability * 1000) / 10 : null);
                return (
                  <li key={visit.id}>
                    <span className={`dot ${isRisk ? 'attention' : 'stable'}`} />
                    <div>
                      <div className="timeline-header">
                        <strong>{index === 0 ? 'Latest visit' : `Visit ${visits.length - index}`}</strong>
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
                            View prediction report →
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
      </section>
    </>
  );
}

function CompareCard({ metric, previousValue, latestValue }) {
  const delta = roundDelta(latestValue - previousValue);
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

  const prevProb = previous?.probability_percentage ?? (previous?.probability != null ? Math.round(previous.probability * 1000) / 10 : null);
  const currProb = latest?.probability_percentage ?? (latest?.probability != null ? Math.round(latest.probability * 1000) / 10 : null);

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
          Risk probability: {prevProb}% → {currProb}% ({currProb >= prevProb ? '+' : ''}{roundDelta(currProb - prevProb)}%)
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

function HealthOverviewPage({ formData, result, onScreen }) {
  const hasPatientValues = formData.trestbps !== '' || formData.chol !== '' || formData.thalach !== '';

  return (
    <>
      <section className="overview-hero">
        <div>
          <p className="eyebrow">Clinical reference</p>
          <h1>Adult heart-health ranges</h1>
          <p className="lead">
            Typical clinic targets. After a screening is entered, the current
            patient’s values appear on the same scale.
          </p>
        </div>
        <HeartIllustration compact />
      </section>

      {result && (
        <div className={`status-banner ${result.predicted_class === 1 ? 'attention' : 'stable'}`}>
          {result.predicted_class === 1
            ? `Latest Model Prediction: Target Label Positive — Risk of Heart Disease Detected (Class 1)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`
            : `Latest Model Prediction: Target Label Negative — Low Risk of Heart Disease (Class 0)${result.probability_percentage != null ? ` · ${result.probability_percentage}% risk probability` : ''}.`}
        </div>
      )}

      <section className="visual-grid">
        {REFERENCE_RANGES.map((metric) => (
          <RangeCard key={metric.id} metric={metric} formData={formData} />
        ))}
      </section>

      <section className="card anatomy-card">
        <h2 className="section-title">Reference context</h2>
        <div className="anatomy-grid">
          <div className="anatomy-visual">
            <HeartIllustration />
            <div className="pulse-ring" />
          </div>
          <ul className="anatomy-list">
            <li>
              <strong>Blood pressure</strong>
              Resting systolic near 90–120 mm Hg indicates lower arterial strain.
            </li>
            <li>
              <strong>Cholesterol</strong>
              Total cholesterol under 200 mg/dL is the usual adult target.
            </li>
            <li>
              <strong>Peak heart rate</strong>
              Exercise heart rate shows whether the heart can meet demand.
            </li>
            <li>
              <strong>Blood sugar</strong>
              Fasting sugar at or below 120 mg/dL reduces long-term vessel injury.
            </li>
          </ul>
        </div>
      </section>

      {!hasPatientValues && (
        <div className="inline-cta">
          <p>Enter a screening to plot this patient’s values on the charts.</p>
          <button type="button" className="btn-primary" onClick={onScreen}>
            Open screening
          </button>
        </div>
      )}
    </>
  );
}

function RangeCard({ metric, formData }) {
  const raw = formData[metric.formKey];
  const hasValue = raw !== '' && raw !== null && raw !== undefined;
  const numeric = hasValue ? Number(raw) : null;

  const markerPercent = useMemo(() => {
    if (!hasValue || Number.isNaN(numeric)) {
      return metric.categorical ? 8 : 28;
    }
    if (metric.categorical) {
      return numeric > 0 ? 78 : 18;
    }
    const pct = ((numeric - metric.min) / (metric.max - metric.min)) * 100;
    return Math.min(96, Math.max(4, pct));
  }, [hasValue, numeric, metric]);

  const band = !hasValue
    ? 'reference'
    : metric.categorical
      ? (numeric > 0 ? 'high' : 'healthy')
      : numeric < metric.healthyMin
        ? 'caution'
        : numeric <= metric.healthyMax
          ? 'healthy'
          : 'high';

  return (
    <article className="range-card">
      <header>
        <h3>{metric.label}</h3>
        <span className={`pill ${band}`}>
          {hasValue ? (metric.categorical ? (numeric > 0 ? 'Above target' : 'In range') : `${numeric} ${metric.unit}`) : 'Reference'}
        </span>
      </header>
      <div className="range-track" aria-hidden="true">
        <span className="zone healthy-zone" />
        <span className="zone caution-zone" />
        <span className="zone high-zone" />
        <span className="marker" style={{ left: `${markerPercent}%` }} />
      </div>
      <dl className="range-legend">
        <div>
          <dt>Usual target</dt>
          <dd>{metric.healthy}</dd>
        </div>
        <div>
          <dt>Watch</dt>
          <dd>{metric.caution}</dd>
        </div>
        <div>
          <dt>Needs review</dt>
          <dd>{metric.high}</dd>
        </div>
      </dl>
    </article>
  );
}

function TipsPage() {
  return (
    <>
      <section className="card">
        <p className="eyebrow">Patient counseling</p>
        <h1 className="section-title">Talking points</h1>
        <p className="section-intro">
          Use these points during the visit. They are for clinician discussion, not a public notice board.
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

function BiomarkerTile({ label, value, status = 'reference', note }) {
  return (
    <div className={`biomarker-tile ${status}`}>
      <span className="biomarker-label">{label}</span>
      <strong className="biomarker-value">{value}</strong>
      {note && <span className="biomarker-note">{note}</span>}
    </div>
  );
}

function ResultsPage({ result, formData, priorVisitCount, onHistory, onStartNew, onOverview }) {
  const isDisease = result.predicted_class === 1;
  const probPercent = result.probability_percentage != null
    ? result.probability_percentage
    : (result.probability != null ? Math.round(result.probability * 1000) / 10 : (isDisease ? 75.0 : 25.0));

  const riskCategory = probPercent >= 65 ? 'High Risk' : probPercent >= 35 ? 'Moderate Risk' : 'Low Risk';

  return (
    <section className="card results-card">
      <div className="results-header">
        <span className={`result-target-badge ${isDisease ? 'target-disease' : 'target-no-disease'}`}>
          Target Label: {isDisease ? 'Positive (Class 1) — Risk Detected' : 'Negative (Class 0) — Low Risk'}
        </span>
        <span className="results-date">Recorded: {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
      </div>

      <div className={`prediction-hero ${isDisease ? 'hero-disease' : 'hero-no-disease'}`}>
        <div className="prediction-hero-text">
          <p className="prediction-eyebrow">Diagnostic Prediction Support</p>
          <h1 className="prediction-headline">
            {isDisease ? 'Risk of Heart Disease Detected' : 'Low Risk of Heart Disease'}
          </h1>
          <p className="prediction-subheadline">
            Target Classification: {result.readable_result || (isDisease ? 'Disease detected by model' : 'No disease detected by model')}
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
      <div className="risk-gauge-container">
        <div className="risk-gauge-header">
          <span>Model Positive-Class Decision Score</span>
          <strong>{probPercent}% Risk of Heart Disease</strong>
        </div>
        <div className="risk-gauge-track" aria-hidden="true">
          <span className="gauge-segment gauge-low" title="Low Risk: 0-35%">Low Risk (0–35%)</span>
          <span className="gauge-segment gauge-med" title="Moderate Risk: 35-65%">Moderate (35–65%)</span>
          <span className="gauge-segment gauge-high" title="High Risk: 65-100%">High Risk (65–100%)</span>
          <span
            className="gauge-pointer"
            style={{ left: `${Math.min(98, Math.max(2, probPercent))}%` }}
          />
        </div>
        <p className="risk-gauge-caption">
          Probability reflects the classifier&apos;s statistical decision confidence score based on the Cleveland training distribution.
        </p>
      </div>

      {/* Clinical Decision Interpretation */}
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
        <h3>Input Biomarkers & Risk Factors</h3>
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
            note={Number(formData.chol) >= 240 ? 'High cholesterol (>=240)' : Number(formData.chol) >= 200 ? 'Borderline (200-239)' : 'Desirable (<200)'}
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
            label="Chest Pain Type"
            value={CP_LABELS[formData.cp] || '—'}
            status={formData.cp === '1.0' ? 'high' : formData.cp === '4.0' ? 'caution' : 'healthy'}
            note={formData.cp === '1.0' ? 'Typical angina' : formData.cp === '4.0' ? 'Asymptomatic (silent risk)' : 'Atypical / Non-anginal'}
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
            label="Thalassemia (thal)"
            value={THAL_LABELS[formData.thal] || '—'}
            status={formData.thal === '7.0' ? 'high' : formData.thal === '6.0' ? 'caution' : 'healthy'}
            note={formData.thal === '7.0' ? 'Reversible perfusion defect' : formData.thal === '6.0' ? 'Fixed perfusion defect' : 'Normal myocardial perfusion'}
          />
          <BiomarkerTile
            label="Peak ST Slope"
            value={SLOPE_LABELS[formData.slope] || '—'}
            status={formData.slope === '2.0' ? 'caution' : formData.slope === '3.0' ? 'high' : 'healthy'}
            note={formData.slope === '2.0' ? 'Flat ST segment' : formData.slope === '3.0' ? 'Downsloping ST segment' : 'Normal upsloping ST'}
          />
          <BiomarkerTile
            label="Fasting Blood Sugar"
            value={formData.fbs === '1.0' ? '> 120 mg/dL' : '<= 120 mg/dL'}
            status={formData.fbs === '1.0' ? 'caution' : 'healthy'}
            note={formData.fbs === '1.0' ? 'Elevated fasting blood sugar' : 'Normal fasting glucose'}
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

      {/* Record Saved Banner */}
      <div className="status-banner stable">
        ✓ Encounter saved to chart for <strong>{formData.patientName}</strong> (ID: {formData.patientId}).
        {priorVisitCount > 0
          ? ` Patient now has ${priorVisitCount + 1} visits recorded. View history to inspect longitudinal changes.`
          : ' Initial visit saved to patient history. Subsequent visits will enable comparison charts.'}
      </div>

      <div className="results-actions">
        <button type="button" className="btn-primary" onClick={onHistory}>
          View visit history & trends
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
  );
}

function Field({ id, label, hint, error, full, children }) {
  return (
    <div className={`form-group ${full ? 'full' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
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

function roundDelta(value) {
  return Math.round(value * 10) / 10;
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="none" aria-hidden="true">
      <path
        d="M16 27s-9.5-6.2-12.4-11.4C1.4 12 2.6 7.4 6.8 6.2c2.5-.7 5.1.3 6.6 2.4 1.5-2.1 4.1-3.1 6.6-2.4 4.2 1.2 5.4 5.8 3.2 9.4C25.5 20.8 16 27 16 27z"
        fill="#0f766e"
      />
    </svg>
  );
}

function HeartIllustration({ compact = false }) {
  return (
    <svg
      className={`heart-art ${compact ? 'compact' : ''}`}
      viewBox="0 0 220 200"
      role="img"
      aria-label="Heart illustration"
    >
      <defs>
        <linearGradient id="heartFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <path
        d="M110 178s-68-44-88-82C6 66 16 30 48 22c20-5 40 4 52 22 12-18 32-27 52-22 32 8 42 44 26 74-20 38-88 82-88 82z"
        fill="url(#heartFill)"
      />
      <path
        d="M70 92c18-2 28 10 40 24 10-16 26-28 46-22"
        stroke="#ecfeff"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EcgWave() {
  return (
    <svg viewBox="0 0 320 64" width="100%" height="64" aria-hidden="true">
      <polyline
        points="0,32 40,32 52,32 62,8 72,56 84,32 110,32 122,20 134,44 146,32 320,32"
        fill="none"
        stroke="#5eead4"
        strokeWidth="3"
      />
    </svg>
  );
}
