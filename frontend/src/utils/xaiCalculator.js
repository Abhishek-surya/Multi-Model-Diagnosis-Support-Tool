/**
 * Explainable AI (XAI) & Counterfactual Risk Simulation Engine
 * Directly implements the parameters from the trained Cleveland Logistic Regression Pipeline
 * (models/best_model_pipeline.joblib).
 */

export const MODEL_PARAMS = {
  intercept: -0.025790416510559144,
  numerical: {
    age: {
      label: 'Age',
      mean: 54.549586776859506,
      scale: 8.978372765440131,
      coef: -0.06093617935388166
    },
    trestbps: {
      label: 'Resting Blood Pressure',
      unit: 'mm Hg',
      mean: 130.95867768595042,
      scale: 17.58610302878636,
      coef: 0.34055918357603326
    },
    chol: {
      label: 'Serum Cholesterol',
      unit: 'mg/dL',
      mean: 249.8388429752066,
      scale: 52.737566192586975,
      coef: 0.17891988640737677
    },
    thalach: {
      label: 'Maximum Heart Rate Achieved',
      unit: 'bpm',
      mean: 149.96280991735537,
      scale: 22.639527461380734,
      coef: -0.37247387120628966
    },
    oldpeak: {
      label: 'ST Depression (Exercise Ischemia)',
      unit: 'mm',
      mean: 0.9991735537190083,
      scale: 1.1206178835595506,
      coef: 0.25952539845836003
    }
  },
  categorical: {
    // Biological Sex
    'sex_0.0': { feature: 'sex', label: 'Biological Sex: Female', coef: -0.7008358908897291 },
    'sex_1.0': { feature: 'sex', label: 'Biological Sex: Male', coef: 0.6903530973764125 },

    // Chest Pain Category
    'cp_1.0': { feature: 'cp', label: 'Chest Pain: Typical Angina', coef: -0.6191759931524483 },
    'cp_2.0': { feature: 'cp', label: 'Chest Pain: Atypical Angina', coef: 0.1528984214734227 },
    'cp_3.0': { feature: 'cp', label: 'Chest Pain: Non-anginal', coef: -0.5747658356901345 },
    'cp_4.0': { feature: 'cp', label: 'Chest Pain: Asymptomatic (Silent Ischemia)', coef: 1.0305606138558436 },

    // Fasting Blood Sugar
    'fbs_0.0': { feature: 'fbs', label: 'Fasting Glucose: Normal (<=120 mg/dL)', coef: 0.09285943309201423 },
    'fbs_1.0': { feature: 'fbs', label: 'Fasting Glucose: Elevated (>120 mg/dL)', coef: -0.10334222660533054 },

    // Resting ECG
    'restecg_0.0': { feature: 'restecg', label: 'Resting ECG: Normal', coef: -0.15577500264448574 },
    'restecg_1.0': { feature: 'restecg', label: 'Resting ECG: ST-T Wave Abnormality', coef: -0.067730085961381 },
    'restecg_2.0': { feature: 'restecg', label: 'Resting ECG: Left Ventricular Hypertrophy', coef: 0.21302229509255038 },

    // Exercise Angina
    'exang_0.0': { feature: 'exang', label: 'Exercise Angina: Absent', coef: -0.27011479216515505 },
    'exang_1.0': { feature: 'exang', label: 'Exercise Angina: Present', coef: 0.25963199865183895 },

    // ST Slope
    'slope_1.0': { feature: 'slope', label: 'ST Slope: Upsloping (Normal)', coef: -0.44063939944452596 },
    'slope_2.0': { feature: 'slope', label: 'ST Slope: Flat (Equivocal)', coef: 0.6034274153709909 },
    'slope_3.0': { feature: 'slope', label: 'ST Slope: Downsloping (Ischemia)', coef: -0.17327080943978138 },

    // Fluoroscopy Major Vessels (ca)
    'ca_0.0': { feature: 'ca', label: 'Fluoroscopy: 0 Vessels Colored', coef: -1.4986407773210295 },
    'ca_1.0': { feature: 'ca', label: 'Fluoroscopy: 1 Vessel Calcified', coef: 0.3517542457759076 },
    'ca_2.0': { feature: 'ca', label: 'Fluoroscopy: 2 Vessels Calcified', coef: 0.6421710867063096 },
    'ca_3.0': { feature: 'ca', label: 'Fluoroscopy: 3 Vessels Calcified', coef: 0.4942326513254961 },

    // Thalassemia
    'thal_3.0': { feature: 'thal', label: 'Thalassemia: Normal Perfusion', coef: -0.5402428950844362 },
    'thal_6.0': { feature: 'thal', label: 'Thalassemia: Fixed Perfusion Defect', coef: -0.2887306118502661 },
    'thal_7.0': { feature: 'thal', label: 'Thalassemia: Reversible Defect (Ischemia)', coef: 0.8184907134213865 }
  }
};

/**
 * Calculates exact log-odds contributions and explainable attribution for every feature.
 */
export function calculateFeatureAttributions(formData) {
  let logit = MODEL_PARAMS.intercept;
  const attributions = [];

  // 1. Numerical feature contributions
  Object.entries(MODEL_PARAMS.numerical).forEach(([key, param]) => {
    const rawVal = parseFloat(formData[key]);
    if (!Number.isNaN(rawVal)) {
      const zScore = (rawVal - param.mean) / param.scale;
      const contribution = zScore * param.coef;
      logit += contribution;

      attributions.push({
        id: key,
        label: param.label,
        value: `${rawVal} ${param.unit || ''}`.trim(),
        contribution: Math.round(contribution * 1000) / 1000,
        direction: contribution >= 0 ? 'increase' : 'decrease',
        clinicalExplanation: getNumericalExplanation(key, rawVal, contribution)
      });
    }
  });

  // 2. Categorical feature contributions
  const catKeys = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal'];
  catKeys.forEach((key) => {
    const val = formData[key];
    if (val !== '' && val !== null && val !== undefined) {
      const catKey = `${key}_${parseFloat(val).toFixed(1)}`;
      const param = MODEL_PARAMS.categorical[catKey];
      if (param) {
        const contribution = param.coef;
        logit += contribution;

        attributions.push({
          id: key,
          label: param.label,
          value: getCategoryValueLabel(key, val),
          contribution: Math.round(contribution * 1000) / 1000,
          direction: contribution >= 0 ? 'increase' : 'decrease',
          clinicalExplanation: getCategoricalExplanation(key, val, contribution)
        });
      }
    }
  });

  const probability = 1 / (1 + Math.exp(-logit));
  const probabilityPercentage = Math.round(probability * 1000) / 10;

  // Sort by absolute impact
  attributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  const riskIncreasing = attributions.filter((item) => item.contribution > 0.02);
  const riskDecreasing = attributions.filter((item) => item.contribution < -0.02);

  return {
    logit: Math.round(logit * 1000) / 1000,
    probability,
    probabilityPercentage,
    attributions,
    riskIncreasing,
    riskDecreasing
  };
}

/**
 * Computes counterfactual "What-If" simulated risk when modifiable biomarkers are adjusted.
 */
export function calculateSimulatedRisk(baseFormData, modifiedFields) {
  const simulatedData = { ...baseFormData, ...modifiedFields };
  const baseResult = calculateFeatureAttributions(baseFormData);
  const simulatedResult = calculateFeatureAttributions(simulatedData);

  const delta = Math.round((simulatedResult.probabilityPercentage - baseResult.probabilityPercentage) * 10) / 10;

  return {
    baseProbability: baseResult.probabilityPercentage,
    simulatedProbability: simulatedResult.probabilityPercentage,
    delta,
    isRiskReduced: delta < 0,
    reductionMagnitude: Math.abs(delta)
  };
}

function getNumericalExplanation(key, value, contribution) {
  switch (key) {
    case 'trestbps':
      return value >= 140
        ? `Resting systolic BP of ${value} mm Hg exerts chronic shear stress on coronary endothelium, driving up cardiac risk (+${Math.abs(contribution).toFixed(2)} log-odds).`
        : value <= 120
          ? `Systolic pressure in optimal range (<=120 mm Hg) shields coronary microvasculature.`
          : `Mildly elevated blood pressure within prehypertensive range.`;
    case 'chol':
      return value >= 240
        ? `Serum cholesterol of ${value} mg/dL substantially accelerates coronary atherogenesis.`
        : value < 200
          ? `Optimal lipid profile (<200 mg/dL) slows plaque accumulation.`
          : `Borderline lipid level warranting dietary adjustments.`;
    case 'thalach':
      return value < 130
        ? `Reduced peak heart rate capacity (${value} bpm) reflects chronotropic incompetence, an independent ischemia marker.`
        : `Robust exercise heart rate response (${value} bpm) indicates good myocardial reserve.`;
    case 'oldpeak':
      return value >= 1.0
        ? `Exertional ST depression of ${value} mm provides direct electrocardiographic evidence of subendocardial ischemia.`
        : `Minimal ST depression (<1.0 mm) indicates normal myocardial perfusion during stress.`;
    case 'age':
      return `Age baseline contributes to cumulative vascular exposure over time.`;
    default:
      return '';
  }
}

function getCategoryValueLabel(key, val) {
  const mapping = {
    sex: { '1.0': 'Male', '0.0': 'Female' },
    cp: { '1.0': 'Typical Angina', '2.0': 'Atypical Angina', '3.0': 'Non-anginal', '4.0': 'Asymptomatic' },
    fbs: { '1.0': '> 120 mg/dL', '0.0': '<= 120 mg/dL' },
    restecg: { '0.0': 'Normal', '1.0': 'ST-T Abnormality', '2.0': 'LV Hypertrophy' },
    exang: { '1.0': 'Yes', '0.0': 'No' },
    slope: { '1.0': 'Upsloping', '2.0': 'Flat', '3.0': 'Downsloping' },
    ca: { '0.0': '0 vessels', '1.0': '1 vessel', '2.0': '2 vessels', '3.0': '3 vessels' },
    thal: { '3.0': 'Normal', '6.0': 'Fixed Defect', '7.0': 'Reversible Defect' }
  };
  return mapping[key]?.[val] || val;
}

function getCategoricalExplanation(key, val, contribution) {
  if (key === 'ca') {
    return parseFloat(val) > 0
      ? `Fluoroscopy colored ${val} major vessel(s), indicating significant anatomical coronary artery calcification/stenosis.`
      : `Zero fluoroscopic vessel calcifications strongly predicts patent coronary arteries (-1.50 log-odds).`;
  }
  if (key === 'thal') {
    return val === '7.0'
      ? `Reversible perfusion defect indicates viable myocardium suffering transient stress-induced ischemia.`
      : val === '3.0'
        ? `Normal thallium perfusion confirms adequate blood flow across all myocardial segments.`
        : `Fixed perfusion defect indicative of prior infarction scar.`;
  }
  if (key === 'cp') {
    return val === '4.0'
      ? `Asymptomatic category in high-risk patients often corresponds to silent myocardial ischemia, strongly associated with advanced disease (+1.03 log-odds).`
      : val === '1.0'
        ? `Typical angina classic symptoms.`
        : `Non-anginal or atypical discomfort patterns.`;
  }
  if (key === 'exang') {
    return val === '1.0'
      ? `Exercise-induced angina demonstrates myocardial oxygen demand exceeding stenotic supply under exertion.`
      : `Absence of angina during exercise stress is a favorable clinical marker.`;
  }
  if (key === 'slope') {
    return val === '2.0'
      ? `Flat ST segment slope suggests delayed myocardial repolarization due to ischemia.`
      : val === '1.0'
        ? `Upsloping ST segment during peak exercise is the normal physiological response.`
        : `Downsloping ST segment.`;
  }
  return '';
}
