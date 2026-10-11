import unittest
from fastapi.testclient import TestClient
import backend.main as backend_module
from backend.main import app


class TestBackendAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.valid_negative_sample = {
            "age": 63.0,
            "sex": 1.0,
            "cp": 1.0,
            "trestbps": 145.0,
            "chol": 233.0,
            "fbs": 1.0,
            "restecg": 2.0,
            "thalach": 150.0,
            "exang": 0.0,
            "oldpeak": 2.3,
            "slope": 3.0,
            "ca": 0.0,
            "thal": 6.0
        }
        cls.valid_positive_sample = {
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

    def test_01_root_endpoint(self):
        """Test GET / returns confirmation message."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Backend is running", response.json().get("message", ""))

    def test_02_health_endpoint(self):
        """Test GET /health reports healthy status and loaded model."""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertTrue(data.get("model_loaded"))

    def test_03_successful_prediction_negative(self):
        """Test POST /predict returns No disease prediction with probability."""
        response = self.client.post("/predict", json=self.valid_negative_sample)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("predicted_class"), 0)
        self.assertEqual(data.get("readable_result"), "No disease detected by model")
        self.assertIsNotNone(data.get("probability"))
        self.assertIsNotNone(data.get("probability_percentage"))

    def test_04_successful_prediction_positive(self):
        """Test POST /predict returns Disease detected prediction with probability."""
        response = self.client.post("/predict", json=self.valid_positive_sample)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("predicted_class"), 1)
        self.assertEqual(data.get("readable_result"), "Disease detected by model")
        self.assertGreater(data.get("probability_percentage"), 50.0)

    def test_05_missing_input_fields(self):
        """Test POST /predict with missing fields returns 422 Unprocessable Entity."""
        incomplete_input = self.valid_negative_sample.copy()
        del incomplete_input["age"]
        response = self.client.post("/predict", json=incomplete_input)
        self.assertEqual(response.status_code, 422)

    def test_06_out_of_range_numerical_fields(self):
        """Test POST /predict with unrealistic numerical range returns 422."""
        invalid_range = self.valid_negative_sample.copy()
        invalid_range["age"] = 999.0
        response = self.client.post("/predict", json=invalid_range)
        self.assertEqual(response.status_code, 422)

    def test_07_invalid_categorical_option(self):
        """Test POST /predict with invalid categorical option returns 400 Bad Request."""
        invalid_cat = self.valid_negative_sample.copy()
        invalid_cat["cp"] = 9.0  # Allowed: 1, 2, 3, 4
        response = self.client.post("/predict", json=invalid_cat)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid value for 'cp'", response.json().get("detail", ""))

    def test_08_model_loading_failure_behavior(self):
        """Test behavior when model fails to load or is None."""
        original_model = backend_module.loaded_model
        try:
            backend_module.loaded_model = None
            backend_module.model_load_error = "Simulated missing model file"

            # /health should report degraded
            health_res = self.client.get("/health")
            self.assertEqual(health_res.status_code, 200)
            self.assertFalse(health_res.json().get("model_loaded"))
            self.assertEqual(health_res.json().get("status"), "degraded")

            # /predict should return 503 Service Unavailable
            pred_res = self.client.post("/predict", json=self.valid_negative_sample)
            self.assertEqual(pred_res.status_code, 503)
        finally:
            backend_module.loaded_model = original_model
            backend_module.model_load_error = None


if __name__ == "__main__":
    unittest.main()
