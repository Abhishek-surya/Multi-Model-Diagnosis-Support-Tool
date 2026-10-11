import numpy as np
from sklearn.base import clone
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold

from training.data_split import prepare_data
from training.individual_models import get_individual_models
from training.voting import get_voting_models


def get_all_candidate_pipelines():
    models = {}
    models.update(get_individual_models())
    models.update(get_voting_models())
    return models


def run_cross_validation(X_train=None, y_train=None, n_splits=5, random_state=42):
    """
    Performs 5-fold stratified cross-validation on TRAINING DATA ONLY (242 samples).
    The held-out test set (61 samples) is never passed here to prevent data leakage.
    Each candidate pipeline fits its own preprocessing independently on each fold.
    """
    if X_train is None or y_train is None:
        X_train, _, y_train, _ = prepare_data()

    models = get_all_candidate_pipelines()
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    fold_splits = list(cv.split(X_train, y_train))

    results = {}
    print(f"\n=== 5-Fold Stratified CV on Training Data ({len(X_train)} samples) ===")

    for name, pipeline in models.items():
        acc_list, prec_list, rec_list, f1_list = [], [], [], []

        print(f"\n--- {name} ---")
        for fold, (train_idx, val_idx) in enumerate(fold_splits, start=1):
            X_tr, X_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_tr, y_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

            # Clone ensures fresh pipeline fit on this fold
            fold_model = clone(pipeline)
            fold_model.fit(X_tr, y_tr)
            y_pred = fold_model.predict(X_val)

            acc = accuracy_score(y_val, y_pred)
            prec = precision_score(y_val, y_pred, zero_division=0)
            rec = recall_score(y_val, y_pred, zero_division=0)
            f1 = f1_score(y_val, y_pred, zero_division=0)

            acc_list.append(acc)
            prec_list.append(prec)
            rec_list.append(rec)
            f1_list.append(f1)
            print(f"  Fold {fold}: Acc = {acc:.4f} | Prec = {prec:.4f} | Rec = {rec:.4f} | F1 = {f1:.4f}")

        results[name] = {
            "accuracy_mean": float(np.mean(acc_list)),
            "accuracy_std": float(np.std(acc_list)),
            "precision_mean": float(np.mean(prec_list)),
            "precision_std": float(np.std(prec_list)),
            "recall_mean": float(np.mean(rec_list)),
            "recall_std": float(np.std(rec_list)),
            "f1_mean": float(np.mean(f1_list)),
            "f1_std": float(np.std(f1_list)),
            "fold_accuracies": acc_list,
            "fold_f1s": f1_list
        }

        print(f"  Mean Accuracy : {np.mean(acc_list):.4f} (+/- {np.std(acc_list):.4f})")
        print(f"  Mean Precision: {np.mean(prec_list):.4f} (+/- {np.std(prec_list):.4f})")
        print(f"  Mean Recall   : {np.mean(rec_list):.4f} (+/- {np.std(rec_list):.4f})")
        print(f"  Mean F1 Score : {np.mean(f1_list):.4f} (+/- {np.std(f1_list):.4f})")

    # Select winning model based on Training CV
    best_model_name = max(results.keys(), key=lambda k: results[k]["accuracy_mean"])

    print("\n" + "=" * 70)
    print("                    CV COMPARISON SUMMARY")
    print("=" * 70)
    for name, r in results.items():
        print(f"{name:<22}: Acc = {r['accuracy_mean']:.4f} (+/- {r['accuracy_std']:.4f}) | F1 = {r['f1_mean']:.4f} (+/- {r['f1_std']:.4f})")
    print("=" * 70)
    print(f"Selected Winning Model by CV: '{best_model_name}'")

    return results, best_model_name, models


if __name__ == "__main__":
    run_cross_validation()