const API_URL = "http://127.0.0.1:8010/predict";

const form = document.getElementById("predictionForm");
const predictBtn = document.getElementById("predictBtn");
const fillSampleBtn = document.getElementById("fillSampleBtn");
const clearBtn = document.getElementById("clearBtn");
const formMessage = document.getElementById("formMessage");

const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const resultState = document.getElementById("resultState");

const riskBanner = document.getElementById("riskBanner");
const riskTitle = document.getElementById("riskTitle");
const riskDescription = document.getElementById("riskDescription");
const probabilityValue = document.getElementById("probabilityValue");
const predictionValue = document.getElementById("predictionValue");
const genderValue = document.getElementById("genderValue");
const bmiValue = document.getElementById("bmiValue");
const pulseValue = document.getElementById("pulseValue");
const payloadPreview = document.getElementById("payloadPreview");
const rawResponse = document.getElementById("rawResponse");

const sampleData = {
  age: 50,
  gender: "male",
  height: 170,
  weight: 70,
  ap_hi: 120,
  ap_lo: 80,
  cholesterol: 1,
  gluc: 1,
  smoke: 0,
  alco: 0,
  active: 1
};

function setStatus(message, kind = "neutral") {
  formMessage.textContent = message;

  if (kind === "error") {
    formMessage.style.color = "#f05d6c";
  } else if (kind === "success") {
    formMessage.style.color = "#18c37e";
  } else {
    formMessage.style.color = "#97a3b6";
  }
}

function resetStates() {
  emptyState.classList.remove("hidden");
  loadingState.classList.add("hidden");
  resultState.classList.add("hidden");
}

function toggleLoading(isLoading) {
  predictBtn.disabled = isLoading;
  predictBtn.textContent = isLoading ? "Predicting..." : "Run Prediction";

  if (isLoading) {
    emptyState.classList.add("hidden");
    resultState.classList.add("hidden");
    loadingState.classList.remove("hidden");
  } else {
    loadingState.classList.add("hidden");
  }
}

function getNumber(id) {
  return Number(document.getElementById(id).value);
}

function collectPayload() {
  const genderText = document.getElementById("gender").value.toLowerCase();

  if (!["male", "female"].includes(genderText)) {
    throw new Error("Gender must be male or female.");
  }

  const payload = {
    age: getNumber("age"),
    gender: genderText,
    height: getNumber("height"),
    weight: getNumber("weight"),
    ap_hi: getNumber("ap_hi"),
    ap_lo: getNumber("ap_lo"),
    cholesterol: getNumber("cholesterol"),
    gluc: getNumber("gluc"),
    smoke: getNumber("smoke"),
    alco: getNumber("alco"),
    active: getNumber("active")
  };

  if (payload.age < 29 || payload.age > 65) {
    throw new Error("Age must be between 29 and 65 years.");
  }

  if (payload.height < 100 || payload.height > 220) {
    throw new Error("Height must be between 100 and 220 cm.");
  }

  if (payload.weight < 30 || payload.weight > 180) {
    throw new Error("Weight must be between 30 and 180 kg.");
  }

  if (payload.ap_hi < 60 || payload.ap_hi > 240) {
    throw new Error("Systolic pressure (ap_hi) must be between 60 and 240.");
  }

  if (payload.ap_lo < 40 || payload.ap_lo > 150) {
    throw new Error("Diastolic pressure (ap_lo) must be between 40 and 150.");
  }

  if (payload.ap_lo >= payload.ap_hi) {
    throw new Error("Diastolic pressure must be less than systolic pressure.");
  }

  if (![1, 2, 3].includes(payload.cholesterol)) {
    throw new Error("Cholesterol must be 1, 2, or 3.");
  }

  if (![1, 2, 3].includes(payload.gluc)) {
    throw new Error("Glucose must be 1, 2, or 3.");
  }

  if (![0, 1].includes(payload.smoke)) {
    throw new Error("Smoking must be 0 or 1.");
  }

  if (![0, 1].includes(payload.alco)) {
    throw new Error("Alcohol must be 0 or 1.");
  }

  if (![0, 1].includes(payload.active)) {
    throw new Error("Physical activity must be 0 or 1.");
  }

  return payload;
}

function showResult(result, payload) {
  emptyState.classList.add("hidden");
  loadingState.classList.add("hidden");
  resultState.classList.remove("hidden");

  const prediction = Number(result.prediction ?? 0);
  const probability = Number(result.probability ?? 0);
  const probabilityPercent = `${(probability * 100).toFixed(2)}%`;
  const predictionLabel = prediction === 1 ? "High Risk" : "Low Risk";

  predictionValue.textContent = result.risk_label || predictionLabel;
  genderValue.textContent = result.gender || payload.gender;
  bmiValue.textContent = result.bmi !== undefined ? String(result.bmi) : "--";
  pulseValue.textContent = result.pulse_pressure !== undefined ? String(result.pulse_pressure) : "--";
  probabilityValue.textContent = probabilityPercent;

  riskBanner.classList.remove("low", "high");

  if (prediction === 1) {
    riskBanner.classList.add("high");
    riskTitle.textContent = "High Risk";
    riskDescription.textContent =
      "The model predicts elevated cardiovascular risk for this patient profile.";
  } else {
    riskBanner.classList.add("low");
    riskTitle.textContent = "Low Risk";
    riskDescription.textContent =
      "The model predicts a lower cardiovascular risk for this patient profile.";
  }

  payloadPreview.textContent = JSON.stringify(payload, null, 2);
  rawResponse.textContent = JSON.stringify(result, null, 2);
}

fillSampleBtn.addEventListener("click", () => {
  Object.entries(sampleData).forEach(([key, value]) => {
    const input = document.getElementById(key);
    if (input) {
      input.value = value;
    }
  });

  setStatus("Sample values inserted.", "success");
});

clearBtn.addEventListener("click", () => {
  form.reset();

  document.getElementById("age").value = 50;
  document.getElementById("gender").value = "male";
  document.getElementById("height").value = 170;
  document.getElementById("weight").value = 70;
  document.getElementById("ap_hi").value = 120;
  document.getElementById("ap_lo").value = 80;
  document.getElementById("cholesterol").value = 1;
  document.getElementById("gluc").value = 1;
  document.getElementById("smoke").value = 0;
  document.getElementById("alco").value = 0;
  document.getElementById("active").value = 1;

  resetStates();
  setStatus("Form reset.");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  let payload;

  try {
    payload = collectPayload();
  } catch (error) {
    setStatus(error.message, "error");
    return;
  }

  toggleLoading(true);
  setStatus("Sending request to backend...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(JSON.stringify(data.detail || data.error || "Prediction request failed."));
    }

    showResult(data, payload);
    setStatus("Prediction completed successfully.", "success");
  } catch (error) {
    resetStates();
    setStatus(error.message || "Could not connect to the backend.", "error");
  } finally {
    toggleLoading(false);
  }
});