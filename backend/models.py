from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from backend.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class PatientModel(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # One patient has many clinical encounters
    encounters = relationship(
        "EncounterModel",
        back_populates="patient",
        cascade="all, delete-orphan",
        order_by="EncounterModel.recorded_at"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "patientId": self.patient_id,
            "name": self.name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "visits": [enc.to_dict() for enc in self.encounters]
        }


class EncounterModel(Base):
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(
        Integer,
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    recorded_at = Column(DateTime(timezone=True), default=utc_now)

    # 13 Cleveland Clinic Biomarkers
    age = Column(Float, nullable=False)
    sex = Column(Float, nullable=False)
    cp = Column(Float, nullable=False)
    trestbps = Column(Float, nullable=False)
    chol = Column(Float, nullable=False)
    fbs = Column(Float, nullable=False)
    restecg = Column(Float, nullable=False)
    thalach = Column(Float, nullable=False)
    exang = Column(Float, nullable=False)
    oldpeak = Column(Float, nullable=False)
    slope = Column(Float, nullable=False)
    ca = Column(Float, nullable=False)
    thal = Column(Float, nullable=False)

    patient = relationship("PatientModel", back_populates="encounters")
    prediction = relationship(
        "PredictionModel",
        back_populates="encounter",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        form_data = {
            "patientId": self.patient.patient_id if self.patient else "",
            "patientName": self.patient.name if self.patient else "",
            "age": str(self.age),
            "sex": str(self.sex),
            "cp": str(self.cp),
            "trestbps": str(self.trestbps),
            "chol": str(self.chol),
            "fbs": str(self.fbs),
            "restecg": str(self.restecg),
            "thalach": str(self.thalach),
            "exang": str(self.exang),
            "oldpeak": str(self.oldpeak),
            "slope": str(self.slope),
            "ca": str(self.ca),
            "thal": str(self.thal)
        }
        return {
            "id": str(self.id),
            "recordedAt": self.recorded_at.isoformat() if self.recorded_at else None,
            "formData": form_data,
            "result": self.prediction.to_dict() if self.prediction else None
        }


class PredictionModel(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    encounter_id = Column(
        Integer,
        ForeignKey("encounters.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    model_name = Column(String(128), default="Logistic Regression Pipeline", nullable=False)
    predicted_class = Column(Integer, nullable=False)
    readable_result = Column(String(255), nullable=False)
    probability = Column(Float, nullable=True)
    probability_percentage = Column(Float, nullable=True)
    risk_tier = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    encounter = relationship("EncounterModel", back_populates="prediction")

    def to_dict(self):
        return {
            "predicted_class": self.predicted_class,
            "readable_result": self.readable_result,
            "probability": self.probability,
            "probability_percentage": self.probability_percentage,
            "risk_tier": self.risk_tier,
            "model_name": self.model_name
        }
