import { StudyInput } from '../types'

export function getStudyWarnings(study: StudyInput): string[] {
  const warnings: string[] = []
  const countryCount = study.countries.length
  const patientsPerSite = study.num_sites > 0 ? study.sample_size / study.num_sites : 0
  const sitesPerCountry = countryCount > 0 ? study.num_sites / countryCount : 0
  const totalDuration = study.duration_months + study.followup_months
  const highComplexityCount = study.countries.filter((c) => c.complexity === 'high').length

  if (countryCount === 0) {
    warnings.push('No countries selected — geographic footprint is required')
  }

  if (patientsPerSite > 50) {
    warnings.push(
      `${patientsPerSite.toFixed(1)} patients/site exceeds recommended maximum of 50 — high site fatigue and data quality risk`
    )
  } else if (patientsPerSite > 25) {
    warnings.push(
      `${patientsPerSite.toFixed(1)} patients/site is on the higher end — ensure robust site support`
    )
  }

  if (sitesPerCountry < 2 && countryCount > 0) {
    warnings.push(
      `Only ${sitesPerCountry.toFixed(1)} sites/country — insufficient redundancy if a site withdraws`
    )
  }

  if (totalDuration > 60) {
    warnings.push(
      `${totalDuration} month total duration — expect 25–40% dropout rate, plan intensive retention strategies`
    )
  } else if (totalDuration > 48) {
    warnings.push(
      `${totalDuration} month total duration — elevated dropout risk, budget for retention activities`
    )
  }

  if (study.endpoints.length > 5) {
    warnings.push(
      `${study.endpoints.length} endpoints simultaneously — extreme data collection burden on sites and patients`
    )
  } else if (study.endpoints.length > 4) {
    warnings.push(
      `${study.endpoints.length} endpoints — consider whether all are primary vs secondary to reduce burden`
    )
  }

  if (countryCount > 20 && study.endpoints.includes('Biomarker')) {
    warnings.push(
      `Biomarker collection across ${countryCount} countries — high cold chain and inter-lab variability risk`
    )
  }

  if (countryCount > 0 && countryCount < study.num_sites / 5) {
    warnings.push(`Very high sites-per-country ratio — operational concentration risk`)
  }

  if (highComplexityCount > 5) {
    warnings.push(
      `${highComplexityCount} high-complexity regulatory markets selected — expect significant regulatory delays`
    )
  }

  if (study.sample_size < 100 && study.num_sites > 20) {
    warnings.push(
      `Very low sample size relative to site count — sites will have very little to do`
    )
  }

  return warnings
}

export function hasBlockingWarning(study: StudyInput): boolean {
  return study.countries.length === 0
}
