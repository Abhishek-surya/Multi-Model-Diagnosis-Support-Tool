from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score
from training.data_split import prepare_data


def evaluate_baseline():
    X_train, X_test, y_train, y_test = prepare_data()

    baseline = DummyClassifier(strategy="most_frequent")
    baseline.fit(X_train, y_train)

    y_pred = baseline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n--- Majority Class Baseline Model ---")
    print(f"Majority class    : {baseline.classes_[0]} (No Disease)")
    print(f"Baseline Accuracy : {acc:.4f}")
    return acc


if __name__ == "__main__":
    evaluate_baseline()