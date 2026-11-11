# Multi-Model Diagnosis Support Tool (HeartCare)

A machine-learning-based **Clinical Decision Support System (CDSS) prototype** that analyzes structured patient biomarkers to provide heart disease risk assessments, Explainable AI (XAI) risk attributions, interactive counterfactual simulations, longitudinal patient charting, and secure clinician session management.

> **Disclaimer:** This project is an academic clinical decision-support prototype. It is not a certified medical diagnostic device and must not replace professional clinical evaluation, medical judgment, or diagnostic testing.

---

## 📌 Project Overview

The **Multi-Model Diagnosis Support Tool** bridges advanced data science with healthcare workflow design. The system evaluates candidate classification models (Logistic Regression, Support Vector Machines, Random Forests), combines their predictive strengths through ensemble strategies, and provides an end-to-end clinical workspace for physicians.

### Key Capabilities

* **Rigorous ML Pipeline**: Trained on the UCI Cleveland Heart Disease dataset using a leak-free `ColumnTransformer` preprocessing protocol and stratified 5-fold cross-validation.
* **Explainable AI (XAI)**: Quantifies biomarker-level attribution (positive and protective risk drivers) for each prediction.
* **Interactive "What-If" Counterfactual Simulator**: Allows clinicians to simulate potential biomarker adjustments (e.g., lowering cholesterol, reducing blood pressure) and see instantaneous probability impact.
* **Secure Google OAuth & Clinician Authentication**: Dedicated sign-in portal supporting Google Workspace accounts and rapid demo profiles.
* **Clinician-Scoped Relational Database**: SQLite persistence via SQLAlchemy where patient charts, encounters, and predictions are strictly isolated per clinician.
* **Longitudinal Patient Roster**: Tracks historical visits, vital trajectories, and metric changes over time with JSON export/import backup support.
* **Modern Clinical UI**: Built with React and Vite featuring responsive layouts, dark/light theme switching, and print-ready consultation summaries.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             React / Vite Frontend (Port 5173)          │
│  - Dedicated Google Sign-In Portal                     │
│  - Clinician Workspace Dashboard                       │
│  - 13-Biomarker Clinical Screening Form                │
│  - Explainable AI (XAI) & Counterfactual Simulator     │
│  - Longitudinal Patient Charts & Sparkline Trajectories│
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / JSON REST APIs
                            ▼
┌────────────────────────────────────────────────────────┐
│             FastAPI Backend (Port 8000)                │
│  - Authentication Router (/api/auth)                   │
│  - Prediction Router (/predict)                        │
│  - Clinical Patient & Encounter CRUD (/api/patients)   │
│  - Pydantic Input Validation & Out-of-Range Guardrails │
└─────────────┬──────────────────────────┬───────────────┘
              │                          │
              ▼                          ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     Machine Learning      │  │   SQLAlchemy Database   │
│         Pipeline          │  │     (heartcare.db)      │
│  - Scikit-learn Pipelines │  │  - Clinicians Table     │
│  - ColumnTransformer      │  │  - Patients (per doc)   │
│  - Calibrated Estimates   │  │  - Clinical Encounters  │
│  - Serialized (.joblib)   │  │  - Prediction Logs      │
└───────────────────────────┘  └─────────────────────────┘
```

---

## 🧠 Machine Learning Methodology & Results

### Supervised Classification Formulation
The clinical task is formulated as supervised binary classification: identifying the presence of coronary artery disease ($\ge 50\%$ diameter stenosis) from 13 patient biomarkers.

### 1. Eliminating Preprocessing Data Leakage
In standard medical ML pipelines, computing imputation values or scaling parameters across the entire dataset before splitting causes **data leakage**. To prevent this:
1. **Raw Cleaning Only**: Placeholder missing tokens (`'?'`) in `ca` and `thal` are mapped to `np.nan`. No global imputation is executed prior to splitting.
2. **Unified Pipeline Preprocessing**: Encapsulated in a `ColumnTransformer`:
   - **Numerical Features** (`age`, `trestbps`, `chol`, `thalach`, `oldpeak`): `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
   - **Categorical Features** (`sex`, `cp`, `fbs`, `restecg`, `exang`, `slope`, `ca`, `thal`): `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.
3. **Fold-Level Isolation**: When executing 5-fold cross-validation, the transformer is fitted **strictly on each fold's training split** and applied to the validation split.
4. **Final Test Isolation**: Evaluated against an untouched held-out test set (61 samples, 20%).

### 2. Candidate Models & Probability Calibration
* **Logistic Regression**: `LogisticRegression(max_iter=1000, random_state=42)`
* **Support Vector Machine (SVM)**: `SVC(kernel='rbf', random_state=42)`
* **Random Forest**: `RandomForestClassifier(n_estimators=100, random_state=42)`
* **Hard Voting Ensemble**: Majority vote combining predictions from LR, SVM, and RF.
* **Soft Voting Ensemble**: Combines calibrated probabilities. SVM is wrapped in `CalibratedClassifierCV(estimator=SVC(...))` to produce reliable, leak-free probability estimates.

### 3. Experimental Results

#### Training-Only 5-Fold Stratified Cross-Validation (242 Samples)
| Candidate Model | Mean CV Accuracy | CV Precision | CV Recall | CV F1 Score |
| :--- | :---: | :---: | :---: | :---: |
| **Logistic Regression (Selected)** | **0.8471 ± 0.0100** | **0.8768 ± 0.0542** | 0.7834 ± 0.0459 | **0.8245 ± 0.0069** |
| **SVM (RBF Kernel)** | 0.8139 ± 0.0235 | 0.8303 ± 0.0742 | 0.7648 ± 0.0797 | 0.7893 ± 0.0271 |
| **Random Forest** | 0.8181 ± 0.0307 | 0.8173 ± 0.0405 | **0.7826 ± 0.0981** | 0.7948 ± 0.0469 |
| **Hard Voting Ensemble** | 0.8181 ± 0.0162 | 0.8363 ± 0.0658 | 0.7648 ± 0.0797 | 0.7927 ± 0.0249 |
| **Soft Voting Ensemble** | 0.8222 ± 0.0289 | 0.8394 ± 0.0743 | 0.7739 ± 0.0775 | 0.7990 ± 0.0307 |

#### Final Evaluation on Untouched Held-Out Test Set (61 Samples)
| Model | Test Accuracy | Precision | Recall | Specificity | F1 Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Majority-Class Baseline** | 0.5410 | 0.0000 | 0.0000 | 1.0000 | 0.0000 | N/A |
| **Logistic Regression (Selected)** | **0.8852** | **0.8387** | **0.9286** | **0.8485** | **0.8814** | **0.9665** |
| **SVM (RBF Kernel)** | 0.8852 | 0.8387 | 0.9286 | 0.8485 | 0.8814 | 0.9643 |
| **Random Forest** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | 0.9437 |
| **Hard Voting Ensemble** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | N/A |
| **Soft Voting Ensemble** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | 0.9610 |

---

## 📊 Clinical Features (13 Cleveland Biomarkers)

| # | Feature | Clinical Description | Reference / Target | Type |
|---|---|---|---|---|
| 1 | `age` | Patient age in years | 1 – 120 | Continuous |
| 2 | `sex` | Biological sex | `1` = Male, `0` = Female | Categorical |
| 3 | `cp` | Chest pain category | `1` = Typical Angina, `2` = Atypical, `3` = Non-anginal, `4` = Asymptomatic | Categorical |
| 4 | `trestbps` | Resting blood pressure (mm Hg) | Target: < 120 mm Hg (Normal) | Continuous |
| 5 | `chol` | Serum cholesterol (mg/dL) | Target: < 200 mg/dL (Desirable) | Continuous |
| 6 | `fbs` | Fasting blood sugar > 120 mg/dL | `1` = True, `0` = False | Categorical |
| 7 | `restecg` | Resting electrocardiogram | `0` = Normal, `1` = ST-T wave abnormality, `2` = LVH | Categorical |
| 8 | `thalach` | Maximum achieved heart rate (bpm) | Estimated Max: $220 - \text{age}$ | Continuous |
| 9 | `exang` | Exercise-induced angina | `1` = Yes, `0` = No | Categorical |
| 10 | `oldpeak` | ST depression induced by exercise (mm) | Target: < 1.0 mm | Continuous |
| 11 | `slope` | Slope of peak exercise ST segment | `1` = Upsloping, `2` = Flat, `3` = Downsloping | Categorical |
| 12 | `ca` | Major vessels colored by fluoroscopy | `0` – `3` | Categorical |
| 13 | `thal` | Thalassemia myocardial perfusion | `3` = Normal, `6` = Fixed defect, `7` = Reversible defect | Categorical |

---

## 🔌 API Reference

### 1. Authentication Endpoints (`/api/auth`)
* `GET /api/auth/config` — Returns the configured Google OAuth Client ID.
* `POST /api/auth/google` — Verifies Google ID token, registers or updates clinician in SQLite, returns clinician profile and session token.
* `POST /api/auth/dev-login` — Offline demonstration login for development/testing (`Dr. Alex Rivera` or `Dr. Priya Sharma`).
* `GET /api/auth/me?email={email}` — Fetches the profile of an authenticated clinician.

### 2. Diagnosis & Prediction Endpoint
* `POST /predict?clinician_email={email}`
  - Receives the 13 biomarkers plus optional patient metadata.
  - Returns binary classification, risk tier, calibrated probability, and persists the encounter to the database under the clinician's account.

```json
{
  "predicted_class": 1,
  "readable_result": "Disease detected by model",
  "probability": 0.764,
  "probability_percentage": 76.4,
  "risk_tier": "High Risk",
  "saved_to_db": true,
  "encounter_id": 42
}
```

### 3. Patient Chart & History Endpoints (`/api/patients`)
* `GET /api/patients?clinician_email={email}` — Roster of patients belonging to the clinician.
* `GET /api/patients/charts?clinician_email={email}` — Full longitudinal charts and encounters for state hydration.
* `GET /api/patients/{patient_id}?clinician_email={email}` — Single patient encounter history.
* `DELETE /api/patients/{patient_id}?clinician_email={email}` — Cascade deletes patient and all associated encounters.
* `POST /api/patients/sync?clinician_email={email}` — Bulk imports / synchronizes patient records from JSON backup.
* `GET /api/patients/export/json?clinician_email={email}` — Exports clinician's database partition as downloadable JSON.

---

## 📁 Project Directory Structure

```text
Diagnosis-support-tool/
│
├── backend/                        # FastAPI Backend Application
│   ├── auth.py                     # Google OAuth token verification & dev login routes
│   ├── crud.py                     # SQLAlchemy database queries (clinician-scoped)
│   ├── database.py                 # Engine & session initialization (SQLite/PostgreSQL)
│   ├── main.py                     # FastAPI application endpoints & CORS setup
│   ├── models.py                   # SQLAlchemy ORM models (Clinician, Patient, Encounter, Prediction)
│   ├── requirements.txt            # Backend dependencies
│   └── schemas.py                  # Pydantic request/response validation schemas
│
├── frontend/                       # React + Vite Clinical Workspace
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                 # Master application controller & navigation state
│       ├── index.css               # Clinical design system & dark/light theme tokens
│       ├── main.jsx                # React DOM root
│       ├── components/
│       │   ├── AssessmentPage.jsx  # 13-biomarker patient data entry form
│       │   ├── BiomarkerTile.jsx   # Clinical metric summary card
│       │   ├── ErrorBoundary.jsx   # React error boundary component
│       │   ├── HealthOverviewPage.jsx # Reference ranges & physiological guidelines
│       │   ├── HistoryPage.jsx     # Patient roster, trajectory charts & encounter timeline
│       │   ├── HomePage.jsx        # Landing dashboard with summary analytics
│       │   ├── ResultsPage.jsx     # Prediction report & consultation print layout
│       │   ├── RiskGauge.jsx       # SVG probability gauge visualization
│       │   ├── SignInPage.jsx      # Dedicated Google OAuth & demo authentication screen
│       │   ├── TipsPage.jsx        # Lifestyle counseling & patient guidance
│       │   ├── Topbar.jsx          # Header navigation, clinician profile & theme switcher
│       │   ├── WhatIfSimulator.jsx # Counterfactual biomarker exploration tool
│       │   └── XaiAttributionPanel.jsx # Explainable AI feature attribution bars
│       ├── constants/
│       │   └── clinicalConstants.js# Field validation rules, reference ranges & sample profiles
│       └── utils/
│           ├── authStorage.js      # LocalStorage session token utilities
│           ├── storage.js          # Patient charts & theme persistence helpers
│           └── xaiCalculator.js    # Feature contribution calculations
│
├── data/
│   └── processed.cleveland.data    # UCI Cleveland Heart Disease dataset (303 rows)
│
├── models/                         # Serialized ML Pipeline Artifacts
│   ├── best_model_pipeline.joblib  # Production-winning Logistic Regression pipeline
│   ├── soft_voting_pipeline.joblib # Calibrated Soft Voting ensemble pipeline
│   └── trained_model.joblib        # Default inference pipeline
│
├── training/                       # ML Experimentation & Reproducibility Suite
│   ├── baseline.py                 # Majority-class dummy baseline evaluator
│   ├── cross_validation.py         # Leak-free 5-fold cross-validation runner
│   ├── data_preprocessing.py       # Raw cleaning & ColumnTransformer pipeline builder
│   ├── data_split.py               # Reproducible 80/20 stratified split
│   ├── evaluation.py               # Metric calculation & confusion matrix generation
│   ├── individual_models.py        # Estimator factory for LR, SVM, Random Forest
│   ├── run_experiment.py           # Full end-to-end experiment orchestration script
│   └── voting.py                   # Hard and Soft voting ensemble pipelines
│
├── tests/                          # Automated Unit & Integration Tests
│   ├── test_backend.py             # FastAPI prediction & validation tests
│   ├── test_database.py            # SQLite schema, isolation & auth tests
│   └── test_workflow.py            # ML pipeline leak-free verification tests
│
├── scripts/
│   └── view_db.py                  # CLI utility to inspect database records
│
├── .env.example                    # Environment variable configuration template
├── requirements.txt                # Root-level Python dependencies
├── run_experiment.py               # Top-level experiment entry point
├── start_backend.sh                # Helper script to launch FastAPI backend
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
* **Python**: 3.10+ (tested on Python 3.11 / 3.12 / 3.13)
* **Node.js**: 18+ & **npm**

### 2. Environment Configuration
Create a `.env` file in the project root (or copy `.env.example`):

```bash
cp .env.example .env
```

Set your Google OAuth Client ID:
```ini
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# Optional: DATABASE_URL=sqlite:///./heartcare.db
```

### 3. Backend Setup & Startup

```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Start the FastAPI backend
uvicorn backend.main:app --reload --port 8000
```
Backend API interactive documentation will be available at **http://127.0.0.1:8000/docs**.

### 4. Frontend Setup & Startup

```bash
# 1. Navigate to frontend directory and install dependencies
cd frontend
npm install

# 2. Launch Vite development server
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🧪 Automated Testing

Run the full verification suite across ML, API, and database layers:

```bash
# 1. ML Leak-Free Protocol Tests
python -m unittest tests/test_workflow.py

# 2. Backend Prediction API Tests
python -m unittest tests/test_backend.py

# 3. Database Persistence & Auth Tests
python -m unittest tests/test_database.py

# 4. Frontend Production Build Check
cd frontend && npm run build
```

---

## ⚙️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18, Vite |
| **Styling & Design** | CSS3 Custom Properties, Responsive Layouts, Dark/Light Themes |
| **Authentication** | Google Identity Services (`@react-oauth/google`), Session Storage |
| **Explainable AI (XAI)** | Custom Normalized Feature Attribution, Counterfactual Simulation |
| **Backend API** | FastAPI, Pydantic v2, Uvicorn |
| **Database & ORM** | SQLAlchemy 2.0, SQLite (PostgreSQL compatible) |
| **Machine Learning** | scikit-learn, joblib, pandas, NumPy |
| **Testing** | Python `unittest`, FastAPI `TestClient` |

---

## 👥 Project Information

* **Author:** Abhishek Suryavanshi
* **Project:** Multi-Model Diagnosis Support Tool (HeartCare)
* **Domain:** Healthcare & Clinical Decision Support Systems
* **License:** Educational & Academic Use Only
