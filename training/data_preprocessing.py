import os
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CATEGORICAL_COLUMNS = ["sex", "cp", "fbs", "restecg", "exang", "slope", "ca", "thal"]
NUMERICAL_COLUMNS = ["age", "trestbps", "chol", "thalach", "oldpeak"]


def load_and_clean_data(filepath=None):
    if filepath is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filepath = os.path.join(base_dir, "data", "processed.cleveland.data")

    df = pd.read_csv(filepath, header=None)
    df.columns = [
        "age", "sex", "cp", "trestbps", "chol",
        "fbs", "restecg", "thalach", "exang",
        "oldpeak", "slope", "ca", "thal", "target"
    ]

    # Replace '?' with NaN.
    # Notice: No global imputation is done here to avoid data leakage!
    df = df.replace("?", np.nan)
    df["ca"] = pd.to_numeric(df["ca"])
    df["thal"] = pd.to_numeric(df["thal"])

    # Binary classification: 0 -> No Disease (0), 1-4 -> Disease (1)
    df["target"] = (df["target"] > 0).astype(int)

    X = df.drop("target", axis=1)
    y = df["target"]
    return X, y


def create_preprocessor():
    num_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    cat_transformer = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    return ColumnTransformer([
        ("num", num_transformer, NUMERICAL_COLUMNS),
        ("cat", cat_transformer, CATEGORICAL_COLUMNS)
    ])


if __name__ == "__main__":
    X, y = load_and_clean_data()
    print(f"Loaded dataset: {X.shape[0]} samples, {X.shape[1]} features.")
    print("Target distribution:\n", y.value_counts())