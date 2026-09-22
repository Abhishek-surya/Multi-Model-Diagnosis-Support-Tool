import pandas as pd
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split

# Load UCI Cleveland dataset
df = pd.read_csv(
    "data/processed.cleveland.data",
    header=None
)

print("Dataset shape:", df.shape)
print("\nFirst 5 rows:")
print(df.head())

print("\nData types:")
print(df.dtypes)

# Assign column names
df.columns = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
    "target"
]

print("\nColumn names:")
print(df.columns)

print("\nMissing values:")
print((df == "?").sum())

print("\nDuplicate rows:")
print(df.duplicated().sum())

# Replace '?' with NaN
df = df.replace("?", np.nan)

print("\nMissing values after replacement:")
print(df.isnull().sum())

# Fill missing categorical values with mode
df["ca"] = df["ca"].fillna(df["ca"].mode()[0])
df["thal"] = df["thal"].fillna(df["thal"].mode()[0])

# Convert columns to numeric
df["ca"] = pd.to_numeric(df["ca"])
df["thal"] = pd.to_numeric(df["thal"])

print("\nMissing values after imputation:")
print(df.isnull().sum())

print("\nData types after conversion:")
print(df.dtypes)

# Convert target into binary classification
df["target"] = (df["target"] > 0).astype(int)

# Separate features and target
X = df.drop("target", axis=1)
y = df["target"]

print("\nTarget distribution:")
print(y.value_counts().sort_index())

print("\nFeatures shape:", X.shape)
print("Target shape:", y.shape)

# Define numerical and categorical columns
categorical_columns = [
    "sex", "cp", "fbs", "restecg",
    "exang", "slope", "ca", "thal"
]

numerical_columns = [
    "age", "trestbps", "chol",
    "thalach", "oldpeak"
]

# Create preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numerical_columns),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_columns)
    ]
)

print("\nPreprocessing pipeline created successfully!")


# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("\nTraining data shape:", X_train.shape)
print("Testing data shape:", X_test.shape)


# Fit preprocessor on training data and transform it
X_train_processed = preprocessor.fit_transform(X_train)

# Transform test data using the already fitted preprocessor
X_test_processed = preprocessor.transform(X_test)

print("\nProcessed training data shape:", X_train_processed.shape)
print("Processed testing data shape:", X_test_processed.shape)