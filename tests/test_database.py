import os
import unittest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, get_db
import backend.main as backend_module
from backend.main import app
from backend.crud import (
    get_or_create_patient,
    create_encounter_with_prediction,
    get_all_patients_charts,
    get_patient_roster,
    delete_patient,
    import_bulk_charts
)
from backend.models import PatientModel, EncounterModel, PredictionModel

from sqlalchemy.pool import StaticPool

# Use an in-memory SQLite database with StaticPool for isolated test execution across sessions
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


class TestDatabaseAndAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Override the dependency for test isolation
        app.dependency_overrides[get_db] = override_get_db
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def setUp(self):
        # Create fresh tables in memory before each test
        Base.metadata.create_all(bind=test_engine)
        self.db = TestingSessionLocal()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=test_engine)

    def test_01_create_patient_and_encounter(self):
        """Verify Patient and Encounter models can be created and linked."""
        patient = get_or_create_patient(self.db, "PT-1001", "Alice Heart")
        self.assertIsNotNone(patient.id)
        self.assertEqual(patient.patient_id, "PT-1001")
        self.assertEqual(patient.name, "Alice Heart")

        biomarkers = {
            "age": 58.0, "sex": 0.0, "cp": 2.0, "trestbps": 120.0,
            "chol": 220.0, "fbs": 0.0, "restecg": 0.0, "thalach": 160.0,
            "exang": 0.0, "oldpeak": 0.4, "slope": 1.0, "ca": 0.0, "thal": 3.0
        }
        pred_result = {
            "predicted_class": 0,
            "readable_result": "No disease detected by model",
            "probability": 0.08,
            "probability_percentage": 8.0,
            "model_name": "Logistic Regression Pipeline"
        }
        enc = create_encounter_with_prediction(self.db, patient, biomarkers, pred_result)
        self.assertIsNotNone(enc.id)
        self.assertEqual(enc.patient_id, patient.id)
        self.assertIsNotNone(enc.prediction)
        self.assertEqual(enc.prediction.predicted_class, 0)
        self.assertEqual(enc.prediction.risk_tier, "Low Risk")

    def test_02_predict_endpoint_persists_to_sql_db(self):
        """Verify POST /predict automatically saves encounter when patient_id is present."""
        payload = {
            "patient_id": "PT-9900",
            "patient_name": "Test Subject",
            "age": 67.0,
            "sex": 1.0,
            "cp": 4.0,
            "trestbps": 160.0,
            "chol": 286.0,
            "fbs": 0.0,
            "restecg": 2.0,
            "thalach": 108.0,
            "exang": 1.0,
            "oldpeak": 1.5,
            "slope": 2.0,
            "ca": 3.0,
            "thal": 3.0
        }
        response = self.client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("saved_to_db"))
        self.assertIsNotNone(data.get("encounter_id"))
        self.assertEqual(data.get("predicted_class"), 1)

        # Check that it exists in the database
        patient = self.db.query(PatientModel).filter(PatientModel.patient_id == "PT-9900").first()
        self.assertIsNotNone(patient)
        self.assertEqual(len(patient.encounters), 1)
        self.assertEqual(patient.encounters[0].prediction.predicted_class, 1)

    def test_03_get_patients_roster_and_charts_endpoints(self):
        """Test GET /api/patients and GET /api/patients/charts."""
        # Insert a sample patient
        patient = get_or_create_patient(self.db, "PT-5555", "Bob Davis")
        biomarkers = {
            "age": 60.0, "sex": 1.0, "cp": 4.0, "trestbps": 140.0,
            "chol": 250.0, "fbs": 1.0, "restecg": 1.0, "thalach": 130.0,
            "exang": 1.0, "oldpeak": 2.0, "slope": 2.0, "ca": 1.0, "thal": 7.0
        }
        create_encounter_with_prediction(self.db, patient, biomarkers, {
            "predicted_class": 1,
            "probability": 0.88,
            "probability_percentage": 88.0
        })

        # Test roster endpoint
        res = self.client.get("/api/patients")
        self.assertEqual(res.status_code, 200)
        roster = res.json()
        self.assertEqual(len(roster), 1)
        self.assertEqual(roster[0]["id"], "PT-5555")
        self.assertEqual(roster[0]["visits"], 1)

        # Test full charts endpoint
        res_charts = self.client.get("/api/patients/charts")
        self.assertEqual(res_charts.status_code, 200)
        charts = res_charts.json()
        self.assertIn("PT-5555", charts)
        self.assertEqual(len(charts["PT-5555"]["visits"]), 1)

    def test_04_delete_patient_cascade(self):
        """Verify deleting a patient cascade deletes all encounters and predictions."""
        patient = get_or_create_patient(self.db, "PT-DELETE", "To Be Deleted")
        biomarkers = {
            "age": 50.0, "sex": 1.0, "cp": 1.0, "trestbps": 120.0,
            "chol": 200.0, "fbs": 0.0, "restecg": 0.0, "thalach": 150.0,
            "exang": 0.0, "oldpeak": 0.0, "slope": 1.0, "ca": 0.0, "thal": 3.0
        }
        create_encounter_with_prediction(self.db, patient, biomarkers, {
            "predicted_class": 0,
            "probability": 0.1,
            "probability_percentage": 10.0
        })

        # Confirm encounter and prediction exist
        self.assertEqual(self.db.query(EncounterModel).count(), 1)
        self.assertEqual(self.db.query(PredictionModel).count(), 1)

        # Call DELETE endpoint
        res = self.client.delete("/api/patients/PT-DELETE")
        self.assertEqual(res.status_code, 200)

        # Confirm cascade deletion
        self.assertEqual(self.db.query(PatientModel).count(), 0)
        self.assertEqual(self.db.query(EncounterModel).count(), 0)
        self.assertEqual(self.db.query(PredictionModel).count(), 0)

    def test_05_bulk_sync_endpoint(self):
        """Verify POST /api/patients/sync can import frontend JSON backup."""
        payload = {
            "PT-BULK1": {
                "name": "Bulk Patient One",
                "visits": [
                    {
                        "recordedAt": "2026-03-01T12:00:00Z",
                        "formData": {
                            "age": "55", "sex": "1.0", "cp": "3.0", "trestbps": "130",
                            "chol": "210", "fbs": "0.0", "restecg": "0.0", "thalach": "155",
                            "exang": "0.0", "oldpeak": "0.5", "slope": "1.0", "ca": "0.0", "thal": "3.0"
                        },
                        "result": {
                            "predicted_class": 0,
                            "readable_result": "No disease detected by model",
                            "probability": 0.12,
                            "probability_percentage": 12.0
                        }
                    }
                ]
            }
        }
        res = self.client.post("/api/patients/sync", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data.get("imported_patients"), 1)
        self.assertEqual(data.get("imported_visits"), 1)

        # Verify record in DB
        patient = self.db.query(PatientModel).filter(PatientModel.patient_id == "PT-BULK1").first()
        self.assertIsNotNone(patient)
        self.assertEqual(patient.name, "Bulk Patient One")
        self.assertEqual(len(patient.encounters), 1)

    def test_06_auth_endpoints(self):
        """Verify authentication endpoints: config, dev-login, and me."""
        # 1. Config endpoint
        res_cfg = self.client.get("/api/auth/config")
        self.assertEqual(res_cfg.status_code, 200)
        self.assertIn("google_client_id", res_cfg.json())

        # 2. Dev login
        login_payload = {
            "email": "dr.smith@cardio.org",
            "name": "Dr. Jane Smith"
        }
        res_login = self.client.post("/api/auth/dev-login", json=login_payload)
        self.assertEqual(res_login.status_code, 200)
        data = res_login.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(data["user"]["email"], "dr.smith@cardio.org")
        self.assertEqual(data["user"]["name"], "Dr. Jane Smith")

        # 3. Me endpoint
        res_me = self.client.get("/api/auth/me?email=dr.smith@cardio.org")
        self.assertEqual(res_me.status_code, 200)
        self.assertEqual(res_me.json()["email"], "dr.smith@cardio.org")

        # 4. Google login with invalid token returns 401
        res_google = self.client.post("/api/auth/google", json={"credential": "invalid-token-string"})
        self.assertEqual(res_google.status_code, 401)



if __name__ == "__main__":
    unittest.main()
