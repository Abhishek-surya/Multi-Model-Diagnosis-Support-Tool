from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier, VotingClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from training.data_split import prepare_data


def evaluate_voting_model(name, model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print(f"\n--- {name} ---")
    print("Accuracy :", accuracy)
    print("Precision:", precision)
    print("Recall   :", recall)
    print("F1 Score :", f1)
    print("Confusion Matrix:")
    print(cm)

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1": f1
    }


def train_voting_classifiers():
    X_train, X_test, y_train, y_test = prepare_data()

    logistic_model = LogisticRegression(
        max_iter=1000,
        random_state=42
    )

    svm_model = SVC(
        kernel="rbf",
        random_state=42
    )

    random_forest_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    # Hard voting uses the predicted class from each model.
    hard_voting_model = VotingClassifier(
        estimators=[
            ("lr", logistic_model),
            ("svm", svm_model),
            ("rf", random_forest_model)
        ],
        voting="hard"
    )

    # Soft voting requires probability estimates from every model.
    calibrated_svm = CalibratedClassifierCV(
        estimator=SVC(
            kernel="rbf",
            random_state=42
        ),
        ensemble=False
    )

    soft_voting_model = VotingClassifier(
        estimators=[
            (
                "lr",
                LogisticRegression(
                    max_iter=1000,
                    random_state=42
                )
            ),
            ("svm", calibrated_svm),
            (
                "rf",
                RandomForestClassifier(
                    n_estimators=100,
                    random_state=42
                )
            )
        ],
        voting="soft"
    )

    hard_results = evaluate_voting_model(
        "Hard Voting",
        hard_voting_model,
        X_train,
        X_test,
        y_train,
        y_test
    )

    soft_results = evaluate_voting_model(
        "Soft Voting",
        soft_voting_model,
        X_train,
        X_test,
        y_train,
        y_test
    )

    print("\n=== Voting Comparison ===")
    print(
        f"Hard Voting Accuracy: "
        f"{hard_results['accuracy']:.4f}"
    )
    print(
        f"Soft Voting Accuracy: "
        f"{soft_results['accuracy']:.4f}"
    )


if __name__ == "__main__":
    train_voting_classifiers()