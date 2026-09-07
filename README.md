# Multi-Model Diagnosis Support Tool

A machine-learning-based **Clinical Decision Support prototype** that analyzes structured patient clinical data and provides a heart-disease risk assessment using multiple machine-learning models combined through ensemble voting.

> **Disclaimer:** This project is an academic clinical decision-support prototype. It is not a certified medical diagnostic system and must not replace professional medical evaluation or clinical testing.

---

## 📌 Project Overview

The **Multi-Model Diagnosis Support Tool** is an Advanced Data Science project focused on healthcare and clinical decision support.

The system uses multiple machine-learning classification models and combines their predictions using **Hard Voting** and **Soft Voting** ensemble strategies.

The goal is to provide a more consistent machine-learning-based risk assessment rather than relying on a single predictive model.

### Basic Workflow

```text
Patient Clinical Data
        ↓
Input Validation
        ↓
Data Preprocessing
        ↓
Multiple ML Models
        ↓
┌───────┴────────┐
↓                ↓
Hard Voting    Soft Voting
↓                ↓
Risk Result    Risk + Probability
└───────┬────────┘
        ↓
FastAPI Backend
        ↓
React Dashboard
```

---

## 🎯 Objectives

* Build a machine-learning-based heart disease risk assessment system.
* Use multiple classification models instead of relying on a single model.
* Implement **Hard Voting** and **Soft Voting** ensemble strategies.
* Validate and preprocess patient inputs before prediction.
* Evaluate models using appropriate classification metrics.
* Provide prediction results through a FastAPI backend.
* Develop a React-based dashboard for interacting with the system.
* Maintain a clear boundary between machine-learning risk assessment and clinical diagnosis.

---

## 🧠 Machine Learning Approach

This project is formulated as a **supervised binary classification problem**.

The system uses multiple candidate classification models, including:

* Logistic Regression
* Random Forest
* Support Vector Machine (SVM)

The individual model predictions are combined using ensemble voting.

### Hard Voting

Hard voting uses the predicted class from each model and selects the class receiving the majority of votes.

Example:

```text
Logistic Regression → High
Random Forest      → High
SVM                → Low

Hard Voting → High
```

### Soft Voting

Soft voting uses the probability predictions produced by the individual models and combines them to obtain an ensemble probability.

Example:

```text
Logistic Regression → 80%
Random Forest      → 70%
SVM                → 60%

Soft Voting → 70%
```

The application can display the results of both strategies independently for comparison.

---

## 📊 Dataset

The project is designed around the **UCI Heart Disease dataset** referenced in the project requirements.

The input features include:

| Feature                 | Description                                 |
| ----------------------- | ------------------------------------------- |
| Age                     | Patient age                                 |
| Biological Sex          | Patient biological sex                      |
| Chest Pain Category     | Type/category of chest pain                 |
| Resting Blood Pressure  | Resting blood pressure measurement          |
| Serum Cholesterol       | Serum cholesterol measurement               |
| Fasting Blood Sugar     | Fasting blood sugar indicator               |
| Resting ECG             | Resting electrocardiogram result            |
| Maximum Heart Rate      | Maximum achieved heart rate                 |
| Exercise-Induced Angina | Presence/absence of exercise-induced angina |
| ST Depression           | ST depression measurement                   |
| ST Slope                | ST-segment slope/category                   |
| Major Vessels           | Number of colored major vessels             |
| Thalassemia Indicator   | Thalassemia-related dataset indicator       |

The exact preprocessing and encoding strategy will be implemented as part of the ML pipeline.

---

## 🔬 Data Science Pipeline

```text
Data Acquisition
       ↓
Data Cleaning
       ↓
Exploratory Data Analysis
       ↓
Feature Preprocessing
       ↓
Train/Test Split
       ↓
Model Training
       ↓
Cross-Validation
       ↓
Ensemble Construction
       ↓
Model Evaluation
       ↓
Model Saving
       ↓
API Integration
       ↓
Web Application
```

### Validation Strategy

The project uses an **80/20 train-test split**.

Five-fold cross-validation is performed on the training data for model development and comparison.

The final test set remains isolated for final evaluation.

---

## 📈 Evaluation Metrics

The models and ensemble strategies will be evaluated using:

* **Sensitivity / Recall**
* **Specificity**
* **F1 Score**

These metrics provide a more informative evaluation than accuracy alone, particularly for a healthcare-oriented classification problem.

---

## 🖥️ Application

The project consists of two major application layers.

### Frontend

Built using:

* React
* Tailwind CSS
* Axios

The dashboard allows the user to:

* Enter patient clinical information.
* Validate input values.
* Submit patient data for prediction.
* View Hard Voting results.
* View Soft Voting results.
* View probability information.
* View model-related information.

### Backend

Built using:

* FastAPI
* Python
* scikit-learn
* pandas
* NumPy

The backend is responsible for:

1. Receiving patient input.
2. Validating the request.
3. Applying the trained preprocessing pipeline.
4. Running the machine-learning models.
5. Generating Hard Voting and Soft Voting results.
6. Returning structured JSON responses.

---

## 🔌 API Overview

### Health Check

```http
GET /health
```

Used to verify that the backend service is running.

### Diagnosis

```http
POST /diagnosis
```

Receives patient clinical data and returns the ensemble prediction.

Illustrative response:

```json
{
  "hard_voting": {
    "risk": "High"
  },
  "soft_voting": {
    "risk": "High",
    "probability": 0.76
  }
}
```

### Model Information

```http
GET /model-info
```

Provides information about the current model configuration and version.

> API schemas may evolve during implementation.

---

## 🔐 Security & Privacy

The project follows a privacy-conscious prototype design.

Key principles include:

* Avoid unnecessary permanent storage of patient information.
* Avoid logging sensitive patient inputs unnecessarily.
* Validate incoming API data.
* Restrict API access through appropriate CORS configuration.
* Use secure communication such as HTTPS during deployment.
* Protect trained model files from unauthorized modification.
* Clearly communicate the clinical decision-support limitation.

---

## 🧪 Testing

Testing will cover multiple levels:

### Input Testing

* Missing values
* Invalid data types
* Unrealistic/out-of-range values
* Required-field validation

### ML Pipeline Testing

* Correct preprocessing
* No preprocessing leakage from test data
* Consistent transformation of new inputs
* Individual model predictions
* Hard Voting predictions
* Soft Voting predictions

### API Testing

* `/health`
* `/diagnosis`
* `/model-info`
* Invalid requests
* Validation errors

### Frontend Testing

* Form behaviour
* Validation messages
* API integration
* Prediction display
* Responsive layout

### Integration Testing

```text
React
  ↓
FastAPI
  ↓
Preprocessing
  ↓
ML Models
  ↓
Voting
  ↓
API Response
  ↓
React Dashboard
```

---

## 🏗️ High-Level Architecture

```text
┌─────────────────────────┐
│     React Frontend      │
│   Patient Dashboard     │
└────────────┬────────────┘
             │
             │ HTTP/JSON
             ↓
┌─────────────────────────┐
│      FastAPI API        │
│ Validation + Routing    │
└────────────┬────────────┘
             ↓
┌─────────────────────────┐
│   ML Preprocessing      │
│ Encoding + Scaling      │
└────────────┬────────────┘
             ↓
     ┌───────┼───────┐
     ↓       ↓       ↓
    LR       RF      SVM
     └───────┼───────┘
             ↓
     ┌───────┴───────┐
     ↓               ↓
Hard Voting      Soft Voting
     ↓               ↓
     └───────┬───────┘
             ↓
       Risk Assessment
             ↓
      React Dashboard
```

---

## 📁 Project Structure

The repository is planned to follow a modular structure:

```text
multi-model-diagnosis-support-tool/
│
├── backend/
│   ├── main.py
│   ├── api/
│   │   ├── health.py
│   │   ├── diagnosis.py
│   │   └── model_info.py
│   │
│   ├── ml/
│   │   ├── preprocessing.py
│   │   ├── models.py
│   │   └── voting.py
│   │
│   ├── schemas/
│   │   └── patient.py
│   │
│   └── models/
│       └── trained_model.pkl
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PatientForm.jsx
│   │   │   ├── RiskCard.jsx
│   │   │   └── ModelBreakdown.jsx
│   │   │
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   │
│   │   └── services/
│   │       └── api.js
│   │
│   └── package.json
│
├── data/
│   └── README.md
│
├── notebooks/
│   └── README.md
│
├── tests/
│
├── requirements.txt
├── README.md
└── .gitignore
```

> The exact structure may change as implementation progresses.

---

## ⚙️ Technology Stack

| Layer           | Technology    |
| --------------- | ------------- |
| Frontend        | React         |
| Styling         | Tailwind CSS  |
| HTTP Client     | Axios         |
| Backend         | FastAPI       |
| Language        | Python        |
| ML              | scikit-learn  |
| Data Processing | pandas, NumPy |
| Visualization   | matplotlib    |
| Version Control | Git + GitHub  |

---

## 🚀 Planned Development Phases

### Phase 1 — Research & Setup

* Understand the problem and dataset.
* Configure development environment.
* Initialize repository.

### Phase 2 — Data & Baselines

* Load and clean the dataset.
* Perform EDA.
* Build baseline models.

### Phase 3 — Ensemble

* Train multiple models.
* Implement Hard Voting.
* Implement Soft Voting.
* Compare results.

### Phase 4 — Evaluation

* Perform cross-validation.
* Evaluate sensitivity, specificity and F1.
* Analyze errors and model behaviour.

### Phase 5 — Backend

* Build FastAPI service.
* Implement validation.
* Integrate trained models.
* Implement prediction endpoints.

### Phase 6 — Frontend

* Build React dashboard.
* Create patient input form.
* Display ensemble results.
* Add risk/probability visualization.

### Phase 7 — Integration & Testing

* Connect frontend and backend.
* Test complete prediction workflow.
* Fix validation and integration issues.

### Phase 8 — Documentation & Demo

* Finalize README.
* Prepare model card.
* Document architecture and decisions.
* Prepare project demonstration.

---

## 👥 Project Information

**Owner:** Abhishek Suryavanshi
**Project:** Multi-Model Diagnosis Support Tool
**Project Type:** Advanced Data Science
**Domain:** Healthcare & Clinical Decision Support

---

## ⚠️ Important Disclaimer

This project is developed for **academic and educational purposes**.

The predictions generated by the system are machine-learning-based risk assessments and **must not be treated as a medical diagnosis**.

The system is intended to support, not replace, qualified healthcare professionals and appropriate clinical testing.
