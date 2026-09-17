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