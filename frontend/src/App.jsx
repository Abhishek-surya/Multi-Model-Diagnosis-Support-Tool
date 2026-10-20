import React, { useEffect, useMemo, useState } from 'react';
import { Topbar } from './components/Topbar';
import { HomePage } from './components/HomePage';
import { AssessmentPage } from './components/AssessmentPage';
import { ResultsPage } from './components/ResultsPage';
import { HistoryPage } from './components/HistoryPage';
import { HealthOverviewPage } from './components/HealthOverviewPage';
import { TipsPage } from './components/TipsPage';
import { ErrorBoundary } from './components/ErrorBoundary';

import {
  emptyForm,
  numberRules,
  requiredSelects,
  SAMPLE_PROFILES
} from './constants/clinicalConstants';

import {
  loadCharts,
  loadTheme,
  normalizePatientId,
  saveCharts,
  saveTheme
} from './utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [theme, setTheme] = useState(() => loadTheme());
  const [page, setPage] = useState('home');
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [charts, setCharts] = useState(() => loadCharts());
  const [historyPatientId, setHistoryPatientId] = useState('');

  // Sync theme attribute to document body/root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const goTo = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.patientId.trim()) {
      errors.patientId = 'Enter a unique patient ID (e.g. PT-8801).';
    }
    if (!formData.patientName.trim()) {
      errors.patientName = 'Enter the patient full name.';
    }

    Object.entries(numberRules).forEach(([name, rule]) => {
      const raw = formData[name];
      if (raw === '' || raw === null || raw === undefined) {
        errors[name] = `Please enter ${rule.label.toLowerCase()}.`;
        return;
      }
      const value = Number(raw);
      if (Number.isNaN(value)) {
        errors[name] = `${rule.label} must be a valid number.`;
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
      setError('Please complete the highlighted clinical fields from the patient chart.');
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
      let response;
      const primaryUrl = API_BASE_URL ? `${API_BASE_URL}/predict` : '/predict';

      try {
        response = await fetch(primaryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        // If relative proxy failed with 500/502/504 and API_BASE_URL wasn't overridden, try direct backend URL
        if (!response.ok && response.status >= 500 && !API_BASE_URL) {
          response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      } catch (networkErr) {
        // If relative fetch failed entirely (e.g. proxy unreachable), try direct backend URL
        if (!API_BASE_URL) {
          response = await fetch('http://127.0.0.1:8000/predict', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } else {
          throw networkErr;
        }
      }

      const rawBody = await response.text();
      let data = null;
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          // not valid JSON
        }
      }

      if (!response.ok) {
        const detail = data?.detail;
        let message = 'Screening could not be completed. Please check the biomarker values.';
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map((item) => item?.msg || 'Please check a form value.').join(' ');
        } else if (response.status === 500) {
          message = 'Backend prediction error (HTTP 500). Please ensure the backend is running with a valid model.';
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
          ? 'Unable to reach the screening service. Please check that the FastAPI backend is running on http://127.0.0.1:8000.'
          : err.message || 'Unable to complete screening right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openPatientChart = (patientId) => {
    const record = charts[patientId];
    if (!record) return;

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
      setFormData((prev) => ({
        ...prev,
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
    setFormData((prev) => ({
      ...emptyForm,
      patientId: prev.patientId,
      patientName: prev.patientName,
      sex: prev.sex
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

  const handleUpdateCharts = (newCharts) => {
    setCharts(newCharts);
    saveCharts(newCharts);
  };

  const patientList = useMemo(() => {
    return Object.entries(charts).map(([id, record]) => {
      const latestVisit = record.visits[record.visits.length - 1];
      return {
        id,
        name: record.name,
        visits: record.visits.length,
        latestResult: latestVisit?.result
      };
    });
  }, [charts]);

  return (
    <div className="app">
      <Topbar
        page={page}
        onNavigate={goTo}
        hasResult={Boolean(result)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <ErrorBoundary onReset={() => goTo('home')}>
        <main className={`main ${page === 'overview' || page === 'tips' || page === 'home' || page === 'history' || page === 'results' ? 'wide' : ''}`}>
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
              onUpdateCharts={handleUpdateCharts}
            />
          )}

          {page === 'overview' && (
            <HealthOverviewPage
              formData={formData}
              result={result}
              onScreen={() => goTo('assessment')}
            />
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
      </ErrorBoundary>
    </div>
  );
}
