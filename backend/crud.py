from datetime import datetime, timezone
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from backend.models import PatientModel, EncounterModel, PredictionModel


def normalize_patient_id(val: str) -> str:
    return str(val or "").strip().upper()


def get_or_create_patient(db: Session, patient_id: str, name: Optional[str] = None) -> PatientModel:
    norm_id = normalize_patient_id(patient_id)
    patient = db.query(PatientModel).filter(PatientModel.patient_id == norm_id).first()
    if not patient:
        patient = PatientModel(
            patient_id=norm_id,
            name=(name or "Patient").strip()
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
    elif name and name.strip() and patient.name != name.strip():
        patient.name = name.strip()
        db.commit()
        db.refresh(patient)
    return patient


def create_encounter_with_prediction(
    db: Session,
    patient: PatientModel,
    biomarkers: Dict[str, float],
    prediction_result: Dict[str, Any],
    recorded_at: Optional[datetime] = None
) -> EncounterModel:
    """Creates an encounter and its associated prediction record atomically."""
    encounter = EncounterModel(
        patient_id=patient.id,
        recorded_at=recorded_at or datetime.now(timezone.utc),
        age=float(biomarkers["age"]),
        sex=float(biomarkers["sex"]),
        cp=float(biomarkers["cp"]),
        trestbps=float(biomarkers["trestbps"]),
        chol=float(biomarkers["chol"]),
        fbs=float(biomarkers["fbs"]),
        restecg=float(biomarkers["restecg"]),
        thalach=float(biomarkers["thalach"]),
        exang=float(biomarkers["exang"]),
        oldpeak=float(biomarkers["oldpeak"]),
        slope=float(biomarkers["slope"]),
        ca=float(biomarkers["ca"]),
        thal=float(biomarkers["thal"]),
    )
    db.add(encounter)
    db.flush()  # populate encounter.id

    prob = prediction_result.get("probability")
    prob_pct = prediction_result.get("probability_percentage")
    predicted_class = int(prediction_result["predicted_class"])
    readable = prediction_result.get(
        "readable_result",
        "Disease detected by model" if predicted_class == 1 else "No disease detected by model"
    )

    # Determine clinical risk tier
    if prob_pct is not None:
        risk_tier = "High Risk" if prob_pct >= 65.0 else ("Moderate Risk" if prob_pct >= 35.0 else "Low Risk")
    else:
        risk_tier = "High Risk" if predicted_class == 1 else "Low Risk"

    prediction = PredictionModel(
        encounter_id=encounter.id,
        model_name=prediction_result.get("model_name", "Logistic Regression Pipeline"),
        predicted_class=predicted_class,
        readable_result=readable,
        probability=prob,
        probability_percentage=prob_pct,
        risk_tier=risk_tier
    )
    db.add(prediction)
    db.commit()
    db.refresh(encounter)
    return encounter


def get_all_patients_charts(db: Session) -> Dict[str, Dict[str, Any]]:
    """
    Returns all patient charts formatted as the frontend JSON schema:
    {
       "PT-8801": {
          "name": "Robert Vance",
          "visits": [ ... ]
       }
    }
    """
    patients = db.query(PatientModel).order_by(PatientModel.updated_at.desc()).all()
    result = {}
    for p in patients:
        result[p.patient_id] = {
            "name": p.name,
            "visits": [enc.to_dict() for enc in p.encounters]
        }
    return result


def get_patient_roster(db: Session) -> List[Dict[str, Any]]:
    """Returns roster list for the dashboard."""
    patients = db.query(PatientModel).order_by(PatientModel.updated_at.desc()).all()
    roster = []
    for p in patients:
        latest_visit = p.encounters[-1].to_dict() if p.encounters else None
        roster.append({
            "id": p.patient_id,
            "name": p.name,
            "visits": len(p.encounters),
            "latestResult": latest_visit.get("result") if latest_visit else None
        })
    return roster


def get_patient_by_id(db: Session, patient_id: str) -> Optional[PatientModel]:
    norm_id = normalize_patient_id(patient_id)
    return db.query(PatientModel).filter(PatientModel.patient_id == norm_id).first()


def delete_patient(db: Session, patient_id: str) -> bool:
    norm_id = normalize_patient_id(patient_id)
    patient = db.query(PatientModel).filter(PatientModel.patient_id == norm_id).first()
    if not patient:
        return False
    db.delete(patient)
    db.commit()
    return True


def import_bulk_charts(db: Session, charts: Dict[str, Any]) -> Tuple[int, int]:
    """
    Upserts patient charts from JSON backup into SQL database.
    Returns (imported_patients_count, imported_visits_count).
    """
    imported_patients = 0
    imported_visits = 0

    for raw_id, record in charts.items():
        if not isinstance(record, dict):
            continue
        patient_id = normalize_patient_id(raw_id)
        if not patient_id:
            continue

        name = record.get("name") or "Patient"
        patient = get_or_create_patient(db, patient_id=patient_id, name=name)
        imported_patients += 1

        visits = record.get("visits") or []
        for visit in visits:
            if not isinstance(visit, dict):
                continue
            form_data = visit.get("formData") or {}
            result = visit.get("result")
            if not result:
                continue

            # Ensure all 13 features are present
            try:
                biomarkers = {
                    "age": float(form_data.get("age", 50)),
                    "sex": float(form_data.get("sex", 1)),
                    "cp": float(form_data.get("cp", 4)),
                    "trestbps": float(form_data.get("trestbps", 130)),
                    "chol": float(form_data.get("chol", 200)),
                    "fbs": float(form_data.get("fbs", 0)),
                    "restecg": float(form_data.get("restecg", 0)),
                    "thalach": float(form_data.get("thalach", 150)),
                    "exang": float(form_data.get("exang", 0)),
                    "oldpeak": float(form_data.get("oldpeak", 0)),
                    "slope": float(form_data.get("slope", 1)),
                    "ca": float(form_data.get("ca", 0)),
                    "thal": float(form_data.get("thal", 3)),
                }
            except (ValueError, TypeError):
                continue

            recorded_at_dt = None
            if visit.get("recordedAt"):
                try:
                    recorded_at_dt = datetime.fromisoformat(visit["recordedAt"].replace("Z", "+00:00"))
                except Exception:
                    recorded_at_dt = None

            create_encounter_with_prediction(
                db=db,
                patient=patient,
                biomarkers=biomarkers,
                prediction_result=result,
                recorded_at=recorded_at_dt
            )
            imported_visits += 1

    return imported_patients, imported_visits
