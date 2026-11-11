import os
import joblib
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

try:
    from backend.schemas import (
        HeartDiseaseInput,
        PredictionResponse,
        PatientSummaryResponse,
        BulkSyncResponse
    )
    from backend.database import get_db, init_db
    from backend.crud import (
        get_or_create_patient,
        create_encounter_with_prediction,
        get_all_patients_charts,
        get_patient_roster,
        get_patient_by_id,
        delete_patient,
        import_bulk_charts,
        get_clinician_by_email,
        get_or_create_clinician
    )
    from backend.auth import router as auth_router
except ImportError:
    from schemas import (
        HeartDiseaseInput,
        PredictionResponse,
        PatientSummaryResponse,
        BulkSyncResponse
    )
    from database import get_db, init_db
    from crud import (
        get_or_create_patient,
        create_encounter_with_prediction,
        get_all_patients_charts,
        get_patient_roster,
        get_patient_by_id,
        delete_patient,
        import_bulk_charts,
        get_clinician_by_email,
        get_or_create_clinician
    )
    from auth import router as auth_router

# 1. Initialize FastAPI application
app = FastAPI(
    title="Multi-Model Diagnosis Support Tool API",
    description="Backend API for Heart Disease Risk Prediction & Clinical SQL Persistence",
    version="1.2.0"
)

# 2. Configure CORS for local Vite frontend (and common LAN origins during host:true)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router (/api/auth)
app.include_router(auth_router)

# 3. Model Loading Logic
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "models", "best_model_pipeline.joblib")
FALLBACK_MODEL_PATH = os.path.join(BASE_DIR, "models", "trained_model.joblib")

loaded_model = None
model_load_error = None

try:
    if os.path.exists(MODEL_PATH):
        loaded_model = joblib.load(MODEL_PATH)
    elif os.path.exists(FALLBACK_MODEL_PATH):
        loaded_model = joblib.load(FALLBACK_MODEL_PATH)
    else:
        model_load_error = f"Model file not found at {MODEL_PATH} or {FALLBACK_MODEL_PATH}"
except Exception as e:
    model_load_error = f"Failed to load model pipeline: {str(e)}"

# Expected feature names in exact order
FEATURE_NAMES = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal"
]

# Valid values for categorical features
VALID_CATEGORIES = {
    "sex": {0.0, 1.0},
    "cp": {1.0, 2.0, 3.0, 4.0},
    "fbs": {0.0, 1.0},
    "restecg": {0.0, 1.0, 2.0},
    "exang": {0.0, 1.0},
    "slope": {1.0, 2.0, 3.0},
    "ca": {0.0, 1.0, 2.0, 3.0},
    "thal": {3.0, 6.0, 7.0}
}


try:
    init_db()
except Exception as e:
    print(f"Warning: Initial database setup notice: {e}")


@app.on_event("startup")
def on_startup():
    """Ensure database tables exist on service startup."""
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")


# ==============================================================================
# Helper: resolve clinician from email query param
# ==============================================================================

def resolve_clinician_id(db: Session, clinician_email: Optional[str]) -> Optional[int]:
    """Look up clinician by email, return their DB id or None."""
    if not clinician_email:
        return None
    clinician = get_clinician_by_email(db, clinician_email)
    if clinician:
        return clinician.id
    # Auto-create for dev convenience (e.g. first sync before explicit login)
    clinician = get_or_create_clinician(db, email=clinician_email, name=clinician_email.split("@")[0].title())
    return clinician.id


# ==============================================================================
# Core endpoints
# ==============================================================================

@app.get("/")
def read_root():
    """Simple confirmation endpoint."""
    return {"message": "Multi-Model Diagnosis Support Tool Backend is running"}


@app.get("/health")
def health_check():
    """Health check endpoint reporting API and model status."""
    if loaded_model is None:
        return {
            "status": "degraded",
            "model_loaded": False,
            "error": model_load_error
        }
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_name": "Logistic Regression Pipeline",
        "database": "SQLAlchemy SQLite/Relational Connected"
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_heart_disease(
    patient_data: HeartDiseaseInput,
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None, description="Email of the logged-in clinician")
):
    """
    Accepts 13 patient features, validates categorical encodings,
    returns model prediction with positive-class probability, and
    optionally persists encounter & prediction to the SQL database if patient_id is provided.
    """
    if loaded_model is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model pipeline unavailable: {model_load_error}"
        )

    # Validate categorical feature options
    data_dict = patient_data.model_dump()
    for cat_feature, valid_values in VALID_CATEGORIES.items():
        val = float(data_dict[cat_feature])
        if val not in valid_values:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid value for '{cat_feature}': {val}. Allowed options: {sorted(list(valid_values))}"
            )

    # Convert to single-row pandas DataFrame with exact column names
    input_df = pd.DataFrame([[data_dict[col] for col in FEATURE_NAMES]], columns=FEATURE_NAMES)

    try:
        prediction = int(loaded_model.predict(input_df)[0])

        probability = None
        prob_percentage = None
        if hasattr(loaded_model, "predict_proba"):
            probs = loaded_model.predict_proba(input_df)[0]
            probability = float(probs[1])
            prob_percentage = round(probability * 100.0, 2)

        readable_result = (
            "Disease detected by model" if prediction == 1
            else "No disease detected by model"
        )

        risk_tier = (
            "High Risk" if (prob_percentage or 0) >= 65.0
            else ("Moderate Risk" if (prob_percentage or 0) >= 35.0 else "Low Risk")
        )

        saved_to_db = False
        encounter_id = None

        # If patient_id was supplied, automatically persist to SQL database
        if patient_data.patient_id and patient_data.patient_id.strip():
            clinician_id = resolve_clinician_id(db, clinician_email)
            if clinician_id:
                try:
                    patient = get_or_create_patient(
                        db=db,
                        patient_id=patient_data.patient_id,
                        clinician_id=clinician_id,
                        name=patient_data.patient_name
                    )
                    biomarkers = {col: float(data_dict[col]) for col in FEATURE_NAMES}
                    enc = create_encounter_with_prediction(
                        db=db,
                        patient=patient,
                        biomarkers=biomarkers,
                        prediction_result={
                            "predicted_class": prediction,
                            "readable_result": readable_result,
                            "probability": probability,
                            "probability_percentage": prob_percentage,
                            "model_name": "Logistic Regression Pipeline"
                        }
                    )
                    saved_to_db = True
                    encounter_id = enc.id
                except Exception as db_err:
                    # Log DB error without breaking prediction response
                    print(f"Warning: Failed to persist encounter to SQL DB: {db_err}")

        return PredictionResponse(
            predicted_class=prediction,
            readable_result=readable_result,
            probability=probability,
            probability_percentage=prob_percentage,
            risk_tier=risk_tier,
            saved_to_db=saved_to_db,
            encounter_id=encounter_id
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating prediction: {str(e)}"
        )


# ==============================================================================
# Clinical SQL Database REST Endpoints — all scoped to logged-in clinician
# ==============================================================================

@app.get("/api/patients", response_model=List[PatientSummaryResponse])
def list_patients(
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
):
    """Fetch patient roster with latest visit summary, scoped to clinician."""
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        return []
    return get_patient_roster(db, clinician_id)


@app.get("/api/patients/charts")
def get_all_charts(
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """
    Fetch all patient charts for a clinician, formatted for frontend state hydration.
    Matches the schema: { [patientId]: { name, visits: [...] } }
    """
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        return {}
    return get_all_patients_charts(db, clinician_id)


@app.get("/api/patients/{patient_id}")
def get_single_patient_chart(
    patient_id: str,
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
):
    """Fetch full longitudinal encounter history for a specific patient."""
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Clinician not identified.")
    patient = get_patient_by_id(db, patient_id, clinician_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{patient_id}' not found in your records."
        )
    return {
        "patientId": patient.patient_id,
        "name": patient.name,
        "visits": [enc.to_dict() for enc in patient.encounters]
    }


@app.delete("/api/patients/{patient_id}")
def remove_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
):
    """Delete patient and cascade delete all encounters and predictions from SQL database."""
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Clinician not identified.")
    success = delete_patient(db, patient_id, clinician_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient '{patient_id}' not found in your records."
        )
    return {"message": f"Patient '{patient_id}' and all associated encounters deleted successfully."}


@app.post("/api/patients/sync", response_model=BulkSyncResponse)
def sync_patients_from_backup(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
):
    """
    Bulk import/synchronize JSON patient charts into SQL database, scoped to clinician.
    """
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        return BulkSyncResponse(
            status="skipped",
            message="No clinician identified; sync skipped.",
            imported_patients=0,
            imported_visits=0
        )
    patients_count, visits_count = import_bulk_charts(db, payload, clinician_id)
    return BulkSyncResponse(
        status="success",
        message=f"Successfully synchronized {patients_count} patient(s) and {visits_count} encounter(s) into SQL database.",
        imported_patients=patients_count,
        imported_visits=visits_count
    )


@app.get("/api/patients/export/json")
def export_database_as_json(
    db: Session = Depends(get_db),
    clinician_email: Optional[str] = Query(None)
):
    """Export complete SQL database as downloadable JSON backup format, scoped to clinician."""
    clinician_id = resolve_clinician_id(db, clinician_email)
    if not clinician_id:
        return {}
    return get_all_patients_charts(db, clinician_id)
