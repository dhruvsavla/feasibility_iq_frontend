export interface CountryOption {
  code: string
  name: string
  region: string
  regulatoryBody: string
  complexity: 'low' | 'moderate' | 'high'
}

export interface StudyInput {
  study_name: string
  therapeutic_area: string
  indication: string
  intervention: string
  duration_months: number
  followup_months: number
  sample_size: number
  num_sites: number
  num_countries: number
  endpoints: string[]
  eligibility_criteria: string
  countries: CountryOption[]
}

export interface FeasibilityReport {
  feasibility_score: number
  grade: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Not Feasible'
  enrollment_probability: number
  screen_failure_rate: number
  site_activation_weeks: number
  dropout_rate: number
  data_completeness_risk: 'Low' | 'Medium' | 'High'
  regulatory_eta_months: number
  risks: {
    recruitment: number
    data_quality: number
    compliance: number
    regulatory: number
    budget: number
  }
  timeline: Array<{
    phase: string
    weeks: number
    status: 'on-track' | 'moderate' | 'critical'
  }>
  executive_summary: string
  critical_success_factors: string[]
  recommendations: string[]
}

export interface SavedReport {
  label: string
  input: StudyInput
  report: FeasibilityReport
  timestamp: string
}
