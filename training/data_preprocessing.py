import pandas as pd
import numpy as np

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def load_and_clean_data():
    # Load dataset
    df = pd.read_csv(
        "data/processed.cleveland.data",
        header=None
    )

    # Assign column names
    df.columns = [
        "age", "sex", "cp", "trestbps", "chol",
        "fbs", "restecg", "thalach", "exang",
        "oldpeak", "slope", "ca", "thal", "target"
    ]

    # Check missing placeholders before replacement
    print("Missing placeholders before replacement:")
    print((df == "?").sum())

    # Replace '?' with NaN
    df = df.replace("?", np.nan)

    # Check missing values after replacement
    print("\nMissing values after replacement:")
    print(df.isnull().sum())

    # Impute missing values
    df["ca"] = df["ca"].fillna(df["ca"].mode()[0])
    df["thal"] = df["thal"].fillna(df["thal"].mode()[0])

    # Convert to numeric
    df["ca"] = pd.to_numeric(df["ca"])
    df["thal"] = pd.to_numeric(df["thal"])

    # Convert target to binary
    df["target"] = (df["target"] > 0).astype(int)

    # Separate features and target
    X = df.drop("target", axis=1)
    y = df["target"]

    return X, y


def create_preprocessor():
    categorical_columns = [
        "sex", "cp", "fbs", "restecg",
        "exang", "slope", "ca", "thal"
    ]

    numerical_columns = [
        "age", "trestbps", "chol",
        "thalach", "oldpeak"
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                numerical_columns
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore"),
                categorical_columns
            )
        ]
    )

    return preprocessor