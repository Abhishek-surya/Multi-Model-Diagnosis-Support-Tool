import React, { useState } from 'react';

// Empty default uses same-origin Vite proxy (/predict -> http://127.0.0.1:8000).
// Set VITE_API_URL only when calling the API without the Vite proxy.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

const initialFormData = {
  age: '55',
  sex: '1.0',
  cp: '1.0',
  trestbps: '130',
  chol: '240',
  fbs: '0.0',
  restecg: '0.0',
  thalach: '150',
  exang: '0.0',
  oldpeak: '1.0',
  slope: '2.0',
  ca: '0.0',
  thal: '3.0'
};

export default function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const loadSample = (type) => {
    setError(null);
    setResult(null);
    if (type === 'normal') {
      // Cleveland record predicting No Disease
      setFormData({
        age: '63',
        sex: '1.0',
        cp: '1.0',
        trestbps: '145',
        chol: '233',
        fbs: '1.0',
        restecg: '2.0',
        thalach: '150',
        exang: '0.0',
        oldpeak: '2.3',
        slope: '3.0',
        ca: '0.0',
        thal: '6.0'
      });
    } else {
      // Cleveland record predicting Disease
      setFormData({
        age: '67',
        sex: '1.0',
        cp: '4.0',
        trestbps: '160',
        chol: '286',
        fbs: '0.0',
        restecg: '2.0',
        thalach: '108',
        exang: '1.0',
        oldpeak: '1.5',
        slope: '2.0',
        ca: '3.0',
        thal: '3.0'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Validate required fields
    for (const [key, value] of Object.entries(formData)) {
      if (value === '' || value === null || value === undefined) {
        setError(`Please provide a value for ${key}.`);
        setLoading(false);
        return;
      }
    }

    // Cast values to numbers for backend Pydantic validation
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
          // Vite proxy returns plain text (e.g. ECONNREFUSED) when FastAPI is down.
          const looksLikeProxyFailure =
            response.status >= 500 ||
            /ECONNREFUSED|ENOTFOUND|socket hang up|proxy error/i.test(rawBody);
          if (looksLikeProxyFailure) {
            throw new Error(
              'Backend is not running on port 8000. From the project root, run: uvicorn backend.main:app --reload --port 8000'
            );
          }
          throw new Error(
            `Unexpected backend response (HTTP ${response.status}): ${rawBody.slice(0, 180)}`
          );
        }
      }

      if (!response.ok) {
        const detail = data?.detail;
        let message = 'Prediction failed. Please check your inputs.';
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail
            .map((item) => item?.msg || JSON.stringify(item))
            .join('; ');
        } else if (!data) {
          message = `Backend error (HTTP ${response.status}). Is FastAPI running on port 8000?`;
        }
        throw new Error(message);
      }

      setResult(data);
    } catch (err) {
      const isNetworkError =
        err instanceof TypeError ||
        /Failed to fetch|NetworkError|Load failed/i.test(err.message || '');
      setError(
        isNetworkError
          ? 'Unable to connect to the backend server. From the project root, run: uvicorn backend.main:app --reload --port 8000'
          : err.message || 'Unable to connect to the backend server. Please verify FastAPI is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Multi-Model Diagnosis Support Tool</h1>
        <p className="subtitle">Heart Disease Risk Prediction — Academic MVP</p>
      </header>

      <div className="sample-buttons">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => loadSample('normal')}
        >
          Load Low-Risk Sample
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => loadSample('at-risk')}
        >
          Load At-Risk Sample
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* 1. Age */}
          <div className="form-group">
            <label htmlFor="age">
              Age <span className="field-hint">(years)</span>
            </label>
            <input
              id="age"
              name="age"
              type="number"
              min="1"
              max="120"
              required
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          {/* 2. Sex */}
          <div className="form-group">
            <label htmlFor="sex">Biological Sex</label>
            <select id="sex" name="sex" value={formData.sex} onChange={handleChange}>
              <option value="1.0">Male (1)</option>
              <option value="0.0">Female (0)</option>
            </select>
          </div>

          {/* 3. Chest Pain */}
          <div className="form-group">
            <label htmlFor="cp">Chest Pain Category</label>
            <select id="cp" name="cp" value={formData.cp} onChange={handleChange}>
              <option value="1.0">Typical Angina (1)</option>
              <option value="2.0">Atypical Angina (2)</option>
              <option value="3.0">Non-anginal Pain (3)</option>
              <option value="4.0">Asymptomatic (4)</option>
            </select>
          </div>

          {/* 4. Resting Blood Pressure */}
          <div className="form-group">
            <label htmlFor="trestbps">
              Resting Blood Pressure <span className="field-hint">(mm Hg)</span>
            </label>
            <input
              id="trestbps"
              name="trestbps"
              type="number"
              min="50"
              max="260"
              required
              value={formData.trestbps}
              onChange={handleChange}
            />
          </div>

          {/* 5. Cholesterol */}
          <div className="form-group">
            <label htmlFor="chol">
              Serum Cholesterol <span className="field-hint">(mg/dl)</span>
            </label>
            <input
              id="chol"
              name="chol"
              type="number"
              min="50"
              max="650"
              required
              value={formData.chol}
              onChange={handleChange}
            />
          </div>

          {/* 6. Fasting Blood Sugar */}
          <div className="form-group">
            <label htmlFor="fbs">Fasting Blood Sugar &gt; 120 mg/dl</label>
            <select id="fbs" name="fbs" value={formData.fbs} onChange={handleChange}>
              <option value="0.0">False (≤ 120 mg/dl) (0)</option>
              <option value="1.0">True (&gt; 120 mg/dl) (1)</option>
            </select>
          </div>

          {/* 7. Resting ECG */}
          <div className="form-group">
            <label htmlFor="restecg">Resting ECG Results</label>
            <select id="restecg" name="restecg" value={formData.restecg} onChange={handleChange}>
              <option value="0.0">Normal (0)</option>
              <option value="1.0">ST-T Wave Abnormality (1)</option>
              <option value="2.0">Left Ventricular Hypertrophy (2)</option>
            </select>
          </div>

          {/* 8. Max Heart Rate */}
          <div className="form-group">
            <label htmlFor="thalach">
              Maximum Heart Rate <span className="field-hint">(bpm)</span>
            </label>
            <input
              id="thalach"
              name="thalach"
              type="number"
              min="50"
              max="250"
              required
              value={formData.thalach}
              onChange={handleChange}
            />
          </div>

          {/* 9. Exercise-Induced Angina */}
          <div className="form-group">
            <label htmlFor="exang">Exercise-Induced Angina</label>
            <select id="exang" name="exang" value={formData.exang} onChange={handleChange}>
              <option value="0.0">No (0)</option>
              <option value="1.0">Yes (1)</option>
            </select>
          </div>

          {/* 10. ST Depression (oldpeak) */}
          <div className="form-group">
            <label htmlFor="oldpeak">
              ST Depression <span className="field-hint">(oldpeak)</span>
            </label>
            <input
              id="oldpeak"
              name="oldpeak"
              type="number"
              step="0.1"
              min="0.0"
              max="10.0"
              required
              value={formData.oldpeak}
              onChange={handleChange}
            />
          </div>

          {/* 11. Slope */}
          <div className="form-group">
            <label htmlFor="slope">Peak ST Segment Slope</label>
            <select id="slope" name="slope" value={formData.slope} onChange={handleChange}>
              <option value="1.0">Upsloping (1)</option>
              <option value="2.0">Flat (2)</option>
              <option value="3.0">Downsloping (3)</option>
            </select>
          </div>

          {/* 12. Major Vessels Colored (ca) */}
          <div className="form-group">
            <label htmlFor="ca">Major Vessels Colored (Fluoroscopy)</label>
            <select id="ca" name="ca" value={formData.ca} onChange={handleChange}>
              <option value="0.0">0 vessels (0)</option>
              <option value="1.0">1 vessel (1)</option>
              <option value="2.0">2 vessels (2)</option>
              <option value="3.0">3 vessels (3)</option>
            </select>
          </div>

          {/* 13. Thalassemia Indicator */}
          <div className="form-group">
            <label htmlFor="thal">Thalassemia Category</label>
            <select id="thal" name="thal" value={formData.thal} onChange={handleChange}>
              <option value="3.0">Normal (3)</option>
              <option value="6.0">Fixed Defect (6)</option>
              <option value="7.0">Reversible Defect (7)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Evaluating Model Prediction...' : 'Predict'}
        </button>
      </form>

      {error && <div className="alert-error"><strong>Error:</strong> {error}</div>}

      {result && (
        <div
          className={`results-card ${
            result.predicted_class === 1 ? 'disease' : 'no-disease'
          }`}
        >
          <div className="results-title">
            {result.readable_result}
          </div>
          <div className="result-row">
            <span className="result-label">Predicted Class:</span>
            <span className="result-value">
              {result.predicted_class} {result.predicted_class === 1 ? '(Disease)' : '(No Disease)'}
            </span>
          </div>
          {result.probability_percentage !== null && result.probability_percentage !== undefined && (
            <div className="result-row">
              <span className="result-label">Model Positive-Class Probability:</span>
              <span className="result-value">
                {result.probability_percentage}%
              </span>
            </div>
          )}
          <p className="prob-note">
            Note: The probability value reflects the classifier&apos;s statistical decision confidence score based on the training dataset distribution, not an individual patient&apos;s real-world clinical prognosis.
          </p>
        </div>
      )}

      <div className="disclaimer-card">
        <strong>Academic Prototype Disclaimer:</strong> This application is an educational prototype developed for machine learning research and clinical decision support study. It is not a certified diagnostic device and does not constitute medical advice or replace professional evaluation by qualified medical personnel.
      </div>
    </div>
  );
}
