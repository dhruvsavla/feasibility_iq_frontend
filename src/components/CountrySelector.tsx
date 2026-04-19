import React, { useState } from 'react'
import { CountryOption } from '../types'
import { COUNTRIES, REGIONS, getCountriesByRegion, flagEmoji } from '../data/countries'

interface Props {
  selectedCountries: CountryOption[]
  onChange: (countries: CountryOption[]) => void
}

const complexityColor = {
  low: 'var(--green)',
  moderate: 'var(--yellow)',
  high: 'var(--red)',
}

const countryToOption = (c: (typeof COUNTRIES)[number]): CountryOption => ({
  code: c.code,
  name: c.name,
  region: c.region,
  regulatoryBody: c.regulatoryBody,
  complexity: c.complexity,
})

const CountrySelector: React.FC<Props> = ({ selectedCountries, onChange }) => {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const selectedCodes = new Set(selectedCountries.map((c) => c.code))

  const toggle = (code: string) => {
    const country = COUNTRIES.find((c) => c.code === code)
    if (!country) return
    if (selectedCodes.has(code)) {
      onChange(selectedCountries.filter((c) => c.code !== code))
    } else {
      onChange([...selectedCountries, countryToOption(country)])
    }
  }

  const toggleRegion = (region: string) => {
    const inRegion = getCountriesByRegion(region)
    const allSelected = inRegion.every((c) => selectedCodes.has(c.code))
    if (allSelected) {
      onChange(selectedCountries.filter((c) => c.region !== region))
    } else {
      const existing = selectedCountries.filter((c) => c.region !== region)
      onChange([...existing, ...inRegion.map(countryToOption)])
    }
  }

  const clearAll = () => onChange([])

  const filteredByRegion = (region: string) => {
    const base = getCountriesByRegion(region)
    if (!search.trim()) return base
    return base.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.regulatoryBody.toLowerCase().includes(search.toLowerCase())
    )
  }

  const anyMatch = REGIONS.some((r) => filteredByRegion(r).length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 600 }}>
          {selectedCountries.length} {selectedCountries.length === 1 ? 'country' : 'countries'} selected
        </div>
        {selectedCountries.length > 0 && (
          <button
            onClick={clearAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '2px 6px',
            }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search countries or regulatory bodies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          backgroundColor: 'var(--slate-light)',
          border: '1px solid transparent',
          borderRadius: 8,
          padding: '8px 12px',
          color: 'var(--text-primary)',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'Inter, sans-serif',
        }}
      />

      {/* Selected tags */}
      {selectedCountries.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {selectedCountries.map((c) => (
            <div
              key={c.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'var(--slate-light)',
                borderRadius: 20,
                padding: '3px 10px 3px 8px',
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
            >
              <span>{flagEmoji(c.code)}</span>
              <span>{c.name}</span>
              <button
                onClick={() => toggle(c.code)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '0 0 0 4px',
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Country list grouped by region */}
      {!anyMatch && (
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, padding: '8px 0' }}>
          No countries match your search.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {REGIONS.map((region) => {
          const countries = filteredByRegion(region)
          if (countries.length === 0) return null
          const allSelected = countries.every((c) => selectedCodes.has(c.code))
          const someSelected = countries.some((c) => selectedCodes.has(c.code))
          const isCollapsed = collapsed[region]

          return (
            <div
              key={region}
              style={{
                backgroundColor: 'var(--slate-light)',
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              {/* Region header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => setCollapsed((p) => ({ ...p, [region]: !p[region] }))}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected
                  }}
                  onChange={(e) => {
                    e.stopPropagation()
                    toggleRegion(region)
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ cursor: 'pointer', accentColor: 'var(--cyan)', width: 14, height: 14 }}
                />
                <div style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                  {region}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {countries.filter((c) => selectedCodes.has(c.code)).length}/{countries.length}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{isCollapsed ? '▸' : '▾'}</div>
              </div>

              {/* Country rows */}
              {!isCollapsed &&
                countries.map((country) => {
                  const selected = selectedCodes.has(country.code)
                  return (
                    <div
                      key={country.code}
                      onClick={() => toggle(country.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 14px 7px 28px',
                        cursor: 'pointer',
                        backgroundColor: selected ? 'rgba(6,182,212,0.07)' : 'transparent',
                        transition: 'background-color 0.1s ease',
                        borderTop: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggle(country.code)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer', accentColor: 'var(--cyan)', width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: 16 }}>{flagEmoji(country.code)}</span>
                      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{country.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          padding: '2px 7px',
                          borderRadius: 4,
                        }}
                      >
                        {country.regulatoryBody}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'white',
                          backgroundColor: complexityColor[country.complexity],
                          padding: '2px 6px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          minWidth: 52,
                          textAlign: 'center',
                        }}
                      >
                        {country.complexity}
                      </div>
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CountrySelector
