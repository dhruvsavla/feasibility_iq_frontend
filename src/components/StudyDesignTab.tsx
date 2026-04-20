import React, { useRef, useState } from 'react'
import { StudyInput } from '../types'
import CountrySelector from './CountrySelector'
import { THERAPEUTIC_AREAS, difficultyColor, difficultyLabel } from '../data/therapeuticAreas'
import { getStudyWarnings, hasBlockingWarning } from '../utils/studyValidation'
import { extractProtocol } from '../api'

interface Props {
  studyInput: StudyInput
  setStudyInput: React.Dispatch<React.SetStateAction<StudyInput>>
  onRun: () => void
  isLoading: boolean
}

const ENDPOINTS = ['OS', 'PFS', 'PROs', 'Biomarker', 'HCRU', 'QoL', 'Safety', 'Pharmacoeconomics']

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--slate)',
  borderRadius: 12,
  padding: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
}

const labelStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  fontSize: 12,
  marginBottom: 6,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--slate-light)',
  border: '1px solid transparent',
  borderRadius: 8,
  padding: '10px 14px',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif',
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: '"DM Serif Display", serif',
  fontSize: 18,
  color: 'var(--text-primary)',
  margin: 0,
  paddingBottom: 12,
  borderBottom: '1px solid var(--slate-light)',
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}

const SliderRow: React.FC<SliderRowProps> = ({ label, value, min, max, step, unit, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ minWidth: 190, color: 'var(--text-secondary)', fontSize: 14 }}>{label}</div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <div
      style={{
        minWidth: 100,
        color: 'var(--cyan)',
        fontWeight: 600,
        textAlign: 'right',
        fontSize: 15,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value} {unit}
    </div>
  </div>
)

const TagButton: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({
  label,
  selected,
  onClick,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 16px',
      borderRadius: 20,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 500,
      backgroundColor: selected ? 'var(--cyan)' : 'var(--slate-light)',
      color: selected ? 'var(--navy)' : 'var(--text-secondary)',
      transition: 'background-color 0.15s ease, color 0.15s ease',
    }}
  >
    {label}
  </button>
)

const StudyDesignTab: React.FC<Props> = ({ studyInput, setStudyInput, onRun, isLoading }) => {
  const [endpointHint, setEndpointHint] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractedFields, setExtractedFields] = useState<string[]>([])
  const [extractionNotes, setExtractionNotes] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProtocolFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setExtractError('Please upload a PDF file.')
      return
    }
    setExtracting(true)
    setExtractError(null)
    setExtractedFields([])
    setExtractionNotes(null)
    try {
      const result = await extractProtocol(file)
      setStudyInput((prev) => {
        const updated = { ...prev }
        if (result.study_name) updated.study_name = result.study_name
        if (result.therapeutic_area) updated.therapeutic_area = result.therapeutic_area
        if (result.indication) updated.indication = result.indication
        if (result.intervention) updated.intervention = result.intervention
        if (result.duration_months != null) updated.duration_months = result.duration_months
        if (result.followup_months != null) updated.followup_months = result.followup_months
        if (result.sample_size != null) updated.sample_size = result.sample_size
        if (result.num_sites != null) updated.num_sites = result.num_sites
        if (result.endpoints.length > 0) updated.endpoints = result.endpoints
        if (result.eligibility_criteria) updated.eligibility_criteria = result.eligibility_criteria
        return updated
      })
      setExtractedFields(result.extracted_fields)
      setExtractionNotes(result.extraction_notes)
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setExtracting(false)
    }
  }

  const update = <K extends keyof StudyInput>(key: K, value: StudyInput[K]) => {
    setStudyInput((prev) => ({ ...prev, [key]: value }))
  }

  const toggleTag = (list: string[], item: string): string[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item]

  const countryCount = studyInput.countries.length
  const patientsPerSite =
    studyInput.num_sites > 0 ? (studyInput.sample_size / studyInput.num_sites).toFixed(1) : '—'
  const sitesPerCountry =
    countryCount > 0 ? (studyInput.num_sites / countryCount).toFixed(1) : '—'
  const totalDuration = studyInput.duration_months + studyInput.followup_months

  const warnings = getStudyWarnings(studyInput)
  const blocking = hasBlockingWarning(studyInput)
  const canRun =
    !blocking &&
    studyInput.therapeutic_area.trim() !== '' &&
    studyInput.indication.trim() !== ''

  const handleTAChange = (taName: string) => {
    update('therapeutic_area', taName)
    if (!taName) {
      setEndpointHint(null)
      return
    }
    const ta = THERAPEUTIC_AREAS.find((t) => t.name === taName)
    if (ta && ta.commonEndpoints.length > 0) {
      setEndpointHint(taName)
      setStudyInput((prev) => ({
        ...prev,
        therapeutic_area: taName,
        endpoints: ta.commonEndpoints,
      }))
    }
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Protocol Upload */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Auto-Fill from Protocol PDF</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            const file = e.dataTransfer.files[0]
            if (file) handleProtocolFile(file)
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--cyan)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10,
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: dragOver ? 'rgba(6,182,212,0.06)' : 'var(--slate-light)',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleProtocolFile(file)
              e.target.value = ''
            }}
          />
          {extracting ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 24, height: 24,
                border: '3px solid var(--slate)',
                borderTop: '3px solid var(--cyan)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Extracting study parameters…</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>
                Drop a protocol PDF here or click to browse
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Supports ICFs, study synopses, and SAPs — fields auto-filled from the document
              </div>
            </>
          )}
        </div>

        {extractError && (
          <div style={{ fontSize: 13, color: 'var(--red)', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '8px 12px' }}>
            {extractError}
          </div>
        )}

        {extractedFields.length > 0 && (
          <div style={{ backgroundColor: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)', marginBottom: 6 }}>
              Extracted {extractedFields.length} field{extractedFields.length !== 1 ? 's' : ''} — review and adjust below
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: extractionNotes ? 8 : 0 }}>
              {extractedFields.map((f) => (
                <span key={f} style={{ fontSize: 11, backgroundColor: 'rgba(6,182,212,0.15)', color: 'var(--cyan)', borderRadius: 4, padding: '2px 8px' }}>
                  {f.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            {extractionNotes && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{extractionNotes}</div>
            )}
          </div>
        )}
      </div>

      {/* Section 1 — Study Identity */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Study Identity</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Study Name</label>
            <input
              style={inputStyle}
              value={studyInput.study_name}
              onChange={(e) => update('study_name', e.target.value)}
              placeholder="e.g. STELLAR-001"
            />
          </div>

          {/* Therapeutic Area — dropdown */}
          <div>
            <label style={labelStyle}>
              Therapeutic Area <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={studyInput.therapeutic_area}
              onChange={(e) => handleTAChange(e.target.value)}
            >
              <option value="">— Select therapeutic area —</option>
              {THERAPEUTIC_AREAS.map((ta) => (
                <option key={ta.name} value={ta.name}>
                  {ta.name}
                </option>
              ))}
            </select>
            {studyInput.therapeutic_area && (() => {
              const ta = THERAPEUTIC_AREAS.find((t) => t.name === studyInput.therapeutic_area)
              return ta ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Enrollment difficulty:
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: difficultyColor[ta.typicalEnrollmentDifficulty],
                    }}
                  >
                    {difficultyLabel[ta.typicalEnrollmentDifficulty]}
                  </div>
                </div>
              ) : null
            })()}
          </div>

          <div>
            <label style={labelStyle}>
              Indication <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              style={inputStyle}
              value={studyInput.indication}
              onChange={(e) => update('indication', e.target.value)}
              placeholder="e.g. HER2+ Breast Cancer"
            />
          </div>
          <div>
            <label style={labelStyle}>Drug / Intervention</label>
            <input
              style={inputStyle}
              value={studyInput.intervention}
              onChange={(e) => update('intervention', e.target.value)}
              placeholder="e.g. Trastuzumab"
            />
          </div>
        </div>
      </div>

      {/* Section 2 — Operational Parameters */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Operational Parameters</h3>
        <SliderRow
          label="Study Duration"
          value={studyInput.duration_months}
          min={6}
          max={60}
          step={1}
          unit="months"
          onChange={(v) => update('duration_months', v)}
        />
        <SliderRow
          label="Follow-up Period"
          value={studyInput.followup_months}
          min={0}
          max={24}
          step={1}
          unit="months"
          onChange={(v) => update('followup_months', v)}
        />
        <SliderRow
          label="Target Sample Size"
          value={studyInput.sample_size}
          min={50}
          max={10000}
          step={50}
          unit="patients"
          onChange={(v) => update('sample_size', v)}
        />
        <SliderRow
          label="Number of Sites"
          value={studyInput.num_sites}
          min={5}
          max={500}
          step={5}
          unit="sites"
          onChange={(v) => update('num_sites', v)}
        />
      </div>

      {/* Section 3 — Live Computed Metrics */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Live Computed Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Patients / Site', value: patientsPerSite },
            { label: 'Sites / Country', value: sitesPerCountry },
            { label: 'Total Duration', value: `${totalDuration} months` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: 'var(--slate-light)',
                borderRadius: 10,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 10 }}>
                {label}
              </div>
              <div
                style={{
                  fontFamily: '"DM Serif Display", serif',
                  fontSize: 30,
                  color: 'var(--cyan)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4 — Endpoints */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Endpoints</h3>
        {endpointHint && (
          <div
            style={{
              backgroundColor: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 8,
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--cyan)' }}>
              Suggested endpoints for <strong>{endpointHint}</strong> pre-selected — you can modify these
            </div>
            <button
              onClick={() => setEndpointHint(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 0,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ENDPOINTS.map((ep) => (
            <TagButton
              key={ep}
              label={ep}
              selected={studyInput.endpoints.includes(ep)}
              onClick={() => {
                setEndpointHint(null)
                update('endpoints', toggleTag(studyInput.endpoints, ep))
              }}
            />
          ))}
        </div>
      </div>

      {/* Section 5 — Eligibility Criteria */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Eligibility Criteria</h3>
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          value={studyInput.eligibility_criteria}
          onChange={(e) => update('eligibility_criteria', e.target.value)}
          placeholder="Describe inclusion and exclusion criteria..."
        />
      </div>

      {/* Section 6 — Geographic Footprint */}
      <div style={cardStyle}>
        <h3 style={sectionTitleStyle}>Geographic Footprint</h3>
        <CountrySelector
          selectedCountries={studyInput.countries}
          onChange={(countries) =>
            setStudyInput((prev) => ({ ...prev, countries, num_countries: countries.length }))
          }
        />
      </div>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {warnings.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <span style={{ fontSize: 13, color: 'var(--yellow)', lineHeight: 1.5 }}>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Run Button */}
      <button
        onClick={onRun}
        disabled={!canRun || isLoading}
        style={{
          background:
            canRun && !isLoading
              ? 'linear-gradient(135deg, var(--cyan) 0%, #3b82f6 100%)'
              : 'var(--slate-light)',
          color: canRun && !isLoading ? 'white' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: 10,
          padding: '16px 24px',
          fontSize: 14,
          fontWeight: 600,
          cursor: canRun && !isLoading ? 'pointer' : 'not-allowed',
          width: '100%',
          letterSpacing: '0.04em',
          transition: 'all 0.2s ease',
          marginBottom: 8,
        }}
      >
        Run Feasibility Analysis →
      </button>
    </div>
  )
}

export default StudyDesignTab
