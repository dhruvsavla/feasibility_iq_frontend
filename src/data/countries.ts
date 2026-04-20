export interface CountryData {
  code: string
  name: string
  region: string
  regulatoryBody: string
  complexity: 'low' | 'moderate' | 'high'
  notes: string
}

export const COUNTRIES: CountryData[] = [
  // North America
  {
    code: 'US', name: 'United States', region: 'North America', regulatoryBody: 'FDA', complexity: 'low',
    notes: 'Mature CRO infrastructure and standardized IRB processes. FDA observational study notifications are straightforward; site activation typically 8–14 weeks.',
  },
  {
    code: 'CA', name: 'Canada', region: 'North America', regulatoryBody: 'Health Canada', complexity: 'low',
    notes: 'Streamlined ethics review via REBs. Strong ICH GCP alignment with the US; cost-efficient sites with experienced coordinators.',
  },
  {
    code: 'MX', name: 'Mexico', region: 'North America', regulatoryBody: 'COFEPRIS', complexity: 'moderate',
    notes: 'COFEPRIS approval timelines can be 4–8 months and are subject to change. Site coordinator turnover and variable data quality practices add moderate risk.',
  },

  // Europe
  {
    code: 'GB', name: 'United Kingdom', region: 'Europe', regulatoryBody: 'MHRA', complexity: 'low',
    notes: 'Post-Brexit MHRA operates independently from EMA but maintains ICH GCP standards. HRA approval process is well-defined; GDPR compliance required.',
  },
  {
    code: 'DE', name: 'Germany', region: 'Europe', regulatoryBody: 'BfArM', complexity: 'low',
    notes: 'Strict but predictable ethics committee process. Strong site infrastructure and high data quality standards; GDPR adds DPA notification requirements.',
  },
  {
    code: 'FR', name: 'France', region: 'Europe', regulatoryBody: 'ANSM', complexity: 'low',
    notes: 'CPP ethics review is centralized and typically 2–3 months. ANSM classification of observational studies affects notification burden; GDPR applies.',
  },
  {
    code: 'IT', name: 'Italy', region: 'Europe', regulatoryBody: 'AIFA', complexity: 'moderate',
    notes: 'Regional ethics committees add coordination complexity. AIFA review for observational studies can be slow; site payment processes are bureaucratic.',
  },
  {
    code: 'ES', name: 'Spain', region: 'Europe', regulatoryBody: 'AEMPS', complexity: 'moderate',
    notes: 'Multi-regional CEIm ethics committees require coordination across autonomous communities. Contracting timelines at public hospitals can extend site activation by 4–8 weeks.',
  },
  {
    code: 'NL', name: 'Netherlands', region: 'Europe', regulatoryBody: 'CBG-MEB', complexity: 'low',
    notes: 'CCMO/accredited METC approval is efficient and well-structured. Dutch sites have high data quality and experienced trial coordinators.',
  },
  {
    code: 'SE', name: 'Sweden', region: 'Europe', regulatoryBody: 'MPA', complexity: 'low',
    notes: 'Swedish Ethical Review Authority provides streamlined approval. Excellent population registries support endpoint capture; high site compliance standards.',
  },
  {
    code: 'CH', name: 'Switzerland', region: 'Europe', regulatoryBody: 'Swissmedic', complexity: 'low',
    notes: 'nLEur and HRA compliance is required. Switzerland is not EU/EEA so GDPR does not apply directly, but equivalent Federal Act on Data Protection (FADP) does.',
  },
  {
    code: 'BE', name: 'Belgium', region: 'Europe', regulatoryBody: 'FAMHP', complexity: 'low',
    notes: 'Central ethics committee system simplifies multi-site approval. Strong academic medical center network with experienced PI pool.',
  },
  {
    code: 'PL', name: 'Poland', region: 'Europe', regulatoryBody: 'URPL', complexity: 'moderate',
    notes: 'Cost-effective sites with large patient pools but variable coordinator experience. Ethics committee timelines range 2–5 months; GDPR applies.',
  },
  {
    code: 'RU', name: 'Russia', region: 'Europe', regulatoryBody: 'Roszdravnadzor', complexity: 'high',
    notes: 'Roszdravnadzor approval adds 4–8 months to timelines. Data localization laws require in-country data storage; geopolitical risk affects supply chain and site reliability.',
  },
  {
    code: 'TR', name: 'Turkey', region: 'Middle East & Africa', regulatoryBody: 'TITCK', complexity: 'moderate',
    notes: 'TITCK approval for observational studies takes 3–6 months. Large patient pools for common indications, but variable site infrastructure quality across regions.',
  },

  // Asia Pacific
  {
    code: 'JP', name: 'Japan', region: 'Asia Pacific', regulatoryBody: 'PMDA', complexity: 'high',
    notes: 'PMDA requires ministerial notification and enhanced GCP inspections for specified clinical studies. Japanese-language protocol requirements and strict data privacy (APPI) add 2–4 months to timelines.',
  },
  {
    code: 'CN', name: 'China', region: 'Asia Pacific', regulatoryBody: 'NMPA', complexity: 'high',
    notes: 'NMPA approval adds 3–6 months; PIPL mandates in-country data storage with cross-border transfer restrictions. Local CRO partnerships are essential; inter-lab variability is a significant data quality risk.',
  },
  {
    code: 'KR', name: 'South Korea', region: 'Asia Pacific', regulatoryBody: 'MFDS', complexity: 'moderate',
    notes: 'MFDS is well-aligned with ICH standards but requires Korean-language submissions. PIPA data privacy law is among the strictest globally; explicit patient consent is mandatory.',
  },
  {
    code: 'AU', name: 'Australia', region: 'Asia Pacific', regulatoryBody: 'TGA', complexity: 'low',
    notes: 'TGA observational study requirements are minimal; HREC ethics approval is well-structured. Strong English-language site capacity and ICH GCP compliance.',
  },
  {
    code: 'IN', name: 'India', region: 'Asia Pacific', regulatoryBody: 'CDSCO', complexity: 'high',
    notes: 'CDSCO Form CT-04A notification and ethics committee registration add 2–4 months. Variable site infrastructure, cold chain reliability, and high screen failure rates for some indications. Large patient pools for prevalent conditions.',
  },
  {
    code: 'TW', name: 'Taiwan', region: 'Asia Pacific', regulatoryBody: 'TFDA', complexity: 'moderate',
    notes: 'TFDA approval process is efficient by regional standards. Strong site quality at academic centers; PDPA data privacy compliance required.',
  },
  {
    code: 'SG', name: 'Singapore', region: 'Asia Pacific', regulatoryBody: 'HSA', complexity: 'low',
    notes: 'HSA has a streamlined observational study framework. PDPA compliance is well-established; Singapore is commonly used as an APAC hub site.',
  },
  {
    code: 'TH', name: 'Thailand', region: 'Asia Pacific', regulatoryBody: 'FDA Thailand', complexity: 'moderate',
    notes: 'FDA Thailand approval timelines are 3–6 months. Site capacity is concentrated in Bangkok; PDPA enacted 2022 adds new data privacy obligations.',
  },
  {
    code: 'MY', name: 'Malaysia', region: 'Asia Pacific', regulatoryBody: 'NPRA', complexity: 'moderate',
    notes: 'NPRA and Medical Research and Ethics Committee (MREC) approval needed. Moderate site infrastructure; PDPA compliance required for health data collection.',
  },

  // Latin America
  {
    code: 'BR', name: 'Brazil', region: 'Latin America', regulatoryBody: 'ANVISA', complexity: 'high',
    notes: 'ANVISA RDC 204/2017 governs observational studies; multi-site studies require CONEP review, adding 3–5 months. LGPD data privacy law applies; port-of-entry requirements affect biomarker sample exports.',
  },
  {
    code: 'AR', name: 'Argentina', region: 'Latin America', regulatoryBody: 'ANMAT', complexity: 'moderate',
    notes: 'ANMAT approval timelines are 3–6 months and subject to political and economic instability. Currency controls can affect site payment reliability.',
  },
  {
    code: 'CO', name: 'Colombia', region: 'Latin America', regulatoryBody: 'INVIMA', complexity: 'moderate',
    notes: 'INVIMA observational study review typically 2–4 months. Growing site capacity in Bogotá and Medellín; variable coordinator experience outside major centers.',
  },
  {
    code: 'CL', name: 'Chile', region: 'Latin America', regulatoryBody: 'ISP', complexity: 'moderate',
    notes: 'ISP and CONEIS ethics approval needed; process is relatively predictable at 3–5 months. Highest site quality in the region; stable regulatory environment.',
  },
  {
    code: 'PE', name: 'Peru', region: 'Latin America', regulatoryBody: 'DIGEMID', complexity: 'high',
    notes: 'DIGEMID approval is slow and unpredictable (4–9 months). Limited experienced site infrastructure outside Lima; high screen failure rates and cold chain challenges for biomarker endpoints.',
  },

  // Middle East & Africa
  {
    code: 'SA', name: 'Saudi Arabia', region: 'Middle East & Africa', regulatoryBody: 'SFDA', complexity: 'high',
    notes: 'SFDA approval requires Arabic-language documentation and IRB approval from the National Committee for Bioethics. Site capacity is limited to major referral centers; data privacy regulations are evolving rapidly.',
  },
  {
    code: 'AE', name: 'UAE', region: 'Middle East & Africa', regulatoryBody: 'MOH UAE', complexity: 'moderate',
    notes: 'MOH UAE and Dubai Health Authority approvals may both be required. Strong site infrastructure in Dubai and Abu Dhabi; relatively fast approval compared to the region.',
  },
  {
    code: 'IL', name: 'Israel', region: 'Middle East & Africa', regulatoryBody: 'MOH Israel', complexity: 'moderate',
    notes: 'MOH Israel Helsinki Committee approval typically 2–4 months. High-quality academic sites with strong data management; Privacy Protection Law requires specific consent language.',
  },
  {
    code: 'ZA', name: 'South Africa', region: 'Middle East & Africa', regulatoryBody: 'SAHPRA', complexity: 'moderate',
    notes: 'SAHPRA and independent ethics committee approval needed; process improved significantly since 2019. Large diverse patient pools; variable infrastructure outside major urban centers.',
  },
  {
    code: 'EG', name: 'Egypt', region: 'Middle East & Africa', regulatoryBody: 'EDA', complexity: 'high',
    notes: 'EDA approval timelines are unpredictable (4–10 months). Limited experienced site capacity; Arabic documentation required; high dropout risk for long-duration studies.',
  },
]

export const REGIONS = [...new Set(COUNTRIES.map((c) => c.region))]

export function getCountriesByRegion(region: string): CountryData[] {
  return COUNTRIES.filter((c) => c.region === region)
}

export function flagEmoji(code: string): string {
  const offset = 0x1f1e6 - 'A'.charCodeAt(0)
  return String.fromCodePoint(code.charCodeAt(0) + offset, code.charCodeAt(1) + offset)
}
