export const emptyForm = {
  patientId: '',
  patientName: '',
  age: '',
  sex: '',
  cp: '',
  trestbps: '',
  chol: '',
  fbs: '',
  restecg: '',
  thalach: '',
  exang: '',
  oldpeak: '',
  slope: '',
  ca: '',
  thal: ''
};

export const numberRules = {
  age: { min: 1, max: 120, label: 'Age' },
  trestbps: { min: 50, max: 260, label: 'Resting blood pressure' },
  chol: { min: 50, max: 650, label: 'Cholesterol' },
  thalach: { min: 50, max: 250, label: 'Maximum heart rate' },
  oldpeak: { min: 0, max: 10, label: 'ST depression' }
};

export const requiredSelects = {
  sex: 'Please select biological sex.',
  cp: 'Please select a chest pain type.',
  fbs: 'Please select a fasting blood sugar result.',
  restecg: 'Please select a resting ECG result.',
  exang: 'Please select whether exercise caused chest pain.',
  slope: 'Please select the ST slope from the report.',
  ca: 'Please select the number of major vessels.',
  thal: 'Please select the thalassemia result.'
};

export const CP_LABELS = {
  '1.0': 'Typical angina',
  '2.0': 'Atypical angina',
  '3.0': 'Non-anginal pain',
  '4.0': 'Asymptomatic (silent ischemia)'
};

export const SLOPE_LABELS = {
  '1.0': 'Upsloping',
  '2.0': 'Flat',
  '3.0': 'Downsloping'
};

export const THAL_LABELS = {
  '3.0': 'Normal blood flow',
  '6.0': 'Fixed defect',
  '7.0': 'Reversible defect'
};

export const RESTECG_LABELS = {
  '0.0': 'Normal',
  '1.0': 'ST-T wave abnormality',
  '2.0': 'Left ventricular hypertrophy'
};

export const SAMPLE_PROFILES = {
  highRisk: {
    patientId: 'PT-8801',
    patientName: 'Robert Vance',
    age: '63',
    sex: '1.0',
    cp: '4.0',
    trestbps: '152',
    chol: '286',
    fbs: '1.0',
    restecg: '2.0',
    thalach: '124',
    exang: '1.0',
    oldpeak: '2.6',
    slope: '2.0',
    ca: '2.0',
    thal: '7.0'
  },
  lowRisk: {
    patientId: 'PT-1042',
    patientName: 'Sarah Jenkins',
    age: '42',
    sex: '0.0',
    cp: '3.0',
    trestbps: '115',
    chol: '178',
    fbs: '0.0',
    restecg: '0.0',
    thalach: '168',
    exang: '0.0',
    oldpeak: '0.2',
    slope: '1.0',
    ca: '0.0',
    thal: '3.0'
  },
  moderateRisk: {
    patientId: 'PT-3320',
    patientName: 'Marcus Chen',
    age: '55',
    sex: '1.0',
    cp: '2.0',
    trestbps: '138',
    chol: '228',
    fbs: '0.0',
    restecg: '1.0',
    thalach: '144',
    exang: '0.0',
    oldpeak: '1.2',
    slope: '2.0',
    ca: '1.0',
    thal: '3.0'
  }
};

export const HEART_TIPS = [
  {
    title: 'Diet counseling',
    body: 'Encourage vegetables, fruit, whole grains, legumes, nuts, and fish. Limit fried food, processed meat, and sugary drinks.'
  },
  {
    title: 'Sodium & Potassium',
    body: 'Aim for less than 5 grams of salt a day. Suggest herbs and lemon instead of table salt, and dietary potassium from leafy greens.'
  },
  {
    title: 'Physical Activity',
    body: 'Recommend 150 minutes of moderate activity weekly. Short 15-minute walks after meals significantly reduce glycemic excursions and BP.'
  },
  {
    title: 'Biomarker Surveillance',
    body: 'Recheck blood pressure, lipid panel, fasting glucose, and BMI at each clinical follow-up, especially for patients over 40.'
  },
  {
    title: 'Sleep and Stress Management',
    body: 'Target 7–9 hours of restorative sleep. Sympathetic overactivation from chronic stress or sleep apnea accelerates vascular remodeling.'
  },
  {
    title: 'Tobacco and Alcohol Cessation',
    body: 'Firmly advise no smoking or vaping. Tobacco cessation decreases cardiovascular event risk by nearly 50% within 1 year.'
  },
  {
    title: 'Visceral Adiposity & Weight',
    body: 'Central adiposity elevates arterial stiffness and atherogenic dyslipidemia. Focus on gradual, sustainable metabolic improvements.'
  },
  {
    title: 'Urgent Red-Flag Warnings',
    body: 'Substernal pressure radiating to jaw or left arm, acute dyspnea, presyncope, or cold diaphoresis warrants immediate emergency triage.'
  }
];

export const REFERENCE_RANGES = [
  // --- 1. Cardiovascular Vitals & Metabolic ---
  {
    id: 'bp',
    category: 'vitals',
    categoryLabel: 'Vitals & Metabolic',
    label: 'Resting Blood Pressure',
    unit: 'mm Hg',
    healthy: '90–120',
    caution: '121–139',
    high: '140+',
    min: 70,
    max: 200,
    healthyMin: 90,
    healthyMax: 120,
    formKey: 'trestbps',
    clinicalSignificance: 'Keeping resting pressure under 120 mm Hg protects artery walls from excessive strain and reduces the heart’s workload.'
  },
  {
    id: 'chol',
    category: 'vitals',
    categoryLabel: 'Vitals & Metabolic',
    label: 'Total Serum Cholesterol',
    unit: 'mg/dL',
    healthy: '< 200',
    caution: '200–239',
    high: '240+',
    min: 80,
    max: 400,
    healthyMin: 80,
    healthyMax: 199,
    formKey: 'chol',
    clinicalSignificance: 'Keeping cholesterol under 200 mg/dL prevents fatty plaque buildup that narrows coronary arteries.'
  },
  {
    id: 'hr',
    category: 'vitals',
    categoryLabel: 'Vitals & Metabolic',
    label: 'Peak Exercise Heart Rate',
    unit: 'bpm',
    healthy: '>= 150 bpm',
    caution: '120–149 bpm',
    high: '< 120 bpm',
    min: 60,
    max: 220,
    healthyMin: 140,
    healthyMax: 205,
    invertScale: true,
    formKey: 'thalach',
    clinicalSignificance: 'A strong peak heart rate during exercise demonstrates good stamina and healthy blood flow to the heart muscle.'
  },
  {
    id: 'sugar',
    category: 'vitals',
    categoryLabel: 'Vitals & Metabolic',
    label: 'Fasting Blood Sugar',
    unit: 'mg/dL',
    healthy: '<= 120 mg/dL',
    caution: '100–120 mg/dL',
    high: '> 120 mg/dL',
    min: 0,
    max: 1,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'fbs',
    categorical: true,
    options: [
      { value: '0.0', label: '<= 120 mg/dL (Normal)', status: 'healthy' },
      { value: '1.0', label: '> 120 mg/dL (Hyperglycemia)', status: 'high' }
    ],
    clinicalSignificance: 'Normal fasting blood sugar (≤ 120 mg/dL) protects delicate blood vessel linings and lowers long-term cardiovascular risk.'
  },
  {
    id: 'age',
    category: 'vitals',
    categoryLabel: 'Vitals & Metabolic',
    label: 'Patient Chronological Age',
    unit: 'years',
    healthy: '< 45 years',
    caution: '45–64 years',
    high: '65+ years',
    min: 20,
    max: 90,
    healthyMin: 20,
    healthyMax: 44,
    formKey: 'age',
    clinicalSignificance: 'Arteries gradually stiffen and accumulate plaque over decades, making advancing age a key natural risk factor.'
  },

  // --- 2. Electrocardiography & Stress Testing ---
  {
    id: 'oldpeak',
    category: 'ecg',
    categoryLabel: 'ECG & Stress Response',
    label: 'ST Depression (Exercise Ischemia)',
    unit: 'mm',
    healthy: '< 1.0 mm',
    caution: '1.0–1.9 mm',
    high: '>= 2.0 mm',
    min: 0.0,
    max: 5.0,
    healthyMin: 0.0,
    healthyMax: 0.9,
    formKey: 'oldpeak',
    clinicalSignificance: 'A downward ECG dip of 1.0 mm or more during exercise indicates the heart muscle is not receiving enough oxygen.'
  },
  {
    id: 'slope',
    category: 'ecg',
    categoryLabel: 'ECG & Stress Response',
    label: 'Peak Exercise ST Slope',
    unit: 'trajectory',
    healthy: 'Type 1: Upsloping',
    caution: 'Type 2: Flat',
    high: 'Type 3: Downsloping',
    min: 1,
    max: 3,
    healthyMin: 1,
    healthyMax: 1,
    formKey: 'slope',
    categorical: true,
    options: [
      { value: '1.0', label: '1: Upsloping (Physiologic)', status: 'healthy' },
      { value: '2.0', label: '2: Flat (Equivocal repolarization)', status: 'caution' },
      { value: '3.0', label: '3: Downsloping (Severe ischemia)', status: 'high' }
    ],
    clinicalSignificance: 'A healthy ECG ST wave rises steeply after exercise. A flat or downward slope warns of reduced coronary blood flow.'
  },
  {
    id: 'restecg',
    category: 'ecg',
    categoryLabel: 'ECG & Stress Response',
    label: 'Resting Electrocardiogram',
    unit: 'rhythm',
    healthy: '0: Normal',
    caution: '1: ST-T Wave Abnormality',
    high: '2: Left Ventricular Hypertrophy',
    min: 0,
    max: 2,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'restecg',
    categorical: true,
    options: [
      { value: '0.0', label: '0: Normal baseline ECG', status: 'healthy' },
      { value: '1.0', label: '1: ST-T wave inversion/depression', status: 'caution' },
      { value: '2.0', label: '2: LVH by Estes criteria', status: 'high' }
    ],
    clinicalSignificance: 'A normal resting ECG confirms regular rhythm without signs of past damage or heart wall thickening (LVH).'
  },
  {
    id: 'exang',
    category: 'ecg',
    categoryLabel: 'ECG & Stress Response',
    label: 'Exercise-Induced Angina',
    unit: 'symptom',
    healthy: 'No (Absent)',
    caution: 'Equivocal chest tightness',
    high: 'Yes (Exertional angina)',
    min: 0,
    max: 1,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'exang',
    categorical: true,
    options: [
      { value: '0.0', label: 'No: Absent during stress', status: 'healthy' },
      { value: '1.0', label: 'Yes: Triggered by exertion', status: 'high' }
    ],
    clinicalSignificance: 'Chest tightness or discomfort triggered specifically by physical exertion signals narrowed arteries that cannot meet oxygen demand.'
  },

  // --- 3. Cardiac Anatomy, Imaging & Demographics ---
  {
    id: 'ca',
    category: 'imaging',
    categoryLabel: 'Anatomy & Imaging',
    label: 'Fluoroscopy Colored Vessels (ca)',
    unit: 'vessels',
    healthy: '0 vessels (Patent)',
    caution: '1 vessel calcified',
    high: '2–3 vessels (Multivessel)',
    min: 0,
    max: 3,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'ca',
    categorical: true,
    options: [
      { value: '0.0', label: '0: Patent (Zero calcified vessels)', status: 'healthy' },
      { value: '1.0', label: '1: Single vessel calcification', status: 'caution' },
      { value: '2.0', label: '2: Two vessels calcified', status: 'high' },
      { value: '3.0', label: '3: Three vessels calcified', status: 'high' }
    ],
    clinicalSignificance: 'Seeing 0 calcified vessels under X-ray is ideal. Any calcified vessel indicates hardened plaque inside coronary arteries.'
  },
  {
    id: 'thal',
    category: 'imaging',
    categoryLabel: 'Anatomy & Imaging',
    label: 'Thallium Myocardial Perfusion',
    unit: 'scintigraphy',
    healthy: 'Code 3: Normal perfusion',
    caution: 'Code 6: Fixed defect (Scar)',
    high: 'Code 7: Reversible defect (Ischemia)',
    min: 3,
    max: 7,
    healthyMin: 3,
    healthyMax: 3,
    formKey: 'thal',
    categorical: true,
    options: [
      { value: '3.0', label: '3: Normal myocardial blood flow', status: 'healthy' },
      { value: '6.0', label: '6: Fixed defect (Infarct scar)', status: 'caution' },
      { value: '7.0', label: '7: Reversible defect (Transient ischemia)', status: 'high' }
    ],
    clinicalSignificance: 'Nuclear scans show whether heart tissue receives normal blood flow, temporary lack of oxygen, or permanent scar.'
  },
  {
    id: 'cp',
    category: 'imaging',
    categoryLabel: 'Anatomy & Imaging',
    label: 'Chest Pain Presentation (cp)',
    unit: 'category',
    healthy: 'Class 1 / 2 (Typical / Atypical)',
    caution: 'Class 3 (Non-anginal)',
    high: 'Class 4 (Asymptomatic / Silent)',
    min: 1,
    max: 4,
    healthyMin: 1,
    healthyMax: 2,
    formKey: 'cp',
    categorical: true,
    options: [
      { value: '1.0', label: '1: Typical Angina', status: 'healthy' },
      { value: '2.0', label: '2: Atypical Angina', status: 'healthy' },
      { value: '3.0', label: '3: Non-anginal pain', status: 'caution' },
      { value: '4.0', label: '4: Asymptomatic (Silent ischemia)', status: 'high' }
    ],
    clinicalSignificance: 'Typical chest pain prompts immediate investigation, but silent (asymptomatic) blockages can also disguise high cardiovascular risk.'
  }
];

export const ALL_CLINICAL_METRICS = [
  // 1. Overall Model Diagnostic Risk Probability
  {
    key: 'probability',
    label: 'Model Risk Probability',
    unit: '%',
    max: 100,
    lowerIsBetter: true,
    isModel: true,
    category: 'vitals',
    description: 'Predicted probability of coronary heart disease from ML model'
  },
  // 2. Hemodynamic & Laboratory Vitals
  {
    key: 'trestbps',
    label: 'Resting Blood Pressure',
    unit: 'mm Hg',
    max: 200,
    lowerIsBetter: true,
    category: 'vitals',
    description: 'Resting systolic blood pressure upon admission'
  },
  {
    key: 'chol',
    label: 'Serum Cholesterol',
    unit: 'mg/dL',
    max: 400,
    lowerIsBetter: true,
    category: 'vitals',
    description: 'Total serum cholesterol concentration'
  },
  {
    key: 'thalach',
    label: 'Peak Exercise Heart Rate',
    unit: 'bpm',
    max: 220,
    lowerIsBetter: false,
    category: 'vitals',
    description: 'Maximum heart rate achieved during exercise stress testing'
  },
  {
    key: 'fbs',
    label: 'Fasting Blood Sugar',
    unit: '',
    max: 1,
    categorical: true,
    labels: { '0.0': '<= 120 mg/dL (Normal)', '1.0': '> 120 mg/dL (Elevated)' },
    lowerIsBetter: true,
    category: 'vitals',
    description: 'Fasting blood sugar above 120 mg/dL'
  },
  // 3. ECG & Stress Symptom Features
  {
    key: 'oldpeak',
    label: 'ST Depression',
    unit: 'mm',
    max: 8,
    lowerIsBetter: true,
    category: 'ecg',
    description: 'Exercise-induced ST segment depression relative to rest'
  },
  {
    key: 'slope',
    label: 'Peak Exercise ST Slope',
    unit: '',
    max: 3,
    categorical: true,
    labels: SLOPE_LABELS,
    lowerIsBetter: true,
    category: 'ecg',
    description: 'Slope of peak exercise ST segment (Upsloping, Flat, Downsloping)'
  },
  {
    key: 'restecg',
    label: 'Resting ECG Result',
    unit: '',
    max: 2,
    categorical: true,
    labels: RESTECG_LABELS,
    lowerIsBetter: true,
    category: 'ecg',
    description: 'Resting electrocardiographic findings'
  },
  {
    key: 'cp',
    label: 'Chest Pain Presentation',
    unit: '',
    max: 4,
    categorical: true,
    labels: CP_LABELS,
    lowerIsBetter: true,
    category: 'ecg',
    description: 'Clinical chest pain classification'
  },
  {
    key: 'exang',
    label: 'Exercise-Induced Angina',
    unit: '',
    max: 1,
    categorical: true,
    labels: { '0.0': 'No (Absent)', '1.0': 'Yes (Present)' },
    lowerIsBetter: true,
    category: 'ecg',
    description: 'Angina provoked during treadmill or bicycle exercise'
  },
  // 4. Vascular & Nuclear Imaging Scans
  {
    key: 'ca',
    label: 'Major Vessels (Fluoroscopy)',
    unit: 'vessels',
    max: 3,
    lowerIsBetter: true,
    category: 'imaging',
    description: 'Number of major coronary vessels colored by fluoroscopy (0-3)'
  },
  {
    key: 'thal',
    label: 'Thallium Nuclear Scan',
    unit: '',
    max: 7,
    categorical: true,
    labels: THAL_LABELS,
    lowerIsBetter: null,
    category: 'imaging',
    description: 'Myocardial nuclear perfusion scan'
  },
  // 5. Patient Demographics
  {
    key: 'age',
    label: 'Patient Age',
    unit: 'yrs',
    max: 100,
    lowerIsBetter: null,
    category: 'demo',
    description: 'Age in years at time of encounter'
  }
];

export const TREND_METRICS = ALL_CLINICAL_METRICS;
