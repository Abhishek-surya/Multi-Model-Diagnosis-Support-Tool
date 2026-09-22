from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score

from training.data_split import prepare_data


# Get preprocessed train and test data
X_train, X_test, y_train, y_test = prepare_data()

# Create baseline model
baseline_model = DummyClassifier(
    strategy="most_frequent"
)

# Train model
baseline_model.fit(X_train, y_train)

# Predict on test data
y_pred = baseline_model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print("\n--- Majority Class Baseline Model ---")
print("Majority class:", baseline_model.classes_[0])
print("Baseline Accuracy:", accuracy)