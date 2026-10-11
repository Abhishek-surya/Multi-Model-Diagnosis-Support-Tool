from typing import Optional
from pydantic import BaseModel, Field


class HeartDiseaseInput(BaseModel):
    """
    13 input features required for heart disease risk prediction,
    matching the Cleveland dataset schema and preprocessing pipeline.
    """
    age: float = Field(
        ...,
        ge=1.0,
        le=120.0,
        description="Patient age in years (e.g., 55)",
        examples=[55.0]
    )
    sex: float = Field(
        ...,
        description="Biological sex (1 = Male, 0 = Female)",
        examples=[1.0]
    )
    cp: float = Field(
        ...,
        description="Chest pain type (1 = Typical angina, 2 = Atypical angina, 3 = Non-anginal pain, 4 = Asymptomatic)",
        examples=[4.0]
    )
    trestbps: float = Field(
        ...,
        ge=50.0,
        le=260.0,
        description="Resting blood pressure in mm Hg (e.g., 130)",
        examples=[130.0]
    )
    chol: float = Field(
        ...,
        ge=50.0,
        le=650.0,
        description="Serum cholesterol in mg/dl (e.g., 250)",
        examples=[250.0]
    )
    fbs: float = Field(
        ...,
        description="Fasting blood sugar > 120 mg/dl (1 = True, 0 = False)",
        examples=[0.0]
    )
    restecg: float = Field(
        ...,
        description="Resting electrocardiographic results (0 = Normal, 1 = ST-T wave abnormality, 2 = Left ventricular hypertrophy)",
        examples=[0.0]
    )
    thalach: float = Field(
        ...,
        ge=50.0,
        le=250.0,
        description="Maximum heart rate achieved (e.g., 150)",
        examples=[150.0]
    )
    exang: float = Field(
        ...,
        description="Exercise-induced angina (1 = Yes, 0 = No)",
        examples=[0.0]
    )
    oldpeak: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="ST depression induced by exercise relative to rest (e.g., 1.5)",
        examples=[1.5]
    )
    slope: float = Field(
        ...,
        description="Slope of the peak exercise ST segment (1 = Upsloping, 2 = Flat, 3 = Downsloping)",
        examples=[2.0]
    )
    ca: float = Field(
        ...,
        description="Number of major vessels (0-3) colored by fluoroscopy",
        examples=[0.0]
    )
    thal: float = Field(
        ...,
        description="Thalassemia (3 = Normal, 6 = Fixed defect, 7 = Reversible defect)",
        examples=[3.0]
    )


class PredictionResponse(BaseModel):
    predicted_class: int
    readable_result: str
    probability: Optional[float] = None
    probability_percentage: Optional[float] = None
