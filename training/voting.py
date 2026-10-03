from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

from training.data_split import prepare_data


def train_voting_classifier():
    # Prepare the same leakage-safe training and testing data
    X_train, X_test, y_train, y_test = prepare_data()

    logistic_model = LogisticRegression(
        max_iter=1000,
        random_state=42
    )

    svm_model = SVC(
        kernel="rbf",

        # Required for soft voting because VotingClassifier
        # needs probability estimates from SVM.
        probability=True,

        random_state=42
    )

    random_forest_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    voting_model = VotingClassifier(
        estimators=[
            ("lr", logistic_model),
            ("svm", svm_model),
            ("rf", random_forest_model)
        ],

        voting="soft"
    )

    voting_model.fit(X_train, y_train)

    # Predict the classes for unseen test data.
    y_pred = voting_model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)

    print("\n--- Voting Classifier ---")
    print("Accuracy :", accuracy)
    print("Precision:", precision)
    print("Recall   :", recall)
    print("F1 Score :", f1)

    print("Confusion Matrix:")
    print(cm)


if __name__ == "__main__":
    train_voting_classifier()