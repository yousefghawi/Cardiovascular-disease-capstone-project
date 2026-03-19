# 🫀 Cardiovascular Disease Prediction

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Dataset](https://img.shields.io/badge/Dataset-Kaggle-20BEFF)
![Models](https://img.shields.io/badge/Models-XGBoost%20|%20Keras-orange)
![Status](https://img.shields.io/badge/Status-In%20Progress-yellow)

> A machine learning project to predict the presence of cardiovascular disease using patient health data.

---

## 👥 Team Members

-Raneem Mansour, Qutada Shobaki, Sara Allan, Yousef Ghawi, and Raghad Qafesha

---

## 🎯 Problem and Goal

### What are we trying to solve?
Cardiovascular disease (CVD) is the **#1 cause of death globally**, yet many cases go undetected until it's too late.  
This project builds a **binary classification model** that predicts whether a patient has cardiovascular disease based on medical and lifestyle features — enabling early detection and better clinical decisions.

### Why does it matter?
Early prediction can:
- Help doctors prioritize high-risk patients
- Reduce unnecessary tests for low-risk patients
- Support preventive care and lifestyle interventions

---

## 📦 Data

**Source:** [Kaggle — Cardiovascular Disease Dataset](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset)

**Size:** 70,000 patient records | 11 features + 1 target

### What does one row represent?
Each row represents **one patient** who underwent a medical examination, with their physical measurements, lab results, and lifestyle habits.

### Features

| Feature | Type | Description |
|---|---|---|
| `age` | int (days) | Patient age in days |
| `gender` | binary | 1 = Female, 2 = Male |
| `height` | int (cm) | Height |
| `weight` | float (kg) | Weight |
| `ap_hi` | int | Systolic blood pressure |
| `ap_lo` | int | Diastolic blood pressure |
| `cholesterol` | categorical | 1 = Normal, 2 = Above normal, 3 = Well above normal |
| `gluc` | categorical | 1 = Normal, 2 = Above normal, 3 = Well above normal |
| `smoke` | binary | Smoking status |
| `alco` | binary | Alcohol intake |
| `active` | binary | Physical activity |
| **`cardio`** | **binary** | **Target: 1 = CVD present, 0 = CVD absent** |

### Limitations & Notes
- No missing values found 
- Age is stored in days, not years — converted to years in preprocessing
- **~60%** of records are female, which may introduce gender bias in predictions
- **Outliers** exist in blood pressure(ap_hi , ap_lo),height and weight columns, (some negative values, and extremely high readings) - rows removed  
- Data has no geographic label — may not generalize to all populations

- The impossible blood pressure values (ap_hi < ap_lo) where removed
- Cholesterol & Glucose -Most patients have normal levels (median = 1 for both)
- Lifestyle columns (smoke, alco, active) Only **~8.8%** of patients smoke, Only **~5.4%** drink alcohol, **~80%** are physically active.
- Target Variable (cardio) -Mean of **~0.50** means the dataset is perfectly balanced 
---

## 🔍 Approach

### 1. Data Cleaning
- Convert `age` from days → years
- Remove duplicate records
- Remove physiologically impossible values:
  - Blood pressure: `ap_hi < 0`, `ap_lo < 0`, `ap_hi < ap_lo`
  - Remove Height and weight outliers  

### 2. Feature Engineering
- Compute **BMI** from height and weight
- Compute **Pulse Pressure** from systolic and diastolic blood pressure

