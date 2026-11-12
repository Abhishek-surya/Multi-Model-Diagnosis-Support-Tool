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
    clinicalSignificance: 'Systolic BP under 120 mm Hg prevents barotrauma, arterial stiffening, and subendocardial shear stress.'
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
    clinicalSignificance: 'Circulating cholesterol < 200 mg/dL prevents ApoB lipid core deposition and coronary plaque formation.'
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
    clinicalSignificance: 'Ability to achieve target heart rate demonstrates chronotropic competence and coronary perfusion reserve.'
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
    clinicalSignificance: 'Euglycemia protects the vascular glycocalyx and suppresses advanced glycation end-product microangiopathy.'
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
    clinicalSignificance: 'Chronological age reflects lifetime cumulative hemodynamic wear, vascular senescence, and intimal remodeling.'
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
    clinicalSignificance: 'Exertional ST-segment depression provides direct electrocardiographic evidence of subendocardial ischemia.'
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
    clinicalSignificance: 'An upsloping ST segment is normal under stress. Flat or downsloping ST signifies delayed myocardial repolarization.'
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
    clinicalSignificance: 'Resting ST-T wave changes or LVH reveal chronic hypertensive pressure overload and baseline repolarization strain.'
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
    clinicalSignificance: 'Angina provoked by exertion indicates myocardial oxygen demand exceeding stenotic coronary blood supply.'
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
    clinicalSignificance: 'Direct fluoroscopic visualization of major coronary artery calcification confirms structural atherosclerotic disease.'
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
    clinicalSignificance: 'Nuclear scintigraphy identifies salvageable under-perfused myocardium (reversible) versus scarred tissue (fixed defect).'
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
    clinicalSignificance: 'In clinical registries, asymptomatic presentations in at-risk patients often disguise occult, severe ischemic disease.'
  }
];

export const TREND_METRICS = [
  { key: 'trestbps', label: 'Blood pressure', unit: 'mm Hg', max: 200, lowerIsBetter: true },
  { key: 'chol', label: 'Cholesterol', unit: 'mg/dL', max: 400, lowerIsBetter: true },
  { key: 'thalach', label: 'Peak heart rate', unit: 'bpm', max: 220, lowerIsBetter: false },
  { key: 'oldpeak', label: 'ST depression', unit: 'mm', max: 10, lowerIsBetter: true },
  { key: 'ca', label: 'Major vessels', unit: '', max: 3, lowerIsBetter: true }
];
