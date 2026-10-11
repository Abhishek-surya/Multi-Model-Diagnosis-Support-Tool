import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.schemas import HeartDiseaseInput, PredictionResponse
except ImportError:  # Supports `uvicorn main:app` when cwd is backend/
    from schemas import HeartDiseaseInput, PredictionResponse

# 1. Initialize FastAPI application
app = FastAPI(
    title="Multi-Model Diagnosis Support Tool API",
    description="Backend API for Heart Disease Risk Prediction using trained ML pipeline",
    version="1.0.0"
)

# 2. Configure CORS for local Vite frontend (and common LAN origins during host:true)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Model Loading Logic
# Locate the saved model relative to project root
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
        "model_name": "Logistic Regression Pipeline"
    }


@app.post("/predict", response_model=PredictionResponse)
def predict_heart_disease(patient_data: HeartDiseaseInput):
    """
    Accepts 13 patient features, validates categorical encodings,
    and returns model prediction with positive-class probability.
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
            # Class 1 is positive for heart disease
            probability = float(probs[1])
            prob_percentage = round(probability * 100.0, 2)

        readable_result = (
            "Disease detected by model" if prediction == 1
            else "No disease detected by model"
        )

        return PredictionResponse(
            predicted_class=prediction,
            readable_result=readable_result,
            probability=probability,
            probability_percentage=prob_percentage
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating prediction: {str(e)}"
        )
