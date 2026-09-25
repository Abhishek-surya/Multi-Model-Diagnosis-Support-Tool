from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

from training.data_split import prepare_data


def train_and_evaluate_models():
    X_train, X_test, y_train, y_test = prepare_data()

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

    results = {}

    for name, model in models.items():
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)

        accuracy = accuracy_score(y_test, y_pred)

        results[name] = accuracy

        print(f"\n--- {name} ---")
        print("Accuracy:", accuracy)

    return results


if __name__ == "__main__":
    train_and_evaluate_models()