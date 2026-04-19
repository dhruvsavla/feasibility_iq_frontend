import React, { useState } from 'react'
import { StudyInput } from '../types'

interface Props {
  studyInput: StudyInput
  setStudyInput: React.Dispatch<React.SetStateAction<StudyInput>>
  onRun: () => void
  isLoading: boolean
}

interface Action {
  id: string
  label: string
  subtitle: string
}

const ACTIONS: Action[] = [
  { id: 'remove5', label: '− 5 Countries', subtitle: 'Remove 5 highest-complexity markets' },
  { id: 'remove10sites', label: '− 10 Sites', subtitle: 'Reduce site count by 10' },
  { id: 'removeRegion', label: 'Remove Highest-Risk Region', subtitle: 'Drop region with most high-complexity markets' },
  { id: 'extendFollowup', label: 'Extend Follow-up +6mo', subtitle: 'Add 6 months to follow-up period' },
  { id: 'reduceSample', label: 'Reduce Sample −20%', subtitle: 'Cut target sample size by 20%' },
  { id: 'simplifyEndpoints', label: 'Simplify Endpoints', subtitle: 'Remove PROs, Biomarker, Pharmacoeconomics' },
]

const WhatIfPanel: React.FC<Props> = ({ studyInput, setStudyInput, onRun, isLoading }) => {
  const [runningAction, setRunningAction] = useState<string | null>(null)

  const applyAndRun = (actionId: string) => {
    let updated = { ...studyInput }

    switch (actionId) {
      case 'remove5': {
        const complexityOrder = { high: 0, moderate: 1, low: 2 } as const
        const sorted = [...studyInput.countries].sort(
          (a, b) => complexityOrder[a.complexity] - complexityOrder[b.complexity]
        )
        const toRemove = new Set(sorted.slice(0, 5).map((c) => c.code))
        const newCountries = studyInput.countries.filter((c) => !toRemove.has(c.code))
        updated = { ...updated, countries: newCountries, num_countries: newCountries.length }
        break
      }
      case 'remove10sites': {
        const newSites = Math.max(5, studyInput.num_sites - 10)
        updated = { ...updated, num_sites: newSites }
        break
      }
      case 'removeRegion': {
        const regionRisk: Record<string, number> = {}
        studyInput.countries.forEach((c) => {
          if (!regionRisk[c.region]) regionRisk[c.region] = 0
          if (c.complexity === 'high') regionRisk[c.region]++
        })
        const entries = Object.entries(regionRisk)
        if (entries.length === 0) break
        const maxRegion = entries.sort((a, b) => b[1] - a[1])[0][0]
        const newCountries = studyInput.countries.filter((c) => c.region !== maxRegion)
        updated = { ...updated, countries: newCountries, num_countries: newCountries.length }
        break
      }
      case 'extendFollowup': {
        updated = { ...updated, followup_months: studyInput.followup_months + 6 }
        break
      }
      case 'reduceSample': {
        const raw = studyInput.sample_size * 0.8
        const rounded = Math.max(50, Math.round(raw / 50) * 50)
        updated = { ...updated, sample_size: rounded }
        break
      }
      case 'simplifyEndpoints': {
        const toRemove = new Set(['PROs', 'Biomarker', 'Pharmacoeconomics'])
        updated = { ...updated, endpoints: studyInput.endpoints.filter((e) => !toRemove.has(e)) }
        break
      }
    }

    setStudyInput(updated)
    setRunningAction(actionId)
    onRun()
  }

  // Clear running state when loading ends
  React.useEffect(() => {
    if (!isLoading) setRunningAction(null)
  }, [isLoading])

  return (
    <div
      style={{
        backgroundColor: 'var(--slate)',
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: 20,
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          What If Analysis
        </h3>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Instantly see how design changes affect feasibility
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {ACTIONS.map((action) => {
          const isRunning = runningAction === action.id && isLoading
          return (
            <button
              key={action.id}
              onClick={() => !isLoading && applyAndRun(action.id)}
              disabled={isLoading}
              style={{
                backgroundColor: 'var(--slate-light)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: '12px 14px',
                textAlign: 'left',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading && !isRunning ? 0.5 : 1,
                transition: 'background-color 0.15s ease, opacity 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {isRunning && (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: '2px solid var(--slate)',
                      borderTop: '2px solid var(--cyan)',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)' }}>
                  {action.label}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {action.subtitle}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WhatIfPanel
