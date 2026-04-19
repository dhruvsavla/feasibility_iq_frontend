import axios, { AxiosError } from 'axios'
import { FeasibilityReport, StudyInput } from './types'

const BASE_URL = 'http://localhost:8000'

function toBackendPayload(study: StudyInput) {
  return {
    ...study,
    countries: study.countries.map((c) => ({
      code: c.code,
      name: c.name,
      region: c.region,
      regulatory_body: c.regulatoryBody,
      complexity: c.complexity,
    })),
  }
}

export async function analyzeStudy(study: StudyInput): Promise<FeasibilityReport> {
  try {
    const response = await axios.post<FeasibilityReport>(`${BASE_URL}/api/analyze`, toBackendPayload(study))
    return response.data
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: string }>
    if (axiosErr.response?.data?.detail) {
      throw new Error(axiosErr.response.data.detail)
    }
    throw new Error(axiosErr.message ?? 'Failed to connect to the analysis server')
  }
}
