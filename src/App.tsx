import React, { useEffect, useState } from 'react'
import { FeasibilityReport, SavedReport, StudyInput } from './types'
import { analyzeStudy } from './api'
import StudyDesignTab from './components/StudyDesignTab'
import FeasibilityReportTab from './components/FeasibilityReportTab'
import CompareTab from './components/CompareTab'
import LoadingOverlay from './components/LoadingOverlay'

const defaultStudyInput: StudyInput = {
  study_name: '',
  therapeutic_area: '',
  indication: '',
  intervention: '',
  duration_months: 24,
  followup_months: 12,
  sample_size: 500,
  num_sites: 50,
  num_countries: 0,
  endpoints: [],
  eligibility_criteria: '',
  countries: [],
}

type ActiveTab = 'design' | 'report' | 'compare'

const DRAFT_KEY = 'feasibilityiq_draft'

const App: React.FC = () => {
  const [studyInput, setStudyInput] = useState<StudyInput>(defaultStudyInput)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<FeasibilityReport | null>(null)
  const [activeTab, setActiveTab] = useState<ActiveTab>('design')
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [previousScore, setPreviousScore] = useState<number | null>(null)
  const [draftRestored, setDraftRestored] = useState(false)
  const [draftBannerDismissed, setDraftBannerDismissed] = useState(false)

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StudyInput
        if (parsed && typeof parsed === 'object' && 'therapeutic_area' in parsed) {
          // Ensure countries array exists (handles old drafts before the field existed)
          setStudyInput({ ...defaultStudyInput, ...parsed, countries: parsed.countries ?? [] })
          setDraftRestored(true)
        }
      }
    } catch {
      // Silently ignore malformed draft
    }
  }, [])

  // Autosave draft to localStorage on every studyInput change
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(studyInput))
    } catch {
      // Silently ignore storage errors
    }
  }, [studyInput])

  const handleRun = async () => {
    setPreviousScore(report?.feasibility_score ?? null)
    setIsLoading(true)
    setError(null)
    try {
      const payload: StudyInput = {
        ...studyInput,
        num_countries: studyInput.countries.length,
      }
      const result = await analyzeStudy(payload)
      setReport(result)
      setActiveTab('report')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveReport = () => {
    if (!report) return
    const label =
      studyInput.study_name ||
      studyInput.indication ||
      `Study ${savedReports.length + 1}`
    setSavedReports((prev) => [
      ...prev.slice(0, 4), // keep max 5 total
      {
        label,
        input: studyInput,
        report,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  const reportDisabled = report === null
  const compareDisabled = savedReports.length < 2

  const tabs: Array<{ key: ActiveTab; label: string; disabled: boolean }> = [
    { key: 'design', label: 'Study Design', disabled: false },
    { key: 'report', label: 'Feasibility Report', disabled: reportDisabled },
    { key: 'compare', label: `Compare${savedReports.length >= 2 ? ` (${savedReports.length})` : ''}`, disabled: compareDisabled },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--navy)',
        color: 'var(--text-primary)',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fixed header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'var(--navy-light)',
          borderBottom: '1px solid var(--slate)',
          padding: '0 32px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: 28,
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}
          >
            FeasibilityIQ
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Phase 4 Observational Study Intelligence
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(({ key, label, disabled }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => !disabled && setActiveTab(key)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: isActive ? 'var(--cyan)' : 'transparent',
                  color: disabled
                    ? 'var(--text-secondary)'
                    : isActive
                    ? 'var(--navy)'
                    : 'var(--text-primary)',
                  opacity: disabled ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Loading overlay */}
      <LoadingOverlay isLoading={isLoading} />

      {/* Content wrapper */}
      <div style={{ paddingTop: 72, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Draft restored banner */}
        {draftRestored && !draftBannerDismissed && (
          <div
            style={{
              backgroundColor: 'rgba(6,182,212,0.1)',
              borderBottom: '1px solid rgba(6,182,212,0.25)',
              padding: '10px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <span style={{ color: 'var(--cyan)', fontSize: 13 }}>
              Draft restored from your last session
            </span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={() => {
                  setStudyInput(defaultStudyInput)
                  localStorage.removeItem(DRAFT_KEY)
                  setDraftBannerDismissed(true)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 0,
                }}
              >
                Clear draft
              </button>
              <button
                onClick={() => setDraftBannerDismissed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#450a0a',
              borderBottom: '1px solid var(--red)',
              padding: '12px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <span style={{ color: '#fca5a5', fontSize: 14 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: 20,
                lineHeight: 1,
                padding: '0 4px',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Main content */}
        <main
          style={{
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto',
            flex: 1,
          }}
        >
          {activeTab === 'design' && (
            <StudyDesignTab
              studyInput={studyInput}
              setStudyInput={setStudyInput}
              onRun={handleRun}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'report' && report !== null && (
            <FeasibilityReportTab
              report={report}
              studyInput={studyInput}
              setStudyInput={setStudyInput}
              onRun={handleRun}
              onSave={handleSaveReport}
              previousScore={previousScore}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'compare' && (
            <CompareTab savedReports={savedReports} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
