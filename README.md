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

## 🔬 Data Science Pipeline & Experiment Workflow

The machine-learning pipeline follows a methodologically rigorous, leakage-safe protocol:

```text
Raw Data (Cleveland UCI)
          ↓
Target Binarization (0 → No Disease, 1-4 → Disease)
          ↓
Stratified Train/Test Split (80% Train [242] / 20% Test [61], random_state=42)
          ↓
Training-Only 5-Fold Stratified Cross-Validation (StratifiedKFold, random_state=42)
  - Pipeline with ColumnTransformer fitted separately within each CV training fold
  - Evaluates 5 Candidates: Logistic Regression, SVM (RBF), Random Forest, Hard Voting, Soft Voting
          ↓
Model Selection Based on Training CV (Highest Mean CV Accuracy / F1)
          ↓
Refit Selected Pipeline on Full Training Set (242 samples)
          ↓
Final Test Evaluation on Untouched Held-Out Test Set (61 samples)
          ↓
Persist Pipeline Artifacts (models/best_model_pipeline.joblib, models/soft_voting_pipeline.joblib)
```

### 1. Eliminating Preprocessing Data Leakage

In standard medical ML pipelines, computing preprocessing statistics (such as mean/median imputation, frequency imputation, or feature scaling) across the entire dataset before splitting causes **data leakage**, as distribution information from validation/test samples is inadvertently revealed to the model.

To prevent this:
1. **Raw Cleaning Only**: Placeholder missing values (`'?'`) in columns `ca` and `thal` are converted to `np.nan`. **No global imputation is performed before the split.**
2. **Unified scikit-learn Pipeline**: Imputation, scaling, and encoding are encapsulated inside a `ColumnTransformer` within each candidate's `Pipeline`:
   - **Numerical Features** (`age`, `trestbps`, `chol`, `thalach`, `oldpeak`): `SimpleImputer(strategy='median')` followed by `StandardScaler()`.
   - **Categorical Features** (`sex`, `cp`, `fbs`, `restecg`, `exang`, `slope`, `ca`, `thal`): `SimpleImputer(strategy='most_frequent')` followed by `OneHotEncoder(handle_unknown='ignore', sparse_output=False)`.
3. **Fold-Level Isolation**: When executing 5-fold cross-validation, the `Pipeline` fits its `ColumnTransformer` **strictly on each fold's training split** and applies the learned transformations to that fold's validation split.
4. **Final Test Isolation**: The final pipeline is fitted on all 242 training samples and evaluates against the held-out test set (61 samples) using those training parameters.

---

### 2. Candidate Models & Probability Calibration

The workflow evaluates five candidate architectures:
1. **Logistic Regression**: `LogisticRegression(max_iter=1000, random_state=42)`
2. **Support Vector Machine (SVM)**: `SVC(kernel='rbf', random_state=42)`
3. **Random Forest**: `RandomForestClassifier(n_estimators=100, random_state=42)`
4. **Hard Voting Ensemble**: Combines predictions from LR, SVM, and RF using majority voting.
5. **Soft Voting Ensemble**: Combines predicted probabilities across estimators. To guarantee valid probability estimates without test leakage, SVM is wrapped in `CalibratedClassifierCV(estimator=SVC(...), ensemble=False)`, which learns isotonic/sigmoid calibration internally via cross-validation without using deprecated parameters.

All five candidates are evaluated across the **exact same 5 stratified folds** on training data.

---

### 3. Model Selection vs. Final Test Evaluation

* **Model Comparison & Selection**: Model performance is compared **solely using 5-fold CV metrics on training data**. The held-out test set is never inspected or used for hyperparameter selection.
* **Final Test Evaluation**: Once the winning candidate is chosen (or for final ensemble evaluation), the pipeline is refitted on all 242 training samples and evaluated on the untouched 61 test samples.
* **Methodology Note**: If hyperparameter tuning is repeatedly guided by a single held-out test set, the test set becomes biased. For academic rigor, testing must occur exactly once, or a **nested cross-validation** scheme must be employed.

---

## 📊 Experimental Results

### Training-Only 5-Fold Cross-Validation (242 Samples)

| Candidate Model | Mean CV Accuracy | CV Precision | CV Recall | CV F1 Score |
| :--- | :---: | :---: | :---: | :---: |
| **Logistic Regression** | **0.8471 ± 0.0100** | **0.8768 ± 0.0542** | 0.7834 ± 0.0459 | **0.8245 ± 0.0069** |
| **SVM (RBF Kernel)** | 0.8139 ± 0.0235 | 0.8303 ± 0.0742 | 0.7648 ± 0.0797 | 0.7893 ± 0.0271 |
| **Random Forest** | 0.8181 ± 0.0307 | 0.8173 ± 0.0405 | **0.7826 ± 0.0981** | 0.7948 ± 0.0469 |
| **Hard Voting Ensemble** | 0.8181 ± 0.0162 | 0.8363 ± 0.0658 | 0.7648 ± 0.0797 | 0.7927 ± 0.0249 |
| **Soft Voting Ensemble** | 0.8222 ± 0.0289 | 0.8394 ± 0.0743 | 0.7739 ± 0.0775 | 0.7990 ± 0.0307 |

*Winning model selected by training cross-validation:* **Logistic Regression** (highest mean CV accuracy: 0.8471, lowest variance: ±0.0100).

### Final Evaluation on Untouched Held-Out Test Set (61 Samples)

| Model | Test Accuracy | Precision | Recall | Specificity | F1 Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Majority-Class Baseline** | 0.5410 | 0.0000 | 0.0000 | 1.0000 | 0.0000 | N/A |
| **Logistic Regression (Selected)** | **0.8852** | **0.8387** | **0.9286** | **0.8485** | **0.8814** | **0.9665** |
| **SVM (RBF Kernel)** | 0.8852 | 0.8387 | 0.9286 | 0.8485 | 0.8814 | 0.9643 |
| **Random Forest** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | 0.9437 |
| **Hard Voting Ensemble** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | N/A |
| **Soft Voting Ensemble** | 0.8689 | 0.8125 | 0.9286 | 0.8182 | 0.8667 | 0.9610 |

#### Confusion Matrix (Logistic Regression on Held-Out Test Set):
```text
                  Predicted Negative    Predicted Positive
Actual Negative          28                     5
Actual Positive           2                    26
```

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

The project organizes machine learning training, cross-validation, and testing modules cleanly with separation of concerns:

```text
Diagnosis-support-tool/
│
├── data/
│   └── processed.cleveland.data    # UCI Cleveland Heart Disease dataset (303 rows)
│
├── training/
│   ├── __init__.py
│   ├── data_preprocessing.py       # Raw cleaning, NaN replacement, ColumnTransformer pipeline
│   ├── data_split.py               # Reproducible 80/20 train/test split with stratification
│   ├── individual_models.py        # Estimator factory & pipeline builders (LR, SVM, RF)
│   ├── voting.py                   # Hard and Soft voting ensemble pipelines & calibrated SVM
│   ├── cross_validation.py         # 5-fold CV across all 5 candidates on training data only
│   ├── evaluation.py               # Standard metric calculations and test set evaluators
│   ├── baseline.py                 # Majority-class DummyClassifier baseline
│   └── run_experiment.py           # End-to-end experiment orchestrator
│
├── models/                         # Serialized trained pipelines (ready for inference)
│   ├── best_model_pipeline.joblib  # Winning model pipeline (fitted preprocessor + classifier)
│   ├── soft_voting_pipeline.joblib # Soft voting pipeline (with calibrated probabilities)
│   └── trained_model.joblib        # Default production pipeline
│
├── tests/
│   └── test_workflow.py            # Automated tests verifying zero leakage & workflow rules
│
├── run_experiment.py               # Top-level experiment entry point
├── requirements.txt                # Python dependencies
└── README.md
```

### Module Responsibilities

* **`data_preprocessing.py`**: Loads raw data, sets column headers, converts `'?'` to `np.nan`, binarizes the target, and builds the `ColumnTransformer` (median imputation + scaling for numeric; mode imputation + one-hot encoding for categorical). Imputation is deferred to the pipeline to prevent data leakage.
* **`data_split.py`**: Performs an 80/20 train/test split (`test_size=0.2, random_state=42, stratify=y`), producing 242 training and 61 test samples with verified zero index overlap.
* **`individual_models.py`**: Defines candidate estimators (Logistic Regression, SVM RBF, Random Forest) and encapsulates them in leak-free `Pipeline` instances.
* **`voting.py`**: Defines the Hard Voting and Soft Voting ensembles. Uses `CalibratedClassifierCV` for SVM to generate reliable probabilities without test leakage or deprecated parameters.
* **`cross_validation.py`**: Evaluates all five candidate models using 5-fold stratified cross-validation on **training data only**. Uses the identical folds for all candidates and reports accuracy, precision, recall, and F1 (mean ± std). Selects the winning model based on CV.
* **`evaluation.py`**: Computes accuracy, precision, recall, specificity, F1 score, confusion matrices, and ROC-AUC. Provides utilities to evaluate fitted pipelines on held-out test data.
* **`baseline.py`**: Evaluates a majority-class `DummyClassifier` baseline on train and test sets (54.10% accuracy).
* **`run_experiment.py`**: Orchestrates the complete end-to-end workflow, selects the winning model based on training CV, fits the pipeline on full training data, evaluates on the untouched test set, and saves fitted pipelines to `models/`.

### How to Run

1. **Run the Full Experiment**:
   ```bash
   python run_experiment.py
   ```

2. **Run Individual Steps**:
   ```bash
   # Preprocessing check
   python -m training.data_preprocessing

   # Train/test split check
   python -m training.data_split

   # Baseline model
   python -m training.baseline

   # 5-Fold Stratified Cross-Validation (Training only)
   python -m training.cross_validation

   # Individual model fitting
   python -m training.individual_models

   # Voting ensemble fitting
   python -m training.voting

   # Test set evaluation
   python -m training.evaluation
   ```

3. **Run Automated Verification Tests**:
   ```bash
   python -m unittest tests/test_workflow.py
   ```

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
