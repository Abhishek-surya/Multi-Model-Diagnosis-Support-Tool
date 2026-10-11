import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

from training.data_split import prepare_data
from training.individual_models import get_individual_models
from training.voting import get_voting_models


def calculate_metrics(y_true, y_pred, y_prob=None):
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0

    auc = None
    if y_prob is not None:
        try:
            auc = float(roc_auc_score(y_true, y_prob))
        except Exception:
            auc = None

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "specificity": specificity,
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "confusion_matrix": cm,
        "roc_auc": auc
    }


def evaluate_fitted_pipeline(model, X_eval, y_eval, name="Model", verbose=True):
    y_pred = model.predict(X_eval)

    y_prob = None
    if hasattr(model, "predict_proba"):
        try:
            y_prob = model.predict_proba(X_eval)[:, 1]
        except Exception:
            pass
    elif hasattr(model, "decision_function"):
        try:
            y_prob = model.decision_function(X_eval)
        except Exception:
            pass

    metrics = calculate_metrics(y_eval, y_pred, y_prob)

    if verbose:
        print(f"\n--- {name} ---")
        print(f"Accuracy   : {metrics['accuracy']:.4f}")
        print(f"Precision  : {metrics['precision']:.4f}")
        print(f"Recall     : {metrics['recall']:.4f}")
        print(f"Specificity: {metrics['specificity']:.4f}")
        print(f"F1 Score   : {metrics['f1']:.4f}")
        if metrics["roc_auc"] is not None:
            print(f"ROC-AUC    : {metrics['roc_auc']:.4f}")
        print("Confusion Matrix:")
        print(metrics["confusion_matrix"])

    return metrics


def evaluate_models_on_test():
    X_train, X_test, y_train, y_test = prepare_data()

    models = {}
    models.update(get_individual_models())
    models.update(get_voting_models())

    print("\n=== Final Test Evaluation (Held-Out 61 Samples) ===")
    results = {}
    for name, model in models.items():
        # Fit on full training set, evaluate on untouched test set
        model.fit(X_train, y_train)
        results[name] = evaluate_fitted_pipeline(model, X_test, y_test, name=name)

    return results


if __name__ == "__main__":
    evaluate_models_on_test()