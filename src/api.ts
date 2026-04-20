import axios, { AxiosError } from 'axios'
import { ExtractedProtocol, FeasibilityReport, StudyInput } from './types'

const BASE_URL = import.meta.env.VITE_API_URL as string
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
export async function extractProtocol(file: File): Promise<ExtractedProtocol> {
  try {
    const form = new FormData()
    form.append('file', file)
    const response = await axios.post<ExtractedProtocol>(`${BASE_URL}/api/extract-protocol`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: string }>
    if (axiosErr.response?.data?.detail) {
      throw new Error(axiosErr.response.data.detail)
    }
    throw new Error(axiosErr.message ?? 'Failed to extract protocol')
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
