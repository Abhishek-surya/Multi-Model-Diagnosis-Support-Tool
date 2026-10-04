from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.model_selection import StratifiedKFold

from training.data_preprocessing import (
    load_and_clean_data,
    create_preprocessor
)


def run_cross_validation():
    X, y = load_and_clean_data()

    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            random_state=42
        ),

        "SVM": SVC(
            kernel="rbf",
            random_state=42
        ),

        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    }

    # Soft voting needs probability estimates from SVM.
    calibrated_svm = CalibratedClassifierCV(
        estimator=SVC(
            kernel="rbf",
            random_state=42
        ),
        ensemble=False
    )

    voting_model = VotingClassifier(
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

    models["Voting Classifier"] = voting_model

    cv = StratifiedKFold(
        n_splits=5,
        shuffle=True,
        random_state=42
    )

    for name, model in models.items():

        scores = []

        for train_index, validation_index in cv.split(X, y):

            X_train = X.iloc[train_index]
            X_validation = X.iloc[validation_index]

            y_train = y.iloc[train_index]
            y_validation = y.iloc[validation_index]

            # Fit preprocessing only on the training fold.
            preprocessor = create_preprocessor()

            X_train_processed = preprocessor.fit_transform(X_train)
            X_validation_processed = preprocessor.transform(
                X_validation
            )

            model.fit(X_train_processed, y_train)

            score = model.score(
                X_validation_processed,
                y_validation
            )

            scores.append(score)

        print(f"\n--- {name} ---")

        for i, score in enumerate(scores, start=1):
            print(f"Fold {i} Accuracy: {score:.4f}")

        mean_score = sum(scores) / len(scores)

        print(f"Mean CV Accuracy: {mean_score:.4f}")


if __name__ == "__main__":
    run_cross_validation()