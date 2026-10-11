import os
import joblib

from training.cross_validation import run_cross_validation
from training.data_split import prepare_data
from training.evaluation import evaluate_fitted_pipeline
from training.voting import get_voting_models


def run_experiment():
    print("=" * 70)
    print("      MULTI-MODEL HEART DISEASE DIAGNOSIS SUPPORT EXPERIMENT")
    print("=" * 70)

    # 1. Load data and run 5-Fold CV on training data only (Model Selection)
    X_train, X_test, y_train, y_test = prepare_data()
    cv_results, best_model_name, candidate_models = run_cross_validation(X_train, y_train)

    # 2. Fit selected winning model on full training set and evaluate on test set
    print(f"\nFitting selected model ('{best_model_name}') on all {len(X_train)} training samples...")
    winning_model = candidate_models[best_model_name]
    winning_model.fit(X_train, y_train)

    print(f"\nFinal Evaluation on Untouched Test Set ({len(X_test)} samples):")
    test_metrics = evaluate_fitted_pipeline(
        winning_model, X_test, y_test, name=f"Final Test: {best_model_name}"
    )

    # 3. Save fitted pipelines for API / backend inference
    os.makedirs("models", exist_ok=True)
    joblib.dump(winning_model, "models/best_model_pipeline.joblib")
    joblib.dump(winning_model, "models/trained_model.joblib")

    # Fit and save Soft Voting pipeline for probability outputs
    soft_voting = get_voting_models()["Soft Voting"]
    soft_voting.fit(X_train, y_train)
    joblib.dump(soft_voting, "models/soft_voting_pipeline.joblib")

    print("\nSaved trained model pipelines to models/ directory successfully!")
    return cv_results, test_metrics


if __name__ == "__main__":
    run_experiment()
