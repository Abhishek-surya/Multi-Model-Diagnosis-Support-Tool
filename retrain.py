"""
Retrain heart disease model with current sklearn version and save to models/.
Run from project root: python retrain.py
"""
import os
import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

DATA_PATH = "data/processed.cleveland.data"
OUT_PATH  = "models/best_model_pipeline.joblib"
OUT2_PATH = "models/trained_model.joblib"

COLS = ["age","sex","cp","trestbps","chol","fbs","restecg",
        "thalach","exang","oldpeak","slope","ca","thal","target"]

df = pd.read_csv(DATA_PATH, header=None, names=COLS, na_values="?")
df.dropna(inplace=True)
df["target"] = (df["target"] > 0).astype(int)

X = df[COLS[:-1]].astype(float)
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf",    LogisticRegression(max_iter=1000, random_state=42, C=1.0))
])

pipe.fit(X_train, y_train)
acc = accuracy_score(y_test, pipe.predict(X_test))
print(f"Accuracy: {acc:.3f}")

os.makedirs("models", exist_ok=True)
joblib.dump(pipe, OUT_PATH)
joblib.dump(pipe, OUT2_PATH)
print(f"Saved → {OUT_PATH}")
print(f"Saved → {OUT2_PATH}")
