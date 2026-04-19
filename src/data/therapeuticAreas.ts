export interface TherapeuticArea {
  name: string
  description: string
  typicalEnrollmentDifficulty: 'low' | 'moderate' | 'high' | 'very-high'
  commonEndpoints: string[]
}

export const THERAPEUTIC_AREAS: TherapeuticArea[] = [
  {
    name: 'Oncology',
    description: 'Solid tumors and hematologic malignancies including targeted therapies and immuno-oncology agents',
    typicalEnrollmentDifficulty: 'high',
    commonEndpoints: ['OS', 'PFS', 'Biomarker', 'PROs'],
  },
  {
    name: 'Cardiology',
    description: 'Cardiovascular diseases including heart failure, coronary artery disease, and arrhythmias',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['Safety', 'Biomarker', 'HCRU', 'PROs'],
  },
  {
    name: 'Neurology',
    description: 'Central and peripheral nervous system disorders including MS, Parkinson\'s, Alzheimer\'s, and epilepsy',
    typicalEnrollmentDifficulty: 'high',
    commonEndpoints: ['PROs', 'QoL', 'Safety', 'Biomarker'],
  },
  {
    name: 'Endocrinology',
    description: 'Metabolic and hormonal disorders including diabetes, obesity, and thyroid conditions',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['Biomarker', 'PROs', 'Safety', 'HCRU'],
  },
  {
    name: 'Rheumatology',
    description: 'Inflammatory and autoimmune joint diseases including RA, PsA, and ankylosing spondylitis',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['PROs', 'Safety', 'Biomarker', 'QoL'],
  },
  {
    name: 'Respiratory',
    description: 'Airway and lung diseases including COPD, asthma, and pulmonary fibrosis',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['PROs', 'Safety', 'HCRU', 'QoL'],
  },
  {
    name: 'Gastroenterology',
    description: 'GI tract diseases including IBD, IBS, NASH, and colorectal conditions',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['Safety', 'Biomarker', 'PROs', 'HCRU'],
  },
  {
    name: 'Infectious Disease',
    description: 'Bacterial, viral, and fungal infections including HIV, hepatitis, and respiratory pathogens',
    typicalEnrollmentDifficulty: 'low',
    commonEndpoints: ['Safety', 'Biomarker', 'HCRU'],
  },
  {
    name: 'Rare Disease',
    description: 'Ultra-rare and rare conditions with prevalence <1 in 10,000 requiring specialized site networks',
    typicalEnrollmentDifficulty: 'very-high',
    commonEndpoints: ['PROs', 'Biomarker', 'OS', 'QoL'],
  },
  {
    name: 'Hematology',
    description: 'Blood cancers and disorders including multiple myeloma, leukemia, lymphoma, and hemoglobinopathies',
    typicalEnrollmentDifficulty: 'high',
    commonEndpoints: ['OS', 'Safety', 'Biomarker', 'PROs'],
  },
  {
    name: 'Nephrology',
    description: 'Kidney diseases including CKD, FSGS, IgA nephropathy, and renal transplant management',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['Biomarker', 'Safety', 'HCRU', 'PROs'],
  },
  {
    name: 'Dermatology',
    description: 'Skin conditions including psoriasis, atopic dermatitis, acne, and dermatologic malignancies',
    typicalEnrollmentDifficulty: 'low',
    commonEndpoints: ['PROs', 'Safety', 'QoL', 'Biomarker'],
  },
  {
    name: 'Ophthalmology',
    description: 'Eye diseases including AMD, diabetic retinopathy, glaucoma, and uveitis',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['PROs', 'Safety', 'Biomarker'],
  },
  {
    name: 'Psychiatry',
    description: 'Mental health conditions including depression, schizophrenia, bipolar disorder, and ADHD',
    typicalEnrollmentDifficulty: 'high',
    commonEndpoints: ['PROs', 'QoL', 'Safety'],
  },
  {
    name: 'Immunology',
    description: 'Systemic autoimmune and inflammatory diseases including SLE, Sjögren\'s, and vasculitis',
    typicalEnrollmentDifficulty: 'moderate',
    commonEndpoints: ['Safety', 'Biomarker', 'PROs', 'QoL'],
  },
]

export const difficultyLabel: Record<TherapeuticArea['typicalEnrollmentDifficulty'], string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  'very-high': 'Very High',
}

export const difficultyColor: Record<TherapeuticArea['typicalEnrollmentDifficulty'], string> = {
  low: 'var(--green)',
  moderate: 'var(--yellow)',
  high: 'var(--orange)',
  'very-high': 'var(--red)',
}
