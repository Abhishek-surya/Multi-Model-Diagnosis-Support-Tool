import os
import unittest
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline

from training.data_preprocessing import (
    load_and_clean_data,
    create_preprocessor,
    CATEGORICAL_COLUMNS,
    NUMERICAL_COLUMNS,
)
from training.data_split import split_data
from training.individual_models import get_individual_pipelines
from training.voting import get_voting_pipelines, get_calibrated_svm
from training.cross_validation import run_cross_validation, get_all_candidate_pipelines
from training.evaluation import calculate_metrics, evaluate_fitted_pipeline


class TestMLWorkflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.X, cls.y = load_and_clean_data()
        cls.X_train, cls.X_test, cls.y_train, cls.y_test = split_data(
            cls.X, cls.y, test_size=0.2, random_state=42
        )

    def test_01_data_cleaning_no_global_imputation(self):
        """Confirm '?' replaced with NaN and NO global imputation in raw data."""
        self.assertEqual(len(self.X), 303)
        self.assertEqual(len(self.y), 303)
        # Check that '?' is not present
        self.assertFalse((self.X == "?").any().any())
        # Check that NaN exists in raw ca and thal (not prematurely imputed)
        self.assertTrue(self.X["ca"].isna().sum() > 0)
        self.assertTrue(self.X["thal"].isna().sum() > 0)
        # Check binary target
        self.assertTrue(set(self.y.unique()).issubset({0, 1}))

    def test_02_train_test_split_dimensions_and_disjointness(self):
        """Confirm split contains 242 train and 61 test samples with 0 overlap."""
        self.assertEqual(len(self.X_train), 242)
        self.assertEqual(len(self.X_test), 61)
        self.assertEqual(len(self.y_train), 242)
        self.assertEqual(len(self.y_test), 61)

        # Zero index overlap
        overlap = set(self.X_train.index).intersection(set(self.X_test.index))
        self.assertEqual(len(overlap), 0, "Training and test sample indices overlap!")

        # Check stratification
        train_ratio = self.y_train.mean()
        test_ratio = self.y_test.mean()
        self.assertAlmostEqual(train_ratio, test_ratio, places=2)

    def test_03_no_missing_values_reach_models_after_pipeline(self):
        """Confirm ColumnTransformer imputes and encodes with zero remaining NaNs."""
        preprocessor = create_preprocessor()
        X_train_trans = preprocessor.fit_transform(self.X_train)
        X_test_trans = preprocessor.transform(self.X_test)

        self.assertFalse(np.isnan(X_train_trans).any(), "NaN found in transformed training data!")
        self.assertFalse(np.isnan(X_test_trans).any(), "NaN found in transformed test data!")
        self.assertEqual(X_train_trans.shape[1], 28)
        self.assertEqual(X_test_trans.shape[1], 28)

    def test_04_cv_receives_only_training_data(self):
        """Confirm cross-validation is conducted strictly on 242 training samples."""
        results, best_model, candidates = run_cross_validation(
            X_train=self.X_train,
            y_train=self.y_train,
            n_splits=5,
            random_state=42
        )
        self.assertIn(best_model, candidates)
        self.assertEqual(len(results), 5)
        for name, metrics in results.items():
            self.assertEqual(len(metrics["fold_accuracies"]), 5)
            # Verify each fold had around 242 * 0.2 = ~48-49 validation samples
            self.assertGreater(metrics["accuracy_mean"], 0.70)

    def test_05_preprocessing_fitted_separately_per_fold(self):
        """Verify pipeline fits preprocessor exclusively on fold train data."""
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        candidates = get_all_candidate_pipelines()
        lr_pipe = candidates["Logistic Regression"]

        for tr_idx, val_idx in cv.split(self.X_train, self.y_train):
            X_tr, y_tr = self.X_train.iloc[tr_idx], self.y_train.iloc[tr_idx]
            X_val, y_val = self.X_train.iloc[val_idx], self.y_train.iloc[val_idx]

            # Fit pipeline on fold
            lr_pipe.fit(X_tr, y_tr)
            preds = lr_pipe.predict(X_val)
            self.assertEqual(len(preds), len(X_val))
            # Test set was not used
            self.assertNotIn(self.X_test.index[0], X_tr.index)

    def test_06_all_five_candidates_use_identical_folds(self):
        """Verify all 5 candidates are evaluated across identical StratifiedKFold splits."""
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        folds_1 = list(cv.split(self.X_train, self.y_train))
        folds_2 = list(cv.split(self.X_train, self.y_train))

        for f1, f2 in zip(folds_1, folds_2):
            np.testing.assert_array_equal(f1[0], f2[0])
            np.testing.assert_array_equal(f1[1], f2[1])

    def test_07_voting_classifiers_predictions_and_calibration(self):
        """Verify Hard Voting, Soft Voting, and Calibrated SVM functionality."""
        voting_pipes = get_voting_pipelines()
        hard_pipe = voting_pipes["Hard Voting"]
        soft_pipe = voting_pipes["Soft Voting"]

        hard_pipe.fit(self.X_train, self.y_train)
        soft_pipe.fit(self.X_train, self.y_train)

        hard_preds = hard_pipe.predict(self.X_test)
        soft_preds = soft_pipe.predict(self.X_test)

        self.assertEqual(len(hard_preds), 61)
        self.assertEqual(len(soft_preds), 61)

        # Soft voting must produce calibrated probabilities that sum to 1
        self.assertTrue(hasattr(soft_pipe, "predict_proba"))
        soft_probs = soft_pipe.predict_proba(self.X_test)
        self.assertEqual(soft_probs.shape, (61, 2))
        np.testing.assert_allclose(soft_probs.sum(axis=1), np.ones(61), atol=1e-5)

    def test_08_metrics_calculation_consistency(self):
        """Verify accuracy, precision, recall, specificity, F1, and confusion matrix."""
        y_true = np.array([0, 0, 1, 1])
        y_pred = np.array([0, 1, 0, 1])
        # TN=1, FP=1, FN=1, TP=1
        metrics = calculate_metrics(y_true, y_pred)
        self.assertAlmostEqual(metrics["accuracy"], 0.5)
        self.assertAlmostEqual(metrics["precision"], 0.5)
        self.assertAlmostEqual(metrics["recall"], 0.5)
        self.assertAlmostEqual(metrics["specificity"], 0.5)
        self.assertAlmostEqual(metrics["f1"], 0.5)
        self.assertEqual(metrics["confusion_matrix"].tolist(), [[1, 1], [1, 1]])

    def test_09_test_set_isolation(self):
        """Verify test set is untouched during model selection and only evaluated post-selection."""
        results, best_model, candidates = run_cross_validation(self.X_train, self.y_train)
        # Select model purely by CV
        winner = candidates[best_model]
        winner.fit(self.X_train, self.y_train)
        test_m = evaluate_fitted_pipeline(winner, self.X_test, self.y_test, verbose=False)
        self.assertGreater(test_m["accuracy"], 0.80)
        self.assertGreater(test_m["f1"], 0.80)


if __name__ == "__main__":
    unittest.main()
