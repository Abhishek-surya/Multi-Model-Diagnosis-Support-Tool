from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC

from training.data_preprocessing import create_preprocessor
from training.data_split import prepare_data


def get_individual_models():
    """
    Returns the 3 individual classifiers.
    Each model is wrapped in a Pipeline with learned preprocessing
    to ensure zero data leakage during cross-validation and testing.
    """
    return {
        "Logistic Regression": Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42))
        ]),
        "SVM": Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", SVC(kernel="rbf", random_state=42))
        ]),
        "Random Forest": Pipeline([
            ("preprocessor", create_preprocessor()),
            ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))
        ])
    }


# Alias for compatibility
get_individual_pipelines = get_individual_models


if __name__ == "__main__":
    X_train, _, y_train, _ = prepare_data()
    models = get_individual_models()
    for name, model in models.items():
        model.fit(X_train, y_train)
        print(f"Successfully fitted pipeline: {name}")