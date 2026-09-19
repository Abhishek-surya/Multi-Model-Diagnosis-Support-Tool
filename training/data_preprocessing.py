import pandas as pd
import numpy as np

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