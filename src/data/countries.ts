export interface CountryData {
  code: string
  name: string
  region: string
  regulatoryBody: string
  complexity: 'low' | 'moderate' | 'high'
}

export const COUNTRIES: CountryData[] = [
  // North America
  { code: 'US', name: 'United States', region: 'North America', regulatoryBody: 'FDA', complexity: 'low' },
  { code: 'CA', name: 'Canada', region: 'North America', regulatoryBody: 'Health Canada', complexity: 'low' },
  { code: 'MX', name: 'Mexico', region: 'North America', regulatoryBody: 'COFEPRIS', complexity: 'moderate' },

  // Europe
  { code: 'GB', name: 'United Kingdom', region: 'Europe', regulatoryBody: 'MHRA', complexity: 'low' },
  { code: 'DE', name: 'Germany', region: 'Europe', regulatoryBody: 'BfArM', complexity: 'low' },
  { code: 'FR', name: 'France', region: 'Europe', regulatoryBody: 'ANSM', complexity: 'low' },
  { code: 'IT', name: 'Italy', region: 'Europe', regulatoryBody: 'AIFA', complexity: 'moderate' },
  { code: 'ES', name: 'Spain', region: 'Europe', regulatoryBody: 'AEMPS', complexity: 'moderate' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', regulatoryBody: 'CBG-MEB', complexity: 'low' },
  { code: 'SE', name: 'Sweden', region: 'Europe', regulatoryBody: 'MPA', complexity: 'low' },
  { code: 'CH', name: 'Switzerland', region: 'Europe', regulatoryBody: 'Swissmedic', complexity: 'low' },
  { code: 'BE', name: 'Belgium', region: 'Europe', regulatoryBody: 'FAMHP', complexity: 'low' },
  { code: 'PL', name: 'Poland', region: 'Europe', regulatoryBody: 'URPL', complexity: 'moderate' },
  { code: 'RU', name: 'Russia', region: 'Europe', regulatoryBody: 'Roszdravnadzor', complexity: 'high' },
  { code: 'TR', name: 'Turkey', region: 'Middle East & Africa', regulatoryBody: 'TITCK', complexity: 'moderate' },

  // Asia Pacific
  { code: 'JP', name: 'Japan', region: 'Asia Pacific', regulatoryBody: 'PMDA', complexity: 'high' },
  { code: 'CN', name: 'China', region: 'Asia Pacific', regulatoryBody: 'NMPA', complexity: 'high' },
  { code: 'KR', name: 'South Korea', region: 'Asia Pacific', regulatoryBody: 'MFDS', complexity: 'moderate' },
  { code: 'AU', name: 'Australia', region: 'Asia Pacific', regulatoryBody: 'TGA', complexity: 'low' },
  { code: 'IN', name: 'India', region: 'Asia Pacific', regulatoryBody: 'CDSCO', complexity: 'high' },
  { code: 'TW', name: 'Taiwan', region: 'Asia Pacific', regulatoryBody: 'TFDA', complexity: 'moderate' },
  { code: 'SG', name: 'Singapore', region: 'Asia Pacific', regulatoryBody: 'HSA', complexity: 'low' },
  { code: 'TH', name: 'Thailand', region: 'Asia Pacific', regulatoryBody: 'FDA Thailand', complexity: 'moderate' },
  { code: 'MY', name: 'Malaysia', region: 'Asia Pacific', regulatoryBody: 'NPRA', complexity: 'moderate' },

  // Latin America
  { code: 'BR', name: 'Brazil', region: 'Latin America', regulatoryBody: 'ANVISA', complexity: 'high' },
  { code: 'AR', name: 'Argentina', region: 'Latin America', regulatoryBody: 'ANMAT', complexity: 'moderate' },
  { code: 'CO', name: 'Colombia', region: 'Latin America', regulatoryBody: 'INVIMA', complexity: 'moderate' },
  { code: 'CL', name: 'Chile', region: 'Latin America', regulatoryBody: 'ISP', complexity: 'moderate' },
  { code: 'PE', name: 'Peru', region: 'Latin America', regulatoryBody: 'DIGEMID', complexity: 'high' },

  // Middle East & Africa
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East & Africa', regulatoryBody: 'SFDA', complexity: 'high' },
  { code: 'AE', name: 'UAE', region: 'Middle East & Africa', regulatoryBody: 'MOH UAE', complexity: 'moderate' },
  { code: 'IL', name: 'Israel', region: 'Middle East & Africa', regulatoryBody: 'MOH Israel', complexity: 'moderate' },
  { code: 'ZA', name: 'South Africa', region: 'Middle East & Africa', regulatoryBody: 'SAHPRA', complexity: 'moderate' },
  { code: 'EG', name: 'Egypt', region: 'Middle East & Africa', regulatoryBody: 'EDA', complexity: 'high' },
]

export const REGIONS = [...new Set(COUNTRIES.map((c) => c.region))]

export function getCountriesByRegion(region: string): CountryData[] {
  return COUNTRIES.filter((c) => c.region === region)
}

export function flagEmoji(code: string): string {
  const offset = 0x1f1e6 - 'A'.charCodeAt(0)
  return String.fromCodePoint(code.charCodeAt(0) + offset, code.charCodeAt(1) + offset)
}
