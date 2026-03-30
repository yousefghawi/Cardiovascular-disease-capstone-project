from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "gradient_boosting_model.pkl"

app = FastAPI(
    title="Cardio Prediction API",
    version="2.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load(MODEL_PATH)


# ✅ input: gender string
class InputData(BaseModel):
    age: float = Field(..., ge=1, le=120)
    gender: str = Field(..., description="male or female")
    height: float = Field(..., ge=100, le=220)
    weight: float = Field(..., ge=30, le=180)
    ap_hi: float = Field(..., ge=60, le=240)
    ap_lo: float = Field(..., ge=40, le=150)
    cholesterol: int = Field(..., ge=1, le=3)
    gluc: int = Field(..., ge=1, le=3)
    smoke: int = Field(..., ge=0, le=1)
    alco: int = Field(..., ge=0, le=1)
    active: int = Field(..., ge=0, le=1)


# 🔄 input → number
def map_gender_to_number(gender: str) -> int:
    gender = gender.lower()

    if gender == "male":
        return 1
    elif gender == "female":
        return 2
    else:
        raise HTTPException(
            status_code=400,
            detail="gender must be 'male' or 'female'"
        )


# 🔄 number → output
def map_gender_to_string(gender: int) -> str:
    if gender == 1:
        return "male"
    elif gender == 2:
        return "female"
    return "unknown"


def calculate_bmi(height_cm, weight_kg):
    height_m = height_cm / 100
    return weight_kg / (height_m ** 2)


def calculate_bmi_cat(bmi):
    if bmi < 18.5:
        return 0
    elif bmi < 25:
        return 1
    elif bmi < 30:
        return 2
    else:
        return 3


@app.get("/")
def root():
    return {"message": "API is running"}


@app.post("/predict")
def predict(data: InputData):
    try:
        if data.ap_hi <= data.ap_lo:
            raise HTTPException(
                status_code=400,
                detail="ap_hi must be greater than ap_lo",
            )

        gender_num = map_gender_to_number(data.gender)

        bmi = calculate_bmi(data.height, data.weight)
        bmi_cat = calculate_bmi_cat(bmi)
        pulse_pressure = data.ap_hi - data.ap_lo

        features = np.array(
            [[
                data.age,
                gender_num,
                data.height,
                data.weight,
                data.ap_hi,
                data.ap_lo,
                data.cholesterol,
                data.gluc,
                data.smoke,
                data.alco,
                data.active,
                pulse_pressure,
                bmi,
                bmi_cat,
            ]],
            dtype=float,
        )

        prediction = int(model.predict(features)[0])

        response = {
            "prediction": prediction,
            "risk_label": "High Risk" if prediction == 1 else "Low Risk",
            "gender": map_gender_to_string(gender_num),  # ✅ رجعناه string
            "bmi": round(bmi, 2),
            "pulse_pressure": round(pulse_pressure, 2),
        }

        if hasattr(model, "predict_proba"):
            probability = float(model.predict_proba(features)[0][1])
            response["probability"] = round(probability, 6)

        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))