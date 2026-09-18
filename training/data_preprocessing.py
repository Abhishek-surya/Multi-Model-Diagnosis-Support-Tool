import pandas as pd

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