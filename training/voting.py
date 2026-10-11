from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC

from training.data_preprocessing import create_preprocessor
from training.data_split import prepare_data


def get_voting_models():
    """
    Returns Hard Voting and Soft Voting ensemble pipelines.
    - Hard Voting: selects the majority vote class among LR, SVM, and RF.
    - Soft Voting: averages predicted probabilities.
      Uses CalibratedClassifierCV on SVM so all estimators output calibrated probabilities.
    """
    lr = LogisticRegression(max_iter=1000, random_state=42)
    svm = SVC(kernel="rbf", random_state=42)
    rf = RandomForestClassifier(n_estimators=100, random_state=42)

    # Calibrated SVM for soft voting probability support
    calibrated_svm = CalibratedClassifierCV(
        estimator=SVC(kernel="rbf", random_state=42),
        ensemble=False
    )

    hard_voting = VotingClassifier(
        estimators=[("lr", lr), ("svm", svm), ("rf", rf)],
        voting="hard"
    )

    soft_voting = VotingClassifier(
        estimators=[("lr", lr), ("svm", calibrated_svm), ("rf", rf)],
        voting="soft"
    )

    return {
        "Hard Voting": Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", hard_voting)
        ]),
        "Soft Voting": Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", soft_voting)
        ])
    }


# Aliases for compatibility
get_voting_pipelines = get_voting_models
get_calibrated_svm = lambda: CalibratedClassifierCV(estimator=SVC(kernel="rbf", random_state=42), ensemble=False)


if __name__ == "__main__":
    X_train, _, y_train, _ = prepare_data()
    models = get_voting_models()
    for name, model in models.items():
        model.fit(X_train, y_train)
        print(f"Successfully fitted pipeline: {name}")