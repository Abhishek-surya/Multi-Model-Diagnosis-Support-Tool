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
  {
    id: 'bp',
    label: 'Resting blood pressure',
    unit: 'mm Hg',
    healthy: '90–120',
    caution: '121–139',
    high: '140+',
    min: 70,
    max: 200,
    healthyMin: 90,
    healthyMax: 120,
    formKey: 'trestbps'
  },
  {
    id: 'chol',
    label: 'Total cholesterol',
    unit: 'mg/dL',
    healthy: 'Under 200',
    caution: '200–239',
    high: '240+',
    min: 80,
    max: 400,
    healthyMin: 80,
    healthyMax: 199,
    formKey: 'chol'
  },
  {
    id: 'hr',
    label: 'Peak heart rate',
    unit: 'bpm',
    healthy: 'Age-adjusted target',
    caution: 'Below expected',
    high: 'Above expected',
    min: 50,
    max: 220,
    healthyMin: 100,
    healthyMax: 170,
    formKey: 'thalach'
  },
  {
    id: 'sugar',
    label: 'Fasting blood sugar',
    unit: '',
    healthy: '120 mg/dL or lower',
    caution: 'Above 120 mg/dL',
    high: 'Needs follow-up',
    min: 0,
    max: 1,
    healthyMin: 0,
    healthyMax: 0,
    formKey: 'fbs',
    categorical: true
  }
];

export const TREND_METRICS = [
  { key: 'trestbps', label: 'Blood pressure', unit: 'mm Hg', max: 200, lowerIsBetter: true },
  { key: 'chol', label: 'Cholesterol', unit: 'mg/dL', max: 400, lowerIsBetter: true },
  { key: 'thalach', label: 'Peak heart rate', unit: 'bpm', max: 220, lowerIsBetter: false },
  { key: 'oldpeak', label: 'ST depression', unit: 'mm', max: 10, lowerIsBetter: true },
  { key: 'ca', label: 'Major vessels', unit: '', max: 3, lowerIsBetter: true }
];
